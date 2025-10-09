import {
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Error as ErrorIcon,
  FileUpload as FileUploadIcon,
  Upload as UploadIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography
} from '@mui/material';
import { useCallback, useState } from 'react';
import { toast } from 'react-hot-toast';
import { assignmentApi, downloadAssignmentPdf, type CreateAssignmentDto } from '../../apis/assignment';
import AudioGenerationOptions from '../AudioGenerationOptions';

interface Activity {
  id: string;
  type: string;
  title: string;
  instructions?: string;
  content: any;
  points?: number;
  timeLimit?: number;
  maxAttempts?: number;
  passingScore?: number;
  difficulty?: string;
  hints?: string[];
}

interface Assignment {
  title: string;
  description: string;
  instructions: string;
  dueDate: string;
  totalPoints: number;
  timeLimit: number;
  maxAttempts: number;
  assignedTo: string[];
  activities: Activity[];
  isPublished: boolean;
  customContent?: any;
}

interface ImportPreviewResult {
  assignment: Partial<Assignment>;
  activities: Activity[];
  errors: string[];
  warnings: string[];
}

const ACTIVITY_TYPES = [
  { value: 'quiz', label: 'Quiz' },
  { value: 'reading', label: 'Reading Comprehension' },
  { value: 'listening', label: 'Listening' },
  { value: 'grammar', label: 'Grammar' },
  { value: 'vocab', label: 'Vocabulary' },
  { value: 'flashcard', label: 'Flashcard' },
];

interface CreateAssignmentModalProps {
  open: boolean;
  onClose: () => void;
  classroomId: string;
  onSuccess?: (assignmentId: string) => void;
}

