import { Box, Grid, Typography } from "@mui/material"
import { DataGrid } from "@mui/x-data-grid"
import axios from "axios"
import { useSnackbar } from "notistack"
import React, { useEffect } from "react"
import authHeader from "../constants/authHeader"
import formatAmount from "../helpers/formatAmount"
import { backendUrl } from "../constants/url"

const Products = () => {
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
    const { enqueueSnackbar } = useSnackbar()

    const fetchOrders = async () => {
        try {
            const response = await axios.get(`${backendUrl}/order/get-all?pageNo=1&pageSize=10`, { headers: authHeader })
            setRows(response.data.body.map((order, index) => ({
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
        } catch (error) {
            console.error('Error fetching orders:', error)
            enqueueSnackbar("Error fetching orders", {
                autoHideDuration: 2000,
                variant: "error",
            });
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchOrders()
    }, [])

    return (

        <Box sx={{ width: '100%', maxWidth: { sm: '100%' } }}>
            <Typography variant="h2" sx={{ mb: 2 }}>
                Welcome, products!
            </Typography>
            <Typography sx={{ mb: 2, fontSize: 16 }}>
                Here are your recent orders:
            </Typography>
            <Grid container>
                <Grid item xs={12} width="100%">
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        hideFooter
                        disableColumnResize
                        loading={isLoading}
                    />
                </Grid>
            </Grid>
        </Box>
    )
}

export default Products