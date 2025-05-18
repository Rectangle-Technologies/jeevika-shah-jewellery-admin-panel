import { Box, Button, Grid, Modal, Typography } from '@mui/material';
import React from 'react';

const ConfirmationModal = (props) => {
    const [isLoading, setIsLoading] = React.useState(false);

    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        border: '2px solid #000',
        borderRadius: 2,
        boxShadow: 24,
        p: 4,
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            await props.onConfirm();
            props.handleClose();
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Modal
            open={props.open}
            onClose={props.handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style}>
                <Typography id="modal-modal-title" variant="h6" component="h2">
                    Are you sure?
                </Typography>
                <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                    This action cannot be undone.
                </Typography>
                <Grid container columns={12} sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                    <Grid>
                        <Button variant="contained" color='error' onClick={props.handleClose}>
                            No
                        </Button>
                    </Grid>
                    <Grid>
                        <Button variant="outlined" onClick={handleSubmit} loading={isLoading}>
                            Confirm
                        </Button>
                    </Grid>
                </Grid>
            </Box>
        </Modal>
    )
}

export default ConfirmationModal