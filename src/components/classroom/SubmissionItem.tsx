import { type SubmissionDetail } from '@/apis/assignment';
import { Box, Button, Chip, TableCell, TableRow, Typography } from '@mui/material';
import { Award, Calendar, User } from 'lucide-react';
import React from 'react';

interface SubmissionItemProps {
  submission: SubmissionDetail;
  assignmentTotalPoints: number;
  onGrade: () => void;
}

const SubmissionItem: React.FC<SubmissionItemProps> = ({
  submission,
  assignmentTotalPoints,
  onGrade,
}) => {
  const finalScore = submission.gradedById
    ? submission.score
    : (submission.aiScore || submission.score);

  const hasAIScore = submission.aiScore !== null && submission.aiScore !== undefined;
  const hasTeacherScore = !!submission.gradedById;

  const getStatusLabel = () => {
    if (hasTeacherScore) return 'Đã chấm (GV)';
    if (hasAIScore) return 'Đã chấm (AI)';
    return 'Đã nộp';
  };

  const getStatusColor = () => {
    if (hasTeacherScore) return 'success';
    if (hasAIScore) return 'info';
    return 'default';
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const studentName =
    submission.student.displayName ||
    `${submission.student.firstName || ''} ${submission.student.lastName || ''}`.trim() ||
    submission.student.email ||
    'Học viên';

  return (
    <TableRow>
      <TableCell>
        <Box display="flex" alignItems="center" gap={1}>
          <User size={16} />
          <Typography variant="body2">{studentName}</Typography>
        </Box>
      </TableCell>
      <TableCell>
        <Box display="flex" alignItems="center" gap={1}>
          <Calendar size={16} />
          <Typography variant="body2">{formatDate(submission.submittedAt)}</Typography>
        </Box>
      </TableCell>
      <TableCell>
        {hasAIScore ? (
          <Chip
            label={`${submission.aiScore}/${assignmentTotalPoints}`}
            size="small"
            color="info"
            icon={<Award size={14} />}
          />
        ) : (
          <Typography variant="body2" color="text.secondary">
            -
          </Typography>
        )}
      </TableCell>
      <TableCell>
        {hasTeacherScore ? (
          <Chip
            label={`${submission.score}/${assignmentTotalPoints}`}
            size="small"
            color="success"
            icon={<Award size={14} />}
          />
        ) : (
          <Typography variant="body2" color="text.secondary">
            -
          </Typography>
        )}
      </TableCell>
      <TableCell>
        {finalScore !== null && finalScore !== undefined ? (
          <Typography variant="body2" fontWeight="bold" color="primary">
            {finalScore}/{assignmentTotalPoints}
          </Typography>
        ) : (
          <Typography variant="body2" color="text.secondary">
            -
          </Typography>
        )}
      </TableCell>
      <TableCell>
        <Chip label={getStatusLabel()} size="small" color={getStatusColor() as any} />
      </TableCell>
      <TableCell align="right">
        <Button
          variant={hasTeacherScore ? 'outlined' : 'contained'}
          size="small"
          onClick={onGrade}
        >
          {hasTeacherScore ? 'Chấm lại' : 'Chấm bài'}
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default SubmissionItem;











