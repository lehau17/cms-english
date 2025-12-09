import {
  useBulkMarkAttendance,
  useDeleteAttendance,
  useMarkAllAbsent,
  useMarkAttendance,
  useQuickCheckIn,
  useQuickCheckOut,
  useSessionSummary,
  useUnmarkedStudents,
} from '@/hooks/useAttendance';
import { AttendanceStatus, BulkAttendanceRequest } from '@/interface/attendance.interface';
import { PersonOff as MarkAbsentIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Snackbar,
  Typography,
} from '@mui/material';
import { useCallback, useState } from 'react';
import { AttendanceSummaryCard } from './AttendanceSummaryCard';
import { AttendanceTable } from './AttendanceTable';
import { BulkAttendanceActions } from './BulkAttendanceActions';

interface SessionAttendancePanelProps {
  sessionId: string;
  sessionTitle?: string;
  editable?: boolean;
}

export const SessionAttendancePanel = ({
  sessionId,
  sessionTitle,
  editable = true,
}: SessionAttendancePanelProps) => {
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [confirmMarkAllAbsent, setConfirmMarkAllAbsent] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({ open: false, message: '', severity: 'info' });

  // Queries
  const {
    data: summary,
    isLoading: loadingSummary,
    error: summaryError,
    refetch: refetchSummary,
  } = useSessionSummary(sessionId);

  const {
    data: unmarkedStudents,
    isLoading: loadingUnmarked,
    error: unmarkedError,
    refetch: refetchUnmarked,
  } = useUnmarkedStudents(sessionId);

  // Mutations
  const markAttendanceMutation = useMarkAttendance(sessionId);
  const bulkMarkMutation = useBulkMarkAttendance(sessionId);
  const quickCheckInMutation = useQuickCheckIn(sessionId);
  const quickCheckOutMutation = useQuickCheckOut(sessionId);
  const markAllAbsentMutation = useMarkAllAbsent(sessionId);
  const deleteAttendanceMutation = useDeleteAttendance(sessionId);

  const isLoading = loadingSummary || loadingUnmarked;
  const hasError = summaryError || unmarkedError;
  const isMutating =
    markAttendanceMutation.isPending ||
    bulkMarkMutation.isPending ||
    quickCheckInMutation.isPending ||
    quickCheckOutMutation.isPending ||
    markAllAbsentMutation.isPending ||
    deleteAttendanceMutation.isPending;

  // Log error for debugging
  if (summaryError) {
    console.error('Attendance API Error:', {
      sessionId,
      error: summaryError,
      message: summaryError instanceof Error ? summaryError.message : 'Unknown error',
    });
  }

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleRefresh = useCallback(() => {
    refetchSummary();
    refetchUnmarked();
    setSelectedStudentIds([]);
  }, [refetchSummary, refetchUnmarked]);

  const handleStatusChange = useCallback(
    async (studentId: string, status: AttendanceStatus, notes?: string) => {
      try {
        await markAttendanceMutation.mutateAsync({
          studentId,
          data: { status, notes },
        });
        showSnackbar('Cap nhat trang thai thanh cong');
      } catch (error) {
        showSnackbar('Loi khi cap nhat trang thai', 'error');
      }
    },
    [markAttendanceMutation]
  );

  const handleBulkMark = useCallback(
    async (status: AttendanceStatus) => {
      if (selectedStudentIds.length === 0) return;

      const request: BulkAttendanceRequest = {
        attendances: selectedStudentIds.map((studentId) => ({
          studentId,
          status,
        })),
      };

      try {
        await bulkMarkMutation.mutateAsync(request);
        showSnackbar(`Da danh dau ${selectedStudentIds.length} hoc sinh`);
        setSelectedStudentIds([]);
      } catch (error) {
        showSnackbar('Loi khi danh dau hang loat', 'error');
      }
    },
    [selectedStudentIds, bulkMarkMutation]
  );

  const handleCheckIn = useCallback(
    async (studentId: string) => {
      try {
        await quickCheckInMutation.mutateAsync(studentId);
        showSnackbar('Check-in thanh cong');
      } catch (error) {
        showSnackbar('Loi khi check-in', 'error');
      }
    },
    [quickCheckInMutation]
  );

  const handleCheckOut = useCallback(
    async (studentId: string) => {
      try {
        await quickCheckOutMutation.mutateAsync(studentId);
        showSnackbar('Check-out thanh cong');
      } catch (error) {
        showSnackbar('Loi khi check-out', 'error');
      }
    },
    [quickCheckOutMutation]
  );

  const handleMarkAllAbsent = useCallback(async () => {
    try {
      const result = await markAllAbsentMutation.mutateAsync();
      showSnackbar(`Da danh dau vang ${result.markedCount} hoc sinh`);
      setConfirmMarkAllAbsent(false);
    } catch (error) {
      showSnackbar('Loi khi danh dau vang tat ca', 'error');
    }
  }, [markAllAbsentMutation]);

  const handleDelete = useCallback(
    async (studentId: string) => {
      try {
        await deleteAttendanceMutation.mutateAsync(studentId);
        showSnackbar('Da xoa ban ghi diem danh');
      } catch (error) {
        showSnackbar('Loi khi xoa', 'error');
      }
    },
    [deleteAttendanceMutation]
  );

  const handleSelectAll = useCallback(() => {
    if (summary?.attendances) {
      setSelectedStudentIds(summary.attendances.map((a) => a.studentId));
    }
  }, [summary]);

  const handleClearSelection = useCallback(() => {
    setSelectedStudentIds([]);
  }, []);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (hasError) {
    const errorMessage = summaryError instanceof Error
      ? summaryError.message
      : unmarkedError instanceof Error
        ? unmarkedError.message
        : 'Khong the tai thong tin diem danh. Vui long thu lai sau.';

    const statusCode = (summaryError as any)?.response?.status || (unmarkedError as any)?.response?.status;
    const isServerError = statusCode >= 500;

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, py: 4 }}>
        <Alert
          severity="error"
          action={
            <Button
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              size="small"
              color="inherit"
            >
              Thu lai
            </Button>
          }
        >
          <Typography variant="h6" gutterBottom>
            Loi khi tai thong tin diem danh
          </Typography>
          <Typography variant="body2">
            {isServerError
              ? 'May chu dang gap su co. Vui long thu lai sau hoac lien he quan tri vien.'
              : errorMessage}
          </Typography>
          {process.env.NODE_ENV === 'development' && (
            <Typography variant="caption" sx={{ display: 'block', mt: 1, fontFamily: 'monospace' }}>
              Session ID: {sessionId}
              {statusCode && ` | Status: ${statusCode}`}
            </Typography>
          )}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          {sessionTitle ? `Diem danh: ${sessionTitle}` : 'Diem danh buoi hoc'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={isMutating}
            size="small"
          >
            Lam moi
          </Button>
        </Box>
      </Box>

      {/* Summary Card */}
      {summary && <AttendanceSummaryCard summary={summary} />}

      {/* Unmarked students alert */}
      {unmarkedStudents && unmarkedStudents.length > 0 && editable && (
        <Alert
          severity="warning"
          action={
            <Button
              color="inherit"
              size="small"
              startIcon={<MarkAbsentIcon />}
              onClick={() => setConfirmMarkAllAbsent(true)}
            >
              Danh dau vang tat ca
            </Button>
          }
        >
          Con {unmarkedStudents.length} hoc sinh chua diem danh:{' '}
          {unmarkedStudents.map((s) => s.displayName || `${s.lastName} ${s.firstName}`).join(', ')}
        </Alert>
      )}

      {/* Bulk Actions */}
      {editable && summary?.attendances && summary.attendances.length > 0 && (
        <Paper sx={{ p: 2 }}>
          <BulkAttendanceActions
            selectedCount={selectedStudentIds.length}
            onBulkMark={handleBulkMark}
            onSelectAll={handleSelectAll}
            onClearSelection={handleClearSelection}
            disabled={isMutating}
          />
        </Paper>
      )}

      {/* Attendance Table */}
      {summary?.attendances && (
        <AttendanceTable
          attendances={summary.attendances}
          selectedIds={selectedStudentIds}
          onSelectionChange={setSelectedStudentIds}
          onStatusChange={handleStatusChange}
          onCheckIn={editable ? handleCheckIn : undefined}
          onCheckOut={editable ? handleCheckOut : undefined}
          onDelete={editable ? handleDelete : undefined}
          loading={isMutating}
          editable={editable}
        />
      )}

      {/* Confirm Mark All Absent Dialog */}
      <Dialog open={confirmMarkAllAbsent} onClose={() => setConfirmMarkAllAbsent(false)}>
        <DialogTitle>Xac nhan danh dau vang</DialogTitle>
        <DialogContent>
          <Typography>
            Ban co chac muon danh dau tat ca {unmarkedStudents?.length || 0} hoc sinh chua diem danh
            la "Vang"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmMarkAllAbsent(false)}>Huy</Button>
          <Button
            onClick={handleMarkAllAbsent}
            color="error"
            variant="contained"
            disabled={markAllAbsentMutation.isPending}
          >
            {markAllAbsentMutation.isPending ? 'Dang xu ly...' : 'Xac nhan'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Box>
  );
};

export default SessionAttendancePanel;
