import { Box, Grid, Typography } from "@mui/material"
import { DataGrid } from "@mui/x-data-grid"
import axios from "axios"
import { useSnackbar } from "notistack"
import React, { useEffect } from "react"
import authHeader from "../constants/authHeader"
import formatAmount from "../helpers/formatAmount"
import { backendUrl } from "../constants/url"

const Products = () => {

    return (

        <Box sx={{ width: '100%', maxWidth: { sm: '100%' } }}>
            <Typography variant="h2" sx={{ mb: 2 }}>
                Welcome, products!
            </Typography>
        </Box>
    )
}

export default Products