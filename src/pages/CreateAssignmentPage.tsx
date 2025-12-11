import { yupResolver } from '@hookform/resolvers/yup';
import {
  AddCircleOutline,
  ArrowBack,
  DeleteOutline,
  Download as DownloadIcon,
  FileUpload as FileUploadIcon,
  Save,
  SaveAlt,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Controller, SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { AssignmentActivityDto, assignmentApi, CreateAssignmentDto, downloadAssignmentPdf } from '../apis/assignment';
import { getClassroomSessions } from '../apis/classroom';
import { AssignmentBankBrowser } from '../components/assignment';
import { ActivityEditor } from '../components/assignment/ActivityEditor';
import { ImportDialog } from '../components/assignment/ImportDialog';
import { AIActivityGeneratorModal } from '../components/course/AIActivityGeneratorModal';
import type { Activity } from '../interface/activity.interface';
import { ACTIVITY_TYPES, AssignmentFormValues, assignmentSchema } from '../schemas/assignment.schema';
import { getBookedDateErrorMessage, getBookedDates, getPastDateErrorMessage, isDateBooked, isPastDate } from '../utils/dateValidation';
import { get15MinuteIntervalErrorMessage, isValid15MinuteInterval } from '../utils/timeValidation';

const DIFFICULTY_LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'elementary', label: 'Elementary' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'upper_intermediate', label: 'Upper Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' },
];

