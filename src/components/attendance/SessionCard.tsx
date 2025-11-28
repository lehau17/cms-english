import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Tooltip,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  PlayArrow as StartIcon,
  CheckCircle as CompleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { ClassroomSession, SessionStatus } from '@/interface/attendance.interface';
import SessionStatusBadge from './SessionStatusBadge';

interface SessionCardProps {
  session: ClassroomSession;
  isSelected: boolean;
  onSelect: (session: ClassroomSession) => void;
  attendanceRate?: number;
  markedCount?: number;
  totalStudents?: number;
}

const formatDateTime = (dateString: string): { date: string; time: string } => {
  const date = new Date(dateString);
  return {
    date: date.toLocaleDateString('vi-VN', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
    }),
    time: date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
};

export const SessionCard = ({
  session,
  isSelected,
  onSelect,
  attendanceRate,
  markedCount,
  totalStudents,
}: SessionCardProps) => {
  const startDateTime = formatDateTime(session.startTime);
  const endDateTime = formatDateTime(session.endTime);

  const isOngoing = session.status === SessionStatus.ONGOING || session.status === 'ongoing';
  const isCompleted = session.status === SessionStatus.COMPLETED || session.status === 'completed';
  const canTakeAttendance = isOngoing || isCompleted;

  return (
    <Card
      onClick={() => onSelect(session)}
      sx={{
        cursor: 'pointer',
        border: isSelected ? '2px solid' : '1px solid',
        borderColor: isSelected ? 'primary.main' : 'divider',
        bgcolor: isSelected ? 'primary.50' : 'background.paper',
        transition: 'all 0.2s',
        '&:hover': {
          borderColor: 'primary.light',
          boxShadow: 2,
        },
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" fontWeight="bold" noWrap>
              {session.title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {startDateTime.date} | {startDateTime.time} - {endDateTime.time}
            </Typography>
          </Box>
          <SessionStatusBadge status={session.status} size="small" />
        </Box>

        {/* Attendance Progress */}
        {canTakeAttendance && typeof attendanceRate === 'number' && (
          <Box sx={{ mt: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                Diem danh: {markedCount || 0}/{totalStudents || 0}
              </Typography>
              <Typography variant="caption" fontWeight="bold">
                {Math.round(attendanceRate)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={attendanceRate}
              color={attendanceRate >= 80 ? 'success' : attendanceRate >= 50 ? 'warning' : 'error'}
              sx={{ height: 4, borderRadius: 2 }}
            />
          </Box>
        )}

        {/* Action hint */}
        {!canTakeAttendance && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Chua the diem danh
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default SessionCard;
