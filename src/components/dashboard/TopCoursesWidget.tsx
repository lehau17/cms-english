import { useTopCourses } from "@/hooks/useDashboard";
import { EmojiEvents, MenuBook, People } from "@mui/icons-material";
import {
  Alert,
  alpha,
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Skeleton,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import * as React from "react";

const medalColors: Record<number, string> = {
  0: "#FFD700", // Gold
  1: "#C0C0C0", // Silver
  2: "#CD7F32", // Bronze
};

const TopCoursesWidget: React.FC = () => {
  const { data, isLoading, isError, error } = useTopCourses();
  const theme = useTheme();

  const maxEnrollments = React.useMemo(() => {
    if (!data || data.length === 0) return 1;
    return Math.max(...data.map((c) => c.enrollments), 1);
  }, [data]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <Stack spacing={2}>
          {Array.from(new Array(5)).map((_, index) => (
            <Stack key={index} direction="row" spacing={2} alignItems="center">
              <Skeleton variant="circular" width={40} height={40} />
              <Box flex={1}>
                <Skeleton variant="text" width="80%" height={20} />
                <Skeleton variant="text" width="60%" height={16} />
              </Box>
            </Stack>
          ))}
        </Stack>
      );
    }

    if (isError) {
      return <Alert severity="error">Không thể tải dữ liệu. {error?.message}</Alert>;
    }

    if (!data || data.length === 0) {
      return (
        <Box
          sx={{
            py: 6,
            textAlign: "center",
            bgcolor: alpha(theme.palette.grey[500], 0.05),
            borderRadius: 1,
          }}
        >
          <MenuBook sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            Chưa có dữ liệu khóa học
          </Typography>
        </Box>
      );
    }

    return (
      <Stack spacing={2}>
        {data.map((course, index) => (
          <Box
            key={course.id}
            sx={{
              p: 1.5,
              borderRadius: 1,
              bgcolor: index < 3 ? alpha(medalColors[index], 0.08) : "transparent",
              border: `1px solid ${index < 3 ? alpha(medalColors[index], 0.2) : theme.palette.divider}`,
              transition: "all 0.2s",
              "&:hover": {
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                borderColor: theme.palette.primary.main,
              },
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                sx={{
                  bgcolor: medalColors[index] ?? theme.palette.grey[400],
                  width: 36,
                  height: 36,
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                {index < 3 ? <EmojiEvents sx={{ fontSize: 18 }} /> : index + 1}
              </Avatar>
              <Box flex={1} minWidth={0}>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  noWrap
                  title={course.title}
                >
                  {course.title}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                  <Chip
                    icon={<People sx={{ fontSize: 12 }} />}
                    label={course.enrollments}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: "0.7rem",
                      "& .MuiChip-icon": { fontSize: 12 },
                    }}
                  />
                  <Box flex={1}>
                    <LinearProgress
                      variant="determinate"
                      value={(course.enrollments / maxEnrollments) * 100}
                      sx={{
                        height: 4,
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                      }}
                    />
                  </Box>
                </Stack>
              </Box>
            </Stack>
          </Box>
        ))}
      </Stack>
    );
  };

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            Top khóa học
          </Typography>
          <Chip label="Top 5" size="small" color="primary" variant="outlined" />
        </Stack>
        {renderContent()}
      </CardContent>
    </Card>
  );
};

export default TopCoursesWidget;
