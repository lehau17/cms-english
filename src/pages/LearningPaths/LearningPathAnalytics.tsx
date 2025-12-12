// Learning Path Analytics Page - Phase 4 CMS
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Paper,
} from '@mui/material';
import {
  LineChart,
  Line,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useLearningPathAnalytics } from '@/hooks/useLearningPaths';
import { SkillTarget } from '@/interface/learning-path.interface';

export const LearningPathAnalytics: React.FC = () => {
  const [classroomId, setClassroomId] = useState('');
  const [targetLevel, setTargetLevel] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });

  const { data: analyticsData, isLoading } = useLearningPathAnalytics({
    classroomId: classroomId || undefined,
    targetLevel: targetLevel || undefined,
    startDate: dateRange.startDate || undefined,
    endDate: dateRange.endDate || undefined,
  });

  const analytics = analyticsData?.data;

  // Prepare skill mastery data for radar chart
  const skillMasteryData = analytics?.skillMastery
    ? Object.entries(analytics.skillMastery).map(([skill, value]) => ({
        skill: skill.replace('_', ' '),
        mastery: Math.round(value),
        fullMark: 100,
      }))
    : [];

  // Prepare difficulty distribution data for line chart
  const difficultyData = analytics?.difficultyDistribution
    ? Object.entries(analytics.difficultyDistribution).map(([level, count]) => ({
        level,
        count,
      }))
    : [];

  // Sample completion rate trend data (would come from backend in production)
  const completionTrendData = [
    { date: 'Week 1', rate: 45, completed: 12, total: 27 },
    { date: 'Week 2', rate: 52, completed: 18, total: 35 },
    { date: 'Week 3', rate: 58, completed: 23, total: 40 },
    { date: 'Week 4', rate: 65, completed: 28, total: 43 },
  ];

  const getFailureRateColor = (rate: number) => {
    if (rate >= 50) return 'error';
    if (rate >= 30) return 'warning';
    return 'success';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Learning Path Analytics
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Filters
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Classroom ID"
                size="small"
                value={classroomId}
                onChange={(e) => setClassroomId(e.target.value)}
                placeholder="Optional"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Target Level</InputLabel>
                <Select
                  value={targetLevel}
                  label="Target Level"
                  onChange={(e) => setTargetLevel(e.target.value)}
                >
                  <MenuItem value="">All Levels</MenuItem>
                  <MenuItem value="A1">A1 - Beginner</MenuItem>
                  <MenuItem value="A2">A2 - Elementary</MenuItem>
                  <MenuItem value="B1">B1 - Intermediate</MenuItem>
                  <MenuItem value="B2">B2 - Upper Intermediate</MenuItem>
                  <MenuItem value="C1">C1 - Advanced</MenuItem>
                  <MenuItem value="C2">C2 - Proficiency</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                size="small"
                value={dateRange.startDate}
                onChange={(e) =>
                  setDateRange({ ...dateRange, startDate: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                size="small"
                value={dateRange.endDate}
                onChange={(e) =>
                  setDateRange({ ...dateRange, endDate: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Total Paths
              </Typography>
              <Typography variant="h4">
                {analytics?.totalPaths || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Active Paths
              </Typography>
              <Typography variant="h4" color="primary">
                {analytics?.activePaths || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Completed Paths
              </Typography>
              <Typography variant="h4" color="success.main">
                {analytics?.completedPaths || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Completion Rate
              </Typography>
              <Typography variant="h4">
                {analytics?.completionRate
                  ? `${Math.round(analytics.completionRate)}%`
                  : 'N/A'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Completion Rate Trend
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={completionTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="rate"
                    stroke="#1976d2"
                    strokeWidth={2}
                    name="Completion Rate (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-around' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Avg Completion Time
                  </Typography>
                  <Typography variant="h6">
                    {analytics?.avgCompletionTime
                      ? `${Math.round(analytics.avgCompletionTime / 60)} hrs`
                      : 'N/A'}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Skill Mastery Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={skillMasteryData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="skill" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar
                    name="Mastery Level"
                    dataKey="mastery"
                    stroke="#2e7d32"
                    fill="#4caf50"
                    fillOpacity={0.6}
                  />
                  <Tooltip />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Bottleneck Activities
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Activities with high failure rates or multiple attempts
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Activity Type</TableCell>
                      <TableCell>Failure Rate</TableCell>
                      <TableCell>Avg Attempts</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {!analytics?.bottleneckActivities ||
                    analytics.bottleneckActivities.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          <Typography color="text.secondary">
                            No bottleneck activities identified
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      analytics.bottleneckActivities.map((activity, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Chip
                              label={activity.activityType}
                              size="small"
                              color="primary"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={`${Math.round(activity.failureRate)}%`}
                              size="small"
                              color={getFailureRateColor(activity.failureRate)}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {activity.avgAttempts.toFixed(1)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {activity.failureRate >= 50 ? (
                              <Chip
                                label="Critical"
                                size="small"
                                color="error"
                              />
                            ) : activity.failureRate >= 30 ? (
                              <Chip
                                label="Warning"
                                size="small"
                                color="warning"
                              />
                            ) : (
                              <Chip
                                label="Normal"
                                size="small"
                                color="success"
                              />
                            )}
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

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Difficulty Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={difficultyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="level" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#f57c00"
                    strokeWidth={2}
                    name="Activity Count"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default LearningPathAnalytics;
