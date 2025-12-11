import { RescheduleRequest } from '@/apis/reschedule';
import { DataTable, PageHeader, PaginationBar, type TableColumn } from '@/components/ui';
import {
  useAllRescheduleRequests,
  usePendingRescheduleRequests,
  useReviewRescheduleRequest,
} from '@/hooks/useRescheduleRequest';
import {
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as ClockIcon
} from '@mui/icons-material';
import { Badge, Box, Button, Container, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Tab, Tabs, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import toast from 'react-hot-toast';

type StatusTab = 'all' | 'pending' | 'approved' | 'rejected';

const RescheduleRequestsPage = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [statusTab, setStatusTab] = useState<StatusTab>('pending');
  const [selectedRequest, setSelectedRequest] = useState<RescheduleRequest | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewNote, setReviewNote] = useState('');
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve');
  const [reviewNoteError, setReviewNoteError] = useState<string>('');

  // Fetch data based on selected tab
  const statusFilter = statusTab === 'all' ? undefined : statusTab;
  const { data: allData, isLoading: isLoadingAll, refetch: refetchAll } = useAllRescheduleRequests({
    page,
    limit,
    status: statusFilter
  });
  const { data: pendingData, isLoading: isLoadingPending, refetch: refetchPending } = usePendingRescheduleRequests({ page, limit });

  // Use appropriate data based on tab
  const data = statusTab === 'pending' ? pendingData : allData;
  const isLoading = statusTab === 'pending' ? isLoadingPending : isLoadingAll;
  const refetch = statusTab === 'pending' ? refetchPending : refetchAll;

  const reviewMutation = useReviewRescheduleRequest();

  // Get pending count for badge
  const { data: pendingCountData } = usePendingRescheduleRequests({ page: 1, limit: 1 });
  const pendingCount = pendingCountData?.total || 0;

  const handleApprove = (request: RescheduleRequest) => {
    setSelectedRequest(request);
    setReviewAction('approve');
    setReviewNote('');
    setReviewNoteError('');
    setReviewDialogOpen(true);
  };

  const handleReject = (request: RescheduleRequest) => {
    setSelectedRequest(request);
    setReviewAction('reject');
    setReviewNote('');
    setReviewNoteError('');
    setReviewDialogOpen(true);
  };

  const handleConfirmReview = async () => {
    if (!selectedRequest) return;

    try {
      await reviewMutation.mutateAsync({
        id: selectedRequest.id,
        data: {
          approved: reviewAction === 'approve',
          reviewNote: reviewNote.trim() || undefined,
        },
      });

      toast.success(
        reviewAction === 'approve'
          ? 'Đã duyệt yêu cầu dời lịch thành công!'
          : 'Đã từ chối yêu cầu dời lịch',
      );
      // Refetch both to update counts and current view
      await Promise.all([
        refetchPending(), // Update pending count for badge
        refetchAll(), // Update current view
      ]);
      setReviewDialogOpen(false);
      setSelectedRequest(null);
    } catch (error: any) {
      toast.error(
        'Lỗi: ' + (error?.response?.data?.message || 'Không thể xử lý yêu cầu'),
      );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getReviewerName = (request: RescheduleRequest) => {
    if (!request.reviewedBy) return 'N/A';
    if (request.reviewedBy.displayName) return request.reviewedBy.displayName;
    if (request.reviewedBy.firstName && request.reviewedBy.lastName) {
      return `${request.reviewedBy.firstName} ${request.reviewedBy.lastName}`;
    }
    return 'N/A';
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: StatusTab) => {
    setStatusTab(newValue);
    setPage(1); // Reset to first page when changing tabs
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRequesterName = (request: RescheduleRequest) => {
    if (request.requestedBy?.displayName) return request.requestedBy.displayName;
    if (request.requestedBy?.firstName && request.requestedBy?.lastName) {
      return `${request.requestedBy.firstName} ${request.requestedBy.lastName}`;
    }
    return request.requestedBy?.email || 'N/A';
  };

  const requests = data?.data || [];
  const meta = data;

  const columns: TableColumn<RescheduleRequest>[] = [
    {
      id: 'session',
      label: 'Buổi học',
      render: (request) => (
        <Stack spacing={0.5}>
          <Typography variant="body2" fontWeight={600}>
            {request.session?.title || 'N/A'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {request.session?.classroom?.name || 'N/A'}
          </Typography>
        </Stack>
      ),
    },
    {
      id: 'requester',
      label: 'Người yêu cầu',
      render: (request) => (
        <Stack spacing={0.5}>
          <Typography variant="body2" fontWeight={600}>
            {getRequesterName(request)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {request.requestedBy?.email}
          </Typography>
        </Stack>
      ),
    },
    {
      id: 'time',
      label: 'Thời gian',
      render: (request) => (
        <Stack spacing={0.5}>
          <Typography variant="body2" color="error" sx={{ textDecoration: 'line-through' }}>
            {request.session?.startTime
              ? formatDateTime(request.session.startTime)
              : 'N/A'}
          </Typography>
          <Typography variant="body2" color="success.main" fontWeight={600}>
            {formatDateTime(request.newStartTime)} -{' '}
            {new Date(request.newEndTime).toLocaleString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Typography>
        </Stack>
      ),
    },
    {
      id: 'reason',
      label: 'Lý do',
      render: (request) => (
        <Typography variant="body2" sx={{ maxWidth: 300 }}>
          {request.reason.length > 100
            ? `${request.reason.substring(0, 100)}...`
            : request.reason}
        </Typography>
      ),
    },
    {
      id: 'createdAt',
      label: 'Ngày yêu cầu',
      render: (request) => (
        <Typography variant="body2">{formatDate(request.createdAt)}</Typography>
      ),
    },
    {
      id: 'status',
      label: 'Trạng thái',
      render: (request) => {
        const statusMap: Record<string, { label: string; color: 'success' | 'warning' | 'error' | 'default' }> = {
          pending: { label: 'Chờ duyệt', color: 'warning' },
          approved: { label: 'Đã duyệt', color: 'success' },
          rejected: { label: 'Đã từ chối', color: 'error' },
          cancelled: { label: 'Đã hủy', color: 'default' },
        };
        const statusInfo = statusMap[request.status] || { label: request.status, color: 'default' as const };
        return (
          <Typography
            variant="body2"
            sx={{
              color: statusInfo.color === 'success' ? 'success.main' :
                statusInfo.color === 'error' ? 'error.main' :
                  statusInfo.color === 'warning' ? 'warning.main' : 'text.secondary',
              fontWeight: 600,
            }}
          >
            {statusInfo.label}
          </Typography>
        );
      },
    },
    {
      id: 'reviewer',
      label: 'Người duyệt',
      render: (request) => (
        <Stack spacing={0.5}>
          <Typography variant="body2">
            {request.status !== 'pending' ? getReviewerName(request) : '-'}
          </Typography>
          {request.reviewedAt && (
            <Typography variant="caption" color="text.secondary">
              {formatDate(request.reviewedAt)}
            </Typography>
          )}
        </Stack>
      ),
    },
    {
      id: 'reviewNote',
      label: 'Ghi chú duyệt',
      render: (request) => (
        <Typography
          variant="body2"
          sx={{
            maxWidth: 300,
            color: request.status === 'rejected' ? 'error.main' : 'text.primary',
          }}
        >
          {request.reviewNote || '-'}
        </Typography>
      ),
    },
    {
      id: 'actions',
      label: 'Thao tác',
      render: (request) => {
        // Only show actions for pending requests
        if (request.status !== 'pending') {
          return (
            <Typography variant="body2" color="text.secondary">
              Đã xử lý
            </Typography>
          );
        }
        return (
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant="contained"
              color="success"
              startIcon={<CheckCircleIcon />}
              onClick={() => handleApprove(request)}
              disabled={reviewMutation.isPending}
            >
              Duyệt
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="error"
              startIcon={<CancelIcon />}
              onClick={() => handleReject(request)}
              disabled={reviewMutation.isPending}
            >
              Từ chối
            </Button>
          </Stack>
        );
      },
    },
  ];

  const getPageTitle = () => {
    switch (statusTab) {
      case 'all':
        return 'Tất cả yêu cầu dời lịch';
      case 'pending':
        return 'Yêu cầu dời lịch đang chờ duyệt';
      case 'approved':
        return 'Yêu cầu dời lịch đã duyệt';
      case 'rejected':
        return 'Yêu cầu dời lịch đã từ chối';
      default:
        return 'Yêu cầu dời lịch buổi học';
    }
  };

  return (
    <Container maxWidth="xl">
      <PageHeader
        title={getPageTitle()}
        subtitle={statusTab === 'pending' ? 'Duyệt hoặc từ chối các yêu cầu dời lịch từ giáo viên' : 'Xem lịch sử các yêu cầu dời lịch'}
      />

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={statusTab} onChange={handleTabChange}>
          <Tab label="Tất cả" value="all" />
          <Tab
            label={
              <Badge badgeContent={pendingCount > 0 ? pendingCount : undefined} color="error" max={99}>
                <Box component="span" sx={{ px: 1 }}>Chờ duyệt</Box>
              </Badge>
            }
            value="pending"
          />
          <Tab label="Đã duyệt" value="approved" />
          <Tab label="Đã từ chối" value="rejected" />
        </Tabs>
      </Box>

      <DataTable
        columns={columns}
        data={requests}
        isLoading={isLoading}
        getRowId={(request) => request.id}
        emptyState={{
          title: "Không có yêu cầu dời lịch nào đang chờ duyệt",
          description: "Tất cả các yêu cầu dời lịch đã được xử lý hoặc chưa có yêu cầu nào được gửi.",
        }}
      />

      {meta && meta.totalPages > 1 && (
        <PaginationBar
          currentPage={page}
          totalPages={meta.totalPages}
          onPageChange={setPage}
        />
      )}

      {/* Review Confirmation Dialog */}
      <Dialog
        open={reviewDialogOpen}
        onClose={() => setReviewDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {reviewAction === 'approve'
            ? 'Xác nhận duyệt yêu cầu dời lịch'
            : 'Xác nhận từ chối yêu cầu dời lịch'}
        </DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Buổi học:
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {selectedRequest.session?.title || 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Lớp: {selectedRequest.session?.classroom?.name || 'N/A'}
                </Typography>
              </Box>

              <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Thời gian mới:
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {formatDateTime(selectedRequest.newStartTime)} -{' '}
                  {new Date(selectedRequest.newEndTime).toLocaleString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Typography>
              </Box>

              <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Lý do:
                </Typography>
                <Typography variant="body1">{selectedRequest.reason}</Typography>
              </Box>

              {selectedRequest.evidenceUrls && selectedRequest.evidenceUrls.length > 0 && (
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Minh chứng:
                  </Typography>
                  <Stack spacing={1}>
                    {selectedRequest.evidenceUrls.map((url, idx) => (
                      <Button
                        key={idx}
                        variant="outlined"
                        size="small"
                        href={url}
                        target="_blank"
                        startIcon={<ClockIcon />}
                      >
                        Xem minh chứng {idx + 1}
                      </Button>
                    ))}
                  </Stack>
                </Box>
              )}

              <TextField
                fullWidth
                multiline
                rows={3}
                label={reviewAction === 'reject' ? 'Lý do từ chối (bắt buộc)' : 'Ghi chú (tùy chọn)'}
                placeholder={reviewAction === 'reject' ? 'Nhập lý do từ chối yêu cầu này...' : 'Nhập ghi chú cho quyết định này...'}
                value={reviewNote}
                onChange={(e) => {
                  setReviewNote(e.target.value);
                  // Clear error on input change
                  if (reviewNoteError) {
                    setReviewNoteError('');
                  }
                }}
                required={reviewAction === 'reject'}
                error={!!reviewNoteError}
                helperText={reviewNoteError || (reviewAction === 'reject' ? 'Vui lòng nhập lý do từ chối' : undefined)}
              />

              {reviewAction === 'approve' && (
                <Box sx={{ bgcolor: 'warning.50', p: 2, borderRadius: 1 }}>
                  <Typography variant="body2" color="warning.main">
                    ⚠️ Lưu ý: Khi duyệt, hệ thống sẽ tự động cập nhật lịch học và gửi email thông báo đến tất cả học viên và phụ huynh.
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewDialogOpen(false)} disabled={reviewMutation.isPending}>
            Hủy
          </Button>
          <Button
            onClick={handleConfirmReview}
            variant="contained"
            color={reviewAction === 'approve' ? 'success' : 'error'}
            disabled={reviewMutation.isPending || (reviewAction === 'reject' && !reviewNote.trim())}
          >
            {reviewAction === 'approve' ? 'Xác nhận duyệt' : 'Xác nhận từ chối'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default RescheduleRequestsPage;

