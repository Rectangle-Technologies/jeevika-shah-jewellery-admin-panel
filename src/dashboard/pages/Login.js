import { Box, Button, Grid, OutlinedInput, Typography } from '@mui/material'
import React from 'react'
import { backendUrl } from '../constants/url';
import axios from 'axios';
import { enqueueSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = React.useState()
    const [password, setPassword] = React.useState()
    const [loading, setLoading] = React.useState(false)
    const navigate = useNavigate()

    const handleLogin = async () => {
        setLoading(true)
        try {
            const response = await axios.post(`${backendUrl}/user/admin/login`, {
                email,
                otp2fa: password
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            setLoading(false)
            const data = response.data;
            if (data.result === 'SUCCESS') {
                localStorage.setItem('token', data.body.token)
                navigate('/')
            } else {
                enqueueSnackbar(data.message, {
                    autoHideDuration: 2000,
                    variant: 'error',
                })
            }
        } catch (err) {
            setLoading(false)
            enqueueSnackbar(err?.response?.data?.message || "Error logging in", {
                autoHideDuration: 2000,
                variant: 'error',
            })
        }
    }

    React.useEffect(() => {
        const token = localStorage.getItem('token')
        const verifyToken = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.post(`${backendUrl}/user/verify-token`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.data.result === 'SUCCESS') {
                    navigate('/');
                }
            } catch (err) {
                console.error(err);
                localStorage.removeItem('token');
            }
        };
        if (token !== null && token !== undefined && token !== '') {
            verifyToken()
        }
    }, [])

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
                        name="email"
                        type="email"
                    />
                </Grid>
                <Grid item size={12}>
                    <OutlinedInput
                        placeholder="OTP"
                        sx={{ width: '300px', mb: 2 }}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleLogin()
                            }
                        }}
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