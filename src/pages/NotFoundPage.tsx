import { Box, Button, Container, Typography } from "@mui/material"; // Component UI từ Material-UI
import { Link } from "react-router-dom"; // Component điều hướng

const NotFoundPage = () => { // Component trang 404 (không tìm thấy trang)
    return (
        <Container> {/* Container giới hạn chiều rộng */}
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column", // Sắp xếp theo chiều dọc
                    justifyContent: "center", // Căn giữa theo chiều dọc
                    alignItems: "center", // Căn giữa theo chiều ngang
                    minHeight: "100vh", // Chiều cao tối thiểu full màn hình
                    textAlign: "center", // Căn giữa text
                }}
            >
                <Typography variant="h1" component="h1" gutterBottom>
                    404 {/* Mã lỗi 404 */}
                </Typography>
                <Typography variant="h4" component="h2" gutterBottom>
                    Oops! Page Not Found {/* Tiêu đề thông báo */}
                </Typography>
                <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
                    The page you are looking for might have been removed, had its name changed, or is temporarily unavailable. {/* Mô tả lỗi */}
                </Typography>
                <Button component={Link} to="/" variant="contained" color="primary">
                    Go to Homepage {/* Nút quay về trang chủ */}
                </Button>
            </Box>
        </Container>
    );
};

export default NotFoundPage; // Export component để dùng trong router