export default function CreateAssignmentPage() {
  const navigate = useNavigate();
  const { classroomId } = useParams<{ classroomId: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdAssignmentId, setCreatedAssignmentId] = useState<string | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [bankBrowserOpen, setBankBrowserOpen] = useState(false);
  const [timeValidationErrors, setTimeValidationErrors] = useState<{
    startTime?: string;
    dueDate?: string;
  }>({});
  const [dateValidationErrors, setDateValidationErrors] = useState<{
    startTime?: string;
    dueDate?: string;
  }>({});

  // Fetch classroom sessions for date restriction
  const { data: classroomSessions } = useQuery({
    queryKey: ['classroom-sessions', classroomId],
    queryFn: () => getClassroomSessions(classroomId!),
    enabled: !!classroomId,
  });

  // Calculate booked dates
  const bookedDates = useMemo(() => {
    if (!classroomSessions) return new Set<string>();
    return getBookedDates(classroomSessions);
  }, [classroomSessions]);

  // React Hook Form setup
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<AssignmentFormValues>({
    resolver: yupResolver(assignmentSchema) as any,
    defaultValues: {
      title: '',
      description: '',
      instructions: '',
      startTime: '',
      dueDate: '',
      // totalPoints removed - backend will set to 100
      timeLimit: undefined, // Don't default to 0
      maxAttempts: 1,
      isPublished: false,
      activities: [],
    },
  });

  // Field array for activities
  const { fields: activityFields, append, remove } = useFieldArray({
    control,
    name: 'activities',
  });

  const addActivityOf = (type: string) => {
    const base = {
      type,
      title: type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' '),
      points: 10,
      content: {},
    };
    // seed minimal content per type (matching AI generated structure)
    switch (type) {
      case 'quiz':
        (base as any).content = {
          questions: [
            {
              question: '',
              options: ['', ''],
              correctIndex: 0,
              explanation: '',
            },
          ],
        };
        break;
      case 'grammar':
        (base as any).content = {
          rule: '',
          exercises: [
            {
              question: '',
              options: ['', ''],
              correctIndex: 0,
            },
          ],
        };
        break;
      case 'reading':
        (base as any).content = {
          passage: '',
          questions: [
            {
              question: '',
              options: ['', ''],
              correctIndex: 0,
            },
          ],
        };
        break;
      case 'listening':
        (base as any).content = {
          audioUrl: '',
          questions: [
            {
              question: '',
              options: ['', ''],
              correctIndex: 0,
            },
          ],
        };
        break;
      case 'vocab':
        (base as any).content = {
          items: [{
            word: '',
            definition: '',
            translationVi: '',
            pronunciation: '',
            partOfSpeech: '',
            examples: [''],
            synonyms: [],
            antonyms: [],
            audioUrl: '',
            imageUrl: '',
          }]
        };
        break;
      case 'pronunciation':
        (base as any).content = {
          phrases: [{ text: '', sampleUrl: '' }],
          tips: [''],
          phonetics: '',
        };
        break;
      case 'speaking':
        (base as any).content = { prompt: '', minSeconds: 10, tips: [] };
        break;
      case 'mini_game':
        (base as any).content = { target: '', pool: [], rounds: 3 };
        break;
      case 'writing':
        (base as any).content = { prompt: '', minWords: 50, rubric: [] };
        break;
      case 'flashcard':
        (base as any).content = { cards: [{ front: '', back: '', imageUrl: '' }] };
        break;
      case 'conversation':
        (base as any).content = {
          scenario: '',
          initialDialog: [{ role: 'assistant', text: '' }],
          suggestions: [],
        };
        break;
      case 'fill_blank':
        (base as any).content = { passage: '', blanks: [''] };
        break;
      case 'dictation':
        (base as any).content = {
          audioUrl: '',
          transcript: '',
          minWords: 0,
        };
        break;
      case 'matching':
        (base as any).content = {
          leftItems: [''],
          rightItems: [''],
        };
        break;
    }
    append(base as any);
  };

  const handleAddActivity = () => {
    addActivityOf('quiz');
  };

  const handleImportConfirm = (data: any) => {
    // Merge imported activities with existing ones
    const currentActivities = watch('activities') || [];
    const importedActivities = (data.activities || []).map((activity: any) => ({
      ...activity,
      id: `imported-${Date.now()}-${Math.random()}`,
    }));

    setValue('activities', [...currentActivities, ...importedActivities]);

    // Optionally update assignment info if not set
    if (!watch('title') && data.assignment?.title) {
      setValue('title', data.assignment.title);
    }
    if (!watch('description') && data.assignment?.description) {
      setValue('description', data.assignment.description);
    }

    toast.success(`Imported ${importedActivities.length} activities`);
  };

  const handleBankActivitiesSelected = (activities: AssignmentActivityDto[]) => {
    // Map bank activities to form format
    activities.forEach((activity) => {
      append({
        type: activity.type,
        title: activity.title || '',
        instructions: activity.instructions || '',
        content: activity.content || {},
        points: activity.points || 10,
        passingScore: activity.passingScore,
        difficulty: activity.difficulty,
        hints: activity.hints || [],
        mediaUrls: activity.mediaUrls || [],
      } as any);
    });

    toast.success(`Added ${activities.length} ${activities.length === 1 ? 'activity' : 'activities'} from bank`);
    setBankBrowserOpen(false);
  };

  const onSubmit: SubmitHandler<AssignmentFormValues> = async (data: any) => {
    try {
      setIsSubmitting(true);

      // Validate before submission
      if (!data.title?.trim()) {
        toast.error('Assignment title is required');
        return;
      }

      if (!data.activities || data.activities.length === 0) {
        toast.error('At least one activity is required');
        return;
      }

      // Validate 15-minute intervals
      const timeErrors: { startTime?: string; dueDate?: string } = {};
      if (data.startTime) {
        const startDate = new Date(data.startTime);
        if (!isValid15MinuteInterval(startDate)) {
          timeErrors.startTime = get15MinuteIntervalErrorMessage();
        }
      }
      if (data.dueDate) {
        const dueDate = new Date(data.dueDate);
        if (!isValid15MinuteInterval(dueDate)) {
          timeErrors.dueDate = get15MinuteIntervalErrorMessage();
        }
      }
      if (Object.keys(timeErrors).length > 0) {
        setTimeValidationErrors(timeErrors);
        toast.error('Vui lòng kiểm tra lại thời gian');
        return;
      }
      setTimeValidationErrors({});

      // Validate date restrictions
      const dateErrors: { startTime?: string; dueDate?: string } = {};
      if (data.startTime) {
        const startDate = new Date(data.startTime);
        if (isPastDate(startDate)) {
          dateErrors.startTime = getPastDateErrorMessage();
        } else if (isDateBooked(startDate, bookedDates)) {
          dateErrors.startTime = getBookedDateErrorMessage();
        }
      }
      if (data.dueDate) {
        const dueDate = new Date(data.dueDate);
        if (isPastDate(dueDate)) {
          dateErrors.dueDate = getPastDateErrorMessage();
        } else if (isDateBooked(dueDate, bookedDates)) {
          dateErrors.dueDate = getBookedDateErrorMessage();
        }
      }
      if (Object.keys(dateErrors).length > 0) {
        setDateValidationErrors(dateErrors);
        toast.error('Vui lòng kiểm tra lại ngày đã chọn');
        return;
      }
      setDateValidationErrors({});

      // Map to API format
      const createDto: CreateAssignmentDto = {
        title: data.title.trim(),
        description: data.description?.trim() || undefined,
        instructions: data.instructions?.trim() || undefined,
        startTime: data.startTime || undefined,
        dueDate: data.dueDate || undefined,
        // totalPoints removed - backend will set to 100
        // Only send timeLimit if it's a valid positive integer
        timeLimit: data.timeLimit && data.timeLimit > 0 ? Math.floor(data.timeLimit) : undefined,
        maxAttempts: data.maxAttempts && data.maxAttempts > 0 ? Math.floor(data.maxAttempts) : 1,
        isPublished: data.isPublished,
        assignedTo: [],
        activities: (data.activities || []).map((activity: any): AssignmentActivityDto => ({
          type: activity.type,
          title: activity.title,
          instructions: activity.instructions,
          content: activity.content,
          points: activity.points || 10,
          difficulty: activity.difficulty,
          hints: activity.hints,
        })),
      };

      // Get classroomId from URL params
      if (!classroomId) {
        toast.error('Classroom ID is required');
        return;
      }

      const response = await assignmentApi.createAssignment(classroomId, createDto);

      if (response.data && response.data.id) {
        setCreatedAssignmentId(response.data.id);
        toast.success('Assignment created successfully!');
        // Navigate back to classroom after successful creation
        navigate(`/classrooms/${classroomId}`);
      } else {
        toast.success('Assignment created successfully!');
        navigate(`/classrooms/${classroomId}`);
      }
    } catch (error: any) {
      console.error('Create assignment error:', error);

      // Handle validation errors from backend
      if (error?.response?.data?.message && Array.isArray(error.response.data.message)) {
        const validationErrors = error.response.data.message;

        // Format error messages for better readability
        const formattedErrors = validationErrors
          .filter((err: any) => err.errors && err.errors.length > 0)
          .map((err: any) => {
            const fieldName = err.field.charAt(0).toUpperCase() + err.field.slice(1).replace(/([A-Z])/g, ' $1');
            return `• ${fieldName}: ${err.errors.join(', ')}`;
          });

        if (formattedErrors.length > 0) {
          toast.error(
            <div style={{ textAlign: 'left' }}>
              <strong>Validation Errors:</strong>
              <br />
              {formattedErrors.map((msg: string, idx: number) => (
                <div key={idx}>{msg}</div>
              ))}
            </div>,
            { duration: 6000 }
          );
        } else {
          toast.error('Invalid data. Please check your input.');
        }
      } else if (error?.response?.data?.message) {
        const message = error.response.data.message;
        // Handle when message is an array (validation errors) or object
        if (Array.isArray(message)) {
          toast.error('Validation error. Please check your input.');
        } else if (typeof message === 'object') {
          toast.error('Server error. Please try again.');
        } else {
          toast.error(String(message));
        }
      } else {
        toast.error('Failed to create assignment. Please try again.');
      }
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
      await downloadAssignmentPdf(createdAssignmentId, watch('title'));
      toast.success('PDF downloaded successfully!');
    } catch (error: any) {
      console.error('Download PDF error:', error);
      toast.error(error.message || 'Failed to download PDF');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleSaveDraft = () => {
    toast.success('Save as draft feature coming soon');
  };

  const handleActivitiesGenerated = (generatedActivities: Activity[]) => {
    // Map Course Activity structure to Assignment Activity structure
    // Assignment activities support: type, title, instructions, content, points, passingScore, difficulty, hints, mediaUrls
    // Assignment activities DON'T support: orderNo (course-specific)
    generatedActivities.forEach((activity) => {
      append({
        type: activity.type as any,
        title: activity.title,
        instructions: activity.instructions,
        content: activity.content,
        points: activity.points || 10,
        passingScore: activity.passingScore,
        difficulty: activity.difficulty as any,
        hints: activity.hints ? (Array.isArray(activity.hints) ? activity.hints : []) : undefined,
        mediaUrls: activity.mediaUrls,
      } as any);
    });

    toast.success(`Đã thêm ${generatedActivities.length} hoạt động từ AI!`);
  };

  return (
    <Box sx={{ bgcolor: 'grey.50', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate(`/classrooms/${classroomId}`)}
            sx={{ mb: 2 }}
          >
            Back to Classroom
          </Button>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                Create Assignment
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Design engaging assignments with various activity types
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<FileUploadIcon />}
              onClick={() => setImportDialogOpen(true)}
            >
              Import from Excel
            </Button>
          </Box>
        </Box>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {/* Assignment Information */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Assignment Information
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={2}>
                  <Grid item xs={12} md={8}>
                    <TextField
                      fullWidth
                      label="Title"
                      {...register('title')}
                      error={!!errors.title}
                      helperText={errors.title?.message}
                      required
                      placeholder="e.g., Grammar Quiz - Present Perfect"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <div>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Total Points
                      </Typography>
                      <Typography variant="h6" color="text.secondary">
                        100
                      </Typography>
                    </div>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Description"
                      multiline
                      rows={3}
                      {...register('description')}
                      placeholder="Provide a brief overview of this assignment"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Instructions"
                      multiline
                      rows={2}
                      {...register('instructions')}
                      placeholder="Detailed instructions for students"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Start Time"
                      type="datetime-local"
                      {...register('startTime')}
                      error={!!errors.startTime || !!timeValidationErrors.startTime || !!dateValidationErrors.startTime}
                      helperText={
                        errors.startTime?.message ||
                        timeValidationErrors.startTime ||
                        dateValidationErrors.startTime ||
                        'Thời gian phải là bội số của 15 phút (ví dụ: 12:00, 12:15, 12:30, 12:45)'
                      }
                      InputLabelProps={{ shrink: true }}
                      inputProps={{
                        step: 900, // 15 minutes = 900 seconds
                        min: new Date().toISOString().slice(0, 16),
                      }}
                      onChange={(e) => {
                        register('startTime').onChange(e);
                        // Clear errors on change
                        if (timeValidationErrors.startTime) {
                          setTimeValidationErrors(prev => ({ ...prev, startTime: undefined }));
                        }
                        if (dateValidationErrors.startTime) {
                          setDateValidationErrors(prev => ({ ...prev, startTime: undefined }));
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Due Date"
                      type="datetime-local"
                      {...register('dueDate')}
                      error={!!errors.dueDate || !!timeValidationErrors.dueDate || !!dateValidationErrors.dueDate}
                      helperText={
                        errors.dueDate?.message ||
                        timeValidationErrors.dueDate ||
                        dateValidationErrors.dueDate ||
                        'Thời gian phải là bội số của 15 phút (ví dụ: 12:00, 12:15, 12:30, 12:45)'
                      }
                      InputLabelProps={{ shrink: true }}
                      inputProps={{
                        step: 900, // 15 minutes = 900 seconds
                        min: new Date().toISOString().slice(0, 16),
                      }}
                      onChange={(e) => {
                        register('dueDate').onChange(e);
                        // Clear errors on change
                        if (timeValidationErrors.dueDate) {
                          setTimeValidationErrors(prev => ({ ...prev, dueDate: undefined }));
                        }
                        if (dateValidationErrors.dueDate) {
                          setDateValidationErrors(prev => ({ ...prev, dueDate: undefined }));
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Time Limit (minutes)"
                      type="number"
                      {...register('timeLimit', { valueAsNumber: true })}
                      error={!!errors.timeLimit}
                      helperText={errors.timeLimit?.message || "Leave empty or 0 for no limit"}
                      placeholder="Leave empty for no limit"
                      inputProps={{ min: 0 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Max Attempts"
                      type="number"
                      {...register('maxAttempts', { valueAsNumber: true })}
                      error={!!errors.maxAttempts}
                      helperText={errors.maxAttempts?.message || "Minimum: 1 attempt"}
                      placeholder="1"
                      inputProps={{ min: 1 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <FormControlLabel
                      control={
                        <Switch
                          {...register('isPublished')}
                          color="success"
                        />
                      }
                      label="Xuất bản ngay"
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Activities Section */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      Activities
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {activityFields.length} {activityFields.length === 1 ? 'activity' : 'activities'}
                    </Typography>
                  </Box>
                </Box>

                {/* Activity Type Buttons */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => setShowAIModal(true)}
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      fontWeight: 600,
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5568d3 0%, #653a8f 100%)',
                      },
                      textTransform: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                    }}
                  >
                    <Sparkles size={16} />
                    AI Generate Activities
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setBankBrowserOpen(true)}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 600,
                    }}
                  >
                    Browse Bank
                  </Button>
                  {ACTIVITY_TYPES.map((type) => (
                    <Button
                      key={type}
                      variant="outlined"
                      size="small"
                      startIcon={<AddCircleOutline />}
                      onClick={() => addActivityOf(type)}
                      sx={{ textTransform: 'capitalize' }}
                    >
                      {type.replace('_', ' ')}
                    </Button>
                  ))}
                </Box>

                <Divider sx={{ mb: 3 }} />

                {activityFields.length === 0 ? (
                  <Alert severity="info" sx={{ textAlign: 'center' }}>
                    <Typography variant="body2">
                      No activities added yet. Click <strong>"Add Activity"</strong> or{' '}
                      <strong>"Import from Excel"</strong> to get started.
                    </Typography>
                  </Alert>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {activityFields.map((field, index) => {
                      const activityType = watch(`activities.${index}.type`);
                      return (
                        <Card key={field.id} variant="outlined">
                          <CardContent>
                            {/* Activity Header */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="subtitle1" fontWeight={600}>
                                  Activity #{index + 1}
                                </Typography>
                                <Chip
                                  label={activityType}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                />
                              </Box>
                              <IconButton
                                color="error"
                                onClick={() => remove(index)}
                                size="small"
                              >
                                <DeleteOutline />
                              </IconButton>
                            </Box>

                            {/* Activity Basic Info */}
                            <Grid container spacing={2}>
                              <Grid item xs={12} md={4}>
                                <TextField
                                  fullWidth
                                  label="Activity Title"
                                  {...register(`activities.${index}.title`)}
                                  error={!!errors.activities?.[index]?.title}
                                  helperText={errors.activities?.[index]?.title?.message}
                                  required
                                  placeholder="e.g., Grammar Exercise 1"
                                  size="small"
                                />
                              </Grid>
                              <Grid item xs={12} md={2}>
                                <FormControl fullWidth size="small">
                                  <InputLabel>Type *</InputLabel>
                                  <Controller
                                    name={`activities.${index}.type`}
                                    control={control}
                                    render={({ field }) => (
                                      <Select {...field} label="Type *">
                                        {ACTIVITY_TYPES.map((type) => (
                                          <MenuItem key={type} value={type}>
                                            {type.charAt(0).toUpperCase() + type.slice(1)}
                                          </MenuItem>
                                        ))}
                                      </Select>
                                    )}
                                  />
                                </FormControl>
                              </Grid>
                              <Grid item xs={12} md={2}>
                                <TextField
                                  fullWidth
                                  label="Points"
                                  type="number"
                                  {...register(`activities.${index}.points`, { valueAsNumber: true })}
                                  size="small"
                                  placeholder="10"
                                />
                              </Grid>
                              <Grid item xs={12} md={3}>
                                <FormControl fullWidth size="small">
                                  <InputLabel>Difficulty</InputLabel>
                                  <Controller
                                    name={`activities.${index}.difficulty`}
                                    control={control}
                                    render={({ field }) => (
                                      <Select {...field} label="Difficulty">
                                        {DIFFICULTY_LEVELS.map((level) => (
                                          <MenuItem key={level.value} value={level.value}>
                                            {level.label}
                                          </MenuItem>
                                        ))}
                                      </Select>
                                    )}
                                  />
                                </FormControl>
                              </Grid>
                              <Grid item xs={12}>
                                <TextField
                                  fullWidth
                                  label="Instructions (Optional)"
                                  multiline
                                  rows={2}
                                  {...register(`activities.${index}.instructions`)}
                                  placeholder="Specific instructions for this activity"
                                  size="small"
                                />
                              </Grid>
                            </Grid>

                            {/* Activity Type Specific Editor */}
                            {activityType && (
                              <ActivityEditor
                                activityIndex={index}
                                activityType={activityType}
                                control={control}
                                register={register}
                                watch={watch}
                                setValue={setValue}
                              />
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </Box>
                )}
              </Paper>
            </Grid>

            {/* Action Buttons */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    startIcon={<SaveAlt />}
                    onClick={handleSaveDraft}
                  >
                    Save as Draft
                  </Button>
                  <Button
                    variant="contained"
                    type="submit"
                    startIcon={<Save />}
                    disabled={isSubmitting || activityFields.length === 0}
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
              </Paper>
            </Grid>
          </Grid>
        </form>

        {/* Import Dialog */}
        <ImportDialog
          open={importDialogOpen}
          onClose={() => setImportDialogOpen(false)}
          onImportConfirm={handleImportConfirm}
        />

        {/* Bank Browser Modal */}
        <AssignmentBankBrowser
          open={bankBrowserOpen}
          onClose={() => setBankBrowserOpen(false)}
          onSelect={handleBankActivitiesSelected}
          browseMode="activities"
          allowModeSwitch={true}
        />

        {/* AI Activity Generator Modal */}
        <AIActivityGeneratorModal
          open={showAIModal}
          onClose={() => setShowAIModal(false)}
          courseTitle={watch('title') || 'Assignment'}
          courseDescription={watch('description')}
          lessonTitle={watch('title') || 'Assignment Activities'}
          lessonDescription={watch('instructions')}
          lessonDifficulty={undefined}
          onActivitiesGenerated={handleActivitiesGenerated}
        />
      </Container>
    </Box>
  );
}
