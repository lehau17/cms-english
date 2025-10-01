import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  FileDownload as FileDownloadIcon,
  Publish as PublishIcon,
  UnpublishedOutlined as UnpublishedIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { assignmentApi, downloadAssignmentPdf, type Assignment } from '../apis/assignment';

export default function AssignmentPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);

  // Load assignments
  const loadAssignments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await assignmentApi.getMyAssignments({
        page: page + 1,
        limit: rowsPerPage,
      });

      if (response.data) {
        setAssignments(response.data.assignments || []);
        setTotal(response.data.total || 0);
      }
    } catch (err: any) {
      console.error('Error loading assignments:', err);
      setError(err?.response?.data?.message || 'Failed to load assignments');
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);

  // Load data on mount and when params change
  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  // Handle page change
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle delete assignment
  const handleDeleteAssignment = async () => {
    if (!selectedAssignment) return;

    try {
      await assignmentApi.deleteAssignment(selectedAssignment.id);
      toast.success('Assignment deleted successfully');
      setShowDeleteDialog(false);
      setSelectedAssignment(null);
      loadAssignments();
    } catch (err: any) {
      console.error('Error deleting assignment:', err);
      toast.error(err?.response?.data?.message || 'Failed to delete assignment');
    }
  };

  // Handle toggle publish status
  const handleTogglePublish = async (assignment: Assignment) => {
    try {
      if (assignment.isPublished) {
        // Cannot unpublish via API, would need separate endpoint
        toast('Cannot unpublish assignment via this interface');
        return;
      } else {
        await assignmentApi.publishAssignment(assignment.id);
        toast.success('Assignment published successfully');
        loadAssignments();
      }
    } catch (err: any) {
      console.error('Error toggling publish status:', err);
      toast.error(err?.response?.data?.message || 'Failed to update assignment');
    }
  };

  // Handle download PDF
  const handleDownloadPdf = async (assignment: Assignment) => {
    try {
      setDownloading(assignment.id);
      await downloadAssignmentPdf(assignment.id, assignment.title);
      toast.success('PDF downloaded successfully');
    } catch (err: any) {
      console.error('Error downloading PDF:', err);
      toast.error(err.message || 'Failed to download PDF');
    } finally {
      setDownloading(null);
    }
  };

  // Get status chip
  const getStatusChip = (assignment: Assignment) => {
    if (assignment.isPublished) {
      return <Chip label="Published" color="success" size="small" />;
    } else {
      return <Chip label="Draft" color="default" size="small" />;
    }
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No due date';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (loading && assignments.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Assignment Management
        </Typography>
        <Typography>Loading assignments...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          Assignment Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/create-assignment')}
        >
          Create Assignment
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Search */}
      <Box mb={2}>
        <TextField
          fullWidth
          label="Search assignments..."
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ maxWidth: 400 }}
        />
      </Box>

      {/* Assignments Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Classroom</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Points</TableCell>
              <TableCell>Activities</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {assignments
              .filter((assignment) =>
                assignment.title.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((assignment) => (
                <TableRow key={assignment.id} hover>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {assignment.title}
                    </Typography>
                    {assignment.description && (
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {assignment.description.substring(0, 100)}
                        {assignment.description.length > 100 && '...'}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {assignment.classroom?.name || 'Unknown'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {assignment.classroom?.classCode || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>{getStatusChip(assignment)}</TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(assignment.dueDate)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {assignment.totalPoints || 'N/A'} pts
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {assignment.assignmentActivities?.length || 0} activities
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(assignment.createdAt).toLocaleDateString('vi-VN')}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box display="flex" gap={1} justifyContent="center">
                      {/* View Details */}
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedAssignment(assignment);
                            setShowViewDialog(true);
                          }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      {/* Download PDF */}
                      <Tooltip title="Download PDF">
                        <IconButton
                          size="small"
                          onClick={() => handleDownloadPdf(assignment)}
                          disabled={downloading === assignment.id}
                        >
                          <FileDownloadIcon
                            fontSize="small"
                            color={downloading === assignment.id ? 'disabled' : 'primary'}
                          />
                        </IconButton>
                      </Tooltip>

                      {/* Edit */}
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/edit-assignment/${assignment.id}`)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      {/* Publish/Unpublish */}
                      <Tooltip title={assignment.isPublished ? 'Published' : 'Publish'}>
                        <IconButton
                          size="small"
                          onClick={() => handleTogglePublish(assignment)}
                          disabled={assignment.isPublished}
                        >
                          {assignment.isPublished ? (
                            <PublishIcon fontSize="small" color="success" />
                          ) : (
                            <UnpublishedIcon fontSize="small" />
                          )}
                        </IconButton>
                      </Tooltip>

                      {/* Delete */}
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedAssignment(assignment);
                            setShowDeleteDialog(true);
                          }}
                          sx={{ color: 'error.main' }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={total}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
        <DialogTitle>Delete Assignment</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the assignment "{selectedAssignment?.title}"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteAssignment} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Assignment Dialog */}
      <Dialog
        open={showViewDialog}
        onClose={() => setShowViewDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Assignment Details
          <Box display="flex" gap={1} mt={1}>
            {selectedAssignment && getStatusChip(selectedAssignment)}
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedAssignment && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  {selectedAssignment.title}
                </Typography>
              </Grid>

              {selectedAssignment.description && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Description:
                  </Typography>
                  <Typography variant="body2">
                    {selectedAssignment.description}
                  </Typography>
                </Grid>
              )}

              {selectedAssignment.instructions && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Instructions:
                  </Typography>
                  <Typography variant="body2">
                    {selectedAssignment.instructions}
                  </Typography>
                </Grid>
              )}

              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Classroom:
                </Typography>
                <Typography variant="body2">
                  {selectedAssignment.classroom?.name} ({selectedAssignment.classroom?.classCode})
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Due Date:
                </Typography>
                <Typography variant="body2">
                  {formatDate(selectedAssignment.dueDate)}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Total Points:
                </Typography>
                <Typography variant="body2">
                  {selectedAssignment.totalPoints || 'N/A'} points
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Time Limit:
                </Typography>
                <Typography variant="body2">
                  {selectedAssignment.timeLimit ? `${selectedAssignment.timeLimit} minutes` : 'No limit'}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Activities:
                </Typography>
                <Typography variant="body2">
                  {selectedAssignment.assignmentActivities?.length || 0} activities
                </Typography>
                {selectedAssignment.assignmentActivities?.map((activity, index) => (
                  <Card key={activity.id} variant="outlined" sx={{ mt: 1, p: 2 }}>
                    <Typography variant="subtitle2">
                      {index + 1}. {activity.title} ({activity.type})
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Points: {activity.points} | Difficulty: {activity.difficulty || 'N/A'}
                    </Typography>
                  </Card>
                ))}
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => selectedAssignment && handleDownloadPdf(selectedAssignment)}
            startIcon={<FileDownloadIcon />}
            disabled={downloading === selectedAssignment?.id}
          >
            Download PDF
          </Button>
          <Button onClick={() => setShowViewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
