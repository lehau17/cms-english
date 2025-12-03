import { useLoginMutation } from "@/hooks/auth.mutations"; // Hook mutation login (TanStack Query)
import { useAuth } from "@/hooks/useAuth"; // Hook context auth (lưu token, user)
import LockOutlinedIcon from "@mui/icons-material/LockOutlined"; // Icon khóa cho password
import LoginIcon from "@mui/icons-material/Login"; // Icon nút login
import MailOutlineIcon from "@mui/icons-material/MailOutline"; // Icon email
import Visibility from "@mui/icons-material/Visibility"; // Icon mắt mở (hiện mật khẩu)
import VisibilityOff from "@mui/icons-material/VisibilityOff"; // Icon mắt đóng (ẩn mật khẩu)
import {
    Box,
    Button,
    Container,
    IconButton,
    InputAdornment,
    Paper,
    Stack,
    TextField,
    Typography,
} from "@mui/material"; // Import các component UI từ MUI
import * as React from "react"; // Import React
import { useForm } from "react-hook-form"; // Hook quản lý form
import { useLocation, useNavigate } from "react-router-dom"; // Hook điều hướng và lấy location hiện tại

type FormValues = {
    email: string // Trường email trong form
    password: string // Trường password trong form
} // Kiểu dữ liệu cho form login

