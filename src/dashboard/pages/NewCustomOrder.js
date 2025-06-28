import { Box, Button, Grid, OutlinedInput, Paper, TextField, Typography } from '@mui/material'
import axios from 'axios'
import { enqueueSnackbar } from 'notistack'
import React from 'react'
import AddProductModal from '../components/AddProductModal'
import getAuthHeader from '../constants/authHeader'
import { backendUrl } from '../constants/url'
import formatAmount from '../helpers/formatAmount'
import EditProductModal from '../components/EditProductModal'
import { formatDiamondType } from '../helpers/formatDiamondType'
import { useNavigate } from 'react-router-dom'
import { formatText } from '../helpers/formatText'

const NewCustomOrder = () => {
    const [phone, setPhone] = React.useState('')
    const [isLoading, setIsLoading] = React.useState(false)
    const [isSubmitLoading, setIsSubmitLoading] = React.useState(false)
    const [user, setUser] = React.useState(null)
    const [customOrderDescription, setCustomOrderDescription] = React.useState()
    const [products, setProducts] = React.useState([])
    const [addProductModalOpen, setAddProductModalOpen] = React.useState(false)
    const [editProductModalOpen, setEditProductModalOpen] = React.useState(false)
    const [editProductIndex, setEditProductIndex] = React.useState(-1)
    const MobileNumberRegex = /^[6-9][0-9]{9}$/
    const navigate = useNavigate()

    const handleAddModalOpen = () => setAddProductModalOpen(true);
    const handleAddModalClose = () => setAddProductModalOpen(false);

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
            const response = await axios.post(`${backendUrl}/user/get/phone`, { phone }, { headers: getAuthHeader() })
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
            const response = await axios.post(`${backendUrl}/order/create-custom`, orderData, { headers: getAuthHeader() })

            setCustomOrderDescription('')
            setProducts([])
            setUser(null)
            enqueueSnackbar("Order created successfully", {
                autoHideDuration: 2000,
                variant: "success",
            });
            navigate(`/order/${response.data.body._id}`)
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
                <Grid size={4}>
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
                <Grid>
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
                    <Grid size={12}>
                        <Typography sx={{ mb: 2, fontSize: 16 }}>
                            Name: {user.name}
                        </Typography>
                        <Typography sx={{ mb: 2, fontSize: 16 }}>
                            Contact: {user.phone}
                        </Typography>
                    </Grid>
                    <Grid size={12}>
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
                    <Grid size={12}>
                        <Typography variant="h4" sx={{ mb: 2 }}>Products</Typography>
                        {products.map((product, index) => (
                            <Paper variant="outlined" sx={{ padding: 2, borderRadius: 2, mb: 2 }} key={index}>
                                <Grid container spacing={2} columns={12}>
                                    <Grid size={{ xs: 12, md: 8 }}>
                                        <Typography sx={{ fontSize: 16 }}>
                                            {product.name}
                                        </Typography>
                                        <Typography sx={{ fontSize: 14, mt: 2 }}>
                                            SKU ID: {product.skuId}
                                        </Typography>
                                        <Typography sx={{ fontSize: 14, mt: 2 }}>
                                            Quantity: {product.quantity}
                                        </Typography>
                                        <Typography sx={{ fontSize: 14, mt: 2 }}>
                                            Size: {product.size}
                                        </Typography>
                                        <Typography sx={{ fontSize: 14, mt: 2 }}>
                                            Diamond Type: {formatDiamondType(product.diamondType)}
                                        </Typography>
                                        <Typography sx={{ fontSize: 14, mt: 2 }}>
                                            Price: {formatAmount(product.price)}
                                        </Typography>
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex', justifyContent: { md: 'center' } }}>
                                        <img src={formatText(product.image)} alt={product.name} style={{ height: '200px', width: 'auto' }} />
                                    </Grid>
                                </Grid>
                                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
                                    <Button
                                        variant='contained'
                                        color='error'
                                        onClick={() => {
                                            setProducts(products.filter((_, i) => i !== index))
                                        }}
                                        sx={{ mr: 2 }}
                                    >Delete</Button>
                                    <Button
                                        variant='contained'
                                        color='primary'
                                        onClick={() => {
                                            setEditProductIndex(index)
                                            setEditProductModalOpen(true)
                                        }}
                                    >Edit</Button>
                                </Box>
                            </Paper>
                        ))}
                        <Button
                            variant='contained'
                            sx={{ mb: 2 }}
                            onClick={handleAddModalOpen}
                        >Add Product</Button>
                    </Grid>
                    <Grid size={12}>
                        <Button
                            variant='contained'
                            fullWidth
                            color='success'
                            onClick={handlSubmit}
                            loading={isSubmitLoading}
                        >Create Order</Button>
                    </Grid>
                    <AddProductModal
                        open={addProductModalOpen}
                        handleClose={handleAddModalClose}
                        setProducts={setProducts}
                    />
                    <EditProductModal
                        open={editProductModalOpen}
                        handleClose={() => setEditProductModalOpen(false)}
                        editProductIndex={editProductIndex}
                        products={products}
                        setProducts={setProducts}
                    />
                </>
                )}
            </Grid>
        </Box>
    )
}

export default NewCustomOrder