import {
    Box,
    Card,
    CardContent,
    Container,
    Grid,
    Typography,
    FormControl,
    Select,
    MenuItem,
    Alert,
    Chip,
    Divider,
    Paper,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    CircularProgress,
} from '@mui/material';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
    TrendingUp,
    TrendingDown,
    InfoOutlined,
    LightbulbOutlined,
    CheckCircleOutline,
    ErrorOutline,
    Timer,
    Assignment,
    EmojiEvents,
} from '@mui/icons-material';
import { getStudentAnalytics } from '../apis/analytics';
import { AnalyticsPeriod } from '../interface/analytics.interface';

export default function StudentAnalyticsPage() {
    const { id: studentId } = useParams<{ id: string }>();
    const [period, setPeriod] = useState<AnalyticsPeriod>(AnalyticsPeriod.LAST_30_DAYS);

    const { data: analytics, isLoading, error } = useQuery({
        queryKey: ['student-analytics', studentId, period],
        queryFn: () => getStudentAnalytics(studentId!, period),
        enabled: !!studentId,
    });

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

    const getPeriodLabel = (p: AnalyticsPeriod) => {
        const labels = {
            [AnalyticsPeriod.LAST_7_DAYS]: '7 ngày qua',
            [AnalyticsPeriod.LAST_30_DAYS]: '30 ngày qua',
            [AnalyticsPeriod.LAST_90_DAYS]: '90 ngày qua',
            [AnalyticsPeriod.ALL_TIME]: 'Toàn bộ',
        };
        return labels[p] || '30 ngày qua';
    };

    if (isLoading) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
                <CircularProgress />
                <Typography variant="body2" sx={{ mt: 2 }}>
                    Đang phân tích bằng AI...
                </Typography>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Alert severity="error">
                    Không thể tải phân tích AI. Vui lòng thử lại sau.
                </Alert>
            </Container>
        );
    }

    if (!analytics) return null;

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                    <Typography variant="h4" gutterBottom>
                        🤖 AI Analytics Dashboard
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Phân tích học tập của {analytics.studentName}
                    </Typography>
                </Box>
                <FormControl sx={{ minWidth: 150 }}>
                    <Select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value as AnalyticsPeriod)}
                        size="small"
                    >
                        <MenuItem value={AnalyticsPeriod.LAST_7_DAYS}>7 ngày qua</MenuItem>
                        <MenuItem value={AnalyticsPeriod.LAST_30_DAYS}>30 ngày qua</MenuItem>
                        <MenuItem value={AnalyticsPeriod.LAST_90_DAYS}>90 ngày qua</MenuItem>
                        <MenuItem value={AnalyticsPeriod.ALL_TIME}>Toàn bộ</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            <Grid container spacing={3}>
                {/* Summary Card */}
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={2}>
                                <LightbulbOutlined sx={{ mr: 1, color: 'primary.main' }} />
                                <Typography variant="h6">Tổng quan AI</Typography>
                            </Box>
                            <Alert severity="info" sx={{ mt: 2 }}>
                                <Typography variant="body1">{analytics.aiSummary}</Typography>
                            </Alert>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Metrics Cards */}
                <Grid item xs={12} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light', color: 'white' }}>
                        <EmojiEvents sx={{ fontSize: 40, mb: 1 }} />
                        <Typography variant="h4">{analytics.averageScore.toFixed(1)}</Typography>
                        <Typography variant="caption">Điểm trung bình</Typography>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light', color: 'white' }}>
                        <CheckCircleOutline sx={{ fontSize: 40, mb: 1 }} />
                        <Typography variant="h4">{analytics.completionRate.toFixed(1)}%</Typography>
                        <Typography variant="caption">Tỷ lệ hoàn thành</Typography>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'info.light', color: 'white' }}>
                        <Assignment sx={{ fontSize: 40, mb: 1 }} />
                        <Typography variant="h4">{analytics.totalActivitiesCompleted}</Typography>
                        <Typography variant="caption">Hoạt động hoàn thành</Typography>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.light', color: 'white' }}>
                        <Timer sx={{ fontSize: 40, mb: 1 }} />
                        <Typography variant="h4">{analytics.totalTimeSpentMinutes}</Typography>
                        <Typography variant="caption">Phút học tập</Typography>
                    </Paper>
                </Grid>

                {/* Insights */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                💡 Nhận xét chi tiết
                            </Typography>
                            <Divider sx={{ my: 2 }} />
                            <List>
                                {analytics.insights.map((insight, index) => (
                                    <ListItem key={index} alignItems="flex-start">
                                        <ListItemIcon sx={{ mt: 1 }}>
                                            {getSentimentIcon(insight.sentiment)}
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={
                                                <Box display="flex" alignItems="center">
                                                    <Typography variant="subtitle1" component="span">
                                                        {insight.category}
                                                    </Typography>
                                                    <Chip
                                                        label={insight.sentiment}
                                                        size="small"
                                                        color={
                                                            insight.sentiment === 'positive'
                                                                ? 'success'
                                                                : insight.sentiment === 'negative'
                                                                    ? 'error'
                                                                    : 'default'
                                                        }
                                                        sx={{ ml: 1 }}
                                                    />
                                                </Box>
                                            }
                                            secondary={insight.insight}
                                            secondaryTypographyProps={{
                                                variant: 'body2',
                                                sx: { mt: 0.5 },
                                            }}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Recommendations */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                🎯 Khuyến nghị cải thiện
                            </Typography>
                            <Divider sx={{ my: 2 }} />
                            <Box>
                                {analytics.recommendations.map((rec, index) => (
                                    <Alert
                                        key={index}
                                        severity={getPriorityColor(rec.priority)}
                                        icon={rec.priority === 'high' ? <ErrorOutline /> : <CheckCircleOutline />}
                                        sx={{ mb: 2 }}
                                    >
                                        <Box>
                                            <Box display="flex" alignItems="center" mb={0.5}>
                                                <Typography variant="subtitle2" component="span">
                                                    {rec.title}
                                                </Typography>
                                                <Chip
                                                    label={rec.priority}
                                                    size="small"
                                                    color={getPriorityColor(rec.priority)}
                                                    sx={{ ml: 1, textTransform: 'uppercase' }}
                                                />
                                            </Box>
                                            <Typography variant="body2">{rec.description}</Typography>
                                        </Box>
                                    </Alert>
                                ))}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Footer */}
            <Box mt={3} textAlign="center">
                <Typography variant="caption" color="text.secondary">
                    Phân tích được tạo bằng Gemini AI • Cập nhật lúc:{' '}
                    {new Date(analytics.generatedAt).toLocaleString('vi-VN')}
                </Typography>
            </Box>
        </Container>
    );
}
