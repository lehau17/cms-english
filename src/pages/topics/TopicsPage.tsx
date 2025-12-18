import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Add, Edit, Delete, TrendingUp } from '@mui/icons-material';
import { topicsAPI, Topic } from '../../services/topics.api';
import { TopicForm } from './TopicForm';

export const TopicsPage: React.FC = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [topicToDelete, setTopicToDelete] = useState<Topic | null>(null);

  const loadTopics = async () => {
    setLoading(true);
    try {
      const data = await topicsAPI.getAll();
      setTopics(data);
    } catch (error) {
      console.error('Failed to load topics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTopics();
  }, []);

  const handleCreate = () => {
    setEditingTopic(null);
    setFormOpen(true);
  };

  const handleEdit = (topic: Topic) => {
    setEditingTopic(topic);
    setFormOpen(true);
  };

  const handleDelete = (topic: Topic) => {
    setTopicToDelete(topic);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!topicToDelete) return;

    try {
      await topicsAPI.delete(topicToDelete.id);
      await loadTopics();
      setDeleteDialogOpen(false);
      setTopicToDelete(null);
    } catch (error) {
      console.error('Failed to delete topic:', error);
    }
  };

  const handleFormClose = async (reload?: boolean) => {
    setFormOpen(false);
    setEditingTopic(null);
    if (reload) {
      await loadTopics();
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 1.5,
      minWidth: 200,
    },
    {
      field: 'category',
      headerName: 'Category',
      width: 130,
      renderCell: (params) => {
        const categoryNames: Record<string, string> = {
          daily_life: 'Daily Life',
          travel: 'Travel',
          business: 'Business',
          current_events: 'Current Events',
          personal: 'Personal',
        };
        return categoryNames[params.value] || params.value || '-';
      },
    },
    {
      field: 'difficulty',
      headerName: 'Difficulty',
      width: 130,
    },
    {
      field: 'usageCount',
      headerName: 'Usage',
      width: 100,
      type: 'number',
    },
    {
      field: 'trendScore',
      headerName: 'Trend Score',
      width: 120,
      type: 'number',
      valueFormatter: (params) => params.value.toFixed(1),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 180,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {params.row.isTrending && (
            <Chip
              icon={<TrendingUp />}
              label="Trending"
              color="error"
              size="small"
            />
          )}
          {params.row.isFeatured && (
            <Chip label="Featured" color="warning" size="small" />
          )}
          {!params.row.isActive && (
            <Chip label="Inactive" color="default" size="small" />
          )}
        </Box>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton size="small" onClick={() => handleEdit(params.row)}>
            <Edit fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => handleDelete(params.row)}
          >
            <Delete fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Topic Management</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreate}
        >
          Add Topic
        </Button>
      </Box>

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={topics}
          columns={columns}
          loading={loading}
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 25 } },
          }}
          disableRowSelectionOnClick
        />
      </Paper>

      <Dialog open={formOpen} onClose={() => handleFormClose()} maxWidth="sm" fullWidth>
        <TopicForm topic={editingTopic} onClose={handleFormClose} />
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete the topic "{topicToDelete?.name}"?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
