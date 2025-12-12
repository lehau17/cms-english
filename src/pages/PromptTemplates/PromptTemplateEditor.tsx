// Prompt Template Editor Page - Phase 4 CMS
import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Box,
  Typography,
  Button,
  TextField,
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Paper,
  Divider,
  IconButton,
  Tooltip,
  Alert,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PreviewIcon from '@mui/icons-material/Preview';
import { useParams, useNavigate } from 'react-router-dom';
import {
  usePromptTemplate,
  useCreatePromptTemplate,
  useUpdatePromptTemplate,
} from '@/hooks/useLearningPaths';
import {
  ActivityType,
  SkillTarget,
  CreatePromptTemplateDto,
  UpdatePromptTemplateDto,
} from '@/interface/learning-path.interface';
import toast from 'react-hot-toast';

const promptTemplateSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  category: z.string().min(1, 'Category required'),
  description: z.string().optional(),
  prompt: z.string().min(10, 'Prompt must be at least 10 characters'),
  variables: z.array(z.string()),
  activityType: z.nativeEnum(ActivityType).optional(),
  targetSkills: z.array(z.nativeEnum(SkillTarget)).optional(),
});

type PromptTemplateFormData = z.infer<typeof promptTemplateSchema>;

const COMMON_VARIABLES = [
  '{studentLevel}',
  '{targetSkill}',
  '{topic}',
  '{difficulty}',
  '{context}',
  '{vocabulary}',
  '{grammar}',
  '{previousAnswer}',
  '{feedback}',
];

const CATEGORIES = [
  'vocabulary',
  'grammar',
  'listening',
  'speaking',
  'reading',
  'writing',
  'pronunciation',
  'general',
];