export default function LoginPage() { // Component trang Login mặc định
    const { login } = useAuth() // Lấy hàm login từ AuthContext
    const navigate = useNavigate() // Hook điều hướng
    const location = useLocation() as any // Lấy thông tin route trước đó
    const from = location.state?.from?.pathname || "/dashboard" // Sau khi login sẽ redirect về trang trước hoặc /dashboard

    const loginMutation = useLoginMutation() // Tạo mutation login (gọi API)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormValues>({
        defaultValues: { email: "", password: "" }, // Giá trị mặc định của form
        mode: "onSubmit", // Validate khi submit form
    }) // Khởi tạo form với react-hook-form

    const [showPwd, setShowPwd] = React.useState(false) // State bật/tắt hiện mật khẩu

    // Hàm này chạy khi nhấn nút Login 
    const onSubmit = async (values: FormValues) => { // Hàm xử lý khi submit form
        try {
            const res = await loginMutation.mutateAsync(values) // Gọi API login bằng mutation
            // res: { token, user }
            login({ token: res.data.accessToken, user: res.data.user }) // Lưu token và user vào context/localStorage
            navigate(from, { replace: true }) // Điều hướng sang trang mong muốn sau login
        } catch (err) {
            // Login error will be handled by toast notifications // Lỗi login được xử lý bằng toast (ở interceptor / mutation)
        }
    }

    return ( // Render UI trang login
        <Box
            sx={{
                minHeight: "100vh", // Chiều cao tối thiểu full màn hình
                display: "grid", // Dùng grid để căn giữa
                placeItems: "center", // Căn giữa cả chiều ngang và dọc
                background:
                    "linear-gradient(90deg, rgba(255,240,180,0.9) 0%, rgba(255,247,209,0.6) 40%, rgba(255,255,255,1) 100%)", // Nền gradient mềm
            }}
        >
            <Container maxWidth="sm" sx={{ px: 2 }}> {/* Container giới hạn độ rộng form */}
                <Paper
                    elevation={0} // Không dùng elevation mặc định
                    sx={{
                        p: { xs: 3, sm: 4 }, // Padding responsive theo màn hình
                        borderRadius: 4, // Bo góc lớn
                        background: "rgba(255,255,255,0.65)", // Nền trắng mờ
                        backdropFilter: "blur(12px)", // Hiệu ứng blur nền phía sau
                        border: "1px solid rgba(255,255,255,0.6)", // Viền trắng mờ
                        boxShadow:
                            "0 10px 30px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.6)", // Đổ bóng mềm
                    }}
                >
                    <Stack spacing={3}> {/* Stack dọc cho toàn bộ nội dung trong card */}
                        <Stack spacing={0.5} textAlign="center"> {/* Khối tiêu đề */}
                            <Typography variant="h4" fontWeight={800}> {/* Tiêu đề lớn */}
                                Welcome back {/* Dòng chào mừng */}
                            </Typography>
                            <Typography variant="body2" color="text.secondary"> {/* Mô tả nhỏ */}
                                Sign in to your Dashboard {/* Hướng dẫn ngắn đăng nhập */}
                            </Typography>
                        </Stack>

                        <Stack
                            component="form" // Biến Stack thành thẻ form
                            spacing={2} // Khoảng cách giữa các field
                            onSubmit={handleSubmit(onSubmit)} // Xử lý submit qua react-hook-form
                            noValidate // Tắt validate HTML mặc định
                        >
                            <TextField
                                label="Email" // Nhãn input email
                                fullWidth // Chiều ngang full
                                autoComplete="email" // Gợi ý email từ trình duyệt
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start"> {/* Icon nằm bên trái input */}
                                            <MailOutlineIcon /> {/* Icon email */}
                                        </InputAdornment>
                                    ),
                                }}
                                error={!!errors.email} // Đánh dấu lỗi nếu có error.email
                                helperText={errors.email?.message} // Hiển thị message lỗi email
                                {...register("email", {
                                    required: "Email is required", // Bắt buộc nhập email
                                    pattern: {
                                        value:
                                            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/, // Regex validate email
                                        message: "Invalid email address", // Thông báo khi sai format
                                    },
                                })}
                            />

                            <TextField
                                label="Password" // Nhãn input password
                                type={showPwd ? "text" : "password"} // Đổi type theo state showPwd
                                fullWidth // Chiều ngang full
                                autoComplete="current-password" // Auto-complete password
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start"> {/* Icon khóa bên trái */}
                                            <LockOutlinedIcon /> {/* Icon password */}
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end"> {/* Icon mắt bên phải */}
                                            <IconButton
                                                edge="end" // Căn icon về cuối
                                                onClick={() => setShowPwd((v) => !v)} // Toggle hiển thị mật khẩu
                                                aria-label="toggle password visibility" // Label hỗ trợ screen reader
                                            >
                                                {showPwd ? <VisibilityOff /> : <Visibility />} {/* Đổi icon theo trạng thái */}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                                error={!!errors.password} // Đánh dấu lỗi nếu có error.password
                                helperText={errors.password?.message} // Hiển thị message lỗi password
                                {...register("password", {
                                    required: "Password is required", // Bắt buộc nhập mật khẩu
                                    minLength: { value: 6, message: "Min 6 characters" }, // Tối thiểu 6 ký tự
                                })}
                            />

                            <Button
                                type="submit" // Nút submit form
                                size="large" // Kích thước lớn
                                variant="contained" // Nút dạng contained
                                startIcon={<LoginIcon />} // Icon login bên trái text
                                disabled={loginMutation.isPending} // Disable khi đang gọi API
                                sx={{
                                    py: 1.2, // Padding vertical
                                    borderRadius: 2, // Bo góc nút
                                    textTransform: "none", // Không viết hoa toàn bộ text
                                    fontWeight: 700, // Đậm text
                                    background:
                                        "linear-gradient(90deg, #facc15 0%, #fde68a 60%, #fff 100%)", // Màu nền gradient nút
                                    color: "#1f2937", // Màu chữ
                                    boxShadow: "none", // Không dùng shadow mặc định
                                    "&:hover": {
                                        background:
                                            "linear-gradient(90deg, #f59e0b 0%, #facc15 60%, #fff 100%)", // Gradient khi hover
                                        boxShadow: "0 6px 20px rgba(250, 204, 21, .35)", // Shadow khi hover
                                    },
                                }}
                            >
                                {loginMutation.isPending ? "Signing in..." : "Sign in"} {/* Đổi text theo trạng thái mutation */}
                            </Button>
                        </Stack>

                        {loginMutation.isError && ( // Nếu mutation lỗi thì hiển thị thông báo
                            <Typography
                                color="error" // Màu chữ đỏ
                                variant="body2" // Size chữ nhỏ
                                textAlign="center" // Căn giữa
                            >
                                {(loginMutation.error as any)?.response?.data?.message || "Login failed"} {/* Lấy message lỗi từ API, fallback "Login failed" */}
                                {/* {loginMutation.} */} {/* Comment dư, không dùng */}
                            </Typography>
                        )}
                    </Stack>
                </Paper>
            </Container>
        </Box>
    )
}
