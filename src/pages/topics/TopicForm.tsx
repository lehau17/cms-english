import React, { useState, useEffect } from 'react';
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Box,
} from '@mui/material';
import { topicsAPI, Topic, CreateTopicDto, UpdateTopicDto } from '../../services/topics.api';

interface TopicFormProps {
  topic?: Topic | null;
  onClose: (reload?: boolean) => void;
}

const difficultyOptions = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'elementary', label: 'Elementary' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'upper_intermediate', label: 'Upper Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' },
];

const categoryOptions = [
  { value: 'daily_life', label: 'Daily Life' },
  { value: 'travel', label: 'Travel' },
  { value: 'business', label: 'Work & Business' },
  { value: 'current_events', label: 'Current Events' },
  { value: 'personal', label: 'Personal Growth' },
];

export const TopicForm: React.FC<TopicFormProps> = ({ topic, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'daily_life',
    difficulty: 'intermediate',
    isActive: true,
    isFeatured: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (topic) {
      setFormData({
        name: topic.name,
        description: topic.description || '',
        category: topic.category || 'daily_life',
        difficulty: topic.difficulty,
        isActive: topic.isActive,
        isFeatured: topic.isFeatured,
      });
    }
  }, [topic]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (topic) {
        const updateData: UpdateTopicDto = {
          name: formData.name,
          description: formData.description,
          category: formData.category,
          difficulty: formData.difficulty,
          isActive: formData.isActive,
          isFeatured: formData.isFeatured,
        };
        await topicsAPI.update(topic.id, updateData);
      } else {
        const createData: CreateTopicDto = {
          name: formData.name,
          description: formData.description,
          category: formData.category,
          difficulty: formData.difficulty,
          isActive: formData.isActive,
          isFeatured: formData.isFeatured,
        };
        await topicsAPI.create(createData);
      }
      onClose(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save topic');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DialogTitle>{topic ? 'Edit Topic' : 'Create Topic'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              fullWidth
            />

            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                label="Category"
              >
                {categoryOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Difficulty</InputLabel>
              <Select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                label="Difficulty"
              >
                {difficultyOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
              }
              label="Active"
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                />
              }
              label="Featured"
            />

            {error && (
              <Box sx={{ color: 'error.main', fontSize: '0.875rem' }}>
                {error}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => onClose()}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Saving...' : topic ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </>
  );
};
