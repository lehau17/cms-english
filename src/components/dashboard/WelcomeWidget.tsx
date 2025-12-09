import { useAuth } from '@/hooks/useAuth';
import {
  Add,
  ArrowForward,
  Campaign,
  Groups,
  School,
} from "@mui/icons-material";
import {
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import * as React from "react";
import { useNavigate } from "react-router-dom";

const WelcomeWidget: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  const quickActions = [
    {
      label: "Tạo khóa học",
      icon: Add,
      path: "/courses/create",
      color: theme.palette.primary.main,
    },
    {
      label: "Quản lý lớp",
      icon: Groups,
      path: "/classrooms",
      color: theme.palette.secondary.main,
    },
    {
      label: "Giáo viên",
      icon: School,
      path: "/teachers",
      color: theme.palette.success.main,
    },
    {
      label: "Thông báo",
      icon: Campaign,
      path: "/notifications",
      color: theme.palette.warning.main,
    },
  ];

  return (
    <Card
      sx={{
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        color: "white",
        boxShadow: theme.shadows[10],
        overflow: "visible", // Allow overflow for creative designs if needed later
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, md: 4 }, display: "flex", flexDirection: { xs: "column", md: "row" }, alignItems: { md: "center" }, gap: 3 }}>
        {/* Header Section */}
        <Box sx={{ flex: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.5 }}>
            <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: "-0.5px" }}>
              {getGreeting()}, {user?.displayName || user?.firstName || "Admin"}!
            </Typography>
            <Chip
              label="Beta"
              size="small"
              sx={{
                bgcolor: alpha("#fff", 0.2),
                color: "white",
                fontWeight: 600,
                height: 24,
              }}
            />
          </Stack>
          <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: 600, lineHeight: 1.6, mb: 2 }}>
            Chào mừng trở lại. Hôm nay là {new Date().toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}.
          </Typography>

          <Button
            variant="outlined"
            onClick={() => navigate("/reports")}
            sx={{
              color: "white",
              borderColor: alpha("#fff", 0.3),
              "&:hover": {
                borderColor: "white",
                bgcolor: alpha("#fff", 0.05),
              },
            }}
          >
            Xem báo cáo tổng quan
          </Button>
        </Box>

        {/* Quick Actions Panel */}
        <Box sx={{
          minWidth: { md: 280, lg: 320 },
          p: 2,
          bgcolor: alpha("#fff", 0.1),
          borderRadius: 2,
          backdropFilter: "blur(10px)"
        }}>
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5, opacity: 0.9 }}>
            Thao tác nhanh
          </Typography>
          <Grid container spacing={1}>
            {quickActions.map((action) => (
              <Grid item xs={6} key={action.label}>
                <Button
                  fullWidth
                  variant="contained"
                  size="small"
                  startIcon={<action.icon sx={{ fontSize: 18 }} />}
                  onClick={() => navigate(action.path)}
                  sx={{
                    justifyContent: "flex-start",
                    bgcolor: alpha("#fff", 0.15),
                    color: "white",
                    textTransform: "none",
                    fontWeight: 500,
                    boxShadow: "none",
                    "&:hover": {
                      bgcolor: alpha("#fff", 0.25),
                      boxShadow: "none",
                    },
                  }}
                >
                  {action.label}
                </Button>
              </Grid>
            ))}
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};

export default WelcomeWidget;
