import { Box, Typography } from "@mui/material"
import { enqueueSnackbar } from "notistack"
import React from "react"
import { backendUrl } from "../constants/url"
import authHeader from "../constants/authHeader"
import axios from "axios"

const Products = () => {
    const [products, setProducts] = React.useState([])
    const [loading, setLoading] = React.useState(true)

    const fetchProducts = async () => {
        try { 
            const response = await axios.get(`${backendUrl}/products/get-all`, { headers: authHeader })
            console.log(response.data)
            // setProducts(response.data.body.products)
        } catch (error) {
            console.error('Error fetching orders:', error)
            enqueueSnackbar(error?.response?.data?.message || "Error fetching orders", {
                autoHideDuration: 2000,
                variant: "error",
            });
            setProducts([])
        } finally {
            setLoading(false)
        }
    }

    React.useEffect(() => {
        fetchProducts()
    }, [])

    return (
        <Box sx={{ width: '100%', maxWidth: { sm: '100%' } }}>
            <Typography variant="h2" sx={{ mb: 2 }}>
                All Products
            </Typography>
        </Box>
    )
}

export default Products