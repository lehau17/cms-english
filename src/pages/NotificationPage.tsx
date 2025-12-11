import { getNotifications } from '@/apis/notification';
import { DataTable, PageHeader, type TableColumn } from '@/components/ui';
import { NotificationChannel } from '@/interface/notification.interface';
import {
  getClassroomIdFromNotification,
  isMakeupRequestNotification,
  isRescheduleRequestNotification,
  parseNotificationData,
} from '@/utils/notification.utils';
import {
  Add as AddIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import { Box, Button, Chip, Container, Stack, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';

const getChannelColor = (channel: NotificationChannel) => {
  switch (channel) {
    case NotificationChannel.email: return 'info';
    case NotificationChannel.fcm: return 'warning';
    case NotificationChannel.sms: return 'error';
    case NotificationChannel.in_app: return 'success';
    case NotificationChannel.socket: return 'primary';
    default: return 'default';
  }
};

export default function NotificationPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => getNotifications({ limit: 50 }),
  });

  const notifications = data?.data.data || [];

  const columns: TableColumn<any>[] = [
    {
      id: 'title',
      label: 'Tiêu đề',
      render: (notification) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <NotificationsIcon color="action" />
          <Typography variant="subtitle2">{notification.title}</Typography>
        </Box>
      ),
    },
    {
      id: 'body',
      label: 'Nội dung',
      render: (notification) => (
        <Typography variant="body2" color="text.secondary">
          {notification.body || 'N/A'}
        </Typography>
      ),
    },
    {
      id: 'type',
      label: 'Loại',
      render: (notification) => (
        <Chip label={notification.type} size="small" variant="outlined" />
      ),
    },
    {
      id: 'channel',
      label: 'Kênh',
      render: (notification) => (
        <Chip
          label={notification.channel}
          color={getChannelColor(notification.channel)}
          size="small"
        />
      ),
    },
    {
      id: 'createdAt',
      label: 'Ngày tạo',
      render: (notification) => (
        <Typography variant="body2">
          {new Date(notification.createdAt).toLocaleString('vi-VN')}
        </Typography>
      ),
    },
    {
      id: 'actions',
      label: 'Thao tác',
      render: (notification) => {
        const parsedData = parseNotificationData(notification.data);
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
              onClick={() => navigate(`/classrooms/${classroomId}#attendance`)}
            >
              Xem điểm danh
            </Button>
          );
        }

        return null;
      },
    },
  ];

  return (
    <Container maxWidth="xl">
      <Stack spacing={3} sx={{ py: 3 }}>
        <PageHeader
          title="Quản lý Thông báo"
          actionButton={
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              component={Link}
              to="/notifications/create"
            >
              Gửi Thông báo
            </Button>
          }
        />

        <DataTable
          columns={columns}
          data={notifications}
          isLoading={isLoading}
          getRowId={(notification) => notification.id}
          emptyState={{
            icon: <NotificationsIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />,
            title: 'Không có thông báo',
            description: 'Chưa có thông báo nào trong hệ thống.',
            actionButton: (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                component={Link}
                to="/notifications/create"
              >
                Gửi Thông báo đầu tiên
              </Button>
            ),
          }}
        />
      </Stack>
    </Container>
  );
}
