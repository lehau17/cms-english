import { useState } from 'react';
import { Box, Typography, Paper, Divider, Alert, CircularProgress } from '@mui/material';
import { ClassroomSession, SessionStatus } from '@/interface/attendance.interface';
import { useClassroomAttendanceStats } from '@/hooks/useAttendance';
import SessionList from './SessionList';
import SessionAttendancePanel from './SessionAttendancePanel';
import ClassroomAttendanceStats from './ClassroomAttendanceStats';

interface ClassroomAttendanceTabProps {
  classroomId: string;
  sessions: ClassroomSession[];
  totalStudents: number;
}

export const ClassroomAttendanceTab = ({
  classroomId,
  sessions,
  totalStudents,
}: ClassroomAttendanceTabProps) => {
  const [selectedSession, setSelectedSession] = useState<ClassroomSession | null>(null);

  // Fetch classroom stats
  const { data: classroomStats, isLoading: loadingStats } = useClassroomAttendanceStats(classroomId);

  const handleSelectSession = (session: ClassroomSession) => {
    setSelectedSession(session);
  };

  const canTakeAttendance = (session: ClassroomSession): boolean => {
    const status = session.status.toLowerCase();
    return status === 'ongoing' || status === 'completed';
  };

  // No sessions
  if (sessions.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Chua co buoi hoc nao
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Lich hoc se duoc tao tu dong khi lop bat dau
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', gap: 3, minHeight: 600 }}>
      {/* Left Panel - Session List */}
      <Paper sx={{ width: 360, flexShrink: 0, p: 2, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Danh sach buoi hoc
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Chon buoi hoc de diem danh
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <SessionList
          sessions={sessions}
          selectedSession={selectedSession}
          onSelectSession={handleSelectSession}
          totalStudents={totalStudents}
        />
      </Paper>

      {/* Right Panel - Attendance Detail */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {selectedSession ? (
          <>
            {canTakeAttendance(selectedSession) ? (
              <SessionAttendancePanel
                sessionId={selectedSession.id}
                sessionTitle={selectedSession.title}
                editable={selectedSession.status.toLowerCase() !== 'cancelled'}
              />
            ) : (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Buoi hoc chua bat dau. Chi co the diem danh khi buoi hoc dang dien ra hoac da ket thuc.
                </Alert>
                <Typography variant="h6" gutterBottom>
                  {selectedSession.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Thoi gian: {new Date(selectedSession.startTime).toLocaleString('vi-VN')}
                </Typography>
              </Paper>
            )}
          </>
        ) : (
          // Show classroom stats when no session selected
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Thong ke diem danh lop hoc
            </Typography>
            <Divider sx={{ mb: 3 }} />
            {loadingStats ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : classroomStats ? (
              <ClassroomAttendanceStats stats={classroomStats} />
            ) : (
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                Chua co du lieu diem danh. Hay chon mot buoi hoc de bat dau diem danh.
              </Typography>
            )}
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default ClassroomAttendanceTab;
