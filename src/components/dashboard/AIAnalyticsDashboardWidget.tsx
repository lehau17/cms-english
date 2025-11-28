import {
    CheckCircleOutline,
    InfoOutlined,
    LightbulbOutlined,
    TrendingDown,
    TrendingUp
} from '@mui/icons-material';
import {
    Alert,
    Box,
    Card,
    CardContent,
    CircularProgress,
    FormControl,
    InputLabel,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    MenuItem,
    Select,
    Stack,
    Typography
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { getStudentAnalytics } from '../../apis/analytics';
import { getStudents } from '../../apis/student';
import { AnalyticsPeriod } from '../../interface/analytics.interface';

export default function AIAnalyticsDashboardWidget() {
    const [selectedStudentId, setSelectedStudentId] = useState<string>('');
    const [period] = useState<AnalyticsPeriod>(AnalyticsPeriod.LAST_30_DAYS);

    // Fetch students list
    const { data: studentsData }: any = useQuery({
        queryKey: ['students', { page: 1, limit: 50 }],
        queryFn: () => getStudents({ page: 1, limit: 50 }),
    }) as any;

    // Fetch analytics for selected student
    const { data: analytics, isLoading, error } = useQuery({
        queryKey: ['student-analytics', selectedStudentId, period],
        queryFn: () => getStudentAnalytics(selectedStudentId, period),
        enabled: !!selectedStudentId,
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

    return (
        <Card>
            <CardContent>
                <Stack spacing={2}>
                    {/* Header with Student Selector */}
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6">
                            AI Analytics
                        </Typography>
                    </Box>

                    {/* Student Selector */}
                    <FormControl fullWidth size="small">
                        <InputLabel>Chọn học viên</InputLabel>
                        <Select
                            value={selectedStudentId}
                            label="Chọn học viên"
                            onChange={(e) => setSelectedStudentId(e.target.value)}
                        >
                            {studentsData?.data?.data?.map((student: any) => (
                                <MenuItem key={student.id} value={student.id}>
                                    {student.displayName || `${student.firstName} ${student.lastName}`}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Content */}
                    {!selectedStudentId && (
                        <Alert severity="info">
                            Chọn một học viên để xem phân tích AI
                        </Alert>
                    )}

                    {selectedStudentId && isLoading && (
                        <Box display="flex" justifyContent="center" alignItems="center" py={2}>
                            <CircularProgress size={30} />
                        </Box>
                    )}

                    {selectedStudentId && error && (
                        <Alert severity="error">
                            Không thể tải phân tích AI. Vui lòng thử lại sau.
                        </Alert>
                    )}

                    {selectedStudentId && analytics && (
                        <>
                            {/* Summary */}
                            <Alert severity="info" icon={<LightbulbOutlined />}>
                                <Typography variant="body2">{analytics.aiSummary}</Typography>
                            </Alert>

                            {/* Key Metrics */}
                            <Stack direction="row" spacing={2} flexWrap="wrap">
                                <Box>
                                    <Typography variant="caption" color="text.secondary">
                                        Điểm TB
                                    </Typography>
                                    <Typography variant="h6">
                                        {analytics.averageScore != null ? analytics.averageScore.toFixed(1) : '0.0'}
                                    </Typography>
                                </Box>
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
                            </Stack>

                            {/* Top Insights */}
                            {analytics.insights.length > 0 && (
                                <Box>
                                    <Typography variant="subtitle2" gutterBottom>
                                        💡 Nhận xét
                                    </Typography>
                                    <List dense>
                                        {analytics.insights.slice(0, 2).map((insight, index) => (
                                            <ListItem key={index}>
                                                <ListItemIcon>
                                                    {getSentimentIcon(insight.sentiment)}
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={insight.category}
                                                    secondary={insight.insight}
                                                    secondaryTypographyProps={{
                                                        variant: 'body2',
                                                        noWrap: true,
                                                    }}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                </Box>
                            )}

                            {/* Top Recommendation */}
                            {analytics.recommendations && analytics.recommendations.length > 0 && (
                                <Alert
                                    severity={getPriorityColor(analytics.recommendations[0]?.priority || 'medium')}
                                    icon={<CheckCircleOutline />}
                                >
                                    <Typography variant="subtitle2">
                                        {analytics.recommendations[0]?.title}
                                    </Typography>
                                    <Typography variant="body2" noWrap>
                                        {analytics.recommendations[0]?.description}
                                    </Typography>
                                </Alert>
                            )}

                            {/* Link to full page */}
                            <Box textAlign="center">
                                <Typography
                                    variant="caption"
                                    color="primary"
                                    sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                                    onClick={() => window.location.href = `/students/${selectedStudentId}/analytics`}
                                >
                                    Xem chi tiết →
                                </Typography>
                            </Box>
                        </>
                    )}
                </Stack>
            </CardContent>
        </Card>
    );
}
