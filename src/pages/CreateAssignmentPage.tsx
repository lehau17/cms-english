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
import AudioGenerationOptions from '../components/AudioGenerationOptions';
// import { useDropzone } from 'react-dropzone';
import { toast } from 'react-hot-toast';
import { assignmentApi, downloadAssignmentPdf, type CreateAssignmentDto } from '../apis/assignment';

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

const DIFFICULTY_LEVELS = [
  { value: 'BEGINNER', label: 'Beginner' },
  { value: 'INTERMEDIATE', label: 'Intermediate' },
  { value: 'ADVANCED', label: 'Advanced' },
];

export default function CreateAssignmentPage() {
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
          questions: [] // Start with empty questions array
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
          text: '', // Text to pronounce
          targetWords: [] // Words to focus on
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

      // For demo purposes, using a dummy classroom ID
      // In real implementation, this would come from route params or selection
      const classroomId = '00000000-0000-0000-0000-000000000000'; // Dummy ID

      const response = await assignmentApi.createAssignment(classroomId, createAssignmentDto);

      if (response.data && response.data.id) {
        setCreatedAssignmentId(response.data.id);
        toast.success('Assignment created successfully!');
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

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Create Assignment
      </Typography>

      <Grid container spacing={3}>
        {/* Assignment Info */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Assignment Information</Typography>
              <Button
                variant="outlined"
                startIcon={<FileUploadIcon />}
                onClick={() => setImportDialogOpen(true)}
              >
                Import from Excel
              </Button>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Title"
                  value={assignment.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Total Points"
                  type="number"
                  value={assignment.totalPoints || ''}
                  onChange={(e) => handleInputChange('totalPoints', parseInt(e.target.value) || 100)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={assignment.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Due Date"
                  type="datetime-local"
                  value={assignment.dueDate || ''}
                  onChange={(e) => handleInputChange('dueDate', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Time Limit (minutes)"
                  type="number"
                  value={assignment.timeLimit || ''}
                  onChange={(e) => handleInputChange('timeLimit', parseInt(e.target.value))}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Activities */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Activities ({assignment.activities.length})</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={addActivity}
              >
                Add Activity
              </Button>
            </Box>

            {assignment.activities.length === 0 ? (
              <Alert severity="info">
                No activities added yet. Click "Add Activity" or import from Excel to get started.
              </Alert>
            ) : (
              assignment.activities.map((activity, index) => (
                <Card key={activity.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Activity Title"
                          value={activity.title}
                          onChange={(e) => updateActivity(index, { ...activity, title: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <FormControl fullWidth>
                          <InputLabel>Type</InputLabel>
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
                          label="Points"
                          type="number"
                          value={activity.points || ''}
                          onChange={(e) => updateActivity(index, { ...activity, points: parseInt(e.target.value) || 10 })}
                        />
                      </Grid>

                      {/* Activity Type Specific Fields */}
                      {(activity.type === 'quiz' || activity.type === 'reading' || activity.type === 'grammar') && (
                        <>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Question"
                              value={activity.content?.question || ''}
                              onChange={(e) => updateActivity(index, {
                                ...activity,
                                content: { ...activity.content, question: e.target.value }
                              })}
                            />
                          </Grid>
                          {activity.content?.options?.map((option: string, optIndex: number) => (
                            <Grid item xs={12} md={6} key={optIndex}>
                              <TextField
                                fullWidth
                                label={`Option ${optIndex + 1}`}
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...(activity.content?.options || [])];
                                  newOptions[optIndex] = e.target.value;
                                  updateActivity(index, {
                                    ...activity,
                                    content: { ...activity.content, options: newOptions }
                                  });
                                }}
                              />
                            </Grid>
                          ))}
                          <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                              <InputLabel>Correct Answer</InputLabel>
                              <Select
                                value={activity.content?.correctIndex || 0}
                                onChange={(e) => updateActivity(index, {
                                  ...activity,
                                  content: { ...activity.content, correctIndex: e.target.value }
                                })}
                              >
                                {activity.content?.options?.map((_: any, optIndex: number) => (
                                  <MenuItem key={optIndex} value={optIndex}>
                                    Option {optIndex + 1}
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
                              <Typography variant="h6">Questions ({activity.content?.questions?.length || 0})</Typography>
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
                                Add Question
                              </Button>
                            </Box>

                            {activity.content?.questions?.map((question: any, qIndex: number) => (
                              <Card key={question.id} variant="outlined" sx={{ mb: 2 }}>
                                <CardContent>
                                  <Box display="flex" justifyContent="between" alignItems="center" mb={2}>
                                    <Typography variant="subtitle1">Question {qIndex + 1}</Typography>
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
                                      <DeleteIcon />
                                    </IconButton>
                                  </Box>

                                  <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                      <TextField
                                        fullWidth
                                        label="Question"
                                        value={question.question}
                                        onChange={(e) => {
                                          const questions = [...(activity.content?.questions || [])];
                                          questions[qIndex] = { ...questions[qIndex], question: e.target.value };
                                          updateActivity(index, {
                                            ...activity,
                                            content: { ...activity.content, questions }
                                          });
                                        }}
                                      />
                                    </Grid>

                                    {question.options?.map((option: string, optIndex: number) => (
                                      <Grid item xs={12} md={6} key={optIndex}>
                                        <TextField
                                          fullWidth
                                          label={`Option ${optIndex + 1}`}
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
                                        />
                                      </Grid>
                                    ))}

                                    <Grid item xs={12} md={6}>
                                      <FormControl fullWidth>
                                        <InputLabel>Correct Answer</InputLabel>
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
                                              Option {optIndex + 1}
                                            </MenuItem>
                                          ))}
                                        </Select>
                                      </FormControl>
                                    </Grid>
                                  </Grid>
                                </CardContent>
                              </Card>
                            ))}

                            {(!activity.content?.questions || activity.content.questions.length === 0) && (
                              <Alert severity="info">
                                No questions added yet. Click "Add Question" to create listening comprehension questions.
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
                      onClick={() => removeActivity(index)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              ))
            )}
          </Paper>
        </Grid>

        {/* Submit */}
        <Grid item xs={12}>
          <Box display="flex" gap={2} justifyContent="flex-end">
            <Button variant="outlined">
              Save as Draft
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={!assignment.title || assignment.activities.length === 0 || isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Assignment'}
            </Button>
            {createdAssignmentId && (
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleDownloadPdf}
                disabled={isDownloadingPdf}
              >
                {isDownloadingPdf ? 'Downloading...' : 'Download PDF'}
              </Button>
            )}
          </Box>
        </Grid>
      </Grid>

      {/* Import Dialog */}
      <Dialog
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Import Assignment from Excel
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Step 1: Download Template
            </Typography>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadTemplate}
              sx={{ mb: 2 }}
            >
              Download Excel Template
            </Button>
            <Typography variant="body2" color="text.secondary">
              Download the template, fill in your assignment data, and upload it below.
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Step 2: Upload Completed File
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
                id="file-upload"
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleFileUpload(file);
                  }
                }}
              />
              <label htmlFor="file-upload">
                <UploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                <Typography variant="h6" gutterBottom>
                  Upload Excel File
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Click to browse files (.xlsx, .xls)
                </Typography>
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<UploadIcon />}
                  sx={{ mt: 2 }}
                >
                  Choose File
                </Button>
              </label>
            </Paper>
          </Box>

          {isUploading && (
            <Box sx={{ mb: 2 }}>
              <LinearProgress />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Processing file...
              </Typography>
            </Box>
          )}

          {importPreview && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Import Preview
              </Typography>

              {importPreview.errors.length > 0 && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  <Typography variant="subtitle2">Errors:</Typography>
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
                  <Typography variant="subtitle2">Warnings:</Typography>
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
                  <Typography variant="subtitle2">Ready to Import:</Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText
                        primary={`Assignment: ${importPreview.assignment.title}`}
                        secondary={`${importPreview.activities.length} activities found`}
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
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleImportConfirm}
            disabled={!importPreview || importPreview.errors.length > 0}
          >
            Import Assignment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
