import { Box, Button, CircularProgress, Grid, TextField, Typography } from '@mui/material'
import { enqueueSnackbar, useSnackbar } from 'notistack'
import React from 'react'
import { backendUrl } from '../constants/url'
import authHeader from '../constants/authHeader'
import axios from 'axios'
import { DataGrid } from '@mui/x-data-grid'
import { useLocation, useNavigate } from 'react-router-dom'
import formatAmount from '../helpers/formatAmount'

const UserOrders = () => {
    const location = useLocation()
    const [phone, setPhone] = React.useState(location.state?.phone || '')
    const [isLoading, setIsLoading] = React.useState(false)
    const [user, setUser] = React.useState(location.state?.user || null)
    const [rows, setRows] = React.useState(location.state?.rows || [])
    const { enqueueSnackbar } = useSnackbar()
    const MobileNumberRegex = /^[6-9][0-9]{9}$/
    const columns = [
        { field: 'id', headerName: 'Order ID', width: 220 },
        { field: 'orderDate', headerName: 'Placed On', width: 170 },
        { field: 'status', headerName: 'Status', width: 90 },
        { field: 'paymentStatus', headerName: 'Payment Status', width: 130 },
        { field: 'totalAmount', headerName: 'Total Amount', width: 130 }
    ]
    const navigate = useNavigate()

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
            const orderResponse = await axios.get(`${backendUrl}/order/get-user/${response.data.body._id}`, { headers: authHeader })
            setRows(orderResponse.data.body.orders.map((order, index) => ({
                id: order._id,
                orderDate: new Date(order.createdAt).toLocaleDateString('en-IN', {
                    year: '2-digit',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                }),
                status: order.status,
                paymentStatus: order.paymentStatus,
                totalAmount: formatAmount(order.totalAmount),
            })))
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
                User Orders
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
                        <DataGrid
                            rows={rows}
                            columns={columns}
                            hideFooter
                            onCellClick={cellData => {
                                navigate(`/order/${cellData.row.id}`, {
                                    state: { phone, user, rows, url: location.pathname }
                                });
                            }}
                            sx={{
                                '& .MuiDataGrid-cell': {
                                    cursor: 'pointer'
                                },
                                width: 745,
                            }}
                        />
                    </Grid>
                </>
                )}
            </Grid>
        </Box>
    )
}

export default UserOrders