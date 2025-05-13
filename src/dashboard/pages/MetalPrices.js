import { Box, Button, CircularProgress, Grid, InputAdornment, OutlinedInput, Typography } from '@mui/material'
import axios from 'axios'
import { enqueueSnackbar } from 'notistack'
import React from 'react'
import authHeader from '../constants/authHeader'
import { backendUrl } from '../constants/url'

const MetalPrices = () => {
    const [isLoading, setIsLoading] = React.useState(true)
    const [isSubmitLoading, setIsSubmitLoading] = React.useState(false)
    const [prices, setPrices] = React.useState(null)

    const fetchPrices = async () => {
        setIsLoading(true)
        try {
            const response = await axios.get(`${backendUrl}/price/get`, { headers: authHeader })
            setPrices(response.data.body)
        } catch (error) {
            console.error('Error fetching prices:', error)
            enqueueSnackbar(error?.response?.data?.message || "Error fetching prices", {
                autoHideDuration: 2000,
                variant: "error",
            });
        } finally {
            setIsLoading(false)
        }
    }

    const handleInputChange = (event) => {
        const { name, value } = event.target
        setPrices((prevPrices) => ({
            ...prevPrices,
            [name]: value,
        }))
    }

    const handleSubmit = async () => {
        setIsSubmitLoading(true)
        try {
            // Validate input values
            if (!prices?.goldPricePerGram || !prices?.naturalDiamondPricePerCarat || !prices?.labDiamondPricePerCarat) {
                enqueueSnackbar("Please fill all the fields", {
                    autoHideDuration: 2000,
                    variant: "error",
                });
                return
            }
            console.log(prices)
            await axios.post(`${backendUrl}/price/update`, { 
                goldPricePerGram: prices?.goldPricePerGram,
                naturalDiamondPricePerCarat: prices?.naturalDiamondPricePerCarat,
                labDiamondPricePerCarat: prices?.labDiamondPricePerCarat
             }, { headers: authHeader })
            enqueueSnackbar("Prices updated successfully", {
                autoHideDuration: 2000,
                variant: "success",
            });
            fetchPrices()
        } catch (error) {
            console.error('Error updating prices:', error)
            enqueueSnackbar(error?.response?.data?.message || "Error updating prices", {
                autoHideDuration: 2000,
                variant: "error",
            });
        } finally {
            setIsSubmitLoading(false)
        }
    }

    React.useEffect(() => {
        fetchPrices()
    }, [])

    return (
        <Box sx={{ width: '100%', maxWidth: { sm: '100%' } }}>
            <Typography variant="h2" sx={{ mb: 4}}>
                Metal Prices
            </Typography>
            {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <CircularProgress />
                </Box>
            ) : <>
                <Grid container sx={{ display: 'flex', flexDirection: 'row', mb: 4, alignItems: 'center' }}>
                    <Grid item size={4}>
                        <Typography sx={{ fontSize: 16 }}>
                            Gold Price per Gram:
                        </Typography>
                    </Grid>
                    <Grid item>
                        <OutlinedInput
                            name="goldPricePerGram"
                            value={prices?.goldPricePerGram}
                            startAdornment={<InputAdornment position="start">₹</InputAdornment>}
                            onChange={handleInputChange}
                        />
                    </Grid>
                </Grid>
                <Grid container sx={{ display: 'flex', flexDirection: 'row', mb: 4, alignItems: 'center' }}>
                    <Grid item size={4}>
                        <Typography sx={{ fontSize: 16 }}>
                            Natural Diamond Price per Carat:
                        </Typography>
                    </Grid>
                    <Grid item>
                        <OutlinedInput
                            name="naturalDiamondPricePerCarat"
                            value={prices?.naturalDiamondPricePerCarat}
                            startAdornment={<InputAdornment position="start">₹</InputAdornment>}
                            onChange={handleInputChange}
                        />
                    </Grid>
                </Grid>
                <Grid container sx={{ display: 'flex', flexDirection: 'row', mb: 4, alignItems: 'center' }}>
                    <Grid item size={4}>
                        <Typography sx={{ fontSize: 16 }}>
                            CVD Diamond Price per Carat:
                        </Typography>
                    </Grid>
                    <Grid item>
                        <OutlinedInput
                            name="labDiamondPricePerCarat"
                            value={prices?.labDiamondPricePerCarat}
                            startAdornment={<InputAdornment position="start">₹</InputAdornment>}
                            onChange={handleInputChange}
                        />
                    </Grid>
                </Grid>
                <Button
                    variant="outlined"
                    fullWidth
                    onClick={handleSubmit}
                    loading={isSubmitLoading}
                >Update Prices</Button>
            </>
            }
        </Box>
    )
}

export default MetalPrices