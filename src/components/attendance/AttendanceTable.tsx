import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  Avatar,
  Box,
  Typography,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  TextField,
  CircularProgress,
} from '@mui/material';
import {
  Login as CheckInIcon,
  Logout as CheckOutIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { AttendanceRecord, AttendanceStatus } from '@/interface/attendance.interface';
import AttendanceStatusBadge from './AttendanceStatusBadge';

interface AttendanceTableProps {
  attendances: AttendanceRecord[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onStatusChange: (studentId: string, status: AttendanceStatus, notes?: string) => void;
  onCheckIn?: (studentId: string) => void;
  onCheckOut?: (studentId: string) => void;
  onDelete?: (studentId: string) => void;
  loading?: boolean;
  editable?: boolean;
}

export const AttendanceTable = ({
  attendances,
  selectedIds,
  onSelectionChange,
  onStatusChange,
  onCheckIn,
  onCheckOut,
  onDelete,
  loading = false,
  editable = true,
}: AttendanceTableProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState('');

  const isAllSelected =
    attendances.length > 0 && selectedIds.length === attendances.length;
  const isIndeterminate =
    selectedIds.length > 0 && selectedIds.length < attendances.length;

  const handleSelectAll = () => {
    if (isAllSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(attendances.map((a) => a.studentId));
    }
  };

  const handleSelectOne = (studentId: string) => {
    if (selectedIds.includes(studentId)) {
      onSelectionChange(selectedIds.filter((id) => id !== studentId));
    } else {
      onSelectionChange([...selectedIds, studentId]);
    }
  };

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    onStatusChange(studentId, status);
  };

  const handleEditNotes = (attendance: AttendanceRecord) => {
    setEditingId(attendance.studentId);
    setEditNotes(attendance.notes || '');
  };

  const handleSaveNotes = (studentId: string, status: AttendanceStatus) => {
    onStatusChange(studentId, status, editNotes);
    setEditingId(null);
    setEditNotes('');
  };

  const formatTime = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              <Checkbox
                indeterminate={isIndeterminate}
                checked={isAllSelected}
                onChange={handleSelectAll}
              />
            </TableCell>
            <TableCell>Hoc sinh</TableCell>
            <TableCell>Trang thai</TableCell>
            <TableCell>Check-in</TableCell>
            <TableCell>Check-out</TableCell>
            <TableCell>Ghi chu</TableCell>
            {editable && <TableCell align="right">Thao tac</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {attendances.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} align="center">
                <Typography color="text.secondary" sx={{ py: 4 }}>
                  Chua co du lieu diem danh
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            attendances.map((attendance) => (
              <TableRow
                key={attendance.id}
                selected={selectedIds.includes(attendance.studentId)}
                hover
              >
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedIds.includes(attendance.studentId)}
                    onChange={() => handleSelectOne(attendance.studentId)}
                  />
                </TableCell>

                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar
                      src={attendance.student.avatarUrl || undefined}
                      alt={attendance.student.displayName}
                      sx={{ width: 36, height: 36 }}
                    >
                      {attendance.student.firstName?.[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {attendance.student.displayName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {attendance.student.lastName} {attendance.student.firstName}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>

                <TableCell>
                  {editable ? (
                    <Select
                      size="small"
                      value={attendance.status}
                      onChange={(e) =>
                        handleStatusChange(
                          attendance.studentId,
                          e.target.value as AttendanceStatus
                        )
                      }
                      sx={{ minWidth: 120 }}
                    >
                      <MenuItem value={AttendanceStatus.PRESENT}>Co mat</MenuItem>
                      <MenuItem value={AttendanceStatus.ABSENT}>Vang</MenuItem>
                      <MenuItem value={AttendanceStatus.LATE}>Di muon</MenuItem>
                      <MenuItem value={AttendanceStatus.EXCUSED}>Co phep</MenuItem>
                    </Select>
                  ) : (
                    <AttendanceStatusBadge status={attendance.status} />
                  )}
                </TableCell>

                <TableCell>{formatTime(attendance.checkInTime)}</TableCell>
                <TableCell>{formatTime(attendance.checkOutTime)}</TableCell>

                <TableCell>
                  {editingId === attendance.studentId ? (
                    <TextField
                      size="small"
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      onBlur={() =>
                        handleSaveNotes(attendance.studentId, attendance.status)
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSaveNotes(attendance.studentId, attendance.status);
                        }
                      }}
                      autoFocus
                      placeholder="Nhap ghi chu..."
                      sx={{ minWidth: 150 }}
                    />
                  ) : (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        cursor: editable ? 'pointer' : 'default',
                        '&:hover': editable ? { textDecoration: 'underline' } : {},
                      }}
                      onClick={() => editable && handleEditNotes(attendance)}
                    >
                      {attendance.notes || '-'}
                    </Typography>
                  )}
                </TableCell>

                {editable && (
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                      {onCheckIn && !attendance.checkInTime && (
                        <Tooltip title="Check-in">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => onCheckIn(attendance.studentId)}
                          >
                            <CheckInIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}

                      {onCheckOut && attendance.checkInTime && !attendance.checkOutTime && (
                        <Tooltip title="Check-out">
                          <IconButton
                            size="small"
                            color="warning"
                            onClick={() => onCheckOut(attendance.studentId)}
                          >
                            <CheckOutIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}

                      <Tooltip title="Sua ghi chu">
                        <IconButton
                          size="small"
                          onClick={() => handleEditNotes(attendance)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      {onDelete && (
                        <Tooltip title="Xoa">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => onDelete(attendance.studentId)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default AttendanceTable;
