import { deletePodcast, getPodcasts } from "@/apis/podcast";
import { PodcastDifficulty } from "@/interface/podcast.interface";
import { Add, Delete, Edit, Visibility } from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  Container,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";

const getDifficultyColor = (difficulty: PodcastDifficulty) => {
  switch (difficulty) {
    case PodcastDifficulty.BEGINNER: return "success";
    case PodcastDifficulty.ELEMENTARY: return "info";
    case PodcastDifficulty.INTERMEDIATE: return "primary";
    case PodcastDifficulty.UPPER_INTERMEDIATE: return "warning";
    case PodcastDifficulty.ADVANCED: return "error";
    case PodcastDifficulty.EXPERT: return "secondary";
    default: return "default";
  }
};

export default function PodcastPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["podcasts"],
    queryFn: () => getPodcasts({ limit: 50 }),
  });

  const deleteMutation = useMutation({
    mutationFn: deletePodcast,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["podcasts"] });
    },
  });

  const handleDelete = (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa podcast này?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4, mt: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h4" fontWeight="bold">
          Quản lý Podcast
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          component={Link}
          to="/podcasts/create"
        >
          Tạo Podcast
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tiêu đề</TableCell>
              <TableCell>Danh mục</TableCell>
              <TableCell>Độ khó</TableCell>
              <TableCell>Lượt xem</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell align="right">Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.data.data.map((podcast) => (
              <TableRow key={podcast.id}>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    {podcast.thumbnailUrl && (
                      <img
                        src={podcast.thumbnailUrl}
                        alt={podcast.title}
                        style={{ width: 40, height: 40, borderRadius: 4, objectFit: "cover" }}
                      />
                    )}
                    <Box>
                      <Typography variant="subtitle2">{podcast.title}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {podcast.mediaType.toUpperCase()} • {podcast.duration ? `${Math.floor(podcast.duration / 60)}:${(podcast.duration % 60).toString().padStart(2, '0')}` : "00:00"}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip label={podcast.category} size="small" variant="outlined" />
                </TableCell>
                <TableCell>
                  <Chip
                    label={podcast.difficulty}
                    color={getDifficultyColor(podcast.difficulty)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{podcast.viewCount}</TableCell>
                <TableCell>
                  <Chip
                    label="Published"
                    color="success"
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Xem chi tiết">
                    <IconButton component={Link} to={`/podcasts/${podcast.id}`}>
                      <Visibility fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Chỉnh sửa">
                    <IconButton component={Link} to={`/podcasts/edit/${podcast.id}`}>
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Xóa">
                    <IconButton color="error" onClick={() => handleDelete(podcast.id)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}
