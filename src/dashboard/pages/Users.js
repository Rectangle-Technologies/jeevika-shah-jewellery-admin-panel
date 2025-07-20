import { Box, Button, Grid, Pagination, TextField, Typography } from '@mui/material'
import { enqueueSnackbar } from 'notistack'
import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { backendUrl } from '../constants/url'
import getAuthHeader from '../constants/authHeader'
import { DataGrid, GridToolbarContainer, GridToolbarExport } from '@mui/x-data-grid'
import axios from 'axios'
import { formatText } from '../helpers/formatText'

const Users = () => {
    const columns = [
        { field: 'id', headerName: 'User ID', width: 220 },
        { field: 'name', headerName: 'Name', width: 200 },
        { field: 'contact', headerName: 'Contact', width: 120 },
        { field: 'address', headerName: 'Address', flex: 1 }
    ]

    const [isLoading, setIsLoading] = React.useState(true)
    const [rows, setRows] = React.useState([])
    const [page, setPage] = React.useState(1)
    const [totalPages, setTotalPages] = React.useState(0)
    const [phone, setPhone] = React.useState('')
    const rowsPerPage = 20
    const navigate = useNavigate()
    const MobileNumberRegex = /^[6-9][0-9]{9}$/

    const fetchUsers = async () => {
        try {
            const response = await axios.get(`${backendUrl}/user/get-all?pageNo=${page}&pageSize=${rowsPerPage}`, { headers: getAuthHeader() })
            setRows(response.data.body.users.map((user, index) => ({
                id: user._id,
                name: user.name,
                contact: user.phone,
                address: formatText([
                    user.address.line1,
                    user.address.line2, // will be empty if not present
                    user.address.city,
                    user.address.state,
                    user.address.country + ' - ' + user.address.zip
                ]
                    .filter(part => part && part.trim() !== '') // remove empty parts
                    .join(', ')),
            })))
            setTotalPages(Math.ceil(response.data.body.totalUsers / rowsPerPage))
        } catch (error) {
            console.error('Error fetching orders:', error)
            enqueueSnackbar(error?.response?.data?.message || "Error fetching orders", {
                autoHideDuration: 2000,
                variant: "error",
            });
            setRows([])
        } finally {
            setIsLoading(false)
        }
    }

    const handleSearch = async () => {
        try {
            if (!phone || MobileNumberRegex.test(phone) === false) {
                enqueueSnackbar("Please enter a valid mobile number", {
                    autoHideDuration: 2000,
                    variant: "error",
                });
                return
            }
            setIsLoading(true)
            const response = await axios.post(`${backendUrl}/user/get/phone`, { phone }, { headers: getAuthHeader() })
            setRows([{
                id: response.data.body._id,
                name: response.data.body.name,
                contact: response.data.body.phone,
                address: formatText([
                    response.data.body.address.line1,
                    response.data.body.address.line2, // will be empty if not present
                    response.data.body.address.city,
                    response.data.body.address.state,
                    response.data.body.address.country + ' - ' + response.data.body.address.zip
                ]
                    .filter(part => part && part.trim() !== '') // remove empty parts
                    .join(', ')),
            }])
            setPhone('')
        } catch (error) {
            console.error('Error fetching user:', error)
            enqueueSnackbar(error?.response?.data?.message || "Error fetching user", {
                autoHideDuration: 2000,
                variant: "error",
            });
        } finally {
            setIsLoading(false)
        }
    }

    React.useEffect(() => {
        fetchUsers()
    }, [page])

    return (
        <Box sx={{ width: '100%', maxWidth: { sm: '100%' } }}>
            <Typography variant="h2" sx={{ mb: 2 }}>
                All Users
            </Typography>
            <Grid container spacing={2} sx={{ mt: 3, display: 'flex' }}>
                <Grid item size={4}>
                    <TextField
                        placeholder='Mobile Number'
                        fullWidth
                        sx={{ mb: 2 }}
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleSearch();
                            }
                        }}
                    />
                </Grid>
                <Grid item>
                    <Button
                        variant='outlined'
                        onClick={handleSearch}
                        loading={isLoading}
                    >
                        Go
                    </Button>
                </Grid>
            </Grid>
            <Grid container sx={{ mt: 3 }}>
                <Grid item xs={12} width="100%">
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        hideFooter
                        disableColumnResize
                        loading={isLoading}
                        onCellClick={cellData => {
                            navigate(`/user/${cellData.row.id}`)
                        }}
                        sx={{
                            '& .MuiDataGrid-cell': {
                                cursor: 'pointer'
                            }
                        }}
                        showToolbar
                    />
                </Grid>
                <Grid item xs={12} width='100%' sx={{
                    mt: 2,
                    display: { xs: 'none', md: 'flex' },
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Pagination count={totalPages} onChange={(event, value) => setPage(value)} />
                </Grid>
            </Grid>
        </Box>
    )
}

export default Users