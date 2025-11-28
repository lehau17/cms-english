import {
  AttendanceStatus,
  StudentAttendanceHistory as StudentHistoryData,
  StudentHistoryFilter,
} from '@/interface/attendance.interface';
import {
  Box,
  Card,
  CardContent,
  Chip,
  FormControl,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import AttendanceStatusBadge from './AttendanceStatusBadge';

interface StudentAttendanceHistoryProps {
  data: StudentHistoryData;
  filter: StudentHistoryFilter;
  onFilterChange: (filter: StudentHistoryFilter) => void;
  loading?: boolean;
}

export const StudentAttendanceHistory = ({
  data,
  filter,
  onFilterChange,
  loading = false,
}: StudentAttendanceHistoryProps) => {
  const handlePageChange = (_: unknown, newPage: number) => {
    onFilterChange({ ...filter, page: newPage + 1 });
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filter, limit: parseInt(event.target.value, 10), page: 1 });
  };

  const handleStatusFilter = (status: string) => {
    onFilterChange({
      ...filter,
      status: status ? (status as AttendanceStatus) : undefined,
      page: 1,
    });
  };

  const handleFromDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filter,
      fromDate: e.target.value || undefined,
      page: 1,
    });
  };

  const handleToDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filter,
      toDate: e.target.value || undefined,
      page: 1,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Lich su diem danh
        </Typography>

        {/* Summary Stats */}
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            flexWrap: 'wrap',
            mb: 3,
            p: 2,
            bgcolor: 'grey.50',
            borderRadius: 1,
          }}
        >
          <Box sx={{ flex: 1, minWidth: 120 }}>
            <Typography variant="body2" color="text.secondary">
              Tong so buoi
            </Typography>
            <Typography variant="h5">{data.totalSessions}</Typography>
          </Box>
          <Box sx={{ flex: 1, minWidth: 120 }}>
            <Typography variant="body2" color="text.secondary">
              Da tham gia
            </Typography>
            <Typography variant="h5">{data.attended}</Typography>
          </Box>
          <Box sx={{ flex: 2, minWidth: 200 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Ty le diem danh
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LinearProgress
                variant="determinate"
                value={data.attendanceRate}
                color={
                  data.attendanceRate >= 80
                    ? 'success'
                    : data.attendanceRate >= 50
                      ? 'warning'
                      : 'error'
                }
                sx={{ flex: 1, height: 8, borderRadius: 4 }}
              />
              <Typography variant="body2" fontWeight="bold">
                {Math.round(data.attendanceRate)}%
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Status summary chips */}
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Chip label={`Co mat: ${data.present}`} color="success" size="small" />
          <Chip label={`Vang: ${data.absent}`} color="error" size="small" />
          <Chip label={`Di muon: ${data.late}`} color="warning" size="small" />
          <Chip label={`Co phep: ${data.excused}`} color="info" size="small" />
        </Stack>

        {/* Filters */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Trang thai</InputLabel>
            <Select
              value={filter.status || ''}
              label="Trang thai"
              onChange={(e) => handleStatusFilter(e.target.value)}
            >
              <MenuItem value="">Tat ca</MenuItem>
              <MenuItem value={AttendanceStatus.PRESENT}>Co mat</MenuItem>
              <MenuItem value={AttendanceStatus.ABSENT}>Vang</MenuItem>
              <MenuItem value={AttendanceStatus.LATE}>Di muon</MenuItem>
              <MenuItem value={AttendanceStatus.EXCUSED}>Co phep</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Tu ngay"
            type="date"
            size="small"
            value={filter.fromDate || ''}
            onChange={handleFromDateChange}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 150 }}
          />

          <TextField
            label="Den ngay"
            type="date"
            size="small"
            value={filter.toDate || ''}
            onChange={handleToDateChange}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 150 }}
          />
        </Stack>

        {loading && <LinearProgress sx={{ mb: 2 }} />}

        {/* History Table */}
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Buoi hoc</TableCell>
                <TableCell>Ngay</TableCell>
                <TableCell>Trang thai</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.history.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    <Typography color="text.secondary" sx={{ py: 2 }}>
                      Khong co du lieu
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                data.history.map((item) => (
                  <TableRow key={item.sessionId} hover>
                    <TableCell>{item.sessionTitle}</TableCell>
                    <TableCell>{formatDate(item.sessionDate)}</TableCell>
                    <TableCell>
                      <AttendanceStatusBadge status={item.status} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <TablePagination
          component="div"
          count={data.pagination.totalItems}
          page={(filter.page || 1) - 1}
          onPageChange={handlePageChange}
          rowsPerPage={filter.limit || 10}
          onRowsPerPageChange={handleRowsPerPageChange}
          rowsPerPageOptions={[5, 10, 20, 50]}
          labelRowsPerPage="So dong:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} / ${count !== -1 ? count : `nhieu hon ${to}`}`
          }
        />
      </CardContent>
    </Card>
  );
};

export default StudentAttendanceHistory;
