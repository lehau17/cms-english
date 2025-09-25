import { useDashboardQuery } from "@/hooks/useDashboard";
import {
  Book,
  CheckCircle,
  Error as ErrorIcon,
  LocalActivity,
  MoreVert,
  Notifications,
  People,
  Schedule,
  School,
  TrendingDown,
  TrendingUp,
  Warning
} from "@mui/icons-material";
import {
  Alert,
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from "@mui/material";
import * as React from "react";
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import moment from "moment";

/* ====================== Types ====================== */
type CourseSlice = {
  name: string;
  value: number;
  color: string;
};

type UpcomingClass = {
  id: string;
  classroomName: string;
  courseTitle?: string;
  teacherName: string;
  startTime: string;
  endTime: string;
  roomName?: string | null;
  activeStudents: number;
  maxStudents?: number | null;
};

type NotifType = "success" | "warning" | "error" | "info";

type NotificationItem = {
  id: string;
  title: string;
  message?: string | null;
  type: NotifType;
  createdAt: string;
};

const COURSE_COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#9254DE", "#F759AB"];

type StatCardProps = {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ElementType;
  color: string;
};

/* ====================== Component ====================== */
const DashboardPage: React.FC = () => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const { data: dashboardData, isLoading, isError, error } = useDashboardQuery();

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => setAnchorEl(null);

  const data = dashboardData?.data;

  const courseDistribution = React.useMemo<CourseSlice[]>(() => {
    if (!data?.courseDistribution?.length) return [];
    return data.courseDistribution.map((item, index) => ({
      name: item.label,
      value: item.value,
      color: COURSE_COLORS[index % COURSE_COLORS.length],
    }));
  }, [data?.courseDistribution]);

  const upcomingClasses: UpcomingClass[] = React.useMemo(() => {
    return data?.upcomingClasses ?? [];
  }, [data?.upcomingClasses]);

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

  const notifications: NotificationItem[] = React.useMemo(() => {
    return (data?.notifications ?? []).map((notif) => ({
      id: notif.id,
      title: notif.title,
      message: notif.message,
      type: normalizeNotificationType(notif.type),
      createdAt: notif.createdAt,
    }));
  }, [data?.notifications]);

  const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon: Icon, color }) => (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Box>
            <Typography color="textSecondary" gutterBottom variant="subtitle2">
              {title}
            </Typography>
            <Typography variant="h4" component="div" sx={{ mb: 1 }}>
              {value}
            </Typography>
            {change && (
              <Box sx={{ display: "flex", alignItems: "center" }}>
                {change > 0 ? (
                  <TrendingUp sx={{ color: "success.main", mr: 0.5, fontSize: 20 }} />
                ) : (
                  <TrendingDown sx={{ color: "error.main", mr: 0.5, fontSize: 20 }} />
                )}
                <Typography variant="body2" sx={{ color: change > 0 ? "success.main" : "error.main" }}>
                  {Math.abs(change)}% so với tháng trước
                </Typography>
              </Box>
            )}
          </Box>
          <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>
            <Icon />
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

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

  if (isLoading) {
    return <LinearProgress />;
  }

  if (isError) {
    return <Alert severity="error">{error.message}</Alert>;
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Dashboard
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Tổng quan hoạt động
        </Typography>
      </Box>

      {/* Quick Actions */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" spacing={2} />
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Tổng học viên" value={data?.totalStudents ?? 0} icon={People} color="primary.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Tổng khóa học" value={data?.totalCourses ?? 0} icon={School} color="secondary.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Tổng bài học" value={data?.totalLessons ?? 0} icon={Book} color="success.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Tổng hoạt động" value={data?.totalActivities ?? 0} icon={LocalActivity} color="warning.main" />
        </Grid>
      </Grid>

      {/* Notifications */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Thông báo quan trọng
              </Typography>
              <Stack spacing={2}>
                {notifications.length === 0 ? (
                  <Alert severity="info" icon={getNotificationIcon('info')}>
                    Không có thông báo mới.
                  </Alert>
                ) : (
                  notifications.map((notif) => (
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
                  ))
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h6">Học viên đăng ký (7 ngày)</Typography>
                <IconButton onClick={handleMenuClick}>
                  <MoreVert />
                </IconButton>
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                  <MenuItem onClick={handleMenuClose}>Xuất báo cáo</MenuItem>
                  <MenuItem onClick={handleMenuClose}>Xem chi tiết</MenuItem>
                </Menu>
              </Box>
              {data?.registrationTrend?.length ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.registrationTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#82ca9d"
                      name="Số học viên"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  Chưa có dữ liệu đăng ký gần đây.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Phân bố khóa học
              </Typography>
              {courseDistribution.length ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={courseDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {courseDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  Chưa có dữ liệu phân bố khóa học.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tables */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Lớp học hôm nay
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Lớp học</TableCell>
                      <TableCell>Giáo viên</TableCell>
                      <TableCell>Thời gian</TableCell>
                      <TableCell>Phòng</TableCell>
                      <TableCell align="right">Sĩ số</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {upcomingClasses.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <Typography variant="body2" color="textSecondary">
                            Không có lớp học nào trong vài giờ tới.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      upcomingClasses.map((cls) => (
                        <TableRow key={cls.id}>
                          <TableCell>
                            <Stack spacing={0.5}>
                              <Typography variant="body2" fontWeight={600}>
                                {cls.classroomName}
                              </Typography>
                              {cls.courseTitle && (
                                <Typography variant="caption" color="textSecondary">
                                  {cls.courseTitle}
                                </Typography>
                              )}
                            </Stack>
                          </TableCell>
                          <TableCell>{cls.teacherName}</TableCell>
                          <TableCell>
                            <Chip
                              icon={<Schedule />}
                              label={`${moment(cls.startTime).format('HH:mm')} - ${moment(cls.endTime).format('HH:mm')}`}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>{cls.roomName ?? 'Chưa phân phòng'}</TableCell>
                          <TableCell align="right">
                            {cls.activeStudents}
                            {typeof cls.maxStudents === 'number' && cls.maxStudents > 0
                              ? `/${cls.maxStudents}`
                              : ''}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Học viên mới
              </Typography>
              <List>
                {data?.recentStudents.map((student, index) => (
                  <React.Fragment key={student.id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: "primary.main" }}>{student.firstName.charAt(0)}</Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={`${student.firstName} ${student.lastName}`}
                        secondary={student.email}
                      />
                    </ListItem>
                    {index < (data?.recentStudents.length ?? 0) - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DashboardPage;
