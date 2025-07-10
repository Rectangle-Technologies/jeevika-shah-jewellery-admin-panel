import React, { useState } from "react";
import {
    Box,
    Typography,
    TextField,
    Button,
    Switch,
    FormControlLabel,
    IconButton,
    Grid,
    Paper,
    FormControl,
    InputLabel,
    NativeSelect,
    Select,
    MenuItem,
    Divider,
    Slide,
    Dialog,
    AppBar,
    Toolbar,
    Avatar,
    InputAdornment,
    Pagination,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import axios from "axios";
import { enqueueSnackbar } from "notistack";
import { backendUrl } from "../constants/url";
import getAuthHeader from "../constants/authHeader";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from "@mui/icons-material/Close";
import { DataGrid } from "@mui/x-data-grid";
import DeleteIcon from '@mui/icons-material/Delete';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import formatAmount from "../helpers/formatAmount";

const defaultSize = { displayName: "", weightOfMetal: "" };

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const ProductForm = () => {
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [categories, setCategories] = useState([]);
    const [sizes, setSizes] = useState([]);
    const [allSizes, setAllSizes] = useState([]);
    const [products, setProducts] = useState([]);
    const [page, setPage] = React.useState(1);
    const [totalPages, setTotalPages] = React.useState(0)
    const rowsPerPage = 20;
    const [dialogBoxText, setDialogBoxText] = useState("Add New Product");
    const [actionButtonText, setActionButtonText] = useState("Add Product");
    const [form, setForm] = useState({
        name: "",
        description: "",
        category: "",
        images: [],
        sizes: [{ ...defaultSize }],
        karatOfGold: "18",
        weightOfGold: "0",
        costOfNaturalDiamond: "0",
        costOfLabDiamond: "0",
        costOfLabour: "0",
        miscellaneousCost: "0",
        isCentralisedDiamond: false,
        isNaturalDiamond: true,
        isLabDiamond: true,
        isActive: true,
        isChatWithUs: false
    });
    const [goButtonLoading, setGoButtonLoading] = useState(false)
    const [productSearchName, setProductSearchName] = useState('')


    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name === "category") {
            // If category is changed, reset sizes to default
            setForm((prev) => ({
                ...prev,
                category: value,
                sizes: allSizes[value] ? allSizes[value].map(size => ({ displayName: size.displayName, weightOfMetal: "" })) : [{ ...defaultSize }],
            }));
            return;
        }
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };
    const handleRemoveImage = async (idx) => {
        try {
            const imageUrl = form.images[idx];
            // Delete the image from S3 via API
            await axios.delete(`${backendUrl}/utils/delete-image`, {
                headers: getAuthHeader(),
                data: { imageUrl }
            });
            
            // Remove the image from the form state
            const images = form.images.filter((_, i) => i !== idx);
            setForm((prev) => ({ ...prev, images }));
            
            enqueueSnackbar("Image deleted successfully", { variant: "success" });
        } catch (error) {
            console.error("Error deleting image:", error);
            enqueueSnackbar(error?.response?.data?.message || "Failed to delete image", { variant: "error" });
        }
    };

    const handleSizeChange = (idx, field, value) => {
        const sizes = [...form.sizes];
        sizes[idx][field] = value;
        setForm((prev) => ({ ...prev, sizes }));
    };

    const handleAddSize = () => {
        setForm((prev) => ({ ...prev, sizes: [...prev.sizes, { ...defaultSize }] }));
    };

    const handleRemoveSize = (idx) => {
        const sizes = form.sizes.filter((_, i) => i !== idx);
        setForm((prev) => ({ ...prev, sizes }));
    };

    const handleCloseModal = () => {
        setModalOpen(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Convert numeric fields
            const payload = {
                ...form,
                karatOfGold: Number(form.karatOfGold),
                weightOfGold: Number(form.weightOfGold),
                costOfNaturalDiamond: Number(form.costOfNaturalDiamond),
                costOfLabDiamond: Number(form.costOfLabDiamond),
                costOfDiamond: Number(form.costOfDiamond),
                costOfLabour: Number(form.costOfLabour),
                miscellaneousCost: Number(form.miscellaneousCost),
                sizes: form.sizes.map((s) => ({
                    displayName: s.displayName,
                    weightOfMetal: Number(s.weightOfMetal),
                })),
            };
            // check if images are empty and remove them
            payload.images = payload.images.filter((img) => img.trim() !== "");
            if (payload.images.length === 0) {
                enqueueSnackbar("Please upload at least one image", { variant: "error" });
                setLoading(false);
                return;
            }
            if (actionButtonText === "Update Product" && form.id) {
                // Edit mode: update existing product
                await axios.post(
                    `${backendUrl}/products/update/${form.id}`,
                    payload,
                    { headers: getAuthHeader() }
                );
                enqueueSnackbar("Product updated!", { variant: "success" });
            } else {
                // Create mode: create new product
                await axios.post(
                    `${backendUrl}/products/new`,
                    payload,
                    { headers: getAuthHeader() }
                );
                enqueueSnackbar("Product created!", { variant: "success" });
            }
            setForm({
                name: "",
                description: "",
                category: "",
                images: [],
                sizes: [{ ...defaultSize }],
                karatOfGold: "18",
                weightOfGold: "0",
                costOfNaturalDiamond: "0",
                costOfLabDiamond: "0",
                costOfLabour: "0",
                miscellaneousCost: "0",
                isCentralisedDiamond: false,
                isNaturalDiamond: true,
                isLabDiamond: true,
                isActive: true,
                isChatWithUs: false
            });
            setModalOpen(false);
            // Refresh products list
            fetchProducts()
        } catch (error) {
            enqueueSnackbar(error?.response?.data?.message || "Error creating product", { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const productsRes = await axios.get(`${backendUrl}/products/get-all?page=${page}&size=${rowsPerPage}`, {
                headers: getAuthHeader(),
            });
            productsRes.data.body.products.forEach(product => {
                product.id = product._id; // Ensure id field is set for DataGrid
                product.skuId = product.skuId // Fallback to _id if skuId is not available
                product.createdAt = new Date(product.createdAt).toLocaleDateString('en-IN', {
                    year: '2-digit',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                });
                product.updatedAt = new Date(product.updatedAt).toLocaleDateString('en-IN', {
                    year: '2-digit',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                });
            });
            setProducts(productsRes.data?.body?.products || []);
            setTotalPages(Math.ceil(productsRes.data.body.totalProducts / rowsPerPage))
        } catch (error) {
            console.error("Error fetching products: ", error)
            enqueueSnackbar(error?.response?.data?.message || "Error fetching products", { variant: 'error' })
        }
    }

    const handleSearch = async () => {
        setGoButtonLoading(true)
        try {
            if (productSearchName === null || productSearchName === undefined || productSearchName === '') {
                fetchProducts()
            } else {
                const res = await axios.get(`${backendUrl}/products/get-by-name?name=${productSearchName}`, {
                    headers: getAuthHeader(),
                })
                res.data.body.products.forEach(product => {
                    product.id = product.skuId; // Ensure id field is set for DataGrid
                    product.createdAt = new Date(product.createdAt).toLocaleDateString('en-IN', {
                        year: '2-digit',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                    });
                    product.updatedAt = new Date(product.updatedAt).toLocaleDateString('en-IN', {
                        year: '2-digit',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                    });
                });
                setProducts(res.data?.body?.products || []);
                setTotalPages(Math.ceil(res.data.body.totalProducts / rowsPerPage))
            }
        } catch (error) {
            console.log(error)
            enqueueSnackbar(error?.response?.data?.message || "Error creating product", { variant: "error" })
        } finally {
            setGoButtonLoading(false)
        }
    }

    React.useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await axios.get(`${backendUrl}/products/get-all-categories`, {
                    headers: getAuthHeader(),
                });
                setCategories(res.data?.body?.categories || []);
                setAllSizes(res.data?.body?.sizes || []);
                setForm((prev) => ({
                    ...prev,
                    category: res.data?.body?.categories?.[0]?.name || "",
                    // sizes: res.data?.body?.sizes?.map(size => ({ displayName: size.displayName, weightOfMetal: "" })) || [{ ...defaultSize }],
                    sizes: res.data?.body?.sizes?.[res.data?.body?.categories?.[0]?.name] || [{ ...defaultSize }],
                }));

                fetchProducts()
            } catch (error) {
                console.error(error)
                enqueueSnackbar("Failed to load categories", { variant: "error" });
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, [page]);

    // File input ref for uploading images
    const fileInputRefs = React.useRef([]);

    const columnsProduct = [
        { field: 'skuId', headerName: 'SKU ID', width: 150 },
        { field: 'name', headerName: 'Name', width: 300 },
        { field: 'category', headerName: 'Category', width: 120 },
        { field: 'isActive', headerName: 'Active', width: 100, type: 'boolean' },
        { field: 'createdAt', headerName: 'Created On', width: 160 },
        {
            field: 'calculatedPrice', headerName: 'Starting Price', flex: 1, minWidth: 120, type: 'number', valueGetter: (params) => {
                return formatAmount(params);
            }
        }
    ]

    return (
        <React.Fragment>
            <Box sx={{ width: '100%', maxWidth: { sm: '100%' }, mb: 4 }}>
                <Grid container columns={12} sx={{ mt: 3 }}>
                    <Grid item size={{ xs: 12, md: 6 }}>
                        <Typography variant="h2">
                            All Products
                        </Typography>
                    </Grid>
                    <Grid item size={{ xs: 12, md: 6 }} sx={{ display: 'flex', justifyContent: 'flex-end', paddingRight: 2 }}>
                        <Button
                            variant='contained'
                            onClick={() => {
                                setModalOpen(true)
                                setForm({
                                    name: "",
                                    description: "",
                                    category: "",
                                    images: [],
                                    sizes: [...sizes],
                                    karatOfGold: "18",
                                    weightOfGold: "0",
                                    costOfNaturalDiamond: "0",
                                    costOfLabDiamond: "0",
                                    costOfLabour: "0",
                                    miscellaneousCost: "0",
                                    isCentralisedDiamond: false,
                                    isNaturalDiamond: true,
                                    isLabDiamond: true,
                                    isActive: true,
                                    isLandingPageProduct: false,
                                    isChatWithUs: false
                                });
                                setDialogBoxText("Add New Product");
                                setActionButtonText("Add Product");
                                fileInputRefs.current = []; // Reset file input refs
                            }}
                            startIcon={<AddIcon />}
                        >Add Product</Button>
                    </Grid>
                </Grid>
                <Grid container spacing={2} sx={{ mt: 3, display: 'flex' }}>
                    <Grid item size={4}>
                        <TextField
                            placeholder='Product Name'
                            fullWidth
                            sx={{ mb: 2 }}
                            required
                            value={productSearchName}
                            onChange={(e) => setProductSearchName(e.target.value)}
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
                            loading={goButtonLoading}
                        >
                            Go
                        </Button>
                    </Grid>
                </Grid>
                <Grid container sx={{ mt: 4 }}>
                    <Grid size={12}>
                        <DataGrid
                            rows={products}
                            columns={columnsProduct}
                            hideFooter
                            disableColumnResize
                            loading={loading}
                            sx={{
                                '& .MuiDataGrid-cell': {
                                    cursor: 'pointer'
                                }
                            }}
                            onCellClick={(cellData) => {
                                setModalOpen(true)
                                var images = cellData.row.images || [];
                                // Decode HTML entities in images
                                images = images.map(img => {
                                    const txt = document.createElement("textarea");
                                    txt.innerHTML = img;
                                    return txt.value; // Decode HTML entities if any
                                });

                                setForm({
                                    ...cellData.row,
                                    images: images,
                                });
                                setDialogBoxText("Edit Product");
                                setActionButtonText("Update Product");
                            }}
                        />
                    </Grid>
                    <Grid item size={12} sx={{
                        mt: 2,
                        display: { xs: 'none', md: 'flex' },
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Pagination count={totalPages} onChange={(event, value) => setPage(value)} />
                    </Grid>
                </Grid>
            </Box>

            {/* Form to add new product */}
            <Dialog
                fullScreen
                open={modalOpen}
                onClose={handleCloseModal}
                TransitionComponent={Transition}
            >
                <AppBar sx={{ position: 'relative' }}>
                    <Toolbar>
                        <IconButton
                            edge="start"
                            color="inherit"
                            onClick={handleCloseModal}
                            aria-label="close"
                        >
                            <CloseIcon />
                        </IconButton>
                        <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                            {dialogBoxText}
                        </Typography>
                        {actionButtonText === "Update Product" && (
                            <Button type="button" variant="contained" color="error" disabled={loading} onClick={async () => {
                                if (!form._id) return;
                                setLoading(true);
                                try {
                                    await axios.post(
                                        `${backendUrl}/products/delete/${form._id}`,
                                        {},
                                        { headers: getAuthHeader() }
                                    );
                                    enqueueSnackbar("Product deleted!", { variant: "success" });
                                    setModalOpen(false);
                                    // Refresh products list
                                    fetchProducts()
                                } catch (error) {
                                    enqueueSnackbar(error?.response?.data?.message || "Error deleting product", { variant: "error" });
                                } finally {
                                    setLoading(false);
                                }
                            }}
                            >
                                Delete
                            </Button>
                        )}
                        <Button type="submit" variant="contained" disabled={loading} onClick={handleSubmit} sx={{ ml: 2 }}>
                            {actionButtonText}
                        </Button>
                    </Toolbar>
                </AppBar>

                <Paper sx={{ p: 3, mb: 4, borderRadius: 2, boxShadow: 3, border: "1px solid #d0d0d0", minHeight: "80vh", padding: 6, overflowY: "auto" }}>
                    <Grid container spacing={2}>
                        {form._id && (<>
                            <Grid size={6}>
                                <TextField
                                    variant="filled"
                                    label="Product ID"
                                    name="_id"
                                    value={form._id}
                                    disabled
                                    fullWidth
                                    sx={{ mb: 2 }}
                                />
                            </Grid>
                            <Grid size={6}>
                                <TextField
                                    variant="filled"
                                    label="SKU ID"
                                    name="skuId"
                                    value={form.skuId}
                                    disabled
                                    fullWidth
                                    sx={{ mb: 2 }}
                                />
                            </Grid>
                            </>
                        )}
                        <Grid size={6}>
                            <TextField label="Name" variant="filled" name="name" value={form.name} onChange={handleChange} fullWidth required />
                        </Grid>
                        <Grid size={6}>
                            <FormControl fullWidth variant="filled">
                                <InputLabel variant="filled" htmlFor="category-native">
                                    Category
                                </InputLabel>
                                <Select
                                    value={form.category}
                                    onChange={handleChange}
                                    inputProps={{
                                        name: 'category',
                                        id: 'category-native',
                                    }}
                                    required
                                    IconComponent={KeyboardArrowDownIcon}
                                >
                                    <MenuItem value="" disabled> Select Category</MenuItem>
                                    {categories.map((cat) => (
                                        <MenuItem key={cat} value={cat}>
                                            {cat}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={12}>
                            <TextField
                                variant="filled"
                                label="Description" name="description"
                                value={form.description} onChange={handleChange}
                                fullWidth required multiline />
                        </Grid>
                        <Grid size={6}>
                            <TextField
                                variant="filled"
                                label="Karat of Gold" name="karatOfGold"
                                value={form.karatOfGold} onChange={handleChange}
                                fullWidth required
                                slotProps={{
                                    input: {
                                        endAdornment: <InputAdornment position="end">K</InputAdornment>,
                                    },
                                }} />
                        </Grid>
                        <Grid size={6}>
                            <TextField
                                variant="filled"
                                label="Weight of Gold"
                                name="weightOfGold"
                                value={form.weightOfGold}
                                onChange={handleChange}
                                fullWidth
                                required
                                slotProps={{
                                    input: {
                                        endAdornment: <InputAdornment position="end">gm</InputAdornment>,
                                    },
                                }}
                            />
                        </Grid>
                        <Grid size={6}>
                            <TextField
                                variant="filled"
                                label="Cost of Natural Diamond" name="costOfNaturalDiamond"
                                value={form.costOfNaturalDiamond} onChange={handleChange}
                                fullWidth required disabled={form.isCentralisedDiamond || !form.isNaturalDiamond}
                                slotProps={{
                                    input: {
                                        startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                                    },
                                }}
                            />
                        </Grid>
                        <Grid size={6}>
                            <TextField
                                variant="filled"
                                label="Cost of Lab Diamond" name="costOfLabDiamond"
                                value={form.costOfLabDiamond} onChange={handleChange}
                                fullWidth required disabled={form.isCentralisedDiamond || !form.isLabDiamond}
                                slotProps={{
                                    input: {
                                        startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                                    },
                                }}
                            />
                        </Grid>
                        <Grid size={6}>
                            <TextField
                                variant="filled"
                                label="Cost of Labour" name="costOfLabour"
                                value={form.costOfLabour} onChange={handleChange}
                                fullWidth required
                                slotProps={{
                                    input: {
                                        startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                                    },
                                }}
                            />
                        </Grid>
                        <Grid size={6}>
                            <TextField
                                variant="filled"
                                label="Miscellaneous Cost" name="miscellaneousCost"
                                value={form.miscellaneousCost} onChange={handleChange}
                                fullWidth required
                                slotProps={{
                                    input: {
                                        startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                                    },
                                }}
                            />
                        </Grid>
                        {form.createdAt && form.updatedAt && (<>
                            <Grid size={4}>
                                {/* Created at */}
                                <TextField variant="filled" label="Created On" name="createdAt" type="text" value={form.createdAt}
                                    disabled fullWidth />
                            </Grid>
                            <Grid size={4}>
                                {/* Updated at */}
                                <TextField variant="filled" label="Last Updated On" name="updatedAt" type="text" value={form.updatedAt}
                                    disabled fullWidth />
                            </Grid>
                        </>
                        )}
                        <Grid container size={12}>
                            <Grid size={4}>
                                <FormControlLabel
                                    control={<Switch checked={form.isCentralisedDiamond} onChange={handleChange} name="isCentralisedDiamond" />}
                                    label="Centralised Diamond Pricing"
                                />
                            </Grid>
                            <Grid size={4}>
                                <FormControlLabel
                                    control={<Switch checked={form.isNaturalDiamond} onChange={handleChange} name="isNaturalDiamond" />}
                                    label="Natural Diamond"
                                />
                            </Grid>
                            <Grid size={4}>
                                <FormControlLabel
                                    control={<Switch checked={form.isLabDiamond} onChange={handleChange} name="isLabDiamond" />}
                                    label="Lab Diamond"
                                />
                            </Grid>
                            <Grid size={4}>
                                <FormControlLabel
                                    control={<Switch checked={form.isActive} onChange={handleChange} name="isActive" />}
                                    label="Active"
                                />
                            </Grid>
                            <Grid size={4}>
                                <FormControlLabel
                                    control={<Switch checked={form.isLandingPageProduct} onChange={handleChange} name="isLandingPageProduct" />}
                                    label="Landing Page Product"
                                />
                            </Grid>
                            <Grid size={4}>
                                <FormControlLabel
                                    control={<Switch checked={form.isChatWithUs} onChange={handleChange} name="isChatWithUs" />}
                                    label="Chat With Us"
                                />
                            </Grid>
                        </Grid>
                        <Divider sx={{ width: "100%", my: 2 }} />
                        <Grid size={12}>
                            <Button
                                variant="contained"
                                component="label"
                                startIcon={<CloudUploadIcon />}
                                sx={{ mb: 2 }}
                            >
                                Upload Images / Videos
                                <input
                                    type="file"
                                    accept="image/*,video/*"
                                    multiple
                                    hidden
                                    onChange={async (e) => {
                                        const files = Array.from(e.target.files);
                                        if (!files.length) return;
                                        for (const file of files) {
                                            const formData = new FormData();
                                            formData.append("file", file);
                                            try {
                                                const res = await axios.post(
                                                    `${backendUrl.replace(/\/$/, "")}/utils/upload`,
                                                    formData,
                                                    {
                                                        headers: {
                                                            ...getAuthHeader(),
                                                            "Content-Type": "multipart/form-data",
                                                        },
                                                    }
                                                );
                                                const url = res.data?.filename || res.data?.body?.filename;
                                                if (url) {
                                                    setForm(prev => ({
                                                        ...prev,
                                                        images: [...prev.images, url]
                                                    }));
                                                    enqueueSnackbar(`Image "${file.name}" uploaded!`, { variant: "success" });
                                                } else {
                                                    enqueueSnackbar(`Upload succeeded for "${file.name}" but no URL returned`, { variant: "warning" });
                                                }
                                            } catch (error) {
                                                const apiMsg = error?.response?.data?.message;
                                                enqueueSnackbar(
                                                    apiMsg
                                                        ? `Image upload failed for "${file.name}": ${apiMsg}`
                                                        : `Image upload failed for "${file.name}"`,
                                                    { variant: "error" }
                                                );
                                            }
                                        }
                                        // Reset the input value so the same files can be selected again if needed
                                        e.target.value = "";
                                    }}
                                />
                            </Button>
                            <Grid container spacing={2} sx={{ mt: 2 }}>
                                {form.images.map((img, idx) => {
                                    return (
                                        <Grid item xs={6} sm={4} md={3} key={idx} style={{ display: "flex", justifyContent: "center", position: "relative" }}>
                                            <img src={img} style={{
                                                width: "300px",
                                                height: "300px",
                                                objectFit: "cover",
                                                borderRadius: 4,
                                                cursor: "pointer",
                                            }} />
                                            <Avatar style={{
                                                position: "absolute",
                                                top: 8,
                                                right: 8,
                                            }} sx={{
                                                bgcolor: "error.main",
                                                cursor: "pointer"
                                            }}
                                                onClick={() => handleRemoveImage(idx)}
                                            >
                                                <DeleteIcon />
                                            </Avatar>
                                        </Grid>
                                    );
                                })}
                            </Grid>
                        </Grid>

                        <Divider sx={{ width: "100%", my: 2 }} />

                        <Grid size={12}>
                            <Typography variant="subtitle1" style={{
                                marginBottom: "8px",
                            }}>Add Sizes</Typography>
                            {form.sizes.map((size, idx) => (
                                <Box key={idx} display="flex" alignItems="center" mb={1}>
                                    <TextField
                                        label={`Size Display Name #${idx + 1}`}
                                        value={size.displayName}
                                        onChange={(e) => handleSizeChange(idx, "displayName", e.target.value)}
                                        fullWidth
                                        sx={{ mr: 1 }}
                                    />
                                    <TextField
                                        label={`Weight Difference #${idx + 1}`}
                                        type="number"
                                        value={size.weightOfMetal}
                                        onChange={(e) => handleSizeChange(idx, "weightOfMetal", e.target.value)}
                                        fullWidth
                                        sx={{ mr: 1 }}
                                    />
                                    <IconButton onClick={() => handleRemoveSize(idx)} disabled={form.sizes.length === 1} style={{ marginRight: 8 }}>
                                        <RemoveIcon />
                                    </IconButton>
                                    <IconButton onClick={handleAddSize} style={{ marginRight: 8 }}>
                                        <AddIcon />
                                    </IconButton>
                                </Box>
                            ))}
                        </Grid>
                        <Grid size={12} sx={{ textAlign: "right", mt: 2 }}>
                            <Button type="submit" fullWidth variant="contained" disabled={loading} onClick={handleSubmit}>
                                {actionButtonText}
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>
            </Dialog>
        </React.Fragment>
    );
};

export default ProductForm;