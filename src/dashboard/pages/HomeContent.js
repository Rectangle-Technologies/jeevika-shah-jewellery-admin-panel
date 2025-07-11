import { Box, Button, Typography } from '@mui/material'
import React, { useState } from 'react';
import AddIcon from "@mui/icons-material/Add";
import axios from "axios";
import { backendUrl } from "../constants/url";
import CircularProgress from '@mui/material/CircularProgress';
import Backdrop from '@mui/material/Backdrop';
import RefreshIcon from '@mui/icons-material/Refresh';
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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from '@mui/icons-material/CloudUpload'; import { enqueueSnackbar } from "notistack";
import getAuthHeader from "../constants/authHeader";
import { DataGrid } from "@mui/x-data-grid";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

const Transition = React.forwardRef(function Transition(props, ref) {
	return <Slide direction="up" ref={ref} {...props} />;
});

const HomeContent = () => {
	const [categories, setCategories] = useState([]);
	const [loading, setLoading] = useState(true);
	const [loader, setLoader] = useState(false);
	const [modalOpen, setModalOpen] = useState(false);
	const [dialogBoxText, setDialogBoxText] = useState("Add New Product");
	const [actionButtonText, setActionButtonText] = useState("Create Product");
	const [homeContent, setHomeContent] = useState([]);
	const [refresh, setRefresh] = useState(true);
	const [form, setForm] = useState({
		key: '',
		value: ''
	});

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		setForm((prev) => ({
			...prev,
			[name]: type === "checkbox" ? checked : value,
		}));
	};

	const handleCloseModal = () => {
		setModalOpen(false);
	};

	const handleSubmit = () => {
		// Handle form submission logic here
		axios.post(
			`${backendUrl}/home-content/add`,
			{
				key: form.key.key,
				value: form.value,
				isImage: form.isImage
			},
			{
				headers: {
					...getAuthHeader(),
					"Content-Type": "application/json"
				}
			}
		)
			.then(() => {
				enqueueSnackbar("Home content saved successfully!", { variant: "success" });
			})
			.catch((error) => {
				enqueueSnackbar("Failed to save home content", { variant: "error" });
				console.error(error);
			});
		setModalOpen(false);
		setRefresh(true);
	};

	const fileInputRefs = React.useRef([]);

	React.useEffect(() => {
		if (!refresh) return; // Only fetch categories if refresh is true
		
		const fetchCategories = async () => {
			try {
				const res = await axios.get(`${backendUrl}/home-content/category`, {
					headers: getAuthHeader(),
				});
				setCategories(res.data?.body?.categories || []);
				setLoading(false);

				// Get all content for the home page
				const contentRes = await axios.get(`${backendUrl}/home-content/get/admin`, {
					headers: getAuthHeader(),
				});
				if (contentRes.data?.body?.homeContent) {
					contentRes.data.body.homeContent.forEach((item, index) => {
						// Add an id field to each item for DataGrid
						item.id = item._id || index; // Use _id if available, otherwise use index
					});
					setHomeContent(contentRes.data.body.homeContent);
				} else {
					enqueueSnackbar("No content found for home page", { variant: "info" });
				}
				setRefresh(false);
			} catch (error) {
				enqueueSnackbar("Failed to load categories", { variant: "error" });
			}
		};
		fetchCategories();
	}, [refresh]);

	const columnsHomeContent = [
		{
			field: 'id',
			headerName: 'ID',
			width: 0
		},
		{
			field: 'key',
			headerName: 'Element',
			width: 350,
			renderCell: (params) => {
				const [category, setCategory] = useState(null);
				React.useEffect(() => {
					const foundCategory = categories.find(cat => cat.key === params.row.key);
					if (foundCategory) {
						setCategory(foundCategory);
					}
				}, [categories, params.row.key]);
				return (<>{category?.displayName}</>);
			}
		},
		{
			field: 'value',
			headerName: 'Image',
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				const [isModalOpen, setIsModalOpen] = useState(false);
				// Try to determine if the value is an image or video
				let isImage = false;
				try {
					isImage = params.row.isImage
				} catch (e) {
					isImage = false;
				}
				return (
					<React.Fragment>
						{!isModalOpen && (
							<Button
								variant="outlined"
								onClick={() => {
									setIsModalOpen(true);
								}}
								sx={{ textTransform: 'none' }}
							>
								View {isImage ? "Image" : "Video"}
							</Button>
						)}
						{isModalOpen && (
							<Dialog
								open={isModalOpen}
								onClose={() => setIsModalOpen(false)}
								fullWidth
								maxWidth="md"
							>
								{isImage ? (
									<img src={params.value} alt={params.row.key} style={{ width: '100%', maxHeight: '80vh' }} />
								) : (
									<video width="100%" controls style={{ maxHeight: '80vh' }}>
										<source src={params.value} type="video/mp4" />
										Your browser does not support the video tag.
									</video>
								)}
								<Button
									variant="contained"
									color="primary"
									onClick={() => setIsModalOpen(false)}
									style={{ margin: '16px' }}
								>
									Close
								</Button>
							</Dialog>
						)}
					</React.Fragment>
				)
			}
		}
	]

	return (
		<React.Fragment>
			
			<Box sx={{ width: '100%', maxWidth: { sm: '100%' }, mb: 4 }}>
				<Grid container spacing={2} sx={{ mt: 3 }}>
					<Grid item size={{ xs: 12, md: 6 }}>
						<Typography variant="h2">
							Home Content
						</Typography>
					</Grid>
					<Grid item size={{ xs: 12, md: 6 }} sx={{ display: 'flex', justifyContent: 'flex-end', paddingRight: 2 }}>
						<Button
							variant='contained'
							onClick={() => {
								setModalOpen(true)
								setForm({
									key: '',
									value: ''
								});
								setDialogBoxText("Add New Image");
								setActionButtonText("Save Content");
								fileInputRefs.current = []; // Reset file input refs
							}}
						>Configure Home Content</Button>
						<Button
							variant='outlined'
							onClick={() => {
								setRefresh(true);
								setLoading(true);
								enqueueSnackbar("Refreshing content...", { variant: "info" });
							}}
							sx={{ ml: 2 }}
						>
							<RefreshIcon />
						</Button>
					</Grid>
					<Grid size={12} sx={{ mt: 4 }}>
						<DataGrid
							rows={homeContent}
							columns={columnsHomeContent}
							hideFooter
							disableColumnResize
							loading={loading}
							sx={{
								'& .MuiDataGrid-cell': {
									cursor: 'pointer'
								}
							}}
							columnVisibilityModel={{
								id: false, // Hide the ID column
							}}
						/>
					</Grid>
				</Grid>
			</Box>
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

				<Paper sx={{ p: 3, mb: 4, borderRadius: 2, boxShadow: 3, border: "1px solid #d0d0d0", minHeight: "100vh", padding: 6, overflowY: "auto" }}>
					<Grid container spacing={2}>
						<Grid size={4}>
							<FormControl fullWidth variant="filled">
								<InputLabel variant="filled" htmlFor="category-native">
									Category
								</InputLabel>
								<Select
									value={form.key}
									onChange={handleChange}
									inputProps={{
										name: 'key',
										id: 'category-native',
									}}
									required
									IconComponent={KeyboardArrowDownIcon}
								>
									<MenuItem value="" disabled> Select Category</MenuItem>
									{categories.map((cat) => (
										<MenuItem key={cat.key} value={cat}>
											{cat.displayName}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						</Grid>
						<Grid size={8} sx={{ mt: 1 }}>
							<Backdrop
								sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
								open={loader}
							>
								<CircularProgress color="inherit" />
							</Backdrop>
							<Button
								variant="contained"
								component="label"
								startIcon={<CloudUploadIcon />}
								sx={{ mb: 2 }}
							>
								Upload Image/Video
								<input
									type="file"
									accept="image/*,video/*"
									multiple={false}
									hidden
									onChange={async (e) => {
										const files = Array.from(e.target.files);
										setLoader(true);
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
														value: url,
														isImage: file.type.startsWith("image/")
													}));
													enqueueSnackbar(`Image "${file.name}" uploaded!`, { variant: "success" });
												} else {
													enqueueSnackbar(`Upload succeeded for "${file.name}" but no URL returned`, { variant: "warning" });
												}
											} catch (error) {
												console.error("Image upload failed:", error);
												enqueueSnackbar(`Image upload failed for "${file.name}". Please check file format.`, { variant: "error" });
											}
											setLoader(false);
										}
										// Reset the input value so the same files can be selected again if needed
										e.target.value = "";
									}}
								/>
							</Button>
						</Grid>

						<Grid item xs={6} sm={4} md={3} style={{ display: "flex", justifyContent: "center", position: "relative" }}>
							{form.value.length > 0 && (
								form.isImage ? (
									<img
										src={form.value}
										style={{
											width: "500px",
											height: "500px",
											objectFit: "cover",
											borderRadius: 4,
											cursor: "pointer",
										}}
									/>
								) : (
									<video width="500" controls>
										<source src={form.value} type="video/mp4" />
									</video>
								)
							)}
						</Grid>
					</Grid>
				</Paper>
			</Dialog>
		</React.Fragment>
	)
}

export default HomeContent