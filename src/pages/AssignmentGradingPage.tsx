import { getSubmissionDetails, gradeSubmissionDetailed } from '@/apis/assignment';
import ActivityGradingItem from '@/components/assignment/ActivityGradingItem';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Award,
  CheckCircle,
  Clock,
  FileText,
  Save,
  User,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';

// Calculate activity score from student answer and correct answer
const calculateActivityScore = (activity: any, studentAnswer: any): number => {
  if (!studentAnswer && studentAnswer !== 0) {
    return 0;
  }

  const content = activity.content;
  const activityPoints = activity.points || 10;

  try {
    switch (activity.type.toLowerCase()) {
      case 'quiz':
      case 'vocab':
      case 'grammar':
        if (content?.questions && Array.isArray(content.questions)) {
          let correctCount = 0;
          content.questions.forEach((q: any, qIndex: number) => {
            const userAnswer = studentAnswer?.[qIndex];
            if (typeof userAnswer === 'number' && userAnswer === q.correctIndex) {
              correctCount++;
            }
          });
          return Math.round((correctCount / content.questions.length) * activityPoints);
        } else if (content?.options && typeof content.correctIndex === 'number') {
          return studentAnswer === content.correctIndex ? activityPoints : 0;
        }
        break;

      case 'listening':
        if (content?.questions && Array.isArray(content.questions)) {
          let correctCount = 0;
          content.questions.forEach((q: any, qIndex: number) => {
            const userAnswer = studentAnswer?.[qIndex];
            if (typeof userAnswer === 'number' && userAnswer === q.correctIndex) {
              correctCount++;
            }
          });
          return Math.round((correctCount / content.questions.length) * activityPoints);
        }
        break;

      case 'reading':
        if (content?.questions && Array.isArray(content.questions)) {
          let correctCount = 0;
          content.questions.forEach((q: any, qIndex: number) => {
            const userAnswer = studentAnswer?.[qIndex];
            if (typeof userAnswer === 'number' && userAnswer === q.correctIndex) {
              correctCount++;
            }
          });
          return Math.round((correctCount / content.questions.length) * activityPoints);
        }
        break;

      case 'fill_blank':
        if (content?.correctAnswers && Array.isArray(content.correctAnswers)) {
          let correctCount = 0;
          if (Array.isArray(studentAnswer)) {
            content.correctAnswers.forEach((correctAnswer: string, index: number) => {
              const userAnswer = studentAnswer[index];
              if (
                userAnswer &&
                userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim()
              ) {
                correctCount++;
              }
            });
          }
          return Math.round((correctCount / content.correctAnswers.length) * activityPoints);
        }
        break;

      case 'matching':
        if (typeof studentAnswer === 'object' && studentAnswer !== null) {
          let correctCount = 0;
          let totalPairs = 0;

          if (content?.pairs && Array.isArray(content.pairs)) {
            totalPairs = content.pairs.length;
            content.pairs.forEach((_pair: any, pairIndex: number) => {
              const userRightIndex = studentAnswer[pairIndex];
              if (typeof userRightIndex === 'number' && userRightIndex === pairIndex) {
                correctCount++;
              }
            });
          } else if (content?.leftItems && content?.rightItems) {
            totalPairs = content.leftItems.length;
            content.leftItems.forEach((_leftItem: string, leftIndex: number) => {
              const userRightIndex = studentAnswer[leftIndex];
              if (typeof userRightIndex === 'number' && userRightIndex === leftIndex) {
                correctCount++;
              }
            });
          }

          if (totalPairs > 0) {
            return Math.round((correctCount / totalPairs) * activityPoints);
          }
        }
        break;
    }
  } catch (error) {
    console.error(`Error calculating score for activity ${activity.id}:`, error);
  }

  return 0;
};

