import { bulkDeleteCourses, bulkPublishCourses, bulkUnpublishCourses, exportCourses, getCourseStats, getCourses } from '@/apis/course';
import CourseGrid from '@/components/course/CourseGrid';
import DeleteCourseModal from '@/components/course/DeleteCourseModal';
import { PageHeader, PaginationBar, SearchFilterBar } from '@/components/ui';
import { useBaseRequestQuery } from '@/hooks/useBaseRequestQuery';
import { Course } from '@/interface/course.interface';
import { DifficultyLevel } from '@/interface/enums';
import { Add as AddIcon, CloudDownload as CloudDownloadIcon, Delete as DeleteIcon, People as UsersIcon } from '@mui/icons-material';
import { Box, Button, Container, FormControl, Grid, InputLabel, MenuItem, Paper, Select, Stack, Typography } from '@mui/material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const CoursePage: React.FC = () => {
    const queryClient = useQueryClient();

    const {
        data: courseData,
        isLoading,
        setPage,
        setLimit,
        setSearch,
        request,
    } = useBaseRequestQuery<Course>({
        queryKey: ['courses'],
        queryFn: getCourses,
    });

    // Stats query
    const { data: statsData } = useQuery({
        queryKey: ['course-stats'],
        queryFn: async () => {
            const response = await getCourseStats();
            return response;
        },
    });

    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [selectedCourses, setSelectedCourses] = useState<(string | number)[]>([]);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [difficultyFilter, setDifficultyFilter] = useState<string>('');
    const navigate = useNavigate();

    const handleView = (course: Course) => {
        navigate(`/courses/${course.id}`);
    };

    const handleEdit = (course: Course) => {
        navigate(`/courses/edit/${course.id}`);
    };

    const handleDelete = (course: Course) => {
        setSelectedCourse(course);
        setIsDeleteModalOpen(true);
    };

    const handleCreate = () => {
        navigate('/create-course');
    };

    const handleCloseModals = () => {
        setIsDeleteModalOpen(false);
        setSelectedCourse(null);
    };

    const handlePageChange = (newPage: number) => {
        if (newPage > 0 && newPage <= (courseData?.data.totalPages || 1)) {
            setPage(newPage);
        }
    };

    const handleStatusFilterChange = (value: string) => {
        setStatusFilter(value);
        setRequest({
            ...request,
            isPublished: value === 'published' ? true : value === 'draft' ? false : undefined,
        } as any);
    };

    const handleDifficultyFilterChange = (value: string) => {
        setDifficultyFilter(value);
        setRequest({
            ...request,
            difficulty: value ? (value as DifficultyLevel) : undefined,
        } as any);
    };

    const handleClearFilters = () => {
        setStatusFilter('');
        setDifficultyFilter('');
        setRequest({
            ...request,
            isPublished: undefined,
            difficulty: undefined,
        } as any);
    };

    const isFilterActive = statusFilter || difficultyFilter;

    const handleExport = async () => {
        try {
            const blob = await exportCourses(request as any);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `courses-${new Date().toISOString()}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            toast.success('Courses exported successfully');
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to export courses');
        }
    };

    const handleBulkDelete = async () => {
        if (selectedCourses.length === 0) {
            toast.error('Please select courses to delete');
            return;
        }
        if (!confirm(`Are you sure you want to delete ${selectedCourses.length} courses?`)) {
            return;
        }
        try {
            await bulkDeleteCourses(selectedCourses.map(id => String(id)));
            toast.success(`Deleted ${selectedCourses.length} courses successfully`);
            setSelectedCourses([]);
            queryClient.invalidateQueries({ queryKey: ['courses'] });
            queryClient.invalidateQueries({ queryKey: ['course-stats'] });
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to delete courses');
        }
    };

    const handleBulkPublish = async () => {
        if (selectedCourses.length === 0) {
            toast.error('Please select courses to publish');
            return;
        }
        try {
            await bulkPublishCourses(selectedCourses.map(id => String(id)));
            toast.success(`Published ${selectedCourses.length} courses successfully`);
            setSelectedCourses([]);
            queryClient.invalidateQueries({ queryKey: ['courses'] });
            queryClient.invalidateQueries({ queryKey: ['course-stats'] });
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to publish courses');
        }
    };

    const handleBulkUnpublish = async () => {
        if (selectedCourses.length === 0) {
            toast.error('Please select courses to unpublish');
            return;
        }
        try {
            await bulkUnpublishCourses(selectedCourses.map(id => String(id)));
            toast.success(`Unpublished ${selectedCourses.length} courses successfully`);
            setSelectedCourses([]);
            queryClient.invalidateQueries({ queryKey: ['courses'] });
            queryClient.invalidateQueries({ queryKey: ['course-stats'] });
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to unpublish courses');
        }
    };

    const formatDate = (dateString: string | Date | null | undefined): string => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const courses = courseData?.data.data || [];
    const pagination = courseData?.data;

    const emptyState = (
        <Box
            textAlign="center"
            py={6}
            sx={{
                bgcolor: 'background.paper',
                borderRadius: 2,
                border: 1,
                borderColor: 'divider',
            }}
        >
            <UsersIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" fontWeight={600} gutterBottom>
                No Courses Found
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
                Create a new course to get started.
            </Typography>
            <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreate}
            >
                Create Your First Course
            </Button>
        </Box>
    );

    return (
        <Container maxWidth="xl">
            <Stack spacing={3} sx={{ py: 3 }}>
                <PageHeader
                    title="Course Management"
                    description="Oversee all courses and their activities."
                    createButtonLabel="Create Course"
                    onCreateClick={handleCreate}
                    actionButton={
                        <Stack direction="row" spacing={2}>
                            <Button
                                variant="outlined"
                                startIcon={<CloudDownloadIcon />}
                                onClick={handleExport}
                                disabled={isLoading}
                            >
                                Export
                            </Button>
                            {selectedCourses.length > 0 && (
                                <>
                                    <Button
                                        variant="outlined"
                                        color="success"
                                        onClick={handleBulkPublish}
                                        disabled={isLoading}
                                    >
                                        Publish ({selectedCourses.length})
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        color="warning"
                                        onClick={handleBulkUnpublish}
                                        disabled={isLoading}
                                    >
                                        Unpublish ({selectedCourses.length})
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="error"
                                        startIcon={<DeleteIcon />}
                                        onClick={handleBulkDelete}
                                        disabled={isLoading}
                                    >
                                        Delete ({selectedCourses.length})
                                    </Button>
                                </>
                            )}
                        </Stack>
                    }
                />

                {/* Stats Cards */}
                {statsData && (
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6} md={3}>
                            <Paper sx={{ p: 2 }}>
                                <Typography variant="h6" color="text.secondary">
                                    Total Courses
                                </Typography>
                                <Typography variant="h4" fontWeight="bold">
                                    {statsData.total ?? 0}
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Paper sx={{ p: 2 }}>
                                <Typography variant="h6" color="text.secondary">
                                    Published
                                </Typography>
                                <Typography variant="h4" fontWeight="bold" color="success.main">
                                    {statsData.published ?? 0}
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Paper sx={{ p: 2 }}>
                                <Typography variant="h6" color="text.secondary">
                                    Draft/Unpublished
                                </Typography>
                                <Typography variant="h4" fontWeight="bold" color="warning.main">
                                    {statsData.unpublished ?? 0}
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Paper sx={{ p: 2 }}>
                                <Typography variant="h6" color="text.secondary">
                                    Avg Price
                                </Typography>
                                <Typography variant="h4" fontWeight="bold" color="info.main">
                                    ${statsData.avgPrice ? statsData.avgPrice.toFixed(2) : '0.00'}
                                </Typography>
                            </Paper>
                        </Grid>
                    </Grid>
                )}

                {/* Advanced Filters */}
                <Paper sx={{ p: 2 }}>
                    <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                        <FormControl size="small" sx={{ minWidth: 150 }}>
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={statusFilter}
                                label="Status"
                                onChange={(e) => handleStatusFilterChange(e.target.value)}
                            >
                                <MenuItem value="">All</MenuItem>
                                <MenuItem value="published">Published</MenuItem>
                                <MenuItem value="draft">Draft</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl size="small" sx={{ minWidth: 150 }}>
                            <InputLabel>Difficulty</InputLabel>
                            <Select
                                value={difficultyFilter}
                                label="Difficulty"
                                onChange={(e) => handleDifficultyFilterChange(e.target.value)}
                            >
                                <MenuItem value="">All</MenuItem>
                                <MenuItem value={DifficultyLevel.BEGINNER}>Beginner</MenuItem>
                                <MenuItem value={DifficultyLevel.ELEMENTARY}>Elementary</MenuItem>
                                <MenuItem value={DifficultyLevel.INTERMEDIATE}>Intermediate</MenuItem>
                                <MenuItem value={DifficultyLevel.UPPER_INTERMEDIATE}>Upper Intermediate</MenuItem>
                                <MenuItem value={DifficultyLevel.ADVANCED}>Advanced</MenuItem>
                                <MenuItem value={DifficultyLevel.EXPERT}>Expert</MenuItem>
                            </Select>
                        </FormControl>

                        {isFilterActive && (
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={handleClearFilters}
                                startIcon={<DeleteIcon />}
                            >
                                Clear Filters
                            </Button>
                        )}
                    </Stack>
                </Paper>

                <SearchFilterBar
                    searchValue={request.search || ''}
                    onSearchChange={setSearch}
                    searchPlaceholder="Search by course name..."
                    limitValue={request.limit || 10}
                    onLimitChange={setLimit}
                    limitOptions={[5, 10, 20]}
                    isLoading={isLoading}
                />

                <CourseGrid
                    courses={courses}
                    isLoading={isLoading}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    formatDate={formatDate}
                    emptyState={emptyState}
                    selectedCourses={selectedCourses}
                    onSelectionChange={setSelectedCourses}
                />

                {pagination && (
                    <PaginationBar
                        page={pagination.page}
                        totalPages={pagination.totalPages}
                        totalItems={pagination.totalItems}
                        limit={pagination.limit}
                        onPageChange={handlePageChange}
                    />
                )}
            </Stack>

            <DeleteCourseModal
                isOpen={isDeleteModalOpen}
                onClose={handleCloseModals}
                course={selectedCourse}
            />
        </Container>
    );
};

export default CoursePage;
