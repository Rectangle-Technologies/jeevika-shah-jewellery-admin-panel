import { Box, Button, Card, CardContent, CardHeader, CircularProgress, Grid, Paper, Stack, Typography } from '@mui/material'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import axios from 'axios'
import React from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import ConfirmationModal from '../components/ConfirmationModal'
import getAuthHeader from '../constants/authHeader'
import { backendUrl } from '../constants/url'
import { toIsoWithOffset } from '../helpers/formatDate'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { enqueueSnackbar } from 'notistack'
import formatAmount from "../helpers/formatAmount"
import { formatDiamondType } from '../helpers/formatDiamondType'

const OrderDetail = () => {
    const [order, setOrder] = React.useState()
    const [isLoading, setIsLoading] = React.useState(true)
    const { orderId } = useParams()
    const [open, setOpen] = React.useState(false);
    const [status, setStatus] = React.useState()
    const [deliveredOn, setDeliveredOn] = React.useState()
    const navigate = useNavigate()
    const location = useLocation()

    const fetchOrder = async () => {
        try {
            const response = await axios.get(`${backendUrl}/order/get/${orderId}`, { headers: getAuthHeader() })
            setOrder(response.data.body)
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
    const handleOpen = (status) => {
        setOpen(true);
        setStatus(status)
    }
    const handleClose = () => setOpen(false);

    const changeOrderStatus = async (status) => {
        try {
            if (status === 'Delivered' && !deliveredOn) {
                enqueueSnackbar("Please select a Delivery Date", {
                    autoHideDuration: 2000,
                    variant: "error",
                });
                return
            }
            const payload = {
                status,
                deliveredOn: status === 'Delivered' ? toIsoWithOffset(new Date(deliveredOn)) : null
            }
            await axios.post(`${backendUrl}/order/update-status/${orderId}`, payload, { headers: getAuthHeader() })
            enqueueSnackbar(`Order marked as ${status} successfully`, {
                autoHideDuration: 2000,
                variant: "success",
            });
            fetchOrder()
        } catch (error) {
            console.error('Error updating order:', error)
            enqueueSnackbar(error?.response?.data?.message || "Error updating order", {
                autoHideDuration: 2000,
                variant: "error",
            });
        } finally {
            handleClose()
        }
    }

    React.useEffect(() => {
        fetchOrder()
    }, [])

    return (
        <Box sx={{ width: '100%', maxWidth: { sm: '100%' }, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {isLoading
                ? <CircularProgress />
                : (<>
                    {order
                        ? (
                            <Stack spacing={2} sx={{ width: '100%' }}>
                                <Box>
                                    <Button variant="outlined" onClick={() => navigate(location?.state?.url || -1, { state: location.state })}>
                                        <ArrowBackIcon />
                                    </Button>
                                </Box>
                                <Card variant="outlined" sx={{ width: '100%' }}>
                                    <CardContent>
                                        <Grid container columns={12}>
                                            <Grid item size={{ xs: 12, md: 6 }}>
                                                <Typography variant="h6" sx={{ mt: 1 }}>
                                                    Order ID: {order._id}
                                                </Typography>
                                            </Grid>
                                            <Grid item size={{ xs: 12, md: 6 }} sx={{ display: 'flex', justifyContent: { md: 'flex-end' } }}>
                                                <Typography variant="h4">
                                                    Order {order.status} {order.status === 'Delivered' && `on ${new Date(order.deliveredOn).toLocaleDateString('en-IN', {
                                                        year: '2-digit',
                                                        month: '2-digit',
                                                        day: '2-digit'
                                                    })}`}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>
                                <Grid container spacing={2} columns={12}>
                                    <Grid item size={{ xs: 12, md: 6 }}>
                                        <Card variant="outlined" sx={{ width: '100%' }}>
                                            <CardHeader title="Customer Details" />
                                            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                                                <Typography sx={{ fontSize: 16 }}>
                                                    Name: {order.userId.name}
                                                </Typography>
                                                <Typography sx={{ fontSize: 16 }}>
                                                    Contact: {order.userId.phone}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                    <Grid item size={{ xs: 12, md: 6 }}>
                                        <Card variant="outlined" sx={{ width: '100%' }}>
                                            <CardHeader title="Payment Details" />
                                            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                                                <Typography sx={{ fontSize: 16 }}>
                                                    Payment Status: {order.paymentStatus}
                                                </Typography>
                                                {order.paymentStatus === 'Completed' && <Typography sx={{ fontSize: 16 }}>
                                                    Razorpay Payment ID: {order.razorpayPaymentId}
                                                </Typography>}
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                </Grid>
                                <Card variant="outlined" sx={{ width: '100%' }}>
                                    <CardHeader title="Receiver Details" />
                                    <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                                        <Typography sx={{ fontSize: 16 }}>
                                            Name: {order.receiverDetails.name}
                                        </Typography>
                                        <Typography sx={{ fontSize: 16 }}>
                                            Contact: {order.receiverDetails.phone}
                                        </Typography>
                                        <Typography sx={{ fontSize: 16 }}>
                                            Address: {
                                                [
                                                    order.receiverDetails.address.line1,
                                                    order.receiverDetails.address.line2, // will be empty if not present
                                                    order.receiverDetails.address.city,
                                                    order.receiverDetails.address.state,
                                                    order.receiverDetails.address.country + ' - ' + order.receiverDetails.address.zip
                                                ]
                                                    .filter(part => part && part.trim() !== '') // remove empty parts
                                                    .join(', ')
                                            }
                                        </Typography>
                                    </CardContent>
                                </Card>
                                <Card variant="outlined" sx={{ width: '100%' }}>
                                    <CardHeader title="Products" />
                                    <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                                        {order.products.map((product, index) => (
                                            <Paper variant="outlined" sx={{ padding: 2, borderRadius: 2, mt: 2 }} key={index}>
                                                <Grid container spacing={2} columns={12}>
                                                    <Grid item size={{ xs: 12, md: 8 }}>
                                                        <Typography sx={{ fontSize: 16 }}>
                                                            {product.productId.name}
                                                        </Typography>
                                                        <Typography sx={{ fontSize: 14, mt: 2 }}>
                                                            Product ID: {product.productId._id}
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
                                                    <Grid item size={{ xs: 12, md: 4 }} sx={{ display: 'flex', justifyContent: { md: 'center' } }}>
                                                        <img src={product.productId.images[0]} alt={product.productId.name} style={{ height: '200px', width: 'auto' }} />
                                                    </Grid>
                                                </Grid>
                                            </Paper>
                                        ))}
                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mr: 2 }}>
                                            <Typography variant='h4' sx={{ ml: 1 }}>
                                                Total Amount: {formatAmount(order.totalAmount)}
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                </Card>
                                {order.customOrderDetails.isCustomOrder &&
                                    <Card variant="outlined" sx={{ width: '100%' }}>
                                        <CardHeader title="Order Customization Details" />
                                        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                                            <Typography sx={{ fontSize: 16 }}>
                                                {order.customOrderDetails.description}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                }
                                {order.status !== 'Cancelled' && order.status !== 'Delivered' &&
                                    <Card variant="outlined" sx={{ width: '100%' }}>
                                        <CardHeader title="Order Actions" />
                                        {order.status === 'Placed' && <>
                                            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                                                <Button variant="contained" color="error" onClick={() => handleOpen('Cancelled')}>
                                                    Cancel Order
                                                </Button>
                                            </CardContent>

                                            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 4 }}>
                                                <Button variant="contained" color="success" onClick={() => handleOpen('Shipped')}>
                                                    Mark order as Shipped
                                                </Button>
                                            </CardContent>
                                        </>}
                                        {order.status === 'Shipped' &&
                                            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 4 }}>
                                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                    <DatePicker
                                                        label="Delivered On"
                                                        value={deliveredOn}
                                                        onChange={(newValue) => setDeliveredOn(newValue)}
                                                        format='DD/MM/YYYY'
                                                    />
                                                </LocalizationProvider>
                                                <Button variant="contained" color="success" onClick={() => handleOpen('Delivered')}>
                                                    Mark order as Delivered
                                                </Button>
                                            </CardContent>
                                        }
                                        <ConfirmationModal
                                            open={open}
                                            handleClose={handleClose}
                                            onConfirm={() => changeOrderStatus(status)}
                                        />
                                    </Card>
                                }
                            </Stack>
                        )
                        : <Typography variant="h6">Oops, order not found :(</Typography>
                    }
                </>
                )}
        </Box>
    )
}

export default OrderDetail