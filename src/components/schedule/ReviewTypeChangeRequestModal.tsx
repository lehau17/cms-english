import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  Box,
  Typography,
  Stack,
  Divider,
  Chip,
} from '@mui/material';
import SessionTypeRequestStatus from './SessionTypeRequestStatus';
import { useReviewTypeChangeRequest } from '@/hooks/useSessionTypeChangeRequest';
import { TypeChangeRequest } from '@/apis/session-type-change-request';

interface ReviewTypeChangeRequestModalProps {
  open: boolean;
  onClose: () => void;
  request: TypeChangeRequest | null;
}

const ReviewTypeChangeRequestModal: React.FC<ReviewTypeChangeRequestModalProps> = ({
  open,
  onClose,
  request,
}) => {
  const [reviewNote, setReviewNote] = useState('');
  const { mutate, isPending } = useReviewTypeChangeRequest();

  if (!request) return null;

  const handleReview = (status: 'approved' | 'rejected') => {
    mutate(
      {
        id: request.id,
        data: { status, reviewNote: reviewNote || undefined },
      },
      {
        onSuccess: () => {
          onClose();
          setReviewNote('');
        },
      },
    );
  };

  const handleClose = () => {
    if (!isPending) {
      onClose();
      setReviewNote('');
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Review Session Type Change Request</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Box>
            <Typography variant="subtitle2" color="textSecondary">
              Session
            </Typography>
            <Typography variant="body1">{request.session?.title}</Typography>
            <Typography variant="caption" color="textSecondary">
              {request.session?.startTime
                ? new Date(request.session.startTime).toLocaleString()
                : 'N/A'}
            </Typography>
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle2" color="textSecondary">
              Requested By
            </Typography>
            <Typography variant="body1">
              {request.requestedBy?.displayName ||
                `${request.requestedBy?.firstName || ''} ${request.requestedBy?.lastName || ''}`.trim() ||
                'Unknown'}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {request.requestedBy?.email || 'No email'}
            </Typography>
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle2" color="textSecondary">
              Type Change
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <Chip label={request.currentType} color="default" />
              <Typography>→</Typography>
              <Chip label={request.requestedType} color="primary" />
            </Box>
          </Box>

          <Box>
            <Typography variant="subtitle2" color="textSecondary">
              Reason
            </Typography>
            <Alert severity="info" sx={{ mt: 1 }}>
              {request.reason}
            </Alert>
          </Box>

          <Divider />

          <TextField
            label="Review Note (Optional)"
            multiline
            rows={3}
            value={reviewNote}
            onChange={(e) => setReviewNote(e.target.value)}
            placeholder="Add any comments for the teacher..."
            fullWidth
          />

          {request.requestedType === 'online' && (
            <Alert severity="info">
              If approved, a Google Meet link will be automatically generated.
            </Alert>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isPending}>
          Cancel
        </Button>
        <Button onClick={() => handleReview('rejected')} color="error" disabled={isPending}>
          Reject
        </Button>
        <Button
          onClick={() => handleReview('approved')}
          variant="contained"
          color="success"
          disabled={isPending}
        >
          {isPending ? 'Processing...' : 'Approve'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReviewTypeChangeRequestModal;
