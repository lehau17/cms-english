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
        height: "100%",
        minHeight: 200,
      }}
    >
      <CardContent sx={{ p: 3, height: "100%", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <Box sx={{ mb: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
            <Typography variant="h5" fontWeight={700}>
              {getGreeting()}, {user?.displayName || user?.firstName || "Admin"}!
            </Typography>
            <Chip
              label={new Date().toLocaleDateString("vi-VN", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
              size="small"
              sx={{
                bgcolor: alpha("#fff", 0.2),
                color: "white",
                fontWeight: 500,
              }}
            />
          </Stack>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Chào mừng bạn quay trở lại hệ thống quản lý học tiếng Anh
          </Typography>
        </Box>

        {/* Quick Actions */}
        <Box sx={{ mt: "auto" }}>
          <Typography variant="caption" sx={{ opacity: 0.8, mb: 1.5, display: "block" }}>
            Thao tác nhanh
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {quickActions.map((action) => (
              <Button
                key={action.label}
                variant="contained"
                size="small"
                startIcon={<action.icon sx={{ fontSize: 18 }} />}
                onClick={() => navigate(action.path)}
                sx={{
                  bgcolor: alpha("#fff", 0.15),
                  color: "white",
                  textTransform: "none",
                  fontWeight: 500,
                  px: 2,
                  py: 0.75,
                  "&:hover": {
                    bgcolor: alpha("#fff", 0.25),
                  },
                }}
              >
                {action.label}
              </Button>
            ))}
          </Stack>
        </Box>

        {/* CTA */}
        <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${alpha("#fff", 0.2)}` }}>
          <Button
            variant="text"
            endIcon={<ArrowForward />}
            onClick={() => navigate("/reports")}
            sx={{
              color: "white",
              textTransform: "none",
              p: 0,
              "&:hover": {
                bgcolor: "transparent",
                textDecoration: "underline",
              },
            }}
          >
            Xem báo cáo chi tiết
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default WelcomeWidget;