const AssignmentGradingPage: React.FC = () => {
  const { classroomId, assignmentId, submissionId } = useParams<{
    classroomId: string;
    assignmentId: string;
    submissionId: string;
  }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activityScores, setActivityScores] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState<string>('');

  const { data: submission, isLoading, error } = useQuery({
    queryKey: ['submission-details', submissionId],
    queryFn: () => getSubmissionDetails(submissionId!),
    enabled: !!submissionId,
  });

  const gradeMutation = useMutation({
    mutationFn: async (payload: { activityScores: Record<string, number>; feedback?: string }) => {
      return gradeSubmissionDetailed(submissionId!, payload);
    },
    onSuccess: () => {
      toast.success('Đã lưu điểm thành công');
      queryClient.invalidateQueries({ queryKey: ['submission-details', submissionId] });
      queryClient.invalidateQueries({ queryKey: ['assignment-submissions', assignmentId] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Lưu điểm thất bại');
    },
  });

  // Initialize activity scores from submission data
  React.useEffect(() => {
    if (submission?.assignment?.activities) {
      const initialScores: Record<string, number> = {};
      const answers = submission.answers || {};

      submission.assignment.activities.forEach((activity: any, index: number) => {
        // Use calculated score from backend if available
        if (activity.calculatedScore !== null && activity.calculatedScore !== undefined) {
          initialScores[activity.id] = activity.calculatedScore;
        } else {
          // Get student answer from activity.studentAnswer or submission.answers
          // Try multiple formats: by ID, by index, or from activity.studentAnswer
          const studentAnswer =
            activity.studentAnswer ??
            answers[activity.id] ??
            answers[`activity${index}`] ??
            null;

          // Debug log
          if (process.env.NODE_ENV === 'development') {
            console.log(`Activity ${activity.id} (${activity.type}):`, {
              studentAnswer,
              isAutoGraded: activity.isAutoGraded,
              hasAnswer: studentAnswer !== null && studentAnswer !== undefined,
              answerFromActivity: activity.studentAnswer,
              answerFromAnswers: answers[activity.id] || answers[`activity${index}`],
            });
          }

          // Calculate score if we have student answer
          // For activities that can be auto-calculated (quiz, listening, reading, vocab with questions, grammar, fill_blank, matching)
          if (studentAnswer !== null && studentAnswer !== undefined) {
            // Check if activity has questions format (for quiz, listening, reading, vocab, grammar)
            const hasQuestionsFormat =
              activity.type.toLowerCase() === 'quiz' ||
              activity.type.toLowerCase() === 'listening' ||
              activity.type.toLowerCase() === 'reading' ||
              (activity.type.toLowerCase() === 'vocab' && activity.content?.questions) ||
              (activity.type.toLowerCase() === 'grammar' && activity.content?.questions) ||
              activity.type.toLowerCase() === 'fill_blank' ||
              activity.type.toLowerCase() === 'matching';

            if (hasQuestionsFormat) {
              // Calculate score from student answer
              const calculatedScore = calculateActivityScore(activity, studentAnswer);
              initialScores[activity.id] = calculatedScore;

              if (process.env.NODE_ENV === 'development') {
                console.log(`Calculated score for ${activity.id} (${activity.type}):`, calculatedScore);
              }
            } else {
              // Vocab with items format or other formats - cannot auto-calculate, set to 0
              // Teacher will need to grade manually
              initialScores[activity.id] = 0;
            }
          } else {
            // No answer = 0 points
            initialScores[activity.id] = 0;
          }
        }
      });

      if (process.env.NODE_ENV === 'development') {
        console.log('Initial scores:', initialScores);
        console.log('Submission score:', submission.score);
        console.log('Submission answers:', answers);

        // Calculate total from initial scores
        let totalEarned = 0;
        let totalPoints = 0;
        submission.assignment.activities.forEach((activity: any) => {
          totalEarned += initialScores[activity.id] || 0;
          totalPoints += activity.points || 0;
        });
        const calculatedTotal = totalPoints > 0 ? Math.round((totalEarned / totalPoints) * 100) : 0;
        console.log('Calculated total from activities:', calculatedTotal, `(${totalEarned}/${totalPoints})`);
      }

      setActivityScores(initialScores);
      setFeedback(submission.feedback || '');
    }
  }, [submission]);

  // Calculate total score: earned/total * 100
  const scoreCalculation = useMemo(() => {
    if (!submission?.assignment?.activities) {
      return { earnedPoints: 0, totalPoints: 0, finalScore: 0 };
    }

    let earnedPoints = 0;
    let totalPoints = 0;

    submission.assignment.activities.forEach((activity: any) => {
      const activityScore = activityScores[activity.id] || 0;
      earnedPoints += activityScore;
      totalPoints += activity.points || 0;
    });

    const finalScore = totalPoints > 0
      ? Math.round((earnedPoints / totalPoints) * 100)
      : 0;

    const normalizedScore = Math.min(finalScore, 100);

    return { earnedPoints, totalPoints, finalScore: normalizedScore };
  }, [submission, activityScores]);

  const handleScoreChange = (activityId: string, score: number) => {
    setActivityScores((prev) => ({
      ...prev,
      [activityId]: score,
    }));
  };

  const handleAcceptAIScores = () => {
    if (!submission?.assignment?.activities) return;

    const newScores: Record<string, number> = {};
    const answers = submission.answers || {};

    submission.assignment.activities.forEach((activity: any, index: number) => {
      // Use calculated score from backend if available
      if (activity.calculatedScore !== null && activity.calculatedScore !== undefined) {
        newScores[activity.id] = activity.calculatedScore;
      } else {
        // Get student answer from activity.studentAnswer or submission.answers
        const studentAnswer =
          activity.studentAnswer ??
          answers[activity.id] ??
          answers[`activity${index}`] ??
          null;

        if (activity.isAutoGraded && studentAnswer !== null && studentAnswer !== undefined) {
          // Calculate score from student answer for auto-graded activities
          const calculatedScore = calculateActivityScore(activity, studentAnswer);
          newScores[activity.id] = calculatedScore;
        } else {
          newScores[activity.id] = 0;
        }
      }
    });
    setActivityScores(newScores);
    toast.success('Đã chấp nhận tất cả điểm AI');
  };

  const handleSave = () => {
    gradeMutation.mutate({
      activityScores,
      feedback: feedback.trim() || undefined,
    });
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !submission) {
    return (
      <Box p={4}>
        <Alert severity="error">Không thể tải thông tin bài nộp</Alert>
      </Box>
    );
  }

  const assignment = submission.assignment;
  const activities = assignment.activities || [];
  const student = submission.student;
  const studentName =
    student.displayName ||
    `${student.firstName || ''} ${student.lastName || ''}`.trim() ||
    student.email ||
    'Học viên';

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 4 }}>
      {/* Header */}
      <Paper sx={{ mb: 3, p: 3 }}>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Button
            startIcon={<ArrowLeft />}
            onClick={() => navigate(`/classrooms/${classroomId}`)}
          >
            Quay lại
          </Button>
          <Typography variant="h5" fontWeight="bold">
            Chấm bài tập
          </Typography>
        </Box>

        <Box display="flex" gap={4} flexWrap="wrap">
          <Box display="flex" alignItems="center" gap={1}>
            <User size={20} />
            <Typography variant="body1">
              <strong>Học viên:</strong> {studentName}
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <FileText size={20} />
            <Typography variant="body1">
              <strong>Bài tập:</strong> {assignment.title}
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Award size={20} />
            <Typography variant="body1">
              <strong>Tổng điểm:</strong> {assignment.totalPoints} điểm
            </Typography>
          </Box>
          {submission.submittedAt && (
            <Box display="flex" alignItems="center" gap={1}>
              <Clock size={20} />
              <Typography variant="body1">
                <strong>Nộp lúc:</strong>{' '}
                {new Date(submission.submittedAt).toLocaleString('vi-VN')}
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>

      <Box maxWidth="1200px" mx="auto" px={3}>
        {/* Activities List */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6" fontWeight="bold">
                Danh sách câu hỏi ({activities.length})
              </Typography>
              <Button
                variant="outlined"
                onClick={handleAcceptAIScores}
                startIcon={<CheckCircle />}
              >
                Chấp nhận tất cả điểm AI
              </Button>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {activities.map((activity: any, index: number) => (
              <ActivityGradingItem
                key={activity.id}
                activity={activity}
                index={index}
                score={activityScores[activity.id] || 0}
                onScoreChange={(score: number) => handleScoreChange(activity.id, score)}
              />
            ))}
          </CardContent>
        </Card>

        {/* Summary & Actions */}
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              Tổng kết
            </Typography>

            <Box display="flex" flexDirection="column" gap={2} mb={3}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body1">Điểm đạt được:</Typography>
                <Typography variant="body1" fontWeight="bold">
                  {scoreCalculation.earnedPoints}/{scoreCalculation.totalPoints} điểm
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body1">Điểm tổng kết:</Typography>
                <Chip
                  label={`${scoreCalculation.finalScore}/100`}
                  color="primary"
                  sx={{ fontSize: '1rem', fontWeight: 'bold', px: 2 }}
                />
              </Box>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  Tỷ lệ: {scoreCalculation.totalPoints > 0
                    ? ((scoreCalculation.earnedPoints / scoreCalculation.totalPoints) * 100).toFixed(1)
                    : 0}%
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            <TextField
              label="Nhận xét tổng thể"
              multiline
              rows={4}
              fullWidth
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Nhập nhận xét cho học viên..."
              sx={{ mb: 3 }}
            />

            <Box display="flex" gap={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={() => navigate(`/classrooms/${classroomId}`)}
              >
                Hủy
              </Button>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSave}
                disabled={gradeMutation.isPending}
              >
                {gradeMutation.isPending ? 'Đang lưu...' : 'Lưu điểm'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default AssignmentGradingPage;

