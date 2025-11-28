import {
    Alert,
    Box,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Stack,
    Typography,
} from '@mui/material';
import {
    TrendingUp,
    TrendingDown,
    LightbulbOutlined,
    CheckCircleOutline,
    ErrorOutline,
    InfoOutlined,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { getStudentAnalytics } from '../../apis/analytics';
import { AnalyticsPeriod } from '../../interface/analytics.interface';

interface AIAnalyticsWidgetProps {
    studentId?: string;
    period?: AnalyticsPeriod;
}

export default function AIAnalyticsWidget({
    studentId,
    period = AnalyticsPeriod.LAST_30_DAYS,
}: AIAnalyticsWidgetProps) {
    const { data: analytics, isLoading, error } = useQuery({
        queryKey: ['student-analytics', studentId, period],
        queryFn: () => getStudentAnalytics(studentId!, period),
        enabled: !!studentId,
    });

    if (!studentId) {
        return (
            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        🤖 AI Analytics
                    </Typography>
                    <Alert severity="info">
                        Chọn một học viên để xem phân tích AI
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    if (isLoading) {
        return (
            <Card>
                <CardContent>
                    <Box display="flex" justifyContent="center" alignItems="center" py={4}>
                        <CircularProgress />
                    </Box>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        🤖 AI Analytics
                    </Typography>
                    <Alert severity="error">
                        Không thể tải phân tích AI. Vui lòng thử lại sau.
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    if (!analytics) return null;

    const getSentimentIcon = (sentiment: 'positive' | 'neutral' | 'negative') => {
        switch (sentiment) {
            case 'positive':
                return <TrendingUp color="success" />;
            case 'negative':
                return <TrendingDown color="error" />;
            default:
                return <InfoOutlined color="info" />;
        }
    };

    const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
        switch (priority) {
            case 'high':
                return 'error';
            case 'medium':
                return 'warning';
            default:
                return 'success';
        }
    };

    return (
        <Card>
            <CardContent>
                <Stack spacing={2}>
                    {/* Header */}
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6">
                            🤖 AI Analytics: {analytics.studentName}
                        </Typography>
                        <Chip
                            label={`${analytics.averageScore != null ? analytics.averageScore.toFixed(1) : '0.0'} điểm`}
                            color={analytics.averageScore != null && analytics.averageScore >= 80 ? 'success' : analytics.averageScore != null && analytics.averageScore >= 60 ? 'warning' : 'error'}
                            size="small"
                        />
                    </Box>

                    {/* Summary */}
                    <Alert severity="info" icon={<LightbulbOutlined />}>
                        <Typography variant="body2">{analytics.aiSummary}</Typography>
                    </Alert>

                    {/* Key Metrics */}
                    <Stack direction="row" spacing={2} flexWrap="wrap">
                        <Box>
                            <Typography variant="caption" color="text.secondary">
                                Hoàn thành
                            </Typography>
                            <Typography variant="h6">
                                {analytics.completionRate != null ? analytics.completionRate.toFixed(1) : '0.0'}%
                            </Typography>
                        </Box>
                        <Box>
                            <Typography variant="caption" color="text.secondary">
                                Hoạt động
                            </Typography>
                            <Typography variant="h6">
                                {analytics.totalActivitiesCompleted}
                            </Typography>
                        </Box>
                        <Box>
                            <Typography variant="caption" color="text.secondary">
                                Thời gian
                            </Typography>
                            <Typography variant="h6">
                                {analytics.totalTimeSpentMinutes}min
                            </Typography>
                        </Box>
                    </Stack>

                    {/* Insights */}
                    {analytics.insights.length > 0 && (
                        <Box>
                            <Typography variant="subtitle2" gutterBottom>
                                Nhận xét
                            </Typography>
                            <List dense>
                                {analytics.insights.slice(0, 3).map((insight, index) => (
                                    <ListItem key={index}>
                                        <ListItemIcon>
                                            {getSentimentIcon(insight.sentiment)}
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={insight.category}
                                            secondary={insight.insight}
                                            secondaryTypographyProps={{
                                                variant: 'body2',
                                            }}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    )}

                    {/* Top Recommendations */}
                    {analytics.recommendations.length > 0 && (
                        <Box>
                            <Typography variant="subtitle2" gutterBottom>
                                Khuyến nghị
                            </Typography>
                            <Stack spacing={1}>
                                {analytics.recommendations.slice(0, 2).map((rec, index) => (
                                    <Alert
                                        key={index}
                                        severity={getPriorityColor(rec.priority)}
                                        icon={rec.priority === 'high' ? <ErrorOutline /> : <CheckCircleOutline />}
                                    >
                                        <Typography variant="subtitle2">{rec.title}</Typography>
                                        <Typography variant="body2">{rec.description}</Typography>
                                    </Alert>
                                ))}
                            </Stack>
                        </Box>
                    )}

                    {/* Footer */}
                    <Typography variant="caption" color="text.secondary" textAlign="right">
                        Cập nhật: {new Date(analytics.generatedAt).toLocaleString('vi-VN')}
                    </Typography>
                </Stack>
            </CardContent>
        </Card>
    );
}