export const PromptTemplateEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [newVariable, setNewVariable] = useState('');
  const [previewMode, setPreviewMode] = useState(false);

  const { data: templateData } = usePromptTemplate(id || '', {
    enabled: isEdit,
  });
  const createTemplate = useCreatePromptTemplate();
  const updateTemplate = useUpdatePromptTemplate();

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<PromptTemplateFormData>({
    resolver: zodResolver(promptTemplateSchema),
    defaultValues: {
      name: '',
      category: '',
      description: '',
      prompt: '',
      variables: [],
      activityType: undefined,
      targetSkills: [],
    },
  });

  const currentPrompt = watch('prompt');
  const currentVariables = watch('variables');

  useEffect(() => {
    if (templateData?.data) {
      const template = templateData.data;
      setValue('name', template.name);
      setValue('category', template.category);
      setValue('description', template.description || '');
      setValue('prompt', template.prompt);
      setValue('variables', template.variables);
      setValue('activityType', template.activityType);
      setValue('targetSkills', template.targetSkills || []);
    }
  }, [templateData, setValue]);

  const onSubmit = async (data: PromptTemplateFormData) => {
    try {
      if (isEdit) {
        const updateData: UpdatePromptTemplateDto = {
          name: data.name,
          category: data.category,
          description: data.description,
          prompt: data.prompt,
          variables: data.variables,
          activityType: data.activityType,
          targetSkills: data.targetSkills,
        };
        await updateTemplate.mutateAsync({ id: id!, data: updateData });
        toast.success('Template updated successfully');
      } else {
        const createData: CreatePromptTemplateDto = {
          name: data.name,
          category: data.category,
          description: data.description,
          prompt: data.prompt,
          variables: data.variables,
          activityType: data.activityType,
          targetSkills: data.targetSkills,
        };
        await createTemplate.mutateAsync(createData);
        toast.success('Template created successfully');
      }
      navigate('/prompt-templates');
    } catch (error) {
      toast.error(`Failed to ${isEdit ? 'update' : 'create'} template`);
      console.error(error);
    }
  };

  const handleAddVariable = () => {
    if (newVariable && !currentVariables.includes(newVariable)) {
      setValue('variables', [...currentVariables, newVariable]);
      setNewVariable('');
    }
  };

  const handleRemoveVariable = (variable: string) => {
    setValue(
      'variables',
      currentVariables.filter((v) => v !== variable)
    );
  };

  const handleInsertVariable = (variable: string) => {
    const textarea = document.getElementById('prompt-textarea') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = currentPrompt;
      const before = text.substring(0, start);
      const after = text.substring(end);
      setValue('prompt', before + variable + after);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(
          start + variable.length,
          start + variable.length
        );
      }, 0);
    }
  };

  const generatePreview = () => {
    let preview = currentPrompt;
    currentVariables.forEach((variable) => {
      const sampleValue = `[Sample: ${variable.replace(/[{}]/g, '')}]`;
      // Escape all regex special characters to prevent injection
      const escapedVariable = variable.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      preview = preview.replace(new RegExp(escapedVariable, 'g'), sampleValue);
    });
    return preview;
  };

  const template = templateData?.data;

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1">
          {isEdit ? 'Edit Prompt Template' : 'Create Prompt Template'}
        </Typography>
        <Button variant="outlined" onClick={() => navigate('/prompt-templates')}>
          Cancel
        </Button>
      </Box>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Template Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="name"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Template Name"
                          error={!!errors.name}
                          helperText={errors.name?.message}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="category"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth error={!!errors.category}>
                          <InputLabel>Category</InputLabel>
                          <Select {...field} label="Category">
                            {CATEGORIES.map((cat) => (
                              <MenuItem key={cat} value={cat}>
                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Controller
                      name="description"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Description"
                          multiline
                          rows={2}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="activityType"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth>
                          <InputLabel>Activity Type (Optional)</InputLabel>
                          <Select {...field} label="Activity Type (Optional)">
                            <MenuItem value="">None</MenuItem>
                            {Object.values(ActivityType).map((type) => (
                              <MenuItem key={type} value={type}>
                                {type}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="targetSkills"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth>
                          <InputLabel>Target Skills (Optional)</InputLabel>
                          <Select
                            {...field}
                            multiple
                            label="Target Skills (Optional)"
                            renderValue={(selected) => (
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {(selected as SkillTarget[]).map((value) => (
                                  <Chip key={value} label={value} size="small" />
                                ))}
                              </Box>
                            )}
                          >
                            {Object.values(SkillTarget).map((skill) => (
                              <MenuItem key={skill} value={skill}>
                                {skill}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">Prompt Content</Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<PreviewIcon />}
                    onClick={() => setPreviewMode(!previewMode)}
                  >
                    {previewMode ? 'Edit' : 'Preview'}
                  </Button>
                </Box>

                {previewMode ? (
                  <Paper
                    sx={{
                      p: 2,
                      minHeight: 300,
                      bgcolor: 'grey.50',
                      fontFamily: 'monospace',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {generatePreview()}
                  </Paper>
                ) : (
                  <Controller
                    name="prompt"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        id="prompt-textarea"
                        fullWidth
                        multiline
                        rows={12}
                        placeholder="Enter your prompt template here. Use variables like {studentLevel} to make it dynamic."
                        error={!!errors.prompt}
                        helperText={errors.prompt?.message}
                        sx={{ fontFamily: 'monospace' }}
                      />
                    )}
                  />
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Variables
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Add Variable"
                    value={newVariable}
                    onChange={(e) => setNewVariable(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddVariable()}
                    placeholder="{variableName}"
                  />
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={handleAddVariable}
                    sx={{ mt: 1 }}
                    size="small"
                  >
                    Add Variable
                  </Button>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography variant="body2" sx={{ mb: 1 }}>
                  Common Variables:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                  {COMMON_VARIABLES.map((variable) => (
                    <Tooltip key={variable} title="Click to insert">
                      <Chip
                        label={variable}
                        size="small"
                        onClick={() => handleInsertVariable(variable)}
                        sx={{ cursor: 'pointer' }}
                      />
                    </Tooltip>
                  ))}
                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography variant="body2" sx={{ mb: 1 }}>
                  Template Variables:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {currentVariables.length === 0 ? (
                    <Typography variant="caption" color="text.secondary">
                      No variables added yet
                    </Typography>
                  ) : (
                    currentVariables.map((variable) => (
                      <Chip
                        key={variable}
                        label={variable}
                        size="small"
                        onDelete={() => handleRemoveVariable(variable)}
                        onClick={() => handleInsertVariable(variable)}
                        color="primary"
                        sx={{ cursor: 'pointer' }}
                      />
                    ))
                  )}
                </Box>
              </CardContent>
            </Card>

            {template && (
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Quality Metrics
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Times Used
                    </Typography>
                    <Typography variant="h4">{template.timesUsed}</Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Avg Quality Score
                    </Typography>
                    <Typography variant="h4">
                      {template.avgQualityScore
                        ? `${template.avgQualityScore.toFixed(1)}%`
                        : 'N/A'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Version
                    </Typography>
                    <Typography variant="h4">{template.version}</Typography>
                  </Box>
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
          <Button variant="outlined" onClick={() => navigate('/prompt-templates')}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={createTemplate.isPending || updateTemplate.isPending}
          >
            {createTemplate.isPending || updateTemplate.isPending
              ? 'Saving...'
              : isEdit
              ? 'Update Template'
              : 'Create Template'}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default PromptTemplateEditor;
