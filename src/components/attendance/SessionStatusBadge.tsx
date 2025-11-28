import { Chip, ChipProps } from '@mui/material';
import {
  SessionStatus,
  SESSION_STATUS_LABELS,
  SESSION_STATUS_COLORS,
} from '@/interface/attendance.interface';

interface SessionStatusBadgeProps {
  status: SessionStatus | string;
  size?: 'small' | 'medium';
}

const getStatusConfig = (status: string): { label: string; color: ChipProps['color'] } => {
  const normalizedStatus = status.toLowerCase();

  if (normalizedStatus in SESSION_STATUS_LABELS) {
    return {
      label: SESSION_STATUS_LABELS[normalizedStatus as SessionStatus],
      color: SESSION_STATUS_COLORS[normalizedStatus as SessionStatus] as ChipProps['color'],
    };
  }

  // Fallback for unknown status
  return { label: status, color: 'default' };
};

export const SessionStatusBadge = ({ status, size = 'small' }: SessionStatusBadgeProps) => {
  const config = getStatusConfig(status);

  return <Chip label={config.label} color={config.color} size={size} />;
};

export default SessionStatusBadge;
