import { Box, Button, Grid, OutlinedInput, TextField, Typography } from '@mui/material'
import axios from 'axios'
import { useSnackbar } from 'notistack'
import React from 'react'
import { backendUrl } from '../constants/url'
import authHeader from '../constants/authHeader'

const NewCustomOrder = () => {
    const [phone, setPhone] = React.useState('')
    const [isLoading, setIsLoading] = React.useState(false)
    const [isSubmitLoading, setIsSubmitLoading] = React.useState(false)
    const [user, setUser] = React.useState(null)
    const [customOrderDescription, setCustomOrderDescription] = React.useState()
    const [products, setProducts] = React.useState([
        {
            productId: "60f6f9cf8a1a2c001cfb3b0a",
            quantity: 1,
            price: 103245.23,
            size: "14 cm"
        },
        {
            productId: "60f6f9cf8a1a2c001cfb3b0a",
            quantity: 1,
            price: 203245.23,
            size: "14 cm"
        }
    ])

    const { enqueueSnackbar } = useSnackbar()
    const MobileNumberRegex = /^[6-9][0-9]{9}$/

    const handleSearch = async () => {
        try {
            if (!phone || MobileNumberRegex.test(phone) === false) {
                enqueueSnackbar("Please enter a valid mobile number", {
                    autoHideDuration: 2000,
                    variant: "error",
                });
                return
            }
            setIsLoading(true)
            const response = await axios.post(`${backendUrl}/user/get/phone`, { phone }, { headers: authHeader })
            setUser(response.data.body)
            setPhone('')
        } catch (error) {
            console.error('Error fetching user:', error)
            enqueueSnackbar(error?.response?.data?.message || "Error fetching user", {
                autoHideDuration: 2000,
                variant: "error",
            });
            setUser(null)
        } finally {
            setIsLoading(false)
        }
    }

    const handlSubmit = async () => { 
        setIsSubmitLoading(true)
        try {
            if (!customOrderDescription || customOrderDescription.length === 0) {
                enqueueSnackbar("Please enter a valid description", {
                    autoHideDuration: 2000,
                    variant: "error",
                });
                return
            }
            if (!products || products.length === 0) {
                enqueueSnackbar("Please add at least one product", {
                    autoHideDuration: 2000,
                    variant: "error",
                });
                return
            }
            const orderData = {
                userId: user._id,
                customOrderDetails: {
                    description: customOrderDescription
                },
                products
            }
            await axios.post(`${backendUrl}/order/create-custom`, orderData, { headers: authHeader })

            setCustomOrderDescription('')
            // TODO: Uncomment this when the API is ready
            // setProducts([])
            setUser(null)
            enqueueSnackbar("Order created successfully", {
                autoHideDuration: 2000,
                variant: "success",
            });
        } catch (error) {
            console.error('Error creating order:', error)
            enqueueSnackbar(error?.response?.data?.message || "Error creating order", {
                autoHideDuration: 2000,
                variant: "error",
            });
        } finally {
            setIsSubmitLoading(false)
        }
    }

    return (
        <Box sx={{ width: '100%', maxWidth: { sm: '100%' } }}>
            <Typography variant="h2">
                Create Custom Order
            </Typography>
            <Grid container spacing={2} sx={{ mt: 3, display: 'flex' }}>
                <Grid item size={4}>
                    <TextField
                        placeholder='Mobile Number'
                        fullWidth
                        sx={{ mb: 2 }}
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleSearch();
                            }
                        }}
                    />
                </Grid>
                <Grid item>
                    <Button
                        variant='outlined'
                        onClick={handleSearch}
                        loading={isLoading}
                    >
                        Go
                    </Button>
                </Grid>
            </Grid>
            <Grid container spacing={2} sx={{ mt: 3, display: 'flex' }}>
                {user && (<>
                    <Grid item size={12}>
                        <Typography sx={{ mb: 2, fontSize: 16 }}>
                            Name: {user.name}
                        </Typography>
                        <Typography sx={{ mb: 2, fontSize: 16 }}>
                            Contact: {user.phone}
                        </Typography>
                    </Grid>
                    <Grid item size={12}>
                        <Typography variant="h4" sx={{ mb: 2 }}>Custom Order Details</Typography>
                        <OutlinedInput
                            placeholder='Description'
                            fullWidth
                            multiline
                            sx={{ mb: 2 }}
                            required
                            value={customOrderDescription}
                            onChange={(e) => setCustomOrderDescription(e.target.value)}
                        />
                    </Grid>
                    <Grid item size={12}>
                        <Typography variant="h4" sx={{ mb: 2 }}>Products</Typography>
                        <Button
                            variant='contained'
                            sx={{ mb: 2 }}
                        >Add Product</Button>
                    </Grid>
                    <Grid item size={12}>
                        <Button
                            variant='contained'
                            fullWidth
                            color='success'
                            onClick={handlSubmit}
                            loading={isSubmitLoading}
                        >Create Order</Button>
                    </Grid>
                </>
                )}
            </Grid>
        </Box>
    )
}

export default NewCustomOrder