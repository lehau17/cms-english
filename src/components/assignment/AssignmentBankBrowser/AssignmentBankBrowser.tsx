import {
  ExpandMore,
  Search as SearchIcon,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  assignmentApi,
  type Assignment,
  type AssignmentActivity
} from '../../../apis/assignment';
import { ACTIVITY_TYPES } from '../../../schemas/assignment.schema';

const DIFFICULTY_LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'elementary', label: 'Elementary' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'upper_intermediate', label: 'Upper Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' },
];

interface AssignmentBankBrowserProps {
  open: boolean;
  onClose: () => void;
  onSelect: (activities: AssignmentActivity[]) => void;
  browseMode?: 'assignments' | 'activities';
  allowModeSwitch?: boolean;
}

type BrowseMode = 'assignments' | 'activities';

export default function AssignmentBankBrowser({
  open,
  onClose,
  onSelect,
  browseMode = 'assignments',
  allowModeSwitch = true,
}: AssignmentBankBrowserProps) {
  const [mode, setMode] = useState<BrowseMode>(browseMode);
  const [search, setSearch] = useState('');
  const [activityType, setActivityType] = useState<string>('');
  const [difficulty, setDifficulty] = useState<string>('');
  const [page, setPage] = useState(1);
  const [selectedActivities, setSelectedActivities] = useState<
    Map<string, AssignmentActivity>
  >(new Map());
  const [expandedAssignments, setExpandedAssignments] = useState<
    Set<string>
  >(new Set());

  // Fetch bank assignmentsx
  const {
    data: assignmentsData,
    isLoading: isLoadingAssignments,
    error: assignmentsError,
  } = useQuery({
    queryKey: ['bank-assignments', { search, activityType, difficulty, page }],
    queryFn: () =>
      assignmentApi.getBankAssignments({
        search,
        activityType: activityType || undefined,
        difficulty: difficulty || undefined,
        page,
        limit: 10,
      }),
    enabled: open && mode === 'assignments',
  });

  // Fetch bank activities
  const {
    data: activitiesData,
    isLoading: isLoadingActivities,
    error: activitiesError,
  } = useQuery({
    queryKey: ['bank-activities', { search, type: activityType, difficulty, page }],
    queryFn: () =>
      assignmentApi.getBankActivities({
        search,
        type: activityType || undefined,
        difficulty: difficulty || undefined,
        page,
        limit: 10,
      }),
    enabled: open && mode === 'activities',
  });


  console.log("call api", assignmentsData, activitiesData);

  const handleModeChange = (_: React.SyntheticEvent, newMode: BrowseMode) => {
    setMode(newMode);
    setPage(1);
    setSelectedActivities(new Map());
  };

  const handleSelectActivity = (activity: AssignmentActivity) => {
    const newSelected = new Map(selectedActivities);
    if (newSelected.has(activity.id)) {
      newSelected.delete(activity.id);
    } else {
      newSelected.set(activity.id, activity);
    }
    setSelectedActivities(newSelected);
  };

  const handleSelectAllActivities = (assignment: Assignment) => {
    const newSelected = new Map(selectedActivities);
    const activities = assignment.assignmentActivities || [];
    const allSelected = activities.every((a) => newSelected.has(a.id));

    if (allSelected) {
      activities.forEach((a) => newSelected.delete(a.id));
    } else {
      activities.forEach((a) => {
        newSelected.set(a.id, {
          id: a.id,
          type: a.type as any,
          title: a.title,
          instructions: a.instructions,
          content: a.content || {},
          points: a.points || 10,
          difficulty: a.difficulty as any,
          hints: a.hints || [],
        });
      });
    }
    setSelectedActivities(newSelected);
  };

  const handleConfirm = () => {
    if (selectedActivities.size === 0) {
      toast.error('Please select at least one activity');
      return;
    }

    const activities = Array.from(selectedActivities.values());
    onSelect(activities);
    setSelectedActivities(new Map());
    setPage(1);
    onClose();
  };

  const handleClose = () => {
    setSelectedActivities(new Map());
    setPage(1);
    setSearch('');
    setActivityType('');
    setDifficulty('');
    onClose();
  };

  const toggleAssignmentExpanded = (assignmentId: string) => {
    const newExpanded = new Set(expandedAssignments);
    if (newExpanded.has(assignmentId)) {
      newExpanded.delete(assignmentId);
    } else {
      newExpanded.add(assignmentId);
    }
    setExpandedAssignments(newExpanded);
  };

  const isLoading = mode === 'assignments' ? isLoadingAssignments : isLoadingActivities;
  const error = mode === 'assignments' ? assignmentsError : activitiesError;
  const totalPages =
    mode === 'assignments'
      ? Math.ceil((assignmentsData?.total || 0) / 10)
      : Math.ceil((activitiesData?.total || 0) / 10);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Browse Bank</Typography>
          {selectedActivities.size > 0 && (
            <Chip
              label={`${selectedActivities.size} selected`}
              color="primary"
              size="small"
            />
          )}
        </Box>
      </DialogTitle>

      <DialogContent>
        {allowModeSwitch && (
          <Box sx={{ mb: 2 }}>
            <Tabs value={mode} onChange={handleModeChange}>
              <Tab label="Assignments" value="assignments" />
              <Tab label="Activities" value="activities" />
            </Tabs>
          </Box>
        )}

        {/* Search and Filters */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder={
                mode === 'assignments'
                  ? 'Search assignments...'
                  : 'Search activities...'
              }
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Activity Type</InputLabel>
              <Select
                value={activityType}
                label="Activity Type"
                onChange={(e) => {
                  setActivityType(e.target.value);
                  setPage(1);
                }}
              >
                <MenuItem value="">All Types</MenuItem>
                {ACTIVITY_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Difficulty</InputLabel>
              <Select
                value={difficulty}
                label="Difficulty"
                onChange={(e) => {
                  setDifficulty(e.target.value);
                  setPage(1);
                }}
              >
                <MenuItem value="">All Levels</MenuItem>
                {DIFFICULTY_LEVELS.map((level) => (
                  <MenuItem key={level.value} value={level.value}>
                    {level.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Divider sx={{ mb: 2 }} />

        {/* Content */}
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">Failed to load bank data</Alert>
        ) : mode === 'assignments' ? (
          <Box>
            {assignmentsData?.assignments?.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No assignments found
              </Typography>
            ) : (
              <>
                {assignmentsData?.assignments?.map((assignment) => {
                  const activities = assignment.assignmentActivities || [];
                  const allSelected =
                    activities.length > 0 &&
                    activities.every((a) => selectedActivities.has(a.id));
                  const someSelected = activities.some((a) =>
                    selectedActivities.has(a.id),
                  );
                  const isExpanded = expandedAssignments.has(assignment.id);

                  return (
                    <Card key={assignment.id} sx={{ mb: 2 }}>
                      <CardContent>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                          }}
                        >
                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Checkbox
                                checked={allSelected}
                                indeterminate={someSelected && !allSelected}
                                onChange={() =>
                                  handleSelectAllActivities(assignment)
                                }
                              />
                              <Typography variant="h6">{assignment.title}</Typography>
                            </Box>
                            {assignment.description && (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mb: 1 }}
                              >
                                {assignment.description}
                              </Typography>
                            )}
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                              <Chip
                                label={`${activities.length} activities`}
                                size="small"
                                variant="outlined"
                              />
                              <Chip
                                label={assignment.classroom?.name || 'N/A'}
                                size="small"
                                variant="outlined"
                              />
                            </Box>
                          </Box>
                          <IconButton
                            onClick={() => toggleAssignmentExpanded(assignment.id)}
                          >
                            <ExpandMore
                              sx={{
                                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.2s',
                              }}
                            />
                          </IconButton>
                        </Box>

                        {isExpanded && (
                          <Box sx={{ mt: 2, pl: 4 }}>
                            {activities.map((activity) => (
                              <Box
                                key={activity.id}
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1,
                                  py: 1,
                                  borderBottom: '1px solid',
                                  borderColor: 'divider',
                                }}
                              >
                                <Checkbox
                                  checked={selectedActivities.has(activity.id)}
                                  onChange={() =>
                                    handleSelectActivity({
                                      id: activity.id,
                                      type: activity.type as any,
                                      title: activity.title,
                                      instructions: activity.instructions,
                                      content: activity.content || {},
                                      points: activity.points || 10,
                                      difficulty: activity.difficulty as any,
                                      hints: activity.hints || [],
                                    })
                                  }
                                />
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="body2" fontWeight={500}>
                                    {activity.title}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {activity.type} • {activity.points} pts
                                    {activity.difficulty && ` • ${activity.difficulty}`}
                                  </Typography>
                                </Box>
                              </Box>
                            ))}
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}

                {totalPages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Pagination
                      count={totalPages}
                      page={page}
                      onChange={(_, newPage) => setPage(newPage)}
                    />
                  </Box>
                )}
              </>
            )}
          </Box>
        ) : (
          <Box>
            {activitiesData?.activities?.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No activities found
              </Typography>
            ) : (
              <>
                {activitiesData?.activities?.map((activity) => (
                  <Card key={activity.id} sx={{ mb: 2 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                        <Checkbox
                          checked={selectedActivities.has(activity.id)}
                          onChange={() =>
                            handleSelectActivity({
                              id: activity.id,
                              type: activity.type as any,
                              title: activity.title,
                              instructions: activity.instructions,
                              content: activity.content || {},
                              points: activity.points || 10,
                              difficulty: activity.difficulty as any,
                              hints: activity.hints || [],
                            })
                          }
                        />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" gutterBottom>
                            {activity.title}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                            <Chip label={activity.type} size="small" />
                            <Chip label={`${activity.points} pts`} size="small" />
                            {activity.difficulty && (
                              <Chip label={activity.difficulty} size="small" />
                            )}
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            From: {activity.assignment.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Teacher: {activity.assignment.teacher.displayName || 'N/A'}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}

                {totalPages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Pagination
                      count={totalPages}
                      page={page}
                      onChange={(_, newPage) => setPage(newPage)}
                    />
                  </Box>
                )}
              </>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={selectedActivities.size === 0}
        >
          Select ({selectedActivities.size})
        </Button>
      </DialogActions>
    </Dialog>
  );
}
