import { deletePodcast, getPodcasts } from "@/apis/podcast"; // Hàm gọi API lấy danh sách và xóa podcast
import { PodcastDifficulty } from "@/interface/podcast.interface"; // Enum độ khó của podcast
import { Add, Delete, Edit, Visibility } from "@mui/icons-material"; // Icon từ Material-UI
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
} from "@mui/material"; // Component UI từ Material-UI
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"; // Hook quản lý state và cache
import { Link } from "react-router-dom"; // Component điều hướng

const getDifficultyColor = (difficulty: PodcastDifficulty) => { // Hàm trả về màu chip theo độ khó
    switch (difficulty) {
        case PodcastDifficulty.BEGINNER: return "success"; // Xanh lá cho beginner
        case PodcastDifficulty.ELEMENTARY: return "info"; // Xanh dương cho elementary
        case PodcastDifficulty.INTERMEDIATE: return "primary"; // Xanh đậm cho intermediate
        case PodcastDifficulty.UPPER_INTERMEDIATE: return "warning"; // Vàng cho upper intermediate
        case PodcastDifficulty.ADVANCED: return "error"; // Đỏ cho advanced
        case PodcastDifficulty.EXPERT: return "secondary"; // Tím cho expert
        default: return "default"; // Mặc định
    }
};

export default function PodcastPage() { // Component trang quản lý podcast
    const queryClient = useQueryClient(); // Dùng để invalidate cache sau khi xóa
    const { data, isLoading } = useQuery({
        queryKey: ["podcasts"], // Key cache cho React Query
        queryFn: () => getPodcasts({ limit: 50 }), // Hàm gọi API lấy danh sách podcast (tối đa 50)
    });

    const deleteMutation = useMutation({
        mutationFn: deletePodcast, // Hàm gọi API xóa podcast
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["podcasts"] }); // Làm mới cache sau khi xóa thành công
        },
    });

    const handleDelete = (id: string) => { // Xử lý xóa podcast
        if (window.confirm("Bạn có chắc chắn muốn xóa podcast này?")) { // Xác nhận trước khi xóa
            deleteMutation.mutate(id); // Gọi mutation xóa
        }
    };

    if (isLoading) { // Nếu đang tải dữ liệu
        return <Typography>Loading...</Typography>;
    }

    return (
        <Container maxWidth="xl"> {/* Container giới hạn chiều rộng */}
            {/* Header: tiêu đề + nút tạo podcast */}
            <Box sx={{ mb: 4, mt: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="h4" fontWeight="bold">
                    Quản lý Podcast {/* Tiêu đề trang */}
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    component={Link}
                    to="/podcasts/create" // Điều hướng sang trang tạo podcast
                >
                    Tạo Podcast {/* Nút tạo podcast mới */}
                </Button>
            </Box>

            {/* Bảng danh sách podcast */}
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
                        {data?.data.data.map((podcast) => ( // Lặp qua từng podcast
                            <TableRow key={podcast.id}>
                                <TableCell>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                        {podcast.thumbnailUrl && ( // Nếu có ảnh thumbnail
                                            <img
                                                src={podcast.thumbnailUrl}
                                                alt={podcast.title}
                                                style={{ width: 40, height: 40, borderRadius: 4, objectFit: "cover" }} // Ảnh nhỏ 40x40
                                            />
                                        )}
                                        <Box>
                                            <Typography variant="subtitle2">{podcast.title}</Typography> {/* Tên podcast */}
                                            <Typography variant="caption" color="text.secondary">
                                                {/* Loại media + thời lượng (format mm:ss) */}
                                                {podcast.mediaType.toUpperCase()} • {podcast.duration ? `${Math.floor(podcast.duration / 60)}:${(podcast.duration % 60).toString().padStart(2, '0')}` : "00:00"}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Chip label={podcast.category} size="small" variant="outlined" /> {/* Chip danh mục */}
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={podcast.difficulty}
                                        color={getDifficultyColor(podcast.difficulty)} // Màu theo độ khó
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>{podcast.viewCount}</TableCell> {/* Số lượt xem */}
                                <TableCell>
                                    <Chip
                                        label="Published"
                                        color="success"
                                        size="small"
                                    /> {/* Chip trạng thái đã xuất bản */}
                                </TableCell>
                                <TableCell align="right">
                                    <Tooltip title="Xem chi tiết">
                                        <IconButton component={Link} to={`/podcasts/${podcast.id}`}> {/* Điều hướng sang trang chi tiết */}
                                            <Visibility fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Chỉnh sửa">
                                        <IconButton component={Link} to={`/podcasts/edit/${podcast.id}`}> {/* Điều hướng sang trang sửa */}
                                            <Edit fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Xóa">
                                        <IconButton color="error" onClick={() => handleDelete(podcast.id)}> {/* Xóa podcast */}
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
