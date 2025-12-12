import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { CheckCircle, Lock, XCircle } from 'lucide-react';
import React from 'react';
import AnswerDisplay from './AnswerDisplay';
import QuestionDisplay from './QuestionDisplay';

interface ActivityGradingItemProps {
  activity: {
    id: string;
    type: string;
    title: string;
    points: number;
    studentAnswer: any;
    correctAnswer?: any;
    content: any;
    isAutoGraded?: boolean;
    isAIGradable?: boolean;
    requiresManualGrading?: boolean;
    calculatedScore?: number | null;
  };
  index: number;
  score: number;
  onScoreChange: (score: number) => void;
}

const ActivityGradingItem: React.FC<ActivityGradingItemProps> = ({
  activity,
  index,
  score,
  onScoreChange,
}) => {
  const isReadOnly = activity.isAutoGraded === true;
  const maxScore = activity.points || 0;

  const getActivityTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      quiz: 'Trắc nghiệm',
      fill_blank: 'Điền vào chỗ trống',
      matching: 'Nối cặp',
      listening: 'Nghe hiểu',
      speaking: 'Nói',
      writing: 'Viết',
      pronunciation: 'Phát âm',
      vocab: 'Từ vựng',
      grammar: 'Ngữ pháp',
      dictation: 'Chính tả',
    };
    return labels[type.toLowerCase()] || type;
  };

  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
          <Box flex={1}>
            <Box display="flex" alignItems="center" gap={2} mb={1}>
              <Typography variant="h6" fontWeight="bold">
                Câu {index + 1}: {activity.title}
              </Typography>
              <Chip
                label={getActivityTypeLabel(activity.type)}
                size="small"
                color="primary"
                variant="outlined"
              />
              {isReadOnly && (
                <Chip
                  icon={<Lock size={14} />}
                  label="Tự động chấm"
                  size="small"
                  color="info"
                />
              )}
              {activity.isAIGradable && (
                <Chip
                  label="AI đánh giá"
                  size="small"
                  color="secondary"
                  variant="outlined"
                />
              )}
            </Box>
            <Typography variant="body2" color="text.secondary">
              Điểm tối đa: {maxScore} điểm
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={2}>
            {activity.calculatedScore !== null && activity.calculatedScore !== undefined && (
              <Typography variant="body2" color="text.secondary">
                Điểm tính toán: {activity.calculatedScore}/{maxScore}
              </Typography>
            )}
            <TextField
              label="Điểm"
              type="number"
              value={score}
              onChange={(e) => {
                const newScore = parseFloat(e.target.value) || 0;
                if (newScore >= 0 && newScore <= maxScore) {
                  onScoreChange(newScore);
                }
              }}
              inputProps={{
                min: 0,
                max: maxScore,
                step: 0.1,
              }}
              disabled={isReadOnly}
              size="small"
              sx={{ width: 100 }}
              helperText={isReadOnly ? 'Tự động chấm' : `0-${maxScore}`}
            />
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Original Question */}
        <Box mb={2}>
          <Typography variant="subtitle2" fontWeight="bold" mb={1}>
            Câu hỏi:
          </Typography>
          <QuestionDisplay
            content={activity.content}
            activityType={activity.type}
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Student Answer */}
        <Box mb={2}>
          <Typography variant="subtitle2" fontWeight="bold" mb={1}>
            Câu trả lời của học viên:
          </Typography>
          <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
            <AnswerDisplay
              activityType={activity.type}
              studentAnswer={activity.studentAnswer}
              content={activity.content}
              correctAnswer={activity.correctAnswer}
              showCorrectAnswer={true}
            />
          </Paper>
        </Box>

        {/* Correct Answer (for auto-graded) */}
        {isReadOnly && activity.correctAnswer && (
          <Box mb={2}>
            <Typography variant="subtitle2" fontWeight="bold" mb={1}>
              Đáp án đúng:
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'success.50' }}>
              <AnswerDisplay
                activityType={activity.type}
                studentAnswer={activity.correctAnswer}
                content={activity.content}
                isCorrectAnswer
                showCorrectAnswer={true}
              />
            </Paper>
          </Box>
        )}

        {/* Score Comparison */}
        {isReadOnly && activity.calculatedScore !== null && (
          <Box display="flex" alignItems="center" gap={1}>
            {activity.calculatedScore === maxScore ? (
              <CheckCircle size={16} color="success" />
            ) : (
              <XCircle size={16} color="error" />
            )}
            <Typography variant="body2" color="text.secondary">
              Điểm: {activity.calculatedScore}/{maxScore}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityGradingItem;







