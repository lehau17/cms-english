import {
    Assessment,
    AttachMoney,
    BookmarkAdd,
    CalendarMonth,
    CheckCircle,
    Error as ErrorIcon,
    MoreVert,
    Notifications,
    People,
    PersonAdd,
    Schedule,
    School,
    TrendingDown,
    TrendingUp,
    Warning,
    Book,
    LocalActivity
} from "@mui/icons-material";
import {
    Alert,
    Avatar,
    Box,
    Button,
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
    Typography,
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
import { useDashboardQuery } from "@/hooks/useDashboard";

/* ====================== Types ====================== */
type CourseSlice = {
    name: string;
    value: number;
    color: string;
};

type UpcomingClass = {
    id: number | string;
    name: string;
    teacher: string;
    time: string;
    room: string;
    students: number;
};

type NotifType = "success" | "warning" | "error" | "info";

type NotificationItem = {
    type: NotifType;
    message: string;
};

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

    // TODO: Replace with data from API
    const courseDistribution: CourseSlice[] = [
        { name: "IELTS", value: 35, color: "#0088FE" },
        { name: "TOEIC", value: 25, color: "#00C49F" },
        { name: "Giao tiếp", value: 20, color: "#FFBB28" },
        { name: "Thiếu nhi", value: 15, color: "#FF8042" },
        { name: "Khác", value: 5, color: "#8884D8" },
    ];

    // TODO: Replace with data from API
    const upcomingClasses: UpcomingClass[] = [
        { id: 1, name: "IELTS Foundation", teacher: "Nguyễn Văn A", time: "18:00 - 20:00", room: "A201", students: 12 },
        { id: 2, name: "Business English", teacher: "Trần Thị B", time: "19:00 - 21:00", room: "B102", students: 8 },
        { id: 3, name: "Kids English", teacher: "Lê Văn C", time: "17:00 - 18:30", room: "C203", students: 15 },
        { id: 4, name: "TOEIC 700+", teacher: "Phạm Thị D", time: "20:00 - 22:00", room: "A301", students: 10 },
    ];

    // TODO: Replace with data from API
    const notifications: NotificationItem[] = [
        { type: "success", message: "5 học viên mới đăng ký hôm nay" },
        { type: "warning", message: "3 học viên sắp hết hạn học phí" },
        { type: "info", message: "Cuộc họp giáo viên lúc 14:00" },
        { type: "error", message: "2 lớp thiếu giáo viên tuần sau" },
    ];

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

    const data = dashboardData?.data;

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
                <Stack direction="row" spacing={2}>
                    <Button variant="contained" startIcon={<PersonAdd />}>
                        Thêm học viên
                    </Button>
                    <Button variant="outlined" startIcon={<BookmarkAdd />}>
                        Tạo lớp học
                    </Button>
                    <Button variant="outlined" startIcon={<Assessment />}>
                        Báo cáo
                    </Button>
                </Stack>
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
                                {notifications.map((notif, index) => (
                                    <Alert key={index} severity={notif.type} icon={getNotificationIcon(notif.type)}>
                                        {notif.message}
                                    </Alert>
                                ))}
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
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={data?.registrationTrend}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <RechartsTooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="count" stroke="#82ca9d" name="Số học viên" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Phân bố khóa học
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={courseDistribution}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={(entry: CourseSlice) => `${entry.name}: ${entry.value}%`}
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
                                        {upcomingClasses.map((cls) => (
                                            <TableRow key={cls.id}>
                                                <TableCell>{cls.name}</TableCell>
                                                <TableCell>{cls.teacher}</TableCell>
                                                <TableCell>
                                                    <Chip icon={<Schedule />} label={cls.time} size="small" variant="outlined" />
                                                </TableCell>
                                                <TableCell>{cls.room}</TableCell>
                                                <TableCell align="right">
                                                    {cls.students}/15
                                                </TableCell>
                                            </TableRow>
                                        ))}
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
