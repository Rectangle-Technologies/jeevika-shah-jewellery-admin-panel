import axios from 'axios'
import { useSnackbar } from 'notistack'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import formatAmount from '../helpers/formatAmount'
import { DataGrid } from '@mui/x-data-grid'
import { Box, Button, Grid, Pagination, Typography } from '@mui/material'
import { backendUrl } from '../constants/url'
import authHeader from '../constants/authHeader'

const Orders = () => {
    const columns = [
        { field: 'id', headerName: 'Order ID', width: 220 },
        { field: 'orderDate', headerName: 'Placed On', width: 170 },
        { field: 'customerName', headerName: 'Customer Name', width: 200 },
        { field: 'status', headerName: 'Status', width: 90 },
        { field: 'paymentStatus', headerName: 'Payment Status', width: 130 },
        { field: 'totalAmount', headerName: 'Total Amount', flex: 1 },
    ]

    const [isLoading, setIsLoading] = React.useState(true)
    const [rows, setRows] = React.useState([])
    const [page, setPage] = React.useState(1)
    const [totalPages, setTotalPages] = React.useState(0)
    const rowsPerPage = 20
    const { enqueueSnackbar } = useSnackbar()
    const navigate = useNavigate()

    const fetchOrders = async () => {
        try {
            const response = await axios.get(`${backendUrl}/order/get-all?pageNo=${page}&pageSize=${rowsPerPage}`, { headers: authHeader })
            setRows(response.data.body.orders.map((order, index) => ({
                id: order._id,
                orderDate: new Date(order.createdAt).toLocaleDateString('en-IN', {
                    year: '2-digit',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                }),
                customerName: order.userId.name,
                status: order.status,
                paymentStatus: order.paymentStatus,
                totalAmount: formatAmount(order.totalAmount),
            })))
            setTotalPages(Math.ceil(response.data.body.totalOrders / rowsPerPage))
        } catch (error) {
            console.error('Error fetching orders:', error)
            enqueueSnackbar(error?.response?.data?.message || "Error fetching orders", {
                autoHideDuration: 2000,
                variant: "error",
            });
            setRows([])
        } finally {
            setIsLoading(false)
        }
    }

    React.useEffect(() => {
        fetchOrders()
    }, [page])
    return (
        <Box sx={{ width: '100%', maxWidth: { sm: '100%' } }}>
            <Grid container columns={12} sx={{ mt: 3 }}>
                <Grid item size={{ xs: 12, md: 6 }}>
                    <Typography variant="h2">
                        All Orders
                    </Typography>
                </Grid>
                <Grid item size={{ xs: 12, md: 6 }} sx={{ display: 'flex', justifyContent: 'flex-end', paddingRight: 2 }}>
                    <Button variant='contained'>Create Custom Order</Button>
                </Grid>
            </Grid>
            <Grid container sx={{ mt: 3 }}>
                <Grid item xs={12} width="100%">
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        hideFooter
                        disableColumnResize
                        loading={isLoading}
                        onCellClick={cellData => {
                            navigate(`/order/${cellData.row.id}`)
                        }}
                        sx={{
                            '& .MuiDataGrid-cell': {
                                cursor: 'pointer'
                            }
                        }}
                    />
                </Grid>
                <Grid item xs={12} width='100%' sx={{
                    mt: 2,
                    display: { xs: 'none', md: 'flex' },
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Pagination count={totalPages} onChange={(event, value) => setPage(value)} />
                </Grid>
            </Grid>
        </Box>
    )
}

export default Orders