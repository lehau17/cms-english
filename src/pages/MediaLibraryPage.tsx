import { type MediaFile } from '@/apis/media';
import MediaDetailsModal from '@/components/media/MediaDetailsModal';
import { useMediaList } from '@/hooks/useMedia';
import {
  AudioFile as AudioFileIcon,
  InsertDriveFile as FileIcon,
  Image as ImageIcon,
  VideoLibrary as VideoLibraryIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Chip,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';

export default function MediaLibraryPage() {
  const [filters, setFilters] = useState<{
    mimeType?: string;
    source?: string;
    page?: number;
    limit?: number;
  }>({ page: 1, limit: 20 });
  const [selectedMedia, setSelectedMedia] = useState<MediaFile | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const { data, isLoading } = useMediaList(filters);

  const mediaFiles = data?.data || [];
  const total = data?.total || 0;

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
      page: 1, // Reset to first page on filter change
    }));
  };

  const handleMediaClick = (media: MediaFile) => {
    setSelectedMedia(media);
    setIsDetailsModalOpen(true);
  };

  const getMediaIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <ImageIcon />;
    if (mimeType.startsWith('video/')) return <VideoLibraryIcon />;
    if (mimeType.startsWith('audio/')) return <AudioFileIcon />;
    return <FileIcon />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Media Library
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage and browse all media files in the system
        </Typography>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Type</InputLabel>
              <Select
                value={filters.mimeType || ''}
                label="Type"
                onChange={(e) => handleFilterChange('mimeType', e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="image">Image</MenuItem>
                <MenuItem value="audio">Audio</MenuItem>
                <MenuItem value="video">Video</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Source</InputLabel>
              <Select
                value={filters.source || ''}
                label="Source"
                onChange={(e) => handleFilterChange('source', e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="course_activity">Course Activity</MenuItem>
                <MenuItem value="assignment_activity">Assignment Activity</MenuItem>
                <MenuItem value="podcast">Podcast</MenuItem>
                <MenuItem value="vocabulary_term">Vocabulary Term</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Search"
              placeholder="Search by filename, tags..."
              onChange={(e) => {
                const value = e.target.value.trim();
                setFilters((prev) => ({
                  ...prev,
                  search: value || undefined,
                  page: 1,
                }));
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" color="text.secondary">
              Total: {total} files
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Media Grid */}
      {isLoading ? (
        <Typography>Loading...</Typography>
      ) : mediaFiles.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No media files found
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {mediaFiles.map((media) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={media.id}>
              <Card>
                <CardActionArea onClick={() => handleMediaClick(media)}>
                  {media.thumbnail ? (
                    <CardMedia
                      component="img"
                      height="200"
                      image={media.thumbnail}
                      alt={media.filename}
                      sx={{ objectFit: 'cover' }}
                    />
                  ) : media.mimeType.startsWith('image/') ? (
                    <CardMedia
                      component="img"
                      height="200"
                      image={media.url}
                      alt={media.filename}
                      sx={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <Box
                      sx={{
                        height: 200,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'grey.100',
                      }}
                    >
                      {getMediaIcon(media.mimeType)}
                    </Box>
                  )}
                  <CardContent>
                    <Typography variant="subtitle2" noWrap>
                      {media.filename}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                      <Chip
                        label={media.mimeType.split('/')[0]}
                        size="small"
                        variant="outlined"
                      />
                      {media.source && (
                        <Chip
                          label={media.source.replace('_', ' ')}
                          size="small"
                          variant="outlined"
                          color="primary"
                        />
                      )}
                    </Box>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                      {formatFileSize(media.size)} • {new Date(media.createdAt).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Pagination */}
      {total > (filters.limit || 20) && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              disabled={(filters.page || 1) === 1}
              onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page || 1) - 1 }))}
            >
              Previous
            </Button>
            <Typography sx={{ alignSelf: 'center', px: 2 }}>
              Page {filters.page || 1} of {Math.ceil(total / (filters.limit || 20))}
            </Typography>
            <Button
              disabled={(filters.page || 1) >= Math.ceil(total / (filters.limit || 20))}
              onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page || 1) + 1 }))}
            >
              Next
            </Button>
          </Box>
        </Box>
      )}

      {/* Details Modal */}
      {selectedMedia && (
        <MediaDetailsModal
          open={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedMedia(null);
          }}
          media={selectedMedia}
        />
      )}
    </Container>
  );
}








