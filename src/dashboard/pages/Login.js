import { Box, Button, Grid, OutlinedInput, Typography } from '@mui/material'
import React from 'react'

const Login = () => {
    const [email, setEmail] = React.useState()
    const [password, setPassword] = React.useState()
    const [loading, setLoading] = React.useState(false)

    const handleLogin = () => { }

    return (
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <Grid container spacing={2} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Grid item size={12}>
                    <Typography variant='h2' sx={{ mb: 2, textAlign: 'center' }}>Welcome!</Typography>
                </Grid>
                <Grid item size>
                    <OutlinedInput
                        placeholder="Email"
                        sx={{ width: '300px', mb: 2 }}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </Grid>
                <Grid item size={12}>
                    <OutlinedInput
                        placeholder="Password"
                        sx={{ width: '300px', mb: 2 }}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </Grid>
                <Grid item size={12}>
                    <Button
                        variant='outlined'
                        fullWidth
                        loading={loading}
                        onClick={handleLogin}
                    >Login</Button>
                </Grid>
            </Grid>
        </Box>
    )
}

export default Login