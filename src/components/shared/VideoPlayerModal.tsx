import { Close as CloseIcon } from '@mui/icons-material';
import {
    Box,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Typography,
} from '@mui/material';
import React from 'react';

interface VideoPlayerModalProps {
    open: boolean;
    onClose: () => void;
    videoUrl: string;
    title?: string;
}

const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
    open,
    onClose,
    videoUrl,
    title,
}) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">{title || 'Video Player'}</Typography>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
                    <video
                        src={videoUrl}
                        controls
                        autoPlay
                        style={{ width: '100%', maxHeight: '70vh', borderRadius: '8px' }}
                    >
                        Your browser does not support the video tag.
                    </video>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default VideoPlayerModal;
