import { unblockStudent } from '@/apis/attendance.api';
import { BlockedStudent, UnblockStudentRequest } from '@/interface/attendance.interface';
import { Cancel, Unlock } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import toast from 'react-hot-toast';

interface UnblockDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  classroomId: string;
  student: BlockedStudent;
}

export const UnblockDialog: React.FC<UnblockDialogProps> = ({
  open,
  onClose,
  onSuccess,
  classroomId,
  student,
}) => {
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const queryClient = useQueryClient();

  const unblockMutation = useMutation({
    mutationFn: (data: UnblockStudentRequest) =>
      unblockStudent(classroomId, student.studentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocked-students', classroomId] });
      queryClient.invalidateQueries({ queryKey: ['blocking-config', classroomId] });
      toast.success('Đã bỏ chặn học sinh thành công');
      onSuccess();
      setReason('');
      setNotes('');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi bỏ chặn');
    },
  });

  const handleSubmit = () => {
    if (!reason.trim()) {
      toast.error('Vui lòng nhập lý do bỏ chặn');
      return;
    }

    unblockMutation.mutate({
      reason: reason.trim(),
      notes: notes.trim() || undefined,
    });
  };

  const handleClose = () => {
    if (!unblockMutation.isPending) {
      setReason('');
      setNotes('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <Unlock />
          <Typography variant="h6">Bỏ chặn học sinh</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box mb={2}>
          <Typography variant="body2" color="text.secondary" mb={1}>
            Học sinh:
          </Typography>
          <Typography variant="body1" fontWeight="medium">
            {student.studentName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {student.studentEmail}
          </Typography>
        </Box>

        {student.blockedReason && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="caption" fontWeight="medium">
              Lý do chặn hiện tại:
            </Typography>
            <Typography variant="body2">{student.blockedReason}</Typography>
          </Alert>
        )}

        <TextField
          fullWidth
          label="Lý do bỏ chặn *"
          multiline
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Ví dụ: Học sinh đã đi học lại, đã xin điểm danh bù..."
          required
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          label="Ghi chú (tùy chọn)"
          multiline
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Thêm ghi chú nếu cần..."
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleClose}
          disabled={unblockMutation.isPending}
          startIcon={<Cancel />}
        >
          Hủy
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={unblockMutation.isPending || !reason.trim()}
          startIcon={<Unlock />}
          color="primary"
        >
          {unblockMutation.isPending ? 'Đang xử lý...' : 'Bỏ chặn'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
