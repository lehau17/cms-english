import { useNotifications } from "@/hooks/useDashboard";
import { CheckCircle, Error as ErrorIcon, Notifications, Warning } from "@mui/icons-material";
import { Alert, Box, Card, CardContent, Skeleton, Stack, Typography } from "@mui/material";
import moment from "moment";
import * as React from "react";

/* ====================== Types ====================== */
type NotifType = "success" | "warning" | "error" | "info";

type NotificationItem = {
  id: string;
  title: string;
  message?: string | null;
  type: NotifType;
  createdAt: string;
};

const NotificationsWidget: React.FC = () => {
    const { data: notifications, isLoading, isError, error } = useNotifications();

    const getNotificationIcon = (type: NotifType): React.ReactNode => {
        switch (type) {
          case "success":
            return <CheckCircle color="success" />;
          case "warning":
            return <Warning color="warning" />;
          case "error":
            return <ErrorIcon color="error" />;
          default:
            return <Notifications color="info" />;
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
        return (notifications ?? []).map((notif) => ({
          id: notif.id,
          title: notif.title,
          message: notif.message,
          type: normalizeNotificationType(notif.type),
          createdAt: notif.createdAt,
        }));
      }, [notifications]);


    const renderContent = () => {
        if (isLoading) {
            return (
                <Stack spacing={2}>
                    <Skeleton variant="rounded" width="100%" height={70} />
                    <Skeleton variant="rounded" width="100%" height={70} />
                </Stack>
            )
        }

        if (isError) {
            return <Alert severity="error">Không thể tải thông báo. {error?.message}</Alert>;
        }

        if (processedNotifications.length === 0) {
            return (
                <Alert severity="info" icon={getNotificationIcon('info')}>
                    Không có thông báo mới.
                </Alert>
            )
        }

        return (
            <Stack spacing={2}>
                {processedNotifications.map((notif) => (
                  <Alert
                    key={notif.id}
                    severity={notif.type}
                    icon={getNotificationIcon(notif.type)}
                  >
                    <Box>
                      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                        {notif.title}
                      </Typography>
                      {notif.message && (
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                          {notif.message}
                        </Typography>
                      )}
                      <Typography variant="caption" color="textSecondary">
                        {moment(notif.createdAt).fromNow()}
                      </Typography>
                    </Box>
                  </Alert>
                ))}
              </Stack>
        )
    }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Thông báo quan trọng
        </Typography>
        {renderContent()}
      </CardContent>
    </Card>
  );
};

export default NotificationsWidget;