// Learning Path List Page - Phase 4 CMS
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
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { usePathTemplates, useDeletePathTemplate } from '@/hooks/useLearningPaths';
import { PathTemplate, LearningPathStatus } from '@/interface/learning-path.interface';
import { useNavigate } from 'react-router-dom';

export const LearningPathList: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 25,
  });

  const { data: templates, isLoading } = usePathTemplates({
    page: paginationModel.page + 1,
    limit: paginationModel.pageSize,
    search,
  });

  const deleteTemplate = useDeletePathTemplate();

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      await deleteTemplate.mutateAsync(id);
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Template Name',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'targetLevel',
      headerName: 'Level',
      width: 100,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value}
          size="small"
          color="primary"
          variant="outlined"
        />
      ),
    },
    {
      field: 'steps',
      headerName: 'Steps',
      width: 80,
      valueGetter: (params) => params.row.steps?.length || 0,
    },
    {
      field: 'timesUsed',
      headerName: 'Used',
      width: 80,
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      width: 120,
      valueFormatter: (params) =>
        new Date(params.value).toLocaleDateString(),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      renderCell: (params: GridRenderCellParams<PathTemplate>) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <IconButton
            size="small"
            onClick={() => navigate(`/learning-paths/${params.row.id}`)}
            title="View"
          >
            <VisibilityIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => navigate(`/learning-paths/${params.row.id}/edit`)}
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
          Learning Path Templates
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/learning-paths/create')}
        >
          Create Template
        </Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
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

export default LearningPathList;
