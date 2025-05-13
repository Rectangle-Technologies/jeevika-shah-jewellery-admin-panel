import { Box, Typography } from '@mui/material'
import React from 'react'

const Users = () => {
    return (
        <Box sx={{ width: '100%', maxWidth: { sm: '100%' } }}>
            <Typography variant="h2" sx={{ mb: 2 }}>
                All Users
            </Typography>
        </Box>
    )
}

export default Users