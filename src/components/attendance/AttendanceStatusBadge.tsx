import { AttendanceStatus } from '@/interface/attendance.interface';
import { Chip, ChipProps } from '@mui/material';

interface AttendanceStatusBadgeProps {
  status: AttendanceStatus | string;
  size?: 'small' | 'medium';
}

const STATUS_CONFIG: Record<string, { label: string; color: ChipProps['color'] }> = {
  [AttendanceStatus.PRESENT]: { label: 'Co mat', color: 'success' },
  [AttendanceStatus.ABSENT]: { label: 'Vang', color: 'error' },
  [AttendanceStatus.LATE]: { label: 'Di muon', color: 'warning' },
  [AttendanceStatus.EXCUSED]: { label: 'Co phep', color: 'info' },
};

export const AttendanceStatusBadge = ({
  status,
  size = 'small',
}: AttendanceStatusBadgeProps) => {
  const config = STATUS_CONFIG[status] || { label: status, color: 'default' as const };

  return <Chip label={config.label} color={config.color} size={size} />;
};

export default AttendanceStatusBadge;
