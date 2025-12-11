import {
  getSessionMakeupRequests,
  reviewMakeupRequest,
} from '@/apis/attendance.api';
import type { MakeupAttendanceRequest } from '@/interface/makeup-request.interface';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  Description as DescriptionIcon,
  Image as ImageIcon,
  OpenInNew as OpenInNewIcon,
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Link,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface MakeupRequestsTabProps {
  sessionId: string;
  classroomId: string;
}

const STATUS_COLORS: Record<string, 'warning' | 'success' | 'error'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Đang chờ',
  approved: 'Đã duyệt',
  rejected: 'Đã từ chối',
};

export const MakeupRequestsTab = ({
  sessionId,
  classroomId,
}: MakeupRequestsTabProps) => {
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<MakeupAttendanceRequest | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewNote, setReviewNote] = useState('');
  const [reviewNoteError, setReviewNoteError] = useState('');
  const [reviewAction, setReviewAction] = useState<'approved' | 'rejected'>('approved');

  const { data, isLoading, error } = useQuery({
    queryKey: ['makeup-requests', sessionId],
    queryFn: () => getSessionMakeupRequests(sessionId),
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, status, note }: { id: string; status: 'approved' | 'rejected'; note?: string }) =>
      reviewMakeupRequest(id, { status, reviewNote: note }),
    onSuccess: () => {
      toast.success(reviewAction === 'approved' ? 'Đã duyệt yêu cầu' : 'Đã từ chối yêu cầu');
      queryClient.invalidateQueries({ queryKey: ['makeup-requests', sessionId] });
      queryClient.invalidateQueries({ queryKey: ['session-summary', sessionId] });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra');
    },
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStudentName = (request: MakeupAttendanceRequest) => {
    if (request.student?.displayName) return request.student.displayName;
    if (request.student?.firstName && request.student?.lastName) {
      return `${request.student.firstName} ${request.student.lastName}`;
    }
    return 'Unknown Student';
  };

  const handleOpenReviewDialog = (request: MakeupAttendanceRequest, action: 'approved' | 'rejected') => {
    setSelectedRequest(request);
    setReviewAction(action);
    setReviewNote('');
    setReviewNoteError('');
    setReviewDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setReviewDialogOpen(false);
    setSelectedRequest(null);
    setReviewNote('');
    setReviewNoteError('');
  };

  const handleSubmitReview = () => {
    if (!selectedRequest) return;

    // Validate rejection reason
    if (reviewAction === 'rejected' && !reviewNote.trim()) {
      setReviewNoteError('Vui lòng nhập lý do từ chối');
      return;
    }

    // Clear error if validation passes
    setReviewNoteError('');

    reviewMutation.mutate({
      id: selectedRequest.id,
      status: reviewAction,
      note: reviewNote.trim() || undefined,
    });
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', py: 4, color: 'error.main' }}>
        <Typography>Không thể tải dữ liệu. Vui lòng thử lại.</Typography>
      </Box>
    );
  }

  const requests = data?.data || [];
  const pendingCount = requests.filter((r) => r.status === 'pending').length;

  if (requests.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <DescriptionIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
        <Typography color="text.secondary">
          Chưa có yêu cầu điểm danh bù nào
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={600}>
          Yêu cầu điểm danh bù ({requests.length})
        </Typography>
        {pendingCount > 0 && (
          <Chip
            label={`${pendingCount} chờ duyệt`}
            color="warning"
            size="small"
          />
        )}
      </Box>

      {/* Request List */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {requests.map((request) => (
          <Box
            key={request.id}
            sx={{
              p: 2,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              bgcolor: request.status === 'pending' ? 'warning.50' : 'background.paper',
            }}
          >
            {/* Header Row */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
              <Avatar
                src={request.student?.avatarUrl || undefined}
                sx={{ width: 40, height: 40 }}
              >
                {getStudentName(request).charAt(0)}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography fontWeight={600}>{getStudentName(request)}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatDate(request.createdAt)}
                </Typography>
              </Box>
              <Chip
                label={STATUS_LABELS[request.status]}
                color={STATUS_COLORS[request.status]}
                size="small"
              />
            </Box>

            {/* Reason */}
            <Box sx={{ mb: 1.5 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                Lý do:
              </Typography>
              <Typography variant="body2">{request.reason}</Typography>
            </Box>

            {/* Evidence */}
            {request.evidenceUrls && request.evidenceUrls.length > 0 && (
              <Box sx={{ mb: 1.5 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Minh chứng:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {request.evidenceUrls.map((url, index) => (
                    <Tooltip key={index} title={url}>
                      <Link
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          fontSize: '0.875rem',
                        }}
                      >
                        {url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                          <ImageIcon fontSize="small" />
                        ) : (
                          <DescriptionIcon fontSize="small" />
                        )}
                        Xem #{index + 1}
                        <OpenInNewIcon sx={{ fontSize: 14 }} />
                      </Link>
                    </Tooltip>
                  ))}
                </Box>
              </Box>
            )}

            {/* Review Note (if reviewed) */}
            {request.reviewNote && request.status !== 'pending' && (
              <Box sx={{ mb: 1.5, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Ghi chú từ người duyệt:
                </Typography>
                <Typography variant="body2">{request.reviewNote}</Typography>
              </Box>
            )}

            {/* Actions (only for pending) */}
            {request.status === 'pending' && (
              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <Button
                  variant="contained"
                  color="success"
                  size="small"
                  startIcon={<CheckIcon />}
                  onClick={() => handleOpenReviewDialog(request, 'approved')}
                >
                  Duyệt
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  startIcon={<CloseIcon />}
                  onClick={() => handleOpenReviewDialog(request, 'rejected')}
                >
                  Từ chối
                </Button>
              </Box>
            )}
          </Box>
        ))}
      </Box>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {reviewAction === 'approved' ? 'Duyệt yêu cầu điểm danh bù' : 'Từ chối yêu cầu điểm danh bù'}
        </DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Học sinh: <strong>{getStudentName(selectedRequest)}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Lý do: {selectedRequest.reason}
              </Typography>
            </Box>
          )}
          <TextField
            fullWidth
            multiline
            rows={3}
            label={reviewAction === 'rejected' ? 'Lý do từ chối *' : 'Ghi chú (tùy chọn)'}
            value={reviewNote}
            onChange={(e) => {
              setReviewNote(e.target.value);
              // Clear error when user starts typing
              if (reviewNoteError) {
                setReviewNoteError('');
              }
            }}
            placeholder={reviewAction === 'approved' ? 'VD: Đã xác minh giấy tờ' : 'VD: Minh chứng không hợp lệ'}
            required={reviewAction === 'rejected'}
            error={!!reviewNoteError}
            helperText={reviewNoteError}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button
            variant="contained"
            color={reviewAction === 'approved' ? 'success' : 'error'}
            onClick={handleSubmitReview}
            disabled={reviewMutation.isPending}
          >
            {reviewMutation.isPending ? 'Đang xử lý...' : reviewAction === 'approved' ? 'Duyệt' : 'Từ chối'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MakeupRequestsTab;
