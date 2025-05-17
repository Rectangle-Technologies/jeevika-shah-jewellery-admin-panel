import { Box, Grid, Typography } from "@mui/material"
import { DataGrid } from "@mui/x-data-grid"
import axios from "axios"
import React, { useEffect } from "react"
import authHeader from "../constants/authHeader"
import formatAmount from "../helpers/formatAmount"
import { backendUrl } from "../constants/url"
import { useNavigate } from "react-router-dom"
import StatCard from "../components/StatCard"
import { enqueueSnackbar } from "notistack"

const Home = () => {
    const columns = [
        { field: 'id', headerName: 'Order ID', width: 230 },
        { field: 'orderDate', headerName: 'Placed On', width: 170 },
        { field: 'customerName', headerName: 'Customer Name', width: 200 },
        { field: 'status', headerName: 'Status', width: 90 },
        { field: 'paymentStatus', headerName: 'Payment Status', width: 130 },
        { field: 'totalAmount', headerName: 'Total Amount', flex: 1 },
    ]

    const [isLoading, setIsLoading] = React.useState(true)
    const [rows, setRows] = React.useState([])
    const [data, setData] = React.useState([
        {
            title: 'New Users',
            value: '',
            interval: 'This month'
        },
        {
            title: 'Orders',
            value: '',
            interval: 'This month'
        },
        {
            title: 'Sales',
            value: '',
            interval: 'This month'
        }])
    const navigate = useNavigate()

    const fetchOrders = async () => {
        try {
            const response = await axios.get(`${backendUrl}/dashboard/get-data`, { headers: authHeader })
            setRows(response.data.body.recentOrders.map((order, index) => ({
                id: order._id,
                orderDate: new Date(order.createdAt).toLocaleDateString('en-IN', {
                    year: '2-digit',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                }),
                customerName: order?.userId?.name,
                status: order.status,
                paymentStatus: order.paymentStatus,
                totalAmount: formatAmount(order.totalAmount),
            })))
            setData(prevData => {
                const updatedData = [...prevData]
                updatedData[0].value = response.data.body.totalUsers
                updatedData[1].value = response.data.body.totalOrders
                updatedData[2].value = formatAmount(response.data.body.totalRevenue)
                return updatedData
            })
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
                Welcome, Jeevika Shah!
            </Typography>
            <Typography sx={{ mb: 2, fontSize: 16 }}>
                Some quick stats:
            </Typography>
            <Grid
                container
                spacing={2}
                columns={12}
                sx={{ mb: 2 }}
            >
                {data.map((card, index) => (
                    <Grid key={index} size={{ xs: 12, sm: 6, lg: 4 }}>
                        <StatCard {...card} />
                    </Grid>
                ))}
            </Grid>
            <Typography sx={{ mb: 2, fontSize: 16 }}>
                Recent orders:
            </Typography>
            <Grid container>
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
            </Grid>
        </Box>
    )
}

export default Home