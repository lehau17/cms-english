import { getStudentGradeDetails, type StudentGradeDetails } from '@/apis/classroom-detail';
import {
  Box,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { X } from 'lucide-react';
import React from 'react';

interface StudentGradeDetailModalProps {
  open: boolean;
  onClose: () => void;
  classroomId: string;
  studentId: string;
  studentName: string;
}

const StudentGradeDetailModal: React.FC<StudentGradeDetailModalProps> = ({
  open,
  onClose,
  classroomId,
  studentId,
  studentName,
}) => {
  const [activeTab, setActiveTab] = React.useState(0);

  const { data, isLoading, error } = useQuery<StudentGradeDetails>({
    queryKey: ['grade-details', classroomId, studentId],
    queryFn: () => getStudentGradeDetails(classroomId, studentId),
    enabled: open && !!classroomId && !!studentId,
  });

  const getAssignmentTypeLabel = (type: string) => {
    switch (type) {
      case 'MIDTERM_EXAM':
        return 'Thi giữa kỳ';
      case 'FINAL_EXAM':
        return 'Thi cuối kỳ';
      case 'QUIZ':
        return 'Bài kiểm tra';
      case 'HOMEWORK':
        return 'Bài tập về nhà';
      default:
        return type;
    }
  };

  const getActivityTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      vocab: 'Từ vựng',
      pronunciation: 'Phát âm',
      listening: 'Nghe',
      speaking: 'Nói',
      reading: 'Đọc',
      writing: 'Viết',
      grammar: 'Ngữ pháp',
      quiz: 'Câu hỏi',
      flashcard: 'Thẻ ghi nhớ',
      conversation: 'Hội thoại',
    };
    return typeMap[type] || type;
  };

  const getStateLabel = (state: string) => {
    const stateMap: Record<string, { label: string; color: 'default' | 'primary' | 'success' | 'warning' | 'error' }> = {
      not_started: { label: 'Chưa bắt đầu', color: 'default' },
      in_progress: { label: 'Đang làm', color: 'warning' },
      done: { label: 'Hoàn thành', color: 'success' },
      review_needed: { label: 'Cần ôn lại', color: 'warning' },
      mastered: { label: 'Thành thạo', color: 'success' },
    };
    return stateMap[state] || { label: state, color: 'default' };
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle className="flex items-center justify-between">
        <div>
          <Typography variant="h6">Chi tiết điểm: {studentName}</Typography>
          <Typography variant="body2" color="text.secondary">
            {data?.classroomName || ''}
          </Typography>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </DialogTitle>
      <DialogContent>
        {isLoading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box py={4} textAlign="center">
            <Typography color="error">Không thể tải dữ liệu</Typography>
          </Box>
        ) : data ? (
          <>
            <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
              <Tab label="Bài tập" />
              <Tab label="Hoạt động" />
            </Tabs>

            {activeTab === 0 && (
              <Box mt={3}>
                {/* Midterm Section */}
                {data.assignments.midterm.length > 0 && (
                  <Box mb={4}>
                    <Typography variant="h6" gutterBottom>
                      Thi giữa kỳ
                    </Typography>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Bài thi</TableCell>
                          <TableCell>Điểm</TableCell>
                          <TableCell>Trọng số</TableCell>
                          <TableCell>Ngày nộp</TableCell>
                          <TableCell>Nhận xét</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {data.assignments.midterm.map((assignment) => (
                          <TableRow key={assignment.assignmentId}>
                            <TableCell>{assignment.title}</TableCell>
                            <TableCell>
                              {assignment.score !== null
                                ? `${assignment.score}/${assignment.maxScore}`
                                : '-'}
                            </TableCell>
                            <TableCell>{(assignment.weight * 100).toFixed(0)}%</TableCell>
                            <TableCell>
                              {assignment.submittedAt
                                ? new Date(assignment.submittedAt).toLocaleDateString('vi-VN')
                                : '-'}
                            </TableCell>
                            <TableCell>{assignment.feedback || '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Box>
                )}

                {/* Final Section */}
                {data.assignments.final.length > 0 && (
                  <Box mb={4}>
                    <Typography variant="h6" gutterBottom>
                      Thi cuối kỳ
                    </Typography>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Bài thi</TableCell>
                          <TableCell>Điểm</TableCell>
                          <TableCell>Trọng số</TableCell>
                          <TableCell>Ngày nộp</TableCell>
                          <TableCell>Nhận xét</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {data.assignments.final.map((assignment) => (
                          <TableRow key={assignment.assignmentId}>
                            <TableCell>{assignment.title}</TableCell>
                            <TableCell>
                              {assignment.score !== null
                                ? `${assignment.score}/${assignment.maxScore}`
                                : '-'}
                            </TableCell>
                            <TableCell>{(assignment.weight * 100).toFixed(0)}%</TableCell>
                            <TableCell>
                              {assignment.submittedAt
                                ? new Date(assignment.submittedAt).toLocaleDateString('vi-VN')
                                : '-'}
                            </TableCell>
                            <TableCell>{assignment.feedback || '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Box>
                )}

                {/* Tests Section */}
                {data.assignments.tests.length > 0 && (
                  <Box mb={4}>
                    <Typography variant="h6" gutterBottom>
                      Bài kiểm tra
                    </Typography>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Bài kiểm tra</TableCell>
                          <TableCell>Loại</TableCell>
                          <TableCell>Điểm</TableCell>
                          <TableCell>Trọng số</TableCell>
                          <TableCell>Lần nộp</TableCell>
                          <TableCell>Ngày nộp</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {data.assignments.tests.map((assignment) => (
                          <TableRow key={assignment.assignmentId}>
                            <TableCell>{assignment.title}</TableCell>
                            <TableCell>
                              <Chip
                                label={getAssignmentTypeLabel(assignment.type)}
                                size="small"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              {assignment.score !== null
                                ? `${assignment.score}/${assignment.maxScore}`
                                : '-'}
                            </TableCell>
                            <TableCell>{(assignment.weight * 100).toFixed(0)}%</TableCell>
                            <TableCell>{assignment.attemptCount}</TableCell>
                            <TableCell>
                              {assignment.submittedAt
                                ? new Date(assignment.submittedAt).toLocaleDateString('vi-VN')
                                : '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Box>
                )}

                {data.assignments.midterm.length === 0 &&
                  data.assignments.final.length === 0 &&
                  data.assignments.tests.length === 0 && (
                    <Box py={4} textAlign="center">
                      <Typography color="text.secondary">Chưa có bài tập nào</Typography>
                    </Box>
                  )}
              </Box>
            )}

            {activeTab === 1 && (
              <Box mt={3}>
                {data.activities.length > 0 ? (
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Hoạt động</TableCell>
                        <TableCell>Loại</TableCell>
                        <TableCell>Bài học</TableCell>
                        <TableCell>Điểm tốt nhất</TableCell>
                        <TableCell>Điểm hiện tại</TableCell>
                        <TableCell>Số lần làm</TableCell>
                        <TableCell>Trạng thái</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.activities.map((activity) => {
                        const stateInfo = getStateLabel(activity.state);
                        return (
                          <TableRow key={activity.activityId}>
                            <TableCell>{activity.title}</TableCell>
                            <TableCell>
                              <Chip
                                label={getActivityTypeLabel(activity.type)}
                                size="small"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>{activity.lessonTitle}</TableCell>
                            <TableCell>
                              {activity.bestScore !== null ? activity.bestScore.toFixed(1) : '-'}
                            </TableCell>
                            <TableCell>
                              {activity.currentScore !== null
                                ? activity.currentScore.toFixed(1)
                                : '-'}
                            </TableCell>
                            <TableCell>{activity.attemptsCount}</TableCell>
                            <TableCell>
                              <Chip
                                label={stateInfo.label}
                                size="small"
                                color={stateInfo.color}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <Box py={4} textAlign="center">
                    <Typography color="text.secondary">Chưa có hoạt động nào</Typography>
                  </Box>
                )}
              </Box>
            )}
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default StudentGradeDetailModal;













