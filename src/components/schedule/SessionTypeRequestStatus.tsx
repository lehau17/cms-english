import React from 'react';
import { Chip, Tooltip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PendingIcon from '@mui/icons-material/Pending';

type RequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

interface SessionTypeRequestStatusProps {
  status: RequestStatus;
  showTooltip?: boolean;
}

const SessionTypeRequestStatus: React.FC<SessionTypeRequestStatusProps> = ({
  status,
  showTooltip = true,
}) => {
  const config = {
    pending: {
      color: 'warning' as const,
      icon: <PendingIcon />,
      label: 'Pending Review',
      tooltip: 'Waiting for admin approval',
    },
    approved: {
      color: 'success' as const,
      icon: <CheckCircleIcon />,
      label: 'Approved',
      tooltip: 'Request approved by admin',
    },
    rejected: {
      color: 'error' as const,
      icon: <CancelIcon />,
      label: 'Rejected',
      tooltip: 'Request rejected by admin',
    },
    cancelled: {
      color: 'default' as const,
      icon: <CancelIcon />,
      label: 'Cancelled',
      tooltip: 'Request cancelled by teacher',
    },
  };

  const { color, icon, label, tooltip } = config[status];

  const chip = <Chip size="small" color={color} icon={icon} label={label} />;

  return showTooltip ? <Tooltip title={tooltip}>{chip}</Tooltip> : chip;
};

export default SessionTypeRequestStatus;
