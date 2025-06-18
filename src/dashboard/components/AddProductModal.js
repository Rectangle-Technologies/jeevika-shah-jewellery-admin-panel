import { Box, Button, Grid, InputAdornment, MenuItem, Modal, OutlinedInput, Paper, Select, Typography } from '@mui/material';
import axios from 'axios';
import { enqueueSnackbar } from 'notistack';
import React from 'react'
import { backendUrl } from '../constants/url';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { formatText } from '../helpers/formatText';

const AddProductModal = (props) => {
    const [productUrl, setProductUrl] = React.useState('')
    const [product, setProduct] = React.useState(null)
    const [orderProduct, setOrderProduct] = React.useState(null)
    const [goButtonLoading, setGoButtonLoading] = React.useState(false)
    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 800,
        bgcolor: 'background.paper',
        border: '2px solid #000',
        borderRadius: 2,
        boxShadow: 24,
        p: 4,
    };
    const diamondTypes = [
        { value: 'natural', label: 'Natural' },
        { value: 'lab-grown', label: 'Lab Grown' },
    ]

    const getProduct = async () => {
        setGoButtonLoading(true)
        try {
            if (!productUrl) {
                enqueueSnackbar("Please enter a valid product URL", {
                    autoHideDuration: 2000,
                    variant: "error",
                });
                return
            }
            const urlSplit = productUrl.split('/')

            // Check if the URL is valid
            if (urlSplit.length === 0) {
                enqueueSnackbar("Please enter a valid product URL", {
                    autoHideDuration: 2000,
                    variant: "error",
                });
                return
            }

            const productId = urlSplit[urlSplit.length - 1]
            const response = await axios.get(`${backendUrl}/products/get/${productId}`)
            setProduct(response.data.body.product[0])
            setProductUrl('')
            setOrderProduct({
                productId: response.data.body.product[0]._id,
                name: response.data.body.product[0].name,
                image: response.data.body.product[0].images[0]
            })
        } catch (error) {
            console.error('Error fetching product:', error)
            enqueueSnackbar(error?.response?.data?.message || "Error fetching product", {
                autoHideDuration: 2000,
                variant: "error",
            });
        } finally {
            setGoButtonLoading(false)
        }
    }
    console.log(product)

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setOrderProduct((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    }

    const handleSubmit = async () => {
        // Validate input values
        if (!orderProduct?.quantity || !orderProduct?.size || !orderProduct?.price || !orderProduct?.diamondType) {
            enqueueSnackbar("Please fill all the fields", {
                autoHideDuration: 2000,
                variant: "error",
            });
            return
        }
        if (orderProduct?.quantity <= 0) {
            enqueueSnackbar("Please enter a valid quantity", {
                autoHideDuration: 2000,
                variant: "error",
            });
            return
        }
        if (orderProduct?.price <= 0) {
            enqueueSnackbar("Please enter a valid price", {
                autoHideDuration: 2000,
                variant: "error",
            });
            return
        }

        props.setProducts((prevProducts) => {
            prevProducts.push(orderProduct)
            return prevProducts
        })
        setProduct(null)
        props.handleClose()
    }

    return (
        <Modal
            open={props.open}
            onClose={props.handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style}>
                <Grid container spacing={2} columns={12}>
                    <Grid size={10}>
                        <OutlinedInput
                            placeholder='Product URL'
                            value={productUrl}
                            onChange={(e) => setProductUrl(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    getProduct()
                                }
                            }}
                            fullWidth
                        />
                    </Grid>
                    <Grid size={1}>
                        <Button
                            variant='outlined'
                            onClick={getProduct}
                            size='small'
                            loading={goButtonLoading}
                        >
                            Go
                        </Button>
                    </Grid>
                </Grid>
                {product && <>
                    <Paper variant="outlined" sx={{ padding: 2, borderRadius: 2, mt: 2 }}>
                        <Grid container spacing={2} columns={12}>
                            <Grid size={{ xs: 12, md: 8 }}>
                                <Typography sx={{ fontSize: 16 }}>
                                    {product.name}
                                </Typography>
                                <Typography sx={{ fontSize: 14, mt: 2 }}>
                                    Product ID: {product._id}
                                </Typography>
                                <Grid container columns={12} spacing={2} sx={{ mt: 2 }}>
                                    <Grid size={4}>
                                        <OutlinedInput
                                            placeholder='Quantity'
                                            fullWidth
                                            type='number'
                                            name='quantity'
                                            onChange={handleInputChange}
                                            value={orderProduct?.quantity}
                                        />
                                    </Grid>
                                    <Grid size={6}>
                                        <Select
                                            fullWidth
                                            value={orderProduct?.size || ''}
                                            onChange={handleInputChange}
                                            input={<OutlinedInput />}
                                            name='size'
                                            IconComponent={KeyboardArrowDownIcon}
                                            displayEmpty
                                            renderValue={(selected) => {
                                                if (!selected) {
                                                    return <span style={{ color: '#aaa' }}>Select Size</span>; // Placeholder text
                                                }
                                                return selected;
                                            }}
                                        >
                                            {product.sizes.map((size, index) => (
                                                <MenuItem key={index} value={size.displayName}>
                                                    {size.displayName}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </Grid>
                                </Grid>
                                <Box sx={{ mt: 2 }}>
                                    <OutlinedInput
                                        placeholder='Price'
                                        fullWidth
                                        name='price'
                                        onChange={handleInputChange}
                                        startAdornment={<InputAdornment position="start">₹</InputAdornment>}
                                        value={orderProduct.price}
                                    />
                                </Box>
                                <Select
                                    fullWidth
                                    value={orderProduct?.diamondType || ''}
                                    onChange={handleInputChange}
                                    input={<OutlinedInput />}
                                    name='diamondType'
                                    IconComponent={KeyboardArrowDownIcon}
                                    displayEmpty
                                    renderValue={(selected) => {
                                        if (!selected) {
                                            return <span style={{ color: '#aaa' }}>Select Diamond Type</span>; // Placeholder text
                                        }
                                        const found = diamondTypes.find(type => type.value === selected);
                                        return found ? found.label : selected;
                                    }}
                                    sx={{ mt: 2 }}
                                >
                                    {diamondTypes.map((type, index) => (
                                        <MenuItem key={index} value={type.value}>
                                            {type.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex', justifyContent: { md: 'center' } }}>
                                <img src={formatText(product.images[0])} alt={product.name} style={{ height: 'auto', width: '100%' }} />
                            </Grid>
                        </Grid>
                    </Paper>
                    <Grid container columns={12} sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                        <Grid>
                            <Button variant="contained" color='error' onClick={() => {
                                setProduct(null)
                                props.handleClose()
                            }}>
                                Cancel
                            </Button>
                        </Grid>
                        <Grid>
                            <Button variant="contained" onClick={handleSubmit}>
                                Add
                            </Button>
                        </Grid>
                    </Grid>
                </>
                }
            </Box>
        </Modal>
    )
}

export default AddProductModal