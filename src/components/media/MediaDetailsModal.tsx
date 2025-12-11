import { type MediaFile } from '@/apis/media';
import { Close as CloseIcon, ContentCopy as CopyIcon } from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface MediaDetailsModalProps {
  open: boolean;
  onClose: () => void;
  media: MediaFile;
}

export default function MediaDetailsModal({
  open,
  onClose,
  media,
}: MediaDetailsModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(media.url);
    setCopied(true);
    toast.success('URL copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Media Details</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          {/* Preview */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              {media.mimeType.startsWith('image/') ? (
                <img
                  src={media.url}
                  alt={media.filename}
                  style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain' }}
                />
              ) : media.mimeType.startsWith('video/') ? (
                <video
                  src={media.url}
                  controls
                  style={{ maxWidth: '100%', maxHeight: '400px' }}
                />
              ) : media.mimeType.startsWith('audio/') ? (
                <audio src={media.url} controls style={{ width: '100%' }} />
              ) : (
                <Typography>Preview not available</Typography>
              )}
            </Paper>
          </Grid>

          {/* Metadata */}
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Filename
              </Typography>
              <Typography variant="body1">{media.filename}</Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Type
              </Typography>
              <Chip label={media.mimeType} size="small" sx={{ mt: 0.5 }} />
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Size
              </Typography>
              <Typography variant="body1">{formatFileSize(media.size)}</Typography>
            </Box>

            {media.duration && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Duration
                </Typography>
                <Typography variant="body1">{formatDuration(media.duration)}</Typography>
              </Box>
            )}

            {media.source && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Source
                </Typography>
                <Chip
                  label={media.source.replace(/_/g, ' ')}
                  size="small"
                  color="primary"
                  sx={{ mt: 0.5 }}
                />
              </Box>
            )}

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Usage Count
              </Typography>
              <Typography variant="body1">{media.usageCount}</Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Created
              </Typography>
              <Typography variant="body1">
                {new Date(media.createdAt).toLocaleString()}
              </Typography>
            </Box>

            {media.tags && media.tags.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  Tags
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {media.tags.map((tag, index) => (
                    <Chip key={index} label={tag} size="small" variant="outlined" />
                  ))}
                </Box>
              </Box>
            )}

            {media.description && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Description
                </Typography>
                <Typography variant="body2">{media.description}</Typography>
              </Box>
            )}

            {media.context && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Context
                </Typography>
                <Paper sx={{ p: 1, bgcolor: 'grey.50', mt: 0.5 }}>
                  <Typography variant="body2" component="pre" sx={{ fontSize: '0.75rem' }}>
                    {JSON.stringify(media.context, null, 2)}
                  </Typography>
                </Paper>
              </Box>
            )}

            <Button
              variant="outlined"
              startIcon={<CopyIcon />}
              onClick={handleCopyUrl}
              fullWidth
              sx={{ mt: 2 }}
            >
              {copied ? 'Copied!' : 'Copy URL'}
            </Button>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
}





