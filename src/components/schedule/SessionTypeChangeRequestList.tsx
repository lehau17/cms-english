import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Stack,
  Chip,
  Alert,
} from '@mui/material';
import SessionTypeRequestStatus from './SessionTypeRequestStatus';
import ReviewTypeChangeRequestModal from './ReviewTypeChangeRequestModal';
import { TypeChangeRequest } from '@/apis/session-type-change-request';

interface SessionTypeChangeRequestListProps {
  requests: TypeChangeRequest[];
  onReviewComplete?: () => void;
}

const SessionTypeChangeRequestList: React.FC<SessionTypeChangeRequestListProps> = ({
  requests,
  onReviewComplete,
}) => {
  const [selectedRequest, setSelectedRequest] = useState<TypeChangeRequest | null>(null);

  return (
    <>
      <Stack spacing={2}>
        {requests.length === 0 ? (
          <Alert severity="info">No pending requests</Alert>
        ) : (
          requests.map((request) => (
            <Card key={request.id} variant="outlined">
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="start">
                  <Box flex={1}>
                    <Typography variant="h6">{request.session?.title || 'Unknown Session'}</Typography>
                    <Typography variant="caption" color="textSecondary">
                      Requested by{' '}
                      {request.requestedBy?.displayName ||
                        `${request.requestedBy?.firstName || ''} ${request.requestedBy?.lastName || ''}`.trim() ||
                        'Unknown'}{' '}
                      •{' '}
                      {request.createdAt
                        ? new Date(request.createdAt).toLocaleDateString()
                        : 'N/A'}
                    </Typography>

                    <Box mt={2} display="flex" alignItems="center" gap={2}>
                      <Chip label={request.currentType} size="small" />
                      <Typography>→</Typography>
                      <Chip label={request.requestedType} size="small" color="primary" />
                    </Box>

                    <Typography variant="body2" sx={{ mt: 2 }}>
                      <strong>Reason:</strong> {request.reason}
                    </Typography>
                  </Box>

                  <Box display="flex" flexDirection="column" gap={1} alignItems="end">
                    <SessionTypeRequestStatus status={request.status} />
                    {request.status === 'pending' && (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => setSelectedRequest(request)}
                      >
                        Review
                      </Button>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))
        )}
      </Stack>

      <ReviewTypeChangeRequestModal
        open={!!selectedRequest}
        onClose={() => {
          setSelectedRequest(null);
          onReviewComplete?.();
        }}
        request={selectedRequest}
      />
    </>
  );
};

export default SessionTypeChangeRequestList;
