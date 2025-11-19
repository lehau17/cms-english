import { Close } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Grid,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { Sparkles } from 'lucide-react';
import React, { useState } from 'react';
import {
  ActivityType,
  DifficultyLevel,
  generateActivitiesWithAI,
} from '../../apis/activity';
import type { Activity } from '../../interface/activity.interface';

interface AIActivityGeneratorModalProps {
  open: boolean;
  onClose: () => void;
  courseTitle: string;
  courseDescription?: string;
  lessonTitle: string;
  lessonDescription?: string;
  lessonDifficulty?: DifficultyLevel;
  onActivitiesGenerated: (activities: Activity[]) => void;
}

const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  [ActivityType.VOCAB]: 'Từ vựng',
  [ActivityType.QUIZ]: 'Trắc nghiệm',
  [ActivityType.LISTENING]: 'Nghe',
  [ActivityType.SPEAKING]: 'Nói',
  [ActivityType.READING]: 'Đọc hiểu',
  [ActivityType.WRITING]: 'Viết',
  [ActivityType.PRONUNCIATION]: 'Phát âm',
  [ActivityType.FILL_BLANK]: 'Điền từ',
  [ActivityType.DICTATION]: 'Chính tả',
  [ActivityType.MATCHING]: 'Ghép đôi',
  [ActivityType.MINI_GAME]: 'Mini game',
  [ActivityType.GRAMMAR]: 'Ngữ pháp',
  [ActivityType.FLASHCARD]: 'Flashcard',
  [ActivityType.CONVERSATION]: 'Hội thoại',
};

const DEFAULT_ACTIVITY_TYPES = [
  ActivityType.VOCAB,
  ActivityType.QUIZ,
  ActivityType.LISTENING,
  ActivityType.SPEAKING,
  ActivityType.READING,
  ActivityType.WRITING,
];

export const AIActivityGeneratorModal: React.FC<AIActivityGeneratorModalProps> = ({
  open,
  onClose,
  courseTitle,
  courseDescription,
  lessonTitle,
  lessonDescription,
  lessonDifficulty,
  onActivitiesGenerated,
}) => {
  const [count, setCount] = useState<number>(5);
  const [userPrompt, setUserPrompt] = useState<string>('');
  const [selectedTypes, setSelectedTypes] = useState<ActivityType[]>(DEFAULT_ACTIVITY_TYPES);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleTypeToggle = (type: ActivityType) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleSelectAllTypes = () => {
    setSelectedTypes(Object.values(ActivityType));
  };

  const handleDeselectAllTypes = () => {
    setSelectedTypes([]);
  };

  const handleGenerate = async () => {
    if (selectedTypes.length === 0) {
      setError('Vui lòng chọn ít nhất 1 loại hoạt động');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await generateActivitiesWithAI({
        courseTitle,
        courseDescription,
        lessonTitle,
        lessonDescription,
        userPrompt: userPrompt.trim() || undefined,
        count,
        activityTypes: selectedTypes.length > 0 ? selectedTypes : undefined,
        difficulty: lessonDifficulty,
      });

      onActivitiesGenerated(response.activities);
      onClose();

      // Reset state
      setCount(5);
      setUserPrompt('');
      setSelectedTypes(DEFAULT_ACTIVITY_TYPES);
    } catch (err: any) {
      console.error('AI generation error:', err);
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi tạo hoạt động. Vui lòng thử lại.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClose = () => {
    if (!isGenerating) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <Sparkles className="w-5 h-5 text-blue-600" />
            <Typography variant="h6">Tạo Hoạt Động Bằng AI</Typography>
          </Box>
          <Button
            onClick={handleClose}
            disabled={isGenerating}
            size="small"
            sx={{ minWidth: 'auto' }}
          >
            <Close />
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Course & Lesson Context */}
        <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Ngữ cảnh
          </Typography>
          <Box display="flex" flexDirection="column" gap={0.5}>
            <Typography variant="body2">
              <strong>Khóa học:</strong> {courseTitle}
            </Typography>
            {courseDescription && (
              <Typography variant="body2" color="text.secondary">
                {courseDescription}
              </Typography>
            )}
            <Typography variant="body2" sx={{ mt: 1 }}>
              <strong>Bài học:</strong> {lessonTitle}
            </Typography>
            {lessonDescription && (
              <Typography variant="body2" color="text.secondary">
                {lessonDescription}
              </Typography>
            )}
            {lessonDifficulty && (
              <Box mt={1}>
                <Chip
                  label={lessonDifficulty}
                  size="small"
                  color={
                    lessonDifficulty === DifficultyLevel.BEGINNER || lessonDifficulty === DifficultyLevel.ELEMENTARY
                      ? 'success'
                      : lessonDifficulty === DifficultyLevel.INTERMEDIATE || lessonDifficulty === DifficultyLevel.UPPER_INTERMEDIATE
                        ? 'warning'
                        : 'error'
                  }
                />
              </Box>
            )}
          </Box>
        </Paper>

        {/* User Prompt */}
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Mô tả chi tiết (tuỳ chọn)"
          placeholder="Ví dụ: Tạo bài tập về chủ đề Shopping, tập trung vào từ vựng liên quan đến mua sắm tại cửa hàng quần áo, bao gồm cả cách hỏi giá và thương lượng..."
          value={userPrompt}
          onChange={(e) => setUserPrompt(e.target.value)}
          disabled={isGenerating}
          sx={{ mb: 3 }}
        />

        {/* Activity Count */}
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Số lượng hoạt động</InputLabel>
          <Select
            value={count}
            label="Số lượng hoạt động"
            onChange={(e) => setCount(Number(e.target.value))}
            disabled={isGenerating}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <MenuItem key={num} value={num}>
                {num} hoạt động
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Activity Types */}
        <FormControl component="fieldset" fullWidth sx={{ mb: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <FormLabel component="legend">Loại hoạt động</FormLabel>
            <Box>
              <Button size="small" onClick={handleSelectAllTypes} disabled={isGenerating}>
                Chọn tất cả
              </Button>
              <Button size="small" onClick={handleDeselectAllTypes} disabled={isGenerating}>
                Bỏ chọn tất cả
              </Button>
            </Box>
          </Box>
          <FormGroup>
            <Grid container spacing={1}>
              {Object.values(ActivityType).map((type) => (
                <Grid item xs={6} sm={4} md={3} key={type}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedTypes.includes(type)}
                        onChange={() => handleTypeToggle(type)}
                        disabled={isGenerating}
                        size="small"
                      />
                    }
                    label={
                      <Typography variant="body2">{ACTIVITY_TYPE_LABELS[type]}</Typography>
                    }
                  />
                </Grid>
              ))}
            </Grid>
          </FormGroup>
        </FormControl>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Progress Bar */}
        {isGenerating && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Đang tạo hoạt động bằng AI...
            </Typography>
            <LinearProgress />
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={isGenerating}>
          Hủy
        </Button>
        <Button
          onClick={handleGenerate}
          variant="contained"
          disabled={isGenerating || selectedTypes.length === 0}
          startIcon={<Sparkles className="w-4 h-4" />}
        >
          {isGenerating ? 'Đang tạo...' : 'Tạo hoạt động'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