export default function CreateAssignmentModal({ open, onClose, classroomId, onSuccess }: CreateAssignmentModalProps) {
  // States for API and PDF
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdAssignmentId, setCreatedAssignmentId] = useState<string | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [assignment, setAssignment] = useState<Assignment>({
    title: '',
    description: '',
    instructions: '',
    dueDate: '',
    totalPoints: 100,
    timeLimit: 0,
    maxAttempts: 1,
    assignedTo: [],
    isPublished: false,
    activities: [],
  });

  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importPreview, setImportPreview] = useState<ImportPreviewResult | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleInputChange = (field: keyof Assignment, value: any) => {
    setAssignment(prev => ({ ...prev, [field]: value }));
  };

  const addActivity = () => {
    const newActivity: Activity = {
      id: `activity-${Date.now()}`,
      type: 'quiz',
      title: '',
      content: {
        question: '',
        options: ['', '', '', ''],
        correctIndex: 0,
      },
      points: 10,
    };
    setAssignment(prev => ({
      ...prev,
      activities: [...prev.activities, newActivity],
    }));
  };

  const updateActivity = (index: number, updatedActivity: Activity) => {
    setAssignment(prev => ({
      ...prev,
      activities: prev.activities.map((activity, i) =>
        i === index ? updatedActivity : activity
      ),
    }));
  };

  const handleActivityTypeChange = (index: number, newType: string) => {
    const activity = assignment.activities[index];
    let newContent: any = {};

    // Initialize content based on activity type
    switch (newType) {
      case 'listening':
        newContent = {
          audioUrl: '',
          instructions: '',
          questions: []
        };
        break;
      case 'quiz':
      case 'reading':
      case 'grammar':
        newContent = {
          question: '',
          options: ['', '', '', ''],
          correctIndex: 0
        };
        break;
      case 'pronunciation':
        newContent = {
          text: '',
          targetWords: []
        };
        break;
      default:
        newContent = activity?.content || {};
    }

    updateActivity(index, {
      ...activity,
      type: newType,
      content: newContent
    } as Activity);
  };

  const removeActivity = (index: number) => {
    setAssignment(prev => ({
      ...prev,
      activities: prev.activities.filter((_, i) => i !== index),
    }));
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch('/api/private/v1/assignments/import/template', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('cms_auth')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download template');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'assignment-import-template.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Template downloaded successfully');
    } catch (error) {
      console.error('Download template error:', error);
      toast.error('Failed to download template');
    }
  };

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file.name.match(/\.(xlsx|xls)$/)) {
      toast.error('Please upload an Excel file (.xlsx or .xls)');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/private/v1/assignments/import/preview', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('cms_auth')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to preview import');
      }

      const result = await response.json();
      setImportPreview(result);

      if (result.errors.length === 0) {
        toast.success('File processed successfully');
      } else {
        toast.error('File processed with errors');
      }
    } catch (error) {
      console.error('Import preview error:', error);
      toast.error('Failed to process file');
    } finally {
      setIsUploading(false);
    }
  }, []);

  const handleImportConfirm = () => {
    if (!importPreview) return;

    // Merge imported data with current assignment
    setAssignment(prev => ({
      ...prev,
      ...importPreview.assignment,
      activities: [...prev.activities, ...importPreview.activities],
    }));

    setImportDialogOpen(false);
    setImportPreview(null);
    toast.success(`Imported ${importPreview.activities.length} activities`);
  };

  const handleSubmit = async () => {
    if (!assignment.title.trim()) {
      toast.error('Assignment title is required');
      return;
    }

    if (assignment.activities.length === 0) {
      toast.error('At least one activity is required');
      return;
    }

    try {
      setIsSubmitting(true);

      // Map activities to match API format
      const createAssignmentDto: CreateAssignmentDto = {
        title: assignment.title,
        description: assignment.description || undefined,
        instructions: assignment.instructions || undefined,
        dueDate: assignment.dueDate || undefined,
        totalPoints: assignment.totalPoints || undefined,
        timeLimit: assignment.timeLimit || undefined,
        maxAttempts: assignment.maxAttempts || undefined,
        isPublished: assignment.isPublished || false,
        assignedTo: assignment.assignedTo || [],
        activities: assignment.activities.map(activity => ({
          type: activity.type,
          title: activity.title,
          instructions: activity.instructions,
          content: activity.content,
          points: activity.points || 10,
          timeLimit: activity.timeLimit,
          maxAttempts: activity.maxAttempts,
          difficulty: activity.difficulty,
          hints: activity.hints,
        })),
        customContent: assignment.customContent,
      };

      const response = await assignmentApi.createAssignment(classroomId, createAssignmentDto);

      if (response.data && response.data.id) {
        setCreatedAssignmentId(response.data.id);
        toast.success('Assignment created successfully!');
        onSuccess?.(response.data.id);

        // Reset form after brief delay
        setTimeout(() => {
          setAssignment({
            title: '',
            description: '',
            instructions: '',
            dueDate: '',
            totalPoints: 100,
            timeLimit: 0,
            maxAttempts: 1,
            assignedTo: [],
            isPublished: false,
            activities: [],
          });
          setCreatedAssignmentId(null);
          onClose();
        }, 1500);
      } else {
        toast.success('Assignment created successfully!');
      }
    } catch (error: any) {
      console.error('Create assignment error:', error);
      toast.error(error?.response?.data?.message || 'Failed to create assignment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!createdAssignmentId) {
      toast.error('No assignment created yet');
      return;
    }

    try {
      setIsDownloadingPdf(true);
      await downloadAssignmentPdf(createdAssignmentId, assignment.title);
      toast.success('PDF downloaded successfully!');
    } catch (error: any) {
      console.error('Download PDF error:', error);
      toast.error(error.message || 'Failed to download PDF');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="lg"
        fullWidth
        scroll="paper"
      >
        <DialogTitle>
          Tạo Bài Tập
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            {/* Assignment Info */}
            <Grid item xs={12}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Thông Tin Bài Tập</Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<FileUploadIcon />}
                  onClick={() => setImportDialogOpen(true)}
                >
                  Import Excel
                </Button>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Tiêu đề *"
                    value={assignment.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    required
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Tổng Điểm"
                    type="number"
                    value={assignment.totalPoints || ''}
                    onChange={(e) => handleInputChange('totalPoints', parseInt(e.target.value) || 100)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Mô Tả"
                    multiline
                    rows={2}
                    value={assignment.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Hạn Nộp"
                    type="datetime-local"
                    value={assignment.dueDate || ''}
                    onChange={(e) => handleInputChange('dueDate', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Thời Gian (phút)"
                    type="number"
                    value={assignment.timeLimit || ''}
                    onChange={(e) => handleInputChange('timeLimit', parseInt(e.target.value))}
                    size="small"
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Activities */}
            <Grid item xs={12}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Hoạt Động ({assignment.activities.length})</Typography>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={addActivity}
                >
                  Thêm Hoạt Động
                </Button>
              </Box>

              {assignment.activities.length === 0 ? (
                <Alert severity="info">
                  Chưa có hoạt động nào. Click "Thêm Hoạt Động" hoặc import từ Excel để bắt đầu.
                </Alert>
              ) : (
                assignment.activities.map((activity, index) => (
                  <Card key={activity.id} sx={{ mb: 2 }} variant="outlined">
                    <CardContent>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Tiêu Đề Hoạt Động"
                            value={activity.title}
                            onChange={(e) => updateActivity(index, { ...activity, title: e.target.value })}
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <FormControl fullWidth size="small">
                            <InputLabel>Loại</InputLabel>
                            <Select
                              value={activity.type}
                              onChange={(e) => handleActivityTypeChange(index, e.target.value)}
                            >
                              {ACTIVITY_TYPES.map(type => (
                                <MenuItem key={type.value} value={type.value}>
                                  {type.label}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <TextField
                            fullWidth
                            label="Điểm"
                            type="number"
                            value={activity.points || ''}
                            onChange={(e) => updateActivity(index, { ...activity, points: parseInt(e.target.value) || 10 })}
                            size="small"
                          />
                        </Grid>

                        {/* Activity Type Specific Fields */}
                        {(activity.type === 'quiz' || activity.type === 'reading' || activity.type === 'grammar') && (
                          <>
                            <Grid item xs={12}>
                              <TextField
                                fullWidth
                                label="Câu Hỏi"
                                value={activity.content?.question || ''}
                                onChange={(e) => updateActivity(index, {
                                  ...activity,
                                  content: { ...activity.content, question: e.target.value }
                                })}
                                size="small"
                              />
                            </Grid>
                            {activity.content?.options?.map((option: string, optIndex: number) => (
                              <Grid item xs={12} md={6} key={optIndex}>
                                <TextField
                                  fullWidth
                                  label={`Lựa Chọn ${optIndex + 1}`}
                                  value={option}
                                  onChange={(e) => {
                                    const newOptions = [...(activity.content?.options || [])];
                                    newOptions[optIndex] = e.target.value;
                                    updateActivity(index, {
                                      ...activity,
                                      content: { ...activity.content, options: newOptions }
                                    });
                                  }}
                                  size="small"
                                />
                              </Grid>
                            ))}
                            <Grid item xs={12} md={6}>
                              <FormControl fullWidth size="small">
                                <InputLabel>Đáp Án Đúng</InputLabel>
                                <Select
                                  value={activity.content?.correctIndex || 0}
                                  onChange={(e) => updateActivity(index, {
                                    ...activity,
                                    content: { ...activity.content, correctIndex: e.target.value }
                                  })}
                                >
                                  {activity.content?.options?.map((_: any, optIndex: number) => (
                                    <MenuItem key={optIndex} value={optIndex}>
                                      Lựa Chọn {optIndex + 1}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            </Grid>
                          </>
                        )}

                        {/* Listening Activity Specific Fields */}
                        {activity.type === 'listening' && (
                          <>
                            <Grid item xs={12}>
                              <AudioGenerationOptions
                                label="Audio Content"
                                value={activity.content?.audioUrl || ''}
                                onChange={(audioUrl) => updateActivity(index, {
                                  ...activity,
                                  content: { ...activity.content, audioUrl }
                                })}
                                required={true}
                              />
                            </Grid>

                            {/* Listening Questions */}
                            <Grid item xs={12}>
                              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                <Typography variant="subtitle2">Câu Hỏi ({activity.content?.questions?.length || 0})</Typography>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  startIcon={<AddIcon />}
                                  onClick={() => {
                                    const questions = activity.content?.questions || [];
                                    updateActivity(index, {
                                      ...activity,
                                      content: {
                                        ...activity.content,
                                        questions: [
                                          ...questions,
                                          {
                                            id: Date.now(),
                                            question: '',
                                            options: ['', '', '', ''],
                                            correctIndex: 0
                                          }
                                        ]
                                      }
                                    });
                                  }}
                                >
                                  Thêm Câu Hỏi
                                </Button>
                              </Box>

                              {activity.content?.questions?.map((question: any, qIndex: number) => (
                                <Card key={question.id} variant="outlined" sx={{ mb: 1, p: 1 }}>
                                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                    <Typography variant="caption">Câu {qIndex + 1}</Typography>
                                    <IconButton
                                      size="small"
                                      color="error"
                                      onClick={() => {
                                        const questions = activity.content?.questions || [];
                                        const updatedQuestions = questions.filter((_: any, i: number) => i !== qIndex);
                                        updateActivity(index, {
                                          ...activity,
                                          content: { ...activity.content, questions: updatedQuestions }
                                        });
                                      }}
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </Box>

                                  <Grid container spacing={1}>
                                    <Grid item xs={12}>
                                      <TextField
                                        fullWidth
                                        label="Câu Hỏi"
                                        value={question.question}
                                        onChange={(e) => {
                                          const questions = [...(activity.content?.questions || [])];
                                          questions[qIndex] = { ...questions[qIndex], question: e.target.value };
                                          updateActivity(index, {
                                            ...activity,
                                            content: { ...activity.content, questions }
                                          });
                                        }}
                                        size="small"
                                      />
                                    </Grid>

                                    {question.options?.map((option: string, optIndex: number) => (
                                      <Grid item xs={12} md={6} key={optIndex}>
                                        <TextField
                                          fullWidth
                                          label={`Lựa Chọn ${optIndex + 1}`}
                                          value={option}
                                          onChange={(e) => {
                                            const questions = [...(activity.content?.questions || [])];
                                            const newOptions = [...questions[qIndex].options];
                                            newOptions[optIndex] = e.target.value;
                                            questions[qIndex] = { ...questions[qIndex], options: newOptions };
                                            updateActivity(index, {
                                              ...activity,
                                              content: { ...activity.content, questions }
                                            });
                                          }}
                                          size="small"
                                        />
                                      </Grid>
                                    ))}

                                    <Grid item xs={12}>
                                      <FormControl fullWidth size="small">
                                        <InputLabel>Đáp Án Đúng</InputLabel>
                                        <Select
                                          value={question.correctIndex || 0}
                                          onChange={(e) => {
                                            const questions = [...(activity.content?.questions || [])];
                                            questions[qIndex] = { ...questions[qIndex], correctIndex: e.target.value };
                                            updateActivity(index, {
                                              ...activity,
                                              content: { ...activity.content, questions }
                                            });
                                          }}
                                        >
                                          {question.options?.map((_: any, optIndex: number) => (
                                            <MenuItem key={optIndex} value={optIndex}>
                                              Lựa Chọn {optIndex + 1}
                                            </MenuItem>
                                          ))}
                                        </Select>
                                      </FormControl>
                                    </Grid>
                                  </Grid>
                                </Card>
                              ))}

                              {(!activity.content?.questions || activity.content.questions.length === 0) && (
                                <Alert severity="info" sx={{ mt: 1 }}>
                                  Chưa có câu hỏi. Click "Thêm Câu Hỏi" để tạo câu hỏi nghe hiểu.
                                </Alert>
                              )}
                            </Grid>
                          </>
                        )}
                      </Grid>
                    </CardContent>
                    <CardActions>
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => removeActivity(index)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </CardActions>
                  </Card>
                ))
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={isSubmitting}>
            Huỷ
          </Button>
          {createdAssignmentId && (
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
            >
              {isDownloadingPdf ? 'Đang tải...' : 'Tải PDF'}
            </Button>
          )}
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!assignment.title || assignment.activities.length === 0 || isSubmitting}
          >
            {isSubmitting ? 'Đang tạo...' : 'Tạo Bài Tập'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Import Dialog */}
      <Dialog
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Import Bài Tập từ Excel
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Bước 1: Tải Mẫu Excel
            </Typography>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadTemplate}
              sx={{ mb: 2 }}
            >
              Tải Mẫu Excel
            </Button>
            <Typography variant="body2" color="text.secondary">
              Tải mẫu, điền thông tin bài tập, và upload lại dưới đây.
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Bước 2: Upload File Đã Điền
            </Typography>
            <Paper
              sx={{
                border: '2px dashed',
                borderColor: 'grey.300',
                p: 3,
                textAlign: 'center',
              }}
            >
              <input
                accept=".xlsx,.xls"
                style={{ display: 'none' }}
                id="file-upload-import"
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleFileUpload(file);
                  }
                }}
              />
              <label htmlFor="file-upload-import">
                <UploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                <Typography variant="h6" gutterBottom>
                  Upload File Excel
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Click để chọn file (.xlsx, .xls)
                </Typography>
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<UploadIcon />}
                  sx={{ mt: 2 }}
                >
                  Chọn File
                </Button>
              </label>
            </Paper>
          </Box>

          {isUploading && (
            <Box sx={{ mb: 2 }}>
              <LinearProgress />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Đang xử lý file...
              </Typography>
            </Box>
          )}

          {importPreview && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Xem Trước Import
              </Typography>

              {importPreview.errors.length > 0 && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  <Typography variant="subtitle2">Lỗi:</Typography>
                  <List dense>
                    {importPreview.errors.map((error, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <ErrorIcon color="error" />
                        </ListItemIcon>
                        <ListItemText primary={error} />
                      </ListItem>
                    ))}
                  </List>
                </Alert>
              )}

              {importPreview.warnings.length > 0 && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  <Typography variant="subtitle2">Cảnh báo:</Typography>
                  <List dense>
                    {importPreview.warnings.map((warning, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <WarningIcon color="warning" />
                        </ListItemIcon>
                        <ListItemText primary={warning} />
                      </ListItem>
                    ))}
                  </List>
                </Alert>
              )}

              {importPreview.errors.length === 0 && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  <Typography variant="subtitle2">Sẵn sàng Import:</Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText
                        primary={`Bài tập: ${importPreview.assignment.title}`}
                        secondary={`${importPreview.activities.length} hoạt động`}
                      />
                    </ListItem>
                  </List>
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportDialogOpen(false)}>
            Huỷ
          </Button>
          <Button
            variant="contained"
            onClick={handleImportConfirm}
            disabled={!importPreview || importPreview.errors.length > 0}
          >
            Import Bài Tập
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
