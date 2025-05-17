import { Box, Grid, Pagination, Typography } from '@mui/material'
import { enqueueSnackbar } from 'notistack'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { backendUrl } from '../constants/url'
import authHeader from '../constants/authHeader'
import { DataGrid } from '@mui/x-data-grid'
import axios from 'axios'

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
    const rowsPerPage = 20
    const navigate = useNavigate()

    const fetchUsers = async () => {
        try {
            const response = await axios.get(`${backendUrl}/user/get-all?pageNo=${page}&pageSize=${rowsPerPage}`, { headers: authHeader })
            setRows(response.data.body.users.map((user, index) => ({
                id: user._id,
                name: user.name,
                contact: user.phone,
                address: [
                    user.address.line1,
                    user.address.line2, // will be empty if not present
                    user.address.city,
                    user.address.state,
                    user.address.country + ' - ' + user.address.zip
                ]
                    .filter(part => part && part.trim() !== '') // remove empty parts
                    .join(', '),
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

    React.useEffect(() => {
        fetchUsers()
    }, [page])

    return (
        <Box sx={{ width: '100%', maxWidth: { sm: '100%' } }}>
            <Typography variant="h2" sx={{ mb: 2 }}>
                All Users
            </Typography>
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