import { assignmentApi, type SubmissionDetail } from '@/apis/assignment';
import {
  Alert,
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { X } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import SubmissionItem from './SubmissionItem';

interface SubmissionListModalProps {
  assignmentId: string;
  classroomId: string;
  isOpen: boolean;
  onClose: () => void;
  assignmentTotalPoints?: number;
}

const SubmissionListModal: React.FC<SubmissionListModalProps> = ({
  assignmentId,
  classroomId,
  isOpen,
  onClose,
  assignmentTotalPoints = 100,
}) => {
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ['assignment-submissions', assignmentId],
    queryFn: async () => {
      const response = await assignmentApi.getAssignmentSubmissions(assignmentId);
      return response.data || [];
    },
    enabled: isOpen && !!assignmentId,
  });

  const handleGrade = (submission: SubmissionDetail) => {
    navigate(
      `/classrooms/${classroomId}/assignments/${assignmentId}/submissions/${submission.id}/grade`
    );
  };

  const submissions: SubmissionDetail[] = data || [];

  return (
    <>
      <Dialog open={isOpen} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Danh sách bài nộp</Typography>
            <IconButton onClick={onClose} size="small">
              <X />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {isLoading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error">Không thể tải danh sách bài nộp</Alert>
          ) : submissions.length === 0 ? (
            <Box textAlign="center" p={4}>
              <Typography variant="body2" color="text.secondary">
                Chưa có bài nộp nào
              </Typography>
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Học viên</TableCell>
                  <TableCell>Ngày nộp</TableCell>
                  <TableCell>Điểm AI</TableCell>
                  <TableCell>Điểm giáo viên</TableCell>
                  <TableCell>Điểm cuối</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell align="right">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {submissions.map((submission) => (
                  <SubmissionItem
                    key={submission.id}
                    submission={submission}
                    assignmentTotalPoints={assignmentTotalPoints}
                    onGrade={() => handleGrade(submission)}
                  />
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SubmissionListModal;











