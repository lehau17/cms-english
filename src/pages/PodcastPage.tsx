import { deletePodcast, getPodcasts } from '@/apis/podcast';
import { DataTable, PageHeader, type ActionButton, type TableColumn } from '@/components/ui';
import { PodcastDifficulty } from '@/interface/podcast.interface';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Podcasts as PodcastsIcon,
    Visibility as VisibilityIcon
} from '@mui/icons-material';
import { Box, Button, Chip, Container, Stack, Typography } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

const getDifficultyColor = (difficulty: PodcastDifficulty) => {
    switch (difficulty) {
        case PodcastDifficulty.BEGINNER: return 'success';
        case PodcastDifficulty.ELEMENTARY: return 'info';
        case PodcastDifficulty.INTERMEDIATE: return 'primary';
        case PodcastDifficulty.UPPER_INTERMEDIATE: return 'warning';
        case PodcastDifficulty.ADVANCED: return 'error';
        case PodcastDifficulty.EXPERT: return 'secondary';
        default: return 'default';
    }
};

export default function PodcastPage() {
    const queryClient = useQueryClient();
    const { data, isLoading } = useQuery({
        queryKey: ['podcasts'],
        queryFn: () => getPodcasts({ limit: 50 }),
    });

    const deleteMutation = useMutation({
        mutationFn: deletePodcast,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['podcasts'] });
        },
    });

    const handleDelete = (id: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa podcast này?')) {
            deleteMutation.mutate(id);
        }
    };

    const podcasts = data?.data.data || [];

    const columns: TableColumn<any>[] = [
        {
            id: 'title',
            label: 'Tiêu đề',
            render: (podcast) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {podcast.thumbnailUrl && (
                        <img
                            src={podcast.thumbnailUrl}
                            alt={podcast.title}
                            style={{ width: 40, height: 40, borderRadius: 4, objectFit: 'cover' }}
                        />
                    )}
                    <Box>
                        <Typography variant="subtitle2">{podcast.title}</Typography>
                        <Typography variant="caption" color="text.secondary">
                            {podcast.mediaType.toUpperCase()} •{' '}
                            {podcast.duration
                                ? `${Math.floor(podcast.duration / 60)}:${(podcast.duration % 60).toString().padStart(2, '0')}`
                                : '00:00'}
                        </Typography>
                    </Box>
                </Box>
            ),
        },
        {
            id: 'category',
            label: 'Danh mục',
            render: (podcast) => (
                <Chip label={podcast.category} size="small" variant="outlined" />
            ),
        },
        {
            id: 'difficulty',
            label: 'Độ khó',
            render: (podcast) => (
                <Chip
                    label={podcast.difficulty}
                    color={getDifficultyColor(podcast.difficulty)}
                    size="small"
                />
            ),
        },
        {
            id: 'viewCount',
            label: 'Lượt xem',
            render: (podcast) => <Typography variant="body2">{podcast.viewCount}</Typography>,
        },
        {
            id: 'status',
            label: 'Trạng thái',
            render: () => (
                <Chip label="Published" color="success" size="small" />
            ),
        },
    ];

    const actions: ActionButton<any>[] = [
        {
            icon: <VisibilityIcon fontSize="small" />,
            label: 'Xem chi tiết',
            color: 'primary',
            onClick: (podcast) => {
                window.location.href = `/podcasts/${podcast.id}`;
            },
        },
        {
            icon: <EditIcon fontSize="small" />,
            label: 'Chỉnh sửa',
            color: 'warning',
            onClick: (podcast) => {
                window.location.href = `/podcasts/edit/${podcast.id}`;
            },
        },
        {
            icon: <DeleteIcon fontSize="small" />,
            label: 'Xóa',
            color: 'error',
            onClick: (podcast) => handleDelete(podcast.id),
        },
    ];

    return (
        <Container maxWidth="xl">
            <Stack spacing={3} sx={{ py: 3 }}>
                <PageHeader
                    title="Quản lý Podcast"
                    actionButton={
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            component={Link}
                            to="/podcasts/create"
                        >
                            Tạo Podcast
                        </Button>
                    }
                />

                <DataTable
                    columns={columns}
                    data={podcasts}
                    isLoading={isLoading}
                    actions={actions}
                    getRowId={(podcast) => podcast.id}
                    emptyState={{
                        icon: <PodcastsIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />,
                        title: 'Không có podcast',
                        description: 'Tạo podcast mới để bắt đầu.',
                        actionButton: (
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                component={Link}
                                to="/podcasts/create"
                            >
                                Tạo Podcast đầu tiên
                            </Button>
                        ),
                    }}
                />
            </Stack>
        </Container>
    );
}
