import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Alert,
  Box,
} from '@mui/material';
import { SessionType } from '@/interface/classroom.interface';
import { useCreateTypeChangeRequest } from '@/hooks/useSessionTypeChangeRequest';
import toast from 'react-hot-toast';

interface RequestSessionTypeChangeModalProps {
  open: boolean;
  onClose: () => void;
  session: {
    id: string;
    title: string;
    type: SessionType;
  };
}

const RequestSessionTypeChangeModal: React.FC<RequestSessionTypeChangeModalProps> = ({
  open,
  onClose,
  session,
}) => {
  const [requestedType, setRequestedType] = useState<SessionType>(session.type);
  const [reason, setReason] = useState('');

  const { mutate, isPending } = useCreateTypeChangeRequest();

  const handleSubmit = () => {
    if (!reason.trim()) {
      toast.error('Please provide a reason for the change');
      return;
    }

    if (requestedType === session.type) {
      toast.error('Please select a different session type');
      return;
    }

    mutate(
      { sessionId: session.id, data: { requestedType, reason } },
      {
        onSuccess: () => {
          onClose();
          setReason('');
          setRequestedType(session.type);
        },
      },
    );
  };

  const handleClose = () => {
    if (!isPending) {
      onClose();
      setReason('');
      setRequestedType(session.type);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Request Session Type Change</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Alert severity="info">
            <strong>Current Type:</strong> {session.type}
          </Alert>

          <FormControl fullWidth>
            <InputLabel>Requested Type</InputLabel>
            <Select
              value={requestedType}
              onChange={(e) => setRequestedType(e.target.value as SessionType)}
              label="Requested Type"
            >
              <MenuItem value="online">Online</MenuItem>
              <MenuItem value="offline">Offline</MenuItem>
              <MenuItem value="hybrid">Hybrid</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Reason for Change"
            multiline
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explain why this session type change is needed..."
            required
            fullWidth
          />

          <Alert severity="warning">
            Your request will be reviewed by an administrator. You will be notified when a
            decision is made.
          </Alert>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isPending}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isPending || requestedType === session.type}
        >
          {isPending ? 'Submitting...' : 'Submit Request'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RequestSessionTypeChangeModal;
