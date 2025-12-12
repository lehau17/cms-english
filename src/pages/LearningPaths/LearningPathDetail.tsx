// Learning Path Detail Page - Phase 4 CMS
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useParams, useNavigate } from 'react-router-dom';
import {
  usePathTemplate,
  useDeletePathTemplate,
  useLearningPaths,
} from '@/hooks/useLearningPaths';
import {
  ActivityType,
  SkillTarget,
  LearningPathStatus,
} from '@/interface/learning-path.interface';
import toast from 'react-hot-toast';

const getStatusColor = (status: LearningPathStatus) => {
  switch (status) {
    case LearningPathStatus.ACTIVE:
      return 'primary';
    case LearningPathStatus.COMPLETED:
      return 'success';
    case LearningPathStatus.PAUSED:
      return 'warning';
    case LearningPathStatus.ARCHIVED:
      return 'default';
    default:
      return 'default';
  }
};

const getDifficultyColor = (difficulty: number) => {
  if (difficulty <= 3) return 'success';
  if (difficulty <= 6) return 'warning';
  return 'error';
};

export const LearningPathDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data: templateData, isLoading } = usePathTemplate(id || '');
  const { data: pathsData } = useLearningPaths({ templateId: id });
  const deleteTemplate = useDeletePathTemplate();

  const template = templateData?.data;
  const activePaths = pathsData?.data || [];

  const handleDelete = async () => {
    try {
      await deleteTemplate.mutateAsync(id || '');
      toast.success('Template deleted successfully');
      navigate('/learning-paths');
    } catch (error) {
      toast.error('Failed to delete template');
      console.error(error);
    }
    setDeleteDialogOpen(false);
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
      </Box>
    );
  }

  if (!template) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Template not found</Typography>
      </Box>
    );
  }

  const completedPaths = activePaths.filter(
    (p) => p.status === LearningPathStatus.COMPLETED
  ).length;
  const activeLearners = activePaths.filter(
    (p) => p.status === LearningPathStatus.ACTIVE
  ).length;

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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate('/learning-paths')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            {template.name}
          </Typography>
          <Chip
            label={template.targetLevel}
            color="primary"
            variant="outlined"
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/learning-paths/${id}/edit`)}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => setDeleteDialogOpen(true)}
          >
            Delete
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Template Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Description
                  </Typography>
                  <Typography variant="body1">
                    {template.description || 'No description provided'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Total Steps
                  </Typography>
                  <Typography variant="h5">{template.steps?.length || 0}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Times Used
                  </Typography>
                  <Typography variant="h5">{template.timesUsed}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Learning Steps
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Order</TableCell>
                      <TableCell>Activity Type</TableCell>
                      <TableCell>Target Skills</TableCell>
                      <TableCell>Difficulty</TableCell>
                      <TableCell>Activity ID</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {template.steps?.map((step) => (
                      <TableRow key={step.order}>
                        <TableCell>{step.order}</TableCell>
                        <TableCell>
                          <Chip
                            label={step.activityType}
                            size="small"
                            color="primary"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            {step.targetSkills.map((skill) => (
                              <Chip
                                key={skill}
                                label={skill}
                                size="small"
                                variant="outlined"
                              />
                            ))}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={`${step.difficulty}/10`}
                            size="small"
                            color={getDifficultyColor(step.difficulty)}
                          />
                        </TableCell>
                        <TableCell>
                          {step.activityId ? (
                            <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                              {step.activityId}
                            </Typography>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Usage Statistics
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Active Learners
                </Typography>
                <Typography variant="h4" color="primary">
                  {activeLearners}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Completed Paths
                </Typography>
                <Typography variant="h4" color="success.main">
                  {completedPaths}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Completion Rate
                </Typography>
                <Typography variant="h4">
                  {activePaths.length > 0
                    ? `${Math.round((completedPaths / activePaths.length) * 100)}%`
                    : 'N/A'}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Template Metadata
              </Typography>
              <Box sx={{ mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Created
                </Typography>
                <Typography variant="body1">
                  {new Date(template.createdAt).toLocaleString()}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Last Updated
                </Typography>
                <Typography variant="body1">
                  {new Date(template.updatedAt).toLocaleString()}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Active Students Using This Path
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Student</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Progress</TableCell>
                      <TableCell>Started</TableCell>
                      <TableCell>Last Activity</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {activePaths.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <Typography color="text.secondary">
                            No students using this template yet
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      activePaths.map((path) => (
                        <TableRow key={path.id}>
                          <TableCell>{path.userId}</TableCell>
                          <TableCell>
                            <Chip
                              label={path.status}
                              size="small"
                              color={getStatusColor(path.status)}
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={
                                  (path.completedSteps / path.totalSteps) * 100
                                }
                                sx={{ width: 100 }}
                              />
                              <Typography variant="body2">
                                {path.completedSteps}/{path.totalSteps}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            {path.startedAt
                              ? new Date(path.startedAt).toLocaleDateString()
                              : '-'}
                          </TableCell>
                          <TableCell>
                            {path.updatedAt
                              ? new Date(path.updatedAt).toLocaleDateString()
                              : '-'}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this template? This action cannot be
            undone.
          </Typography>
          {activeLearners > 0 && (
            <Typography color="warning.main" sx={{ mt: 2 }}>
              Warning: {activeLearners} student(s) are currently using this
              template.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={deleteTemplate.isPending}
          >
            {deleteTemplate.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LearningPathDetail;
