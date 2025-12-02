import { useUpcomingClasses } from "@/hooks/useDashboard";
import { CalendarMonth, Groups, Schedule } from "@mui/icons-material";
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

const UpcomingClassesWidget: React.FC = () => {
  const { data: upcomingClasses, isLoading, isError } = useUpcomingClasses();
  const theme = useTheme();

  const renderContent = () => {
    if (isLoading) {
      return (
        <Stack spacing={1.5}>
          {[1, 2, 3].map((i) => (
            <Box key={i} sx={{ display: "flex", gap: 1.5 }}>
              <Skeleton variant="rounded" width={48} height={48} />
              <Box flex={1}>
                <Skeleton variant="text" width="70%" height={18} />
                <Skeleton variant="text" width="50%" height={14} />
              </Box>
            </Box>
          ))}
        </Stack>
      );
    }

    if (isError || !upcomingClasses || upcomingClasses.length === 0) {
      return (
        <Box
          sx={{
            py: 3,
            textAlign: "center",
            bgcolor: alpha(theme.palette.grey[500], 0.05),
            borderRadius: 1,
          }}
        >
          <CalendarMonth sx={{ fontSize: 36, color: "text.disabled", mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            Không có lớp học sắp tới
          </Typography>
        </Box>
      );
    }

    return (
      <Stack spacing={1.5}>
        {upcomingClasses.slice(0, 4).map((cls) => (
          <Box
            key={cls.id}
            sx={{
              p: 1.5,
              borderRadius: 1,
              bgcolor: alpha(theme.palette.primary.main, 0.04),
              border: `1px solid ${theme.palette.divider}`,
              transition: "all 0.2s",
              "&:hover": {
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                borderColor: theme.palette.primary.main,
              },
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: "primary.main",
                  width: 40,
                  height: 40,
                }}
              >
                <Schedule sx={{ fontSize: 20 }} />
              </Avatar>
              <Box flex={1} minWidth={0}>
                <Typography variant="body2" fontWeight={600} noWrap>
                  {cls.classroomName}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                  <Chip
                    label={`${moment(cls.startTime).format("HH:mm")}`}
                    size="small"
                    color="primary"
                    sx={{ height: 18, fontSize: "0.65rem" }}
                  />
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {cls.teacherName}
                  </Typography>
                </Stack>
              </Box>
              <Chip
                icon={<Groups sx={{ fontSize: 14 }} />}
                label={cls.activeStudents}
                size="small"
                variant="outlined"
                sx={{ height: 24 }}
              />
            </Stack>
          </Box>
        ))}
      </Stack>
    );
  };

  return (
    <Card>
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="subtitle1" fontWeight={600}>
            Lớp học hôm nay
          </Typography>
          <Chip
            label={`${upcomingClasses?.length ?? 0} lớp`}
            size="small"
            color="info"
            variant="outlined"
            sx={{ height: 22 }}
          />
        </Stack>
        {renderContent()}
      </CardContent>
    </Card>
  );
};

export default UpcomingClassesWidget;
