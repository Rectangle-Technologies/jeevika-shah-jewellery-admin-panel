import { Box, Typography } from "@mui/material"

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