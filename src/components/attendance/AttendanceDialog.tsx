import { useClassroomAttendanceStats } from '@/hooks/useAttendance';
import { Close as CloseIcon } from '@mui/icons-material';
import {
  Box,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { ClassroomAttendanceStats } from './ClassroomAttendanceStats';
import { MakeupRequestsTab } from './MakeupRequestsTab';
import { SessionAttendancePanel } from './SessionAttendancePanel';

interface AttendanceDialogProps {
  open: boolean;
  onClose: () => void;
  sessionId: string;
  sessionTitle: string;
  classroomId: string;
  classroomName: string;
  sessionStatus?: string;
}

type TabValue = 'session' | 'classroom' | 'makeup_requests';

export const AttendanceDialog = ({
  open,
  onClose,
  sessionId,
  sessionTitle,
  classroomId,
  classroomName,
  sessionStatus,
}: AttendanceDialogProps) => {
  const [activeTab, setActiveTab] = useState<TabValue>('session');

  const { data: classroomStats, isLoading: loadingStats } =
    useClassroomAttendanceStats(classroomId);

  const handleTabChange = (_: React.SyntheticEvent, newValue: TabValue) => {
    setActiveTab(newValue);
  };

  const isEditable = sessionStatus !== 'completed' && sessionStatus !== 'cancelled';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6">Điểm danh</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <Typography variant="body2" color="text.secondary">
                {sessionTitle}
              </Typography>
              <Chip label={classroomName} size="small" variant="outlined" />
              {sessionStatus && (
                <Chip
                  label={sessionStatus}
                  size="small"
                  color={
                    sessionStatus === 'ongoing'
                      ? 'success'
                      : sessionStatus === 'completed'
                        ? 'default'
                        : 'warning'
                  }
                />
              )}
            </Box>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Buổi học hiện tại" value="session" />
          <Tab label="Thống kê lớp" value="classroom" />
          <Tab label="Yêu cầu bù" value="makeup_requests" />
        </Tabs>
      </Box>

      <DialogContent sx={{ minHeight: 400 }}>
        {activeTab === 'session' && (
          <SessionAttendancePanel
            sessionId={sessionId}
            sessionTitle={sessionTitle}
            editable={isEditable}
          />
        )}

        {activeTab === 'classroom' && classroomStats && (
          <ClassroomAttendanceStats stats={classroomStats} loading={loadingStats} />
        )}

        {activeTab === 'makeup_requests' && (
          <MakeupRequestsTab sessionId={sessionId} classroomId={classroomId} />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AttendanceDialog;

