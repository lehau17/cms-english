import { useRecentStudents } from "@/hooks/useDashboard";
import { PersonAdd, PersonOutline } from "@mui/icons-material";
import {
  alpha,
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Skeleton,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import moment from "moment";
import * as React from "react";

const RecentStudentsWidget: React.FC = () => {
  const { data: recentStudents, isLoading, isError } = useRecentStudents();
  const theme = useTheme();

  const getAvatarColor = (index: number) => {
    const colors = [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.success.main,
      theme.palette.warning.main,
      theme.palette.info.main,
    ];
    return colors[index % colors.length];
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <Stack spacing={1.5}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Box key={i} sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
              <Skeleton variant="circular" width={40} height={40} />
              <Box flex={1}>
                <Skeleton variant="text" width="70%" height={18} />
                <Skeleton variant="text" width="50%" height={14} />
              </Box>
            </Box>
          ))}
        </Stack>
      );
    }

    if (isError || !recentStudents || recentStudents.length === 0) {
      return (
        <Box
          sx={{
            py: 4,
            textAlign: "center",
            bgcolor: alpha(theme.palette.grey[500], 0.05),
            borderRadius: 1,
          }}
        >
          <PersonOutline sx={{ fontSize: 40, color: "text.disabled", mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            Chưa có học viên mới
          </Typography>
        </Box>
      );
    }

    return (
      <Stack spacing={1}>
        {recentStudents.slice(0, 5).map((student, index) => (
          <Box
            key={student.id}
            sx={{
              p: 1.5,
              borderRadius: 1,
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              transition: "all 0.2s",
              "&:hover": {
                bgcolor: alpha(theme.palette.primary.main, 0.05),
              },
            }}
          >
            <Avatar
              src={student.avatarUrl}
              sx={{
                bgcolor: getAvatarColor(index),
                width: 40,
                height: 40,
                fontSize: 16,
                fontWeight: 600,
              }}
            >
              {student.firstName?.charAt(0)}{student.lastName?.charAt(0)}
            </Avatar>
            <Box flex={1} minWidth={0}>
              <Typography variant="body2" fontWeight={600} noWrap>
                {student.firstName} {student.lastName}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {student.email}
              </Typography>
            </Box>
            {student.createdAt && (
              <Chip
                label={moment(student.createdAt).fromNow()}
                size="small"
                variant="outlined"
                sx={{ height: 20, fontSize: "0.65rem" }}
              />
            )}
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
            Học viên mới
          </Typography>
          <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), width: 32, height: 32 }}>
            <PersonAdd sx={{ fontSize: 18, color: "success.main" }} />
          </Avatar>
        </Stack>
        {renderContent()}
      </CardContent>
    </Card>
  );
};

export default RecentStudentsWidget;
