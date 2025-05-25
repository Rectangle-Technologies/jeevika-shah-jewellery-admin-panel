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

const defaultSize = { displayName: "", weightOfMetal: "" };

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const ProductForm = () => {
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [categories, setCategories] = useState([]);
    const [sizes, setSizes] = useState([]);
    const [products, setProducts] = useState([]);
    const [page, setPage] = React.useState(1);
    const rowsPerPage = 20;
    const [dialogBoxText, setDialogBoxText] = useState("Add New Product");
    const [actionButtonText, setActionButtonText] = useState("Create Product");
    const [form, setForm] = useState({
        name: "",
        description: "",
        category: "",
        images: [""],
        sizes: [{ ...defaultSize }],
        karatOfGold: "",
        weightOfGold: "",
        karatOfDiamond: "",
        costOfDiamond: "",
        costOfLabour: "",
        miscellaneousCost: "",
        isCentralisedDiamond: false,
        isNaturalDiamond: false,
        isLabDiamond: false,
        isActive: true,
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleImageChange = (idx, value) => {
        const images = [...form.images];
        images[idx] = value;
        setForm((prev) => ({ ...prev, images }));
    };

    const handleAddImage = () => {
        setForm((prev) => ({ ...prev, images: [...prev.images, ""] }));
    };

    const handleRemoveImage = (idx) => {
        const images = form.images.filter((_, i) => i !== idx);
        setForm((prev) => ({ ...prev, images }));
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
                karatOfDiamond: Number(form.karatOfDiamond),
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
            await axios.post(
                `${backendUrl}/products/new`,
                payload,
                { headers: getAuthHeader() }
            );
            enqueueSnackbar("Product created!", { variant: "success" });
            setForm({
                name: "",
                description: "",
                category: "",
                images: [""],
                sizes: [{ ...defaultSize }],
                karatOfGold: "",
                weightOfGold: "",
                karatOfDiamond: "",
                costOfDiamond: "",
                costOfLabour: "",
                miscellaneousCost: "",
                isCentralisedDiamond: false,
                isNaturalDiamond: false,
                isLabDiamond: false,
                isActive: true,
            });
        } catch (error) {
            enqueueSnackbar(error?.response?.data?.message || "Error creating product", { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await axios.get(`${backendUrl}/products/get-all-categories`, {
                    headers: getAuthHeader(),
                });
                setCategories(res.data?.body?.categories || []);
                setSizes(res.data?.body?.sizes || []);
                setForm((prev) => ({
                    ...prev,
                    category: res.data?.body?.categories?.[0]?.name || "",
                    sizes: res.data?.body?.sizes?.map(size => ({ displayName: size.displayName, weightOfMetal: "" })) || [{ ...defaultSize }],
                }));

                const productsRes = await axios.get(`${backendUrl}/products/get-all`, {
                    headers: getAuthHeader(),
                });
                productsRes.data.body.products.forEach(product => {
                    product.id = product._id; // Ensure id field is set for DataGrid
                    product.createdAt = new Date(product.createdAt).toLocaleDateString('en-IN', {
                        year: '2-digit',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                    });
                });
                setProducts(productsRes.data?.body?.products || []);
                setLoading(false);
            } catch (error) {
                enqueueSnackbar("Failed to load categories", { variant: "error" });
            }
        };
        fetchCategories();
    }, []);

    // File input ref for uploading images
    const fileInputRefs = React.useRef([]);

    // Handle file selection and upload
    const handleFileUpload = async (idx, event) => {
        const file = event.target.files[0];
        if (!file) return;
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
            // Assuming the response contains the URL at res.data.url
            const url = res.data?.path || res.data?.body?.path;
            if (url) {
                handleImageChange(idx, url);
                enqueueSnackbar("Image uploaded!", { variant: "success" });
            } else {
                enqueueSnackbar("Upload succeeded but no URL returned", { variant: "warning" });
            }
        } catch (error) {
            enqueueSnackbar("Image upload failed", { variant: "error" });
        }
    };

    const columnsProduct = [
        { field: 'id', headerName: 'Product ID', width: 230 },
        { field: 'name', headerName: 'Name', width: 200, renderCell: (params) => {
            
            return <Button variant="text" onClick={() => {
                setModalOpen(true)
                setForm({
                    ...params.row,
                    images: params.row.images || [""],
                });
                setDialogBoxText("Edit Product");
            }}>{params.value}</Button>;
        }},
        { field: 'category', headerName: 'Category', width: 150 },
        { field: 'description', headerName: 'Description', width: 250 },
        { field: 'images', headerName: 'Images', width: 200, renderCell: (params) => {
            const [isOpen, setIsOpen] = React.useState(false);
            const OpenImageDialog = () => {
                setIsOpen(true);
            }
            const handleClose = () => {
                setIsOpen(false);
            }
            return (
                <React.Fragment>
                    <Button variant="text" onClick={OpenImageDialog}>
                        View Images
                    </Button>
                    <Dialog open={isOpen} onClose={handleClose} maxWidth="xl" fullWidth>
                        <Box sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                            {params.value.map((img, index) => (
                                <img key={index} src={img} alt={`Product ${params.row.id} Image ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }} />
                            ))}
                        </Box>
                    </Dialog>
                </React.Fragment>
            );
        }},
        { field: 'isActive', headerName: 'Active', width: 100, type: 'boolean' },
        { field: 'createdAt', headerName: 'Created On', width: 180 },
    ]

    console.log("Products:", products);

    return (
        <React.Fragment>
            <Box sx={{ p: 3, mb: 4, borderRadius: 2, boxShadow: 3, border: "1px solid #d0d0d0" }}>
                <Typography variant="h4" sx={{ mb: 2 }}>
                    Products
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => {
                        setModalOpen(true)
                        setForm({
                            name: "",
                            description: "",
                            category: categories[0] || "",
                            images: [""],
                            sizes: [{ ...defaultSize }],
                            karatOfGold: "",
                            weightOfGold: "",
                            karatOfDiamond: "",
                            costOfDiamond: "",
                            costOfLabour: "",
                            miscellaneousCost: "",
                            isCentralisedDiamond: false,
                            isNaturalDiamond: false,
                            isLabDiamond: false,
                            isActive: true,
                        });
                        setDialogBoxText("Add New Product");
                        setActionButtonText("Create Product");
                        fileInputRefs.current = []; // Reset file input refs
                    }}
                    sx={{ mb: 2 }}
                >
                    Add New Product
                </Button>
                <Typography variant="body1" sx={{ mb: 2 }}>
                    Use the form to add a new product. Ensure all required fields are filled out, and you can upload multiple images for the product.
                </Typography>
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
                        <Button type="submit" variant="contained" disabled={loading} onClick={handleSubmit}>
                            {actionButtonText}
                        </Button>
                    </Toolbar>
                </AppBar>

                <Paper sx={{ p: 3, mb: 4, borderRadius: 2, boxShadow: 3, border: "1px solid #d0d0d0", minHeight: "80vh", padding: 6, overflowY: "auto" }}>
                    <Grid container spacing={2}>
                        <Grid size={4}>
                            <TextField label="Name" variant="filled" name="name" value={form.name} onChange={handleChange} fullWidth required />
                        </Grid>
                        <Grid size={8}>
                            <TextField label="Description" variant="filled" name="description" value={form.description} onChange={handleChange} fullWidth />
                        </Grid>
                        <Grid size={4}>
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
                                >
                                    <MenuItem value=""> Select Category</MenuItem>
                                    {categories.map((cat) => (
                                        <MenuItem key={cat} value={cat}>
                                            {cat}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        {/* Sizes section omitted for brevity */}
                        <Grid size={4}>
                            <TextField variant="filled" label="Karat of Gold" name="karatOfGold" type="number" value={form.karatOfGold} onChange={handleChange} fullWidth />
                        </Grid>
                        <Grid size={4}>
                            <TextField variant="filled" label="Weight of Gold" name="weightOfGold" type="number" value={form.weightOfGold} onChange={handleChange} fullWidth />
                        </Grid>
                        <Grid size={4}>
                            <TextField variant="filled" label="Karat of Diamond" name="karatOfDiamond" type="number" value={form.karatOfDiamond} onChange={handleChange} fullWidth />
                        </Grid>
                        <Grid size={4}>
                            <TextField variant="filled" label="Cost of Diamond" name="costOfDiamond" type="number" value={form.costOfDiamond} onChange={handleChange} fullWidth />
                        </Grid>
                        <Grid size={4}>
                            <TextField variant="filled" label="Cost of Labour" name="costOfLabour" type="number" value={form.costOfLabour} onChange={handleChange} fullWidth />
                        </Grid>
                        <Grid size={4}>
                            <TextField variant="filled" label="Miscellaneous Cost" name="miscellaneousCost" type="number" value={form.miscellaneousCost} onChange={handleChange} fullWidth />
                        </Grid>
                        <Grid size={8}></Grid>
                        <Grid size={3}>
                            <FormControlLabel
                                control={<Switch checked={form.isCentralisedDiamond} onChange={handleChange} name="isCentralisedDiamond" />}
                                label="Centralised Diamond Pricing"
                            />
                        </Grid>
                        <Grid size={3}>
                            <FormControlLabel
                                control={<Switch checked={form.isNaturalDiamond} onChange={handleChange} name="isNaturalDiamond" />}
                                label="Natural Diamond"
                            />
                        </Grid>
                        <Grid size={3}>
                            <FormControlLabel
                                control={<Switch checked={form.isLabDiamond} onChange={handleChange} name="isLabDiamond" />}
                                label="Lab Diamond"
                            />
                        </Grid>
                        <Grid size={3}>
                            <FormControlLabel
                                control={<Switch checked={form.isActive} onChange={handleChange} name="isActive" />}
                                label="Active"
                            />
                        </Grid>
                        <Divider sx={{ width: "100%", my: 2 }} />
                        <Grid size={12}>
                            <Typography variant="subtitle1" style={{
                                marginBottom: "8px",
                            }}>Add Images</Typography>

                            {/* Multi-file upload button */}
                            <Button
                                variant="contained"
                                component="label"
                                startIcon={<CloudUploadIcon />}
                                sx={{ mb: 2 }}
                            >
                                Upload Multiple Images
                                <input
                                    type="file"
                                    accept="image/*"
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
                                                const url = res.data?.path || res.data?.body?.path;
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
                                                enqueueSnackbar(`Image upload failed for "${file.name}"`, { variant: "error" });
                                            }
                                        }
                                        // Reset the input value so the same files can be selected again if needed
                                        e.target.value = "";
                                    }}
                                />
                            </Button>
                            {form.images.map((img, idx) => (
                                <Box key={idx} display="flex" alignItems="center" mb={1}>
                                    <TextField
                                        label={`Image URL #${idx + 1}`}
                                        value={img}
                                        onChange={(e) => handleImageChange(idx, e.target.value)}
                                        fullWidth
                                        disabled
                                        sx={{ mr: 1 }}
                                    />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        style={{ display: "none" }}
                                        ref={el => fileInputRefs.current[idx] = el}
                                        onChange={e => handleFileUpload(idx, e)}
                                    />
                                    <IconButton onClick={() => handleRemoveImage(idx)} disabled={form.images.length === 1} style={{ marginRight: 8 }}>
                                        <RemoveIcon />
                                    </IconButton>
                                    <IconButton
                                        onClick={() => fileInputRefs.current[idx]?.click()}
                                        style={{ marginRight: 8 }}
                                    >
                                        <CloudUploadIcon />
                                    </IconButton>
                                    <IconButton onClick={handleAddImage}>
                                        <AddIcon />
                                    </IconButton>
                                </Box>
                            ))}
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
                                        label={`Weight of Metal #${idx + 1}`}
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

            {/* Display existing products */}
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
            />
        </React.Fragment>
    );
};

export default ProductForm;