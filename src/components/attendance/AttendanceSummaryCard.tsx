import { SessionAttendanceSummary } from '@/interface/attendance.interface';
import {
  Cancel as AbsentIcon,
  EventAvailable as ExcusedIcon,
  AccessTime as LateIcon,
  CheckCircle as PresentIcon,
} from '@mui/icons-material';
import { Box, Card, CardContent, Grid, LinearProgress, Typography } from '@mui/material';

interface AttendanceSummaryCardProps {
  summary: SessionAttendanceSummary;
}

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}

const StatItem = ({ icon, label, value, color }: StatItemProps) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    <Box sx={{ color }}>{icon}</Box>
    <Box>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h6" fontWeight="bold">
        {value}
      </Typography>
    </Box>
  </Box>
);

export const AttendanceSummaryCard = ({ summary }: AttendanceSummaryCardProps) => {
  const attendancePercent = Math.round(summary.attendanceRate);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Thong ke diem danh
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Ty le co mat
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              {attendancePercent}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={attendancePercent}
            color={attendancePercent >= 80 ? 'success' : attendancePercent >= 50 ? 'warning' : 'error'}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <StatItem
              icon={<PresentIcon />}
              label="Co mat"
              value={summary.present}
              color="#2e7d32"
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatItem
              icon={<AbsentIcon />}
              label="Vang"
              value={summary.absent}
              color="#d32f2f"
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatItem
              icon={<LateIcon />}
              label="Di muon"
              value={summary.late}
              color="#ed6c02"
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatItem
              icon={<ExcusedIcon />}
              label="Co phep"
              value={summary.excused}
              color="#0288d1"
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary">
            Tong so hoc sinh: <strong>{summary.totalStudents}</strong>
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AttendanceSummaryCard;
