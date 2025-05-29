import { Box, Button, Typography } from '@mui/material'
import React, { useState } from 'react';
import AddIcon from "@mui/icons-material/Add";
import axios from "axios";
import { backendUrl } from "../constants/url";
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


const Transition = React.forwardRef(function Transition(props, ref) {
	return <Slide direction="up" ref={ref} {...props} />;
});

const HomeContent = () => {
	const [categories, setCategories] = useState([]);
	const [loading, setLoading] = useState(true);
	const [modalOpen, setModalOpen] = useState(false);
	const [dialogBoxText, setDialogBoxText] = useState("Add New Product");
	const [actionButtonText, setActionButtonText] = useState("Create Product");
	const [homeContent, setHomeContent] = useState([]);
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
				key: form.key,
				value: form.value,
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
	};

	const fileInputRefs = React.useRef([]);

	React.useEffect(() => {
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
			} catch (error) {
				enqueueSnackbar("Failed to load categories", { variant: "error" });
			}
		};
		fetchCategories();
	}, []);

	const columnsHomeContent = [
		{
			field: 'id',
			headerName: 'ID',
			width: 90
		},
		{
			field: 'key',
			headerName: 'Key',
			width: 150,
			renderCell: (params) => {
				const [category, setCategory] = useState(null);
				React.useEffect(() => {
					const foundCategory = categories.find(cat => cat.Key === params.row.key);
					if (foundCategory) {
						setCategory(foundCategory);
					}
				}, [categories, params.row.key]);
				return (<>{category?.Value}</>);
			}
		},
		{
			field: 'value',
			headerName: 'Image',
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				const [isModalOpen, setIsModalOpen] = useState(false);
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
								View Image
							</Button>
						)}
						{isModalOpen && (
							<Dialog
								open={isModalOpen}
								onClose={() => setIsModalOpen(false)}
								fullWidth
								maxWidth="md"
							>
								<img src={params.value} alt={params.row.key} style={{ width: '100%', height: 'auto' }} />
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
							startIcon={<AddIcon />}
						>Configure Home Content</Button>
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
								>
									<MenuItem value=""> Select Category</MenuItem>
									{categories.map((cat) => (
										<MenuItem key={cat.Key} value={cat}>
											{cat.Value}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						</Grid>
						<Grid size={8}>
							<Button
								variant="contained"
								component="label"
								startIcon={<CloudUploadIcon />}
								sx={{ mb: 2 }}
							>
								Upload Image
								<input
									type="file"
									accept="image/*"
									multiple={false}
									hidden
									onChange={async (e) => {
										const files = Array.from(e.target.files);
										console.log("Selected files:", files);
										if (!files.length) return;
										for (const file of files) {
											const formData = new FormData();
											formData.append("file", file);
											console.log("Uploading file:", formData);
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
												console.log("url: ", url);
												if (url) {
													setForm(prev => ({
														...prev,
														value: url
													}));
													enqueueSnackbar(`Image "${file.name}" uploaded!`, { variant: "success" });
												} else {
													enqueueSnackbar(`Upload succeeded for "${file.name}" but no URL returned`, { variant: "warning" });
												}
											} catch (error) {
												console.error("Image upload failed:", error);
												enqueueSnackbar(`Image upload failed for "${file.name}"`, { variant: "error" });
											}
										}
										// Reset the input value so the same files can be selected again if needed
										e.target.value = "";
									}}
								/>
							</Button>
						</Grid>

						<Grid item xs={6} sm={4} md={3} style={{ display: "flex", justifyContent: "center", position: "relative" }}>
							{form.value.length > 0 && <img src={form.value} style={{
								width: "500px",
								height: "500px",
								objectFit: "cover",
								borderRadius: 4,
								cursor: "pointer",
							}} />}
						</Grid>
					</Grid>
				</Paper>
			</Dialog>
		</React.Fragment>
	)
}

export default HomeContent