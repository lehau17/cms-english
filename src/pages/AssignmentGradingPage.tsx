import { assignmentApi, type Assignment, type SubmissionDetail } from '@/apis/assignment';
import {
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Grade as GradeIcon,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import GradingForm from '../components/classroom/GradingForm';

export default function AssignmentGradingPage() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionDetail | null>(null);
  const [isGradingOpen, setIsGradingOpen] = useState(false);

  // Fetch assignment details
  const {
    data: assignment,
    isLoading: isLoadingAssignment,
    error: assignmentError,
  } = useQuery<Assignment>({
    queryKey: ['assignment', assignmentId],
    queryFn: () => assignmentApi.getAssignmentById(assignmentId!),
    enabled: !!assignmentId,
  });

  // Fetch submissions
  const {
    data: submissionsData,
    isLoading: isLoadingSubmissions,
    error: submissionsError,
    refetch: refetchSubmissions,
  } = useQuery({
    queryKey: ['assignment-submissions', assignmentId],
    queryFn: () => assignmentApi.getSubmissions(assignmentId!),
    enabled: !!assignmentId,
  });

  const handleGrade = (submission: SubmissionDetail) => {
    setSelectedSubmission(submission);
    setIsGradingOpen(true);
  };

  const handleGradingSuccess = () => {
    toast.success('Chấm điểm thành công');
    setIsGradingOpen(false);
    setSelectedSubmission(null);
    refetchSubmissions();
  };

  const isLoading = isLoadingAssignment || isLoadingSubmissions;
  const error = assignmentError || submissionsError;

  if (isLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error || !assignment) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error">
          Không thể tải thông tin bài tập. {(error as Error)?.message}
        </Alert>
      </Container>
    );
  }

  const submissions = submissionsData?.submissions || [];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <IconButton onClick={() => navigate(-1)}>
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" component="h1" fontWeight="bold">
              Chấm điểm: {assignment.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tổng điểm: {assignment.totalPoints || 100} | Số bài nộp: {submissions.length}
            </Typography>
          </Box>
          <Chip
            icon={<GradeIcon />}
            label={assignment.isPublished ? 'Đã xuất bản' : 'Nháp'}
            color={assignment.isPublished ? 'success' : 'default'}
          />
        </Box>
      </Box>

      {/* Assignment Info */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                Mô tả
              </Typography>
              <Typography variant="body1">
                {assignment.description || 'Không có mô tả'}
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary">
                Hạn nộp
              </Typography>
              <Typography variant="body1">
                {assignment.dueDate
                  ? new Date(assignment.dueDate).toLocaleString('vi-VN')
                  : 'Không có hạn'}
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary">
                Số lần làm tối đa
              </Typography>
              <Typography variant="body1">
                {assignment.maxAttempts || 'Không giới hạn'}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Submissions Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Danh sách bài nộp
          </Typography>
          <Divider sx={{ mb: 2 }} />

          {submissions.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
              Chưa có bài nộp nào
            </Typography>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Học sinh</TableCell>
                    <TableCell>Trạng thái</TableCell>
                    <TableCell>Thời gian nộp</TableCell>
                    <TableCell>Lần thử</TableCell>
                    <TableCell>Điểm</TableCell>
                    <TableCell>Hành động</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {submissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {submission.student?.firstName} {submission.student?.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {submission.student?.email}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={
                            submission.status === 'graded'
                              ? 'Đã chấm'
                              : submission.status === 'submitted'
                              ? 'Đã nộp'
                              : submission.status === 'late'
                              ? 'Nộp muộn'
                              : 'Chưa nộp'
                          }
                          color={
                            submission.status === 'graded'
                              ? 'success'
                              : submission.status === 'submitted'
                              ? 'info'
                              : submission.status === 'late'
                              ? 'warning'
                              : 'default'
                          }
                        />
                      </TableCell>
                      <TableCell>
                        {submission.submittedAt
                          ? new Date(submission.submittedAt).toLocaleString('vi-VN')
                          : '-'}
                      </TableCell>
                      <TableCell>{submission.attempt}</TableCell>
                      <TableCell>
                        {submission.score !== null && submission.score !== undefined
                          ? `${submission.score}/${assignment.totalPoints || 100}`
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={submission.status === 'graded' ? <CheckCircleIcon /> : <GradeIcon />}
                          onClick={() => handleGrade(submission)}
                        >
                          {submission.status === 'graded' ? 'Xem/Sửa' : 'Chấm điểm'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Grading Form Modal */}
      {selectedSubmission && (
        <GradingForm
          submission={selectedSubmission}
          assignmentId={assignmentId!}
          assignmentTotalPoints={assignment.totalPoints || 100}
          isOpen={isGradingOpen}
          onClose={() => {
            setIsGradingOpen(false);
            setSelectedSubmission(null);
          }}
          onSuccess={handleGradingSuccess}
        />
      )}
    </Container>
  );
}
