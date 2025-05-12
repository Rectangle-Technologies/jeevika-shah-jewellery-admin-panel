import { Box, Button, Grid, TextField, Typography } from '@mui/material'
import axios from 'axios'
import { useSnackbar } from 'notistack'
import React from 'react'
import { backendUrl } from '../constants/url'
import authHeader from '../constants/authHeader'

const NewCustomOrder = () => {
    const [phone, setPhone] = React.useState('')
    const [isLoading, setIsLoading] = React.useState(false)
    const [user, setUser] = React.useState(null)
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
                </>
                )}
            </Grid>
        </Box>
    )
}

export default NewCustomOrder