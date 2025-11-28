import { useState } from 'react';
import {
  Box,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Badge,
} from '@mui/material';
import {
  CheckCircle as PresentIcon,
  Cancel as AbsentIcon,
  AccessTime as LateIcon,
  EventAvailable as ExcusedIcon,
  SelectAll as SelectAllIcon,
  MoreVert as MoreIcon,
} from '@mui/icons-material';
import { AttendanceStatus } from '@/interface/attendance.interface';

interface BulkAttendanceActionsProps {
  selectedCount: number;
  onBulkMark: (status: AttendanceStatus) => void;
  onSelectAll?: () => void;
  onClearSelection?: () => void;
  disabled?: boolean;
}

export const BulkAttendanceActions = ({
  selectedCount,
  onBulkMark,
  onSelectAll,
  onClearSelection,
  disabled = false,
}: BulkAttendanceActionsProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMark = (status: AttendanceStatus) => {
    onBulkMark(status);
    handleClose();
  };

  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
      {onSelectAll && (
        <Button
          size="small"
          startIcon={<SelectAllIcon />}
          onClick={onSelectAll}
          disabled={disabled}
        >
          Chon tat ca
        </Button>
      )}

      {selectedCount > 0 && onClearSelection && (
        <Button size="small" onClick={onClearSelection} color="inherit">
          Bo chon ({selectedCount})
        </Button>
      )}

      <Badge badgeContent={selectedCount} color="primary">
        <Button
          variant="contained"
          endIcon={<MoreIcon />}
          onClick={handleClick}
          disabled={disabled || selectedCount === 0}
        >
          Diem danh hang loat
        </Button>
      </Badge>

      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem onClick={() => handleMark(AttendanceStatus.PRESENT)}>
          <ListItemIcon>
            <PresentIcon color="success" />
          </ListItemIcon>
          <ListItemText>Danh dau Co mat</ListItemText>
        </MenuItem>

        <MenuItem onClick={() => handleMark(AttendanceStatus.ABSENT)}>
          <ListItemIcon>
            <AbsentIcon color="error" />
          </ListItemIcon>
          <ListItemText>Danh dau Vang</ListItemText>
        </MenuItem>

        <MenuItem onClick={() => handleMark(AttendanceStatus.LATE)}>
          <ListItemIcon>
            <LateIcon color="warning" />
          </ListItemIcon>
          <ListItemText>Danh dau Di muon</ListItemText>
        </MenuItem>

        <Divider />

        <MenuItem onClick={() => handleMark(AttendanceStatus.EXCUSED)}>
          <ListItemIcon>
            <ExcusedIcon color="info" />
          </ListItemIcon>
          <ListItemText>Danh dau Co phep</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default BulkAttendanceActions;
