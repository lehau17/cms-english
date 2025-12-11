import { useNotifications } from "@/hooks/useDashboard";
import {
  getClassroomIdFromNotification,
  isMakeupRequestNotification,
  isRescheduleRequestNotification,
  parseNotificationData,
} from "@/utils/notification.utils";
import {
  CheckCircle,
  Error as ErrorIcon,
  Notifications,
  NotificationsNone,
  Warning,
} from "@mui/icons-material";
import {
  alpha,
  Box,
  Button,
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
import { useNavigate } from "react-router-dom";

type NotifType = "success" | "warning" | "error" | "info";

type NotificationItem = {
  id: string;
  title: string;
  message?: string | null;
  type: NotifType;
  data?: string | null;
  createdAt: string;
};

const NotificationsWidget: React.FC = () => {
  const { data: notifications, isLoading, isError } = useNotifications();
  const theme = useTheme();
  const navigate = useNavigate();

  const getNotificationConfig = (type: NotifType) => {
    switch (type) {
      case "success":
        return { icon: CheckCircle, color: theme.palette.success.main };
      case "warning":
        return { icon: Warning, color: theme.palette.warning.main };
      case "error":
        return { icon: ErrorIcon, color: theme.palette.error.main };
      default:
        return { icon: Notifications, color: theme.palette.info.main };
    }
  };

  const normalizeNotificationType = (type: string): NotifType => {
    switch (type) {
      case "success":
      case "warning":
      case "error":
      case "info":
        return type;
      default:
        return "info";
    }
  };

  const processedNotifications: NotificationItem[] = React.useMemo(() => {
    return (notifications ?? []).slice(0, 4).map((notif) => ({
      id: notif.id,
      title: notif.title,
      message: notif.message,
      type: normalizeNotificationType(notif.type),
      data: notif.data,
      createdAt: notif.createdAt,
    }));
  }, [notifications]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <Stack spacing={1.5}>
          {[1, 2, 3].map((i) => (
            <Box key={i} sx={{ display: "flex", gap: 1.5 }}>
              <Skeleton variant="circular" width={32} height={32} />
              <Box flex={1}>
                <Skeleton variant="text" width="80%" height={18} />
                <Skeleton variant="text" width="50%" height={14} />
              </Box>
            </Box>
          ))}
        </Stack>
      );
    }

    if (isError || processedNotifications.length === 0) {
      return (
        <Box
          sx={{
            py: 4,
            textAlign: "center",
            bgcolor: alpha(theme.palette.grey[500], 0.05),
            borderRadius: 1,
          }}
        >
          <NotificationsNone sx={{ fontSize: 40, color: "text.disabled", mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            Không có thông báo mới
          </Typography>
        </Box>
      );
    }

    return (
      <Stack spacing={1.5}>
        {processedNotifications.map((notif) => {
          const config = getNotificationConfig(notif.type);
          const Icon = config.icon;
          return (
            <Box
              key={notif.id}
              sx={{
                p: 1.5,
                borderRadius: 1,
                bgcolor: alpha(config.color, 0.08),
                borderLeft: `3px solid ${config.color}`,
                transition: "all 0.2s",
                "&:hover": {
                  bgcolor: alpha(config.color, 0.12),
                },
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <Icon sx={{ color: config.color, fontSize: 20, mt: 0.25 }} />
                <Box flex={1} minWidth={0}>
                  <Typography variant="body2" fontWeight={600} noWrap>
                    {notif.title}
                  </Typography>
                  {notif.message && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {notif.message}
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: "block" }}>
                    {moment(notif.createdAt).fromNow()}
                  </Typography>
                  {(() => {
                    const parsedData = parseNotificationData(notif.data);
                    const isRescheduleRequest = isRescheduleRequestNotification(parsedData);
                    const isMakeupRequest = isMakeupRequestNotification(parsedData);
                    const classroomId = isMakeupRequest
                      ? getClassroomIdFromNotification(parsedData)
                      : null;

                    if (isRescheduleRequest) {
                      return (
                        <Button
                          size="small"
                          variant="outlined"
                          sx={{ mt: 1 }}
                          onClick={() => navigate('/reschedule-requests')}
                        >
                          Xem yêu cầu
                        </Button>
                      );
                    }

                    if (isMakeupRequest && classroomId) {
                      return (
                        <Button
                          size="small"
                          variant="outlined"
                          sx={{ mt: 1 }}
                          onClick={() => navigate(`/classrooms/${classroomId}#attendance`)}
                        >
                          Xem điểm danh
                        </Button>
                      );
                    }

                    return null;
                  })()}
                </Box>
              </Stack>
            </Box>
          );
        })}
      </Stack>
    );
  };

  return (
    <Card sx={{ height: "auto", maxHeight: 400, display: "flex", flexDirection: "column" }}>
      <CardContent sx={{ p: 2, pb: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Notifications color="action" fontSize="small" />
            <Typography variant="subtitle1" fontWeight={600}>
              Thông báo
            </Typography>
          </Stack>
          {processedNotifications.length > 0 && (
            <Chip
              label={`${processedNotifications.length} mới`}
              size="small"
              color="error"
              sx={{ height: 20, fontSize: "0.7rem", fontWeight: 600 }}
            />
          )}
        </Stack>
      </CardContent>
      <Box sx={{ overflowY: "auto", px: 2, pb: 2, flex: 1 }}>
        {renderContent()}
      </Box>
    </Card>
  );
};

export default NotificationsWidget;
