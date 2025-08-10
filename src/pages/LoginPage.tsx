// src/pages/Login.tsx
import { useAuth } from "@/hooks/useAuth";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import LoginIcon from "@mui/icons-material/Login";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import {
    Box,
    Button,
    Container,
    IconButton,
    InputAdornment,
    Paper,
    Stack,
    TextField,
    Typography
} from "@mui/material";
import * as React from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";

type FormValues = {
    email: string;
    password: string;
    remember: boolean;
};

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation() as any;
    const from = location.state?.from?.pathname || "/dashboard";

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        defaultValues: { email: "", password: "", remember: true },
        mode: "onSubmit",
    });

    const [showPwd, setShowPwd] = React.useState(false);

    const onSubmit = async (values: FormValues) => {
        // TODO: replace bằng API thật
        await new Promise((r) => setTimeout(r, 900));
        login({
            token: "jwt.token.demo",
            user: { id: "1", name: values.email.split("@")[0] || "User", email: values.email, role: "admin" },
        });
        navigate(from, { replace: true });
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "grid",
                placeItems: "center",
                // gradient vàng nhạt -> trắng
                background: "linear-gradient(90deg, rgba(255,240,180,0.9) 0%, rgba(255,247,209,0.6) 40%, rgba(255,255,255,1) 100%)",
            }}
        >
            <Container maxWidth="sm" sx={{ px: 2 }}>
                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 3, sm: 4 },
                        borderRadius: 4,
                        background: "rgba(255,255,255,0.65)",
                        backdropFilter: "blur(12px)",
                        border: "1px solid rgba(255,255,255,0.6)",
                        boxShadow:
                            "0 10px 30px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.6)",
                    }}
                >
                    <Stack spacing={3}>
                        <Stack spacing={0.5} textAlign="center">
                            <Typography variant="h4" fontWeight={800}>
                                Welcome back
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Sign in to your Dashboard
                            </Typography>
                        </Stack>

                        <Stack component="form" spacing={2} onSubmit={handleSubmit(onSubmit)} noValidate>
                            <TextField
                                label="Email"
                                fullWidth
                                autoComplete="email"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <MailOutlineIcon />
                                        </InputAdornment>
                                    ),
                                }}
                                error={!!errors.email}
                                helperText={errors.email?.message}
                                {...register("email", {
                                    required: "Email is required",
                                    pattern: {
                                        value:
                                            /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
                                        message: "Invalid email address",
                                    },
                                })}
                            />

                            <TextField
                                label="Password"
                                type={showPwd ? "text" : "password"}
                                fullWidth
                                autoComplete="current-password"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LockOutlinedIcon />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                edge="end"
                                                onClick={() => setShowPwd((v) => !v)}
                                                aria-label="toggle password visibility"
                                            >
                                                {showPwd ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                                error={!!errors.password}
                                helperText={errors.password?.message}
                                {...register("password", {
                                    required: "Password is required",
                                    minLength: { value: 6, message: "Min 6 characters" },
                                })}
                            />



                            <Button
                                type="submit"
                                size="large"
                                variant="contained"
                                startIcon={<LoginIcon />}
                                disabled={isSubmitting}
                                sx={{
                                    py: 1.2,
                                    borderRadius: 2,
                                    textTransform: "none",
                                    fontWeight: 700,
                                    background:
                                        "linear-gradient(90deg, #facc15 0%, #fde68a 60%, #fff 100%)",
                                    color: "#1f2937",
                                    boxShadow: "none",
                                    "&:hover": {
                                        background:
                                            "linear-gradient(90deg, #f59e0b 0%, #facc15 60%, #fff 100%)",
                                        boxShadow: "0 6px 20px rgba(250, 204, 21, .35)",
                                    },
                                }}
                            >
                                {isSubmitting ? "Signing in..." : "Sign in"}
                            </Button>

                            {/* <Divider>or</Divider> */}

                            {/* <Button
                                size="large"
                                variant="outlined"
                                startIcon={<GoogleIcon />}
                                sx={{
                                    py: 1.1,
                                    borderRadius: 2,
                                    textTransform: "none",
                                    fontWeight: 700,
                                    borderColor: "rgba(31,41,55,.2)",
                                    backgroundColor: "rgba(255,255,255,.7)",
                                    "&:hover": { backgroundColor: "rgba(255,255,255,.95)" },
                                }}
                                onClick={() => alert("Connect your Google OAuth here")}
                            >
                                Continue with Google
                            </Button> */}
                        </Stack>

                        <Typography variant="caption" textAlign="center" color="text.secondary">
                            By continuing you agree to our Terms & Privacy Policy.
                        </Typography>
                    </Stack>
                </Paper>
            </Container>
        </Box>
    );
}
