import { Box, Button, Card, CardContent, CircularProgress, Grid, Stack, Typography } from '@mui/material'
import axios from 'axios'
import React from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { backendUrl } from '../constants/url'
import getAuthHeader from '../constants/authHeader'
import { enqueueSnackbar } from 'notistack'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import formatAmount from '../helpers/formatAmount'
import { DataGrid } from '@mui/x-data-grid'

const UserDetails = () => {
    const [user, setUser] = React.useState(null)
    const [orders, setOrders] = React.useState([])
    const [isLoading, setIsLoading] = React.useState(true)
    const { userId } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    const columns = [
        { field: 'id', headerName: 'Order ID', width: 230 },
        { field: 'orderDate', headerName: 'Placed On', width: 170 },
        { field: 'status', headerName: 'Status', width: 90 },
        { field: 'paymentStatus', headerName: 'Payment Status', width: 130 },
        { field: 'totalAmount', headerName: 'Total Amount', width: 130 }
    ]

    const fetchUser = async () => {
        try {
            const response = await axios.get(`${backendUrl}/user/get/${userId}`, { headers: getAuthHeader() })
            const orderResponse = await axios.get(`${backendUrl}/order/get-user/${response.data.body._id}`, { headers: getAuthHeader() })
            setUser(response.data.body)
            setOrders(orderResponse.data.body.orders.map((order, index) => ({
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
        } catch (error) {
            console.error('Error fetching order:', error)
            enqueueSnackbar(error?.response?.data?.message || "Error fetching order", {
                autoHideDuration: 2000,
                variant: "error",
            });
        } finally {
            setIsLoading(false)
        }
    }

    React.useEffect(() => {
        fetchUser()
    }, [])

    return (
        <Box sx={{ width: '100%', maxWidth: { sm: '100%' }, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {isLoading
                ? <CircularProgress />
                : <>
                    {user
                        ? <Stack spacing={2} sx={{ width: '100%' }}>
                            <Box>
                                <Button variant="outlined" onClick={() => navigate(location?.state?.url || -1, { state: location.state })}>
                                    <ArrowBackIcon />
                                </Button>
                            </Box>
                            <Grid container spacing={2} columns={12}>
                                <Grid item size={12}>
                                    <Card variant="outlined" sx={{ width: '100%' }}>
                                        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                                            <Typography sx={{ fontSize: 16 }}>
                                                Name: {user.name}
                                            </Typography>
                                            <Typography sx={{ fontSize: 16 }}>
                                                Contact: {user.phone}
                                            </Typography>
                                            {user.email && <Typography sx={{ fontSize: 16 }}>
                                                Email: {user.email}
                                            </Typography>}
                                            <Typography sx={{ fontSize: 16 }}>
                                                Address: {
                                                    [
                                                        user.address.line1,
                                                        user.address.line2, // will be empty if not present
                                                        user.address.city,
                                                        user.address.state,
                                                        user.address.country + ' - ' + user.address.zip
                                                    ]
                                                        .filter(part => part && part.trim() !== '') // remove empty parts
                                                        .join(', ')
                                                }
                                            </Typography>
                                            <Typography sx={{ fontSize: 16 }}>
                                                Date of Birth: {new Date(user.dob).toLocaleDateString('en-IN', {
                                                    year: 'numeric',
                                                    month: '2-digit',
                                                    day: '2-digit',
                                                })}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item size={12} sx={{ mt: 2}}>
                                    <Typography variant="h4">
                                        Orders
                                    </Typography>
                                </Grid>
                                <Grid item size={12}>
                                    <DataGrid
                                        rows={orders}
                                        columns={columns}
                                        hideFooter
                                        onCellClick={cellData => {
                                            navigate(`/order/${cellData.row.id}`);
                                        }}
                                        sx={{
                                            '& .MuiDataGrid-cell': {
                                                cursor: 'pointer'
                                            },
                                            width: 755,
                                        }}
                                        localeText={{
                                            noRowsLabel: "No orders found for this user."
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </Stack>
                        : <Typography variant="h6">Oops, order not found :(</Typography>
                    }
                </>}
        </Box>
    )
}

export default UserDetails