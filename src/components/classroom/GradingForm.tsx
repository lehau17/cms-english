import { assignmentApi, type SubmissionDetail } from '@/apis/assignment';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Award, X } from 'lucide-react';
import React, { useState } from 'react';

interface GradingFormProps {
  submission: SubmissionDetail;
  assignmentId: string;
  assignmentTotalPoints: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const GradingForm: React.FC<GradingFormProps> = ({
  submission,
  assignmentId,
  assignmentTotalPoints,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const [grade, setGrade] = useState<string>(
    submission.score?.toString() || submission.aiScore?.toString() || ''
  );
  const [feedback, setFeedback] = useState<string>(submission.feedback || '');

  const gradeMutation = useMutation({
    mutationFn: async (data: { grade: number; feedback?: string }) => {
      return assignmentApi.gradeSubmission(assignmentId, submission.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignment-submissions', assignmentId] });
      onSuccess();
    },
  });

  const handleSubmit = () => {
    const gradeNum = parseFloat(grade);
    if (isNaN(gradeNum) || gradeNum < 0 || gradeNum > assignmentTotalPoints) {
      alert(`Điểm phải từ 0 đến ${assignmentTotalPoints}`);
      return;
    }

    gradeMutation.mutate({
      grade: Math.round(gradeNum),
      feedback: feedback.trim() || undefined,
    });
  };

  const hasAIScore = submission.aiScore !== null && submission.aiScore !== undefined;

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Chấm bài</Typography>
          <Button onClick={onClose} size="small" startIcon={<X />}>
            Đóng
          </Button>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={3} mt={2}>
          {/* Student Info */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Học viên
            </Typography>
            <Typography variant="body1">
              {submission.student.displayName ||
                `${submission.student.firstName || ''} ${submission.student.lastName || ''}`.trim() ||
                submission.student.email ||
                'Học viên'}
            </Typography>
          </Box>

          {/* AI Evaluation (if available) */}
          {hasAIScore && (
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'info.light', bgcolor: 'rgba(33, 150, 243, 0.1)' }}>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Award size={16} />
                <Typography variant="subtitle2" fontWeight="bold">
                  Đánh giá AI (Tham khảo)
                </Typography>
              </Box>
              <Typography variant="body2" gutterBottom>
                <strong>Điểm:</strong> {submission.aiScore}/{assignmentTotalPoints}
              </Typography>
              {submission.aiFeedback && (
                <Typography variant="body2" color="text.secondary">
                  <strong>Nhận xét:</strong> {submission.aiFeedback}
                </Typography>
              )}
            </Paper>
          )}

          <Divider />

          {/* Grade Input */}
          <TextField
            label="Điểm"
            type="number"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            inputProps={{
              min: 0,
              max: assignmentTotalPoints,
              step: 0.1,
            }}
            helperText={`Điểm tối đa: ${assignmentTotalPoints}`}
            fullWidth
            required
          />

          {/* Feedback Input */}
          <TextField
            label="Nhận xét"
            multiline
            rows={4}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Nhập nhận xét cho học viên..."
            fullWidth
          />

          {gradeMutation.isError && (
            <Alert severity="error">
              {gradeMutation.error instanceof Error
                ? gradeMutation.error.message
                : 'Có lỗi xảy ra khi chấm bài'}
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={gradeMutation.isPending || !grade}
        >
          {gradeMutation.isPending ? 'Đang lưu...' : 'Lưu điểm'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GradingForm;




