// Learning Path Create Page - Phase 4 CMS
import React, { useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
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
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Paper,
  Divider,
  OutlinedInput,
  SelectChangeEvent,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import SaveIcon from '@mui/icons-material/Save';
import { useNavigate } from 'react-router-dom';
import { useCreatePathTemplate } from '@/hooks/useLearningPaths';
import {
  ActivityType,
  SkillTarget,
  CreateStepDto,
  CreatePathTemplateDto,
} from '@/interface/learning-path.interface';
import toast from 'react-hot-toast';

const stepSchema = z.object({
  activityType: z.nativeEnum(ActivityType),
  activityId: z.string().optional(),
  targetSkills: z.array(z.nativeEnum(SkillTarget)).min(1, 'Select at least one skill'),
  difficulty: z.number().min(1).max(10),
  metadata: z.record(z.any()).optional(),
});

const pathTemplateSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().optional(),
  targetLevel: z.string().min(2, 'Target level required'),
  steps: z.array(stepSchema).min(1, 'Add at least one step'),
});

type PathTemplateFormData = z.infer<typeof pathTemplateSchema>;

export const LearningPathCreate: React.FC = () => {
  const navigate = useNavigate();
  const createTemplate = useCreatePathTemplate();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PathTemplateFormData>({
    resolver: zodResolver(pathTemplateSchema),
    defaultValues: {
      name: '',
      description: '',
      targetLevel: 'A1',
      steps: [
        {
          activityType: ActivityType.VOCAB,
          targetSkills: [SkillTarget.VOCABULARY],
          difficulty: 5,
        },
      ],
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'steps',
  });

  const onSubmit = async (data: PathTemplateFormData) => {
    try {
      const formattedData: CreatePathTemplateDto = {
        name: data.name,
        description: data.description,
        targetLevel: data.targetLevel,
        steps: data.steps.map((step, index) => ({
          ...step,
          order: index + 1,
        })),
      };

      await createTemplate.mutateAsync(formattedData);
      toast.success('Learning path template created successfully');
      navigate('/learning-paths');
    } catch (error) {
      toast.error('Failed to create learning path template');
      console.error(error);
    }
  };

  const handleAddStep = () => {
    append({
      activityType: ActivityType.VOCAB,
      targetSkills: [SkillTarget.VOCABULARY],
      difficulty: 5,
    });
  };

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      move(index, index - 1);
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < fields.length - 1) {
      move(index, index + 1);
    }
  };

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
          Create Learning Path Template
        </Typography>
        <Button variant="outlined" onClick={() => navigate('/learning-paths')}>
          Cancel
        </Button>
      </Box>

      <form onSubmit={handleSubmit(onSubmit)}>
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
                  name="targetLevel"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.targetLevel}>
                      <InputLabel>Target Level</InputLabel>
                      <Select {...field} label="Target Level">
                        <MenuItem value="A1">A1 - Beginner</MenuItem>
                        <MenuItem value="A2">A2 - Elementary</MenuItem>
                        <MenuItem value="B1">B1 - Intermediate</MenuItem>
                        <MenuItem value="B2">B2 - Upper Intermediate</MenuItem>
                        <MenuItem value="C1">C1 - Advanced</MenuItem>
                        <MenuItem value="C2">C2 - Proficiency</MenuItem>
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
                      rows={3}
                      error={!!errors.description}
                      helperText={errors.description?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <Typography variant="h6">Learning Steps</Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddStep}
              >
                Add Step
              </Button>
            </Box>

            {errors.steps && (
              <Typography color="error" sx={{ mb: 2 }}>
                {errors.steps.message}
              </Typography>
            )}

            {fields.map((field, index) => (
              <Paper key={field.id} sx={{ p: 2, mb: 2 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                  }}
                >
                  <Typography variant="subtitle1" fontWeight="bold">
                    Step {index + 1}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                    >
                      <ArrowUpwardIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleMoveDown(index)}
                      disabled={index === fields.length - 1}
                    >
                      <ArrowDownwardIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name={`steps.${index}.activityType`}
                      control={control}
                      render={({ field }) => (
                        <FormControl
                          fullWidth
                          error={!!errors.steps?.[index]?.activityType}
                        >
                          <InputLabel>Activity Type</InputLabel>
                          <Select {...field} label="Activity Type">
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
                      name={`steps.${index}.targetSkills`}
                      control={control}
                      render={({ field }) => (
                        <FormControl
                          fullWidth
                          error={!!errors.steps?.[index]?.targetSkills}
                        >
                          <InputLabel>Target Skills</InputLabel>
                          <Select
                            {...field}
                            multiple
                            label="Target Skills"
                            renderValue={(selected) => (
                              <Box
                                sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}
                              >
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
                          {errors.steps?.[index]?.targetSkills && (
                            <Typography variant="caption" color="error">
                              {errors.steps[index]?.targetSkills?.message}
                            </Typography>
                          )}
                        </FormControl>
                      )}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Controller
                      name={`steps.${index}.difficulty`}
                      control={control}
                      render={({ field }) => (
                        <Box>
                          <Typography gutterBottom>
                            Difficulty: {field.value}/10
                          </Typography>
                          <Slider
                            {...field}
                            min={1}
                            max={10}
                            marks
                            valueLabelDisplay="auto"
                          />
                        </Box>
                      )}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Controller
                      name={`steps.${index}.activityId`}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Activity ID (optional)"
                          size="small"
                          helperText="Link to specific activity if applicable"
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Paper>
            ))}
          </CardContent>
        </Card>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/learning-paths')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={createTemplate.isPending}
          >
            {createTemplate.isPending ? 'Creating...' : 'Create Template'}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default LearningPathCreate;
