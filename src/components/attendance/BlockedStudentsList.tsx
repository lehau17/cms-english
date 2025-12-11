import { getBlockedStudents } from '@/apis/attendance.api';
import { BlockedStudent } from '@/interface/attendance.interface';
import { LockOpen, Search } from '@mui/icons-material';
import {
  Alert,
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  IconButton,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import moment from 'moment';
import React, { useState } from 'react';
import { UnblockDialog } from './UnblockDialog';

interface BlockedStudentsListProps {
  classroomId: string;
}

export const BlockedStudentsList: React.FC<BlockedStudentsListProps> = ({
  classroomId,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<BlockedStudent | null>(null);
  const [isUnblockDialogOpen, setIsUnblockDialogOpen] = useState(false);

  const { data: blockedStudents, isLoading, refetch } = useQuery<BlockedStudent[]>({
    queryKey: ['blocked-students', classroomId],
    queryFn: () => getBlockedStudents(classroomId),
  });

  const filteredStudents = blockedStudents?.filter(
    (student) =>
      student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentEmail.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleUnblock = (student: BlockedStudent) => {
    setSelectedStudent(student);
    setIsUnblockDialogOpen(true);
  };

  const handleUnblockSuccess = () => {
    refetch();
    setIsUnblockDialogOpen(false);
    setSelectedStudent(null);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
            <Typography variant="h6">Danh sách học sinh bị chặn</Typography>
            <Typography variant="body2" color="text.secondary">
              Tổng: {blockedStudents?.length || 0} học sinh
            </Typography>
          </Box>

          {blockedStudents && blockedStudents.length === 0 ? (
            <Alert severity="info">Không có học sinh nào bị chặn</Alert>
          ) : (
            <>
              <TextField
                fullWidth
                placeholder="Tìm kiếm theo tên hoặc email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />

              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Học sinh</TableCell>
                      <TableCell align="center">Buổi vắng liên tiếp</TableCell>
                      <TableCell>Ngày chặn</TableCell>
                      <TableCell>Lý do</TableCell>
                      <TableCell align="center">Thao tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.studentId}>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Avatar
                              src={student.studentAvatar || undefined}
                              alt={student.studentName}
                            >
                              {student.studentName.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {student.studentName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {student.studentEmail}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={student.consecutiveAbsences}
                            color="error"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {student.blockedAt
                            ? moment(student.blockedAt).format('DD/MM/YYYY HH:mm')
                            : '-'}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                            {student.blockedReason || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            color="primary"
                            size="small"
                            onClick={() => handleUnblock(student)}
                            title="Bỏ chặn"
                          >
                            <LockOpen />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </CardContent>
      </Card>

      {selectedStudent && (
        <UnblockDialog
          open={isUnblockDialogOpen}
          onClose={() => {
            setIsUnblockDialogOpen(false);
            setSelectedStudent(null);
          }}
          onSuccess={handleUnblockSuccess}
          classroomId={classroomId}
          student={selectedStudent}
        />
      )}
    </>
  );
};



