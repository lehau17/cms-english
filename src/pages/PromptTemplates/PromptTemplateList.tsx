// Prompt Template List Page - Phase 4 CMS
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Card,
  CardContent,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { usePromptTemplates, useDeletePromptTemplate } from '@/hooks/useLearningPaths';
import { PromptTemplate, ActivityType } from '@/interface/learning-path.interface';
import { useNavigate } from 'react-router-dom';

export const PromptTemplateList: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 25,
  });

  const { data: templates, isLoading } = usePromptTemplates({
    page: paginationModel.page + 1,
    limit: paginationModel.pageSize,
    search,
    category: categoryFilter || undefined,
  });

  const deleteTemplate = useDeletePromptTemplate();

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      await deleteTemplate.mutateAsync(id);
    }
  };

  const getQualityColor = (score?: number) => {
    if (!score) return 'default';
    if (score >= 90) return 'success';
    if (score >= 70) return 'warning';
    return 'error';
  };

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Template Name',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'category',
      headerName: 'Category',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Chip label={params.value} size="small" variant="outlined" />
      ),
    },
    {
      field: 'activityType',
      headerName: 'Activity Type',
      width: 130,
      renderCell: (params: GridRenderCellParams) =>
        params.value ? (
          <Chip label={params.value} size="small" color="primary" />
        ) : (
          '-'
        ),
    },
    {
      field: 'timesUsed',
      headerName: 'Used',
      width: 80,
      align: 'center',
    },
    {
      field: 'avgQualityScore',
      headerName: 'Quality',
      width: 100,
      renderCell: (params: GridRenderCellParams) =>
        params.value ? (
          <Chip
            label={`${params.value.toFixed(0)}%`}
            size="small"
            color={getQualityColor(params.value)}
          />
        ) : (
          '-'
        ),
    },
    {
      field: 'version',
      headerName: 'Ver',
      width: 60,
      align: 'center',
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params: GridRenderCellParams<PromptTemplate>) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <IconButton
            size="small"
            onClick={() =>
              navigate(`/prompt-templates/${params.row.id}/edit`)
            }
            title="Edit"
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDelete(params.row.id)}
            title="Delete"
            color="error"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

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
          Prompt Templates
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/prompt-templates/create')}
        >
          Create Template
        </Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search templates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select
                  value={categoryFilter}
                  label="Category"
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  <MenuItem value="vocabulary">Vocabulary</MenuItem>
                  <MenuItem value="grammar">Grammar</MenuItem>
                  <MenuItem value="listening">Listening</MenuItem>
                  <MenuItem value="speaking">Speaking</MenuItem>
                  <MenuItem value="reading">Reading</MenuItem>
                  <MenuItem value="writing">Writing</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <DataGrid
          rows={templates?.data || []}
          columns={columns}
          loading={isLoading}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 25, 50]}
          rowCount={templates?.meta?.total || 0}
          paginationMode="server"
          autoHeight
          disableRowSelectionOnClick
          sx={{
            border: 'none',
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid rgba(224, 224, 224, 1)',
            },
          }}
        />
      </Card>
    </Box>
  );
};

export default PromptTemplateList;
