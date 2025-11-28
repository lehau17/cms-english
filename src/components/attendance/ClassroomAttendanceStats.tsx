import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Avatar,
  Chip,
} from '@mui/material';
import { ClassroomAttendanceStats as StatsData } from '@/interface/attendance.interface';

interface ClassroomAttendanceStatsProps {
  stats: StatsData;
  loading?: boolean;
}

export const ClassroomAttendanceStats = ({
  stats,
  loading = false,
}: ClassroomAttendanceStatsProps) => {
  const getAttendanceColor = (rate: number) => {
    if (rate >= 80) return 'success';
    if (rate >= 50) return 'warning';
    return 'error';
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Thong ke diem danh lop hoc
        </Typography>

        {/* Overall stats */}
        <Box
          sx={{
            display: 'flex',
            gap: 3,
            mb: 3,
            p: 2,
            bgcolor: 'primary.50',
            borderRadius: 1,
          }}
        >
          <Box>
            <Typography variant="body2" color="text.secondary">
              Tong so buoi
            </Typography>
            <Typography variant="h4">{stats.totalSessions}</Typography>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Ty le trung binh
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <LinearProgress
                variant="determinate"
                value={stats.averageAttendanceRate}
                color={getAttendanceColor(stats.averageAttendanceRate)}
                sx={{ flex: 1, height: 12, borderRadius: 6 }}
              />
              <Typography variant="h5" fontWeight="bold">
                {Math.round(stats.averageAttendanceRate)}%
              </Typography>
            </Box>
          </Box>
        </Box>

        {loading && <LinearProgress sx={{ mb: 2 }} />}

        {/* Student stats table */}
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Chi tiet theo hoc sinh
        </Typography>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Hoc sinh</TableCell>
                <TableCell align="center">Ty le</TableCell>
                <TableCell align="center">Co mat</TableCell>
                <TableCell align="center">Vang</TableCell>
                <TableCell align="center">Di muon</TableCell>
                <TableCell align="center">Co phep</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stats.studentStats.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography color="text.secondary" sx={{ py: 2 }}>
                      Chua co du lieu
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                stats.studentStats.map((student) => (
                  <TableRow key={student.studentId} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 28, height: 28, fontSize: '0.875rem' }}>
                          {student.studentName?.[0]}
                        </Avatar>
                        <Typography variant="body2">{student.studentName}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={`${Math.round(student.attendanceRate)}%`}
                        color={getAttendanceColor(student.attendanceRate)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" color="success.main">
                        {student.present}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" color="error.main">
                        {student.absent}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" color="warning.main">
                        {student.late}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" color="info.main">
                        {student.excused}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default ClassroomAttendanceStats;
