import { getCourses } from '@/apis/course';
import CourseGrid from '@/components/course/CourseGrid';
import DeleteCourseModal from '@/components/course/DeleteCourseModal';
import { PageHeader, PaginationBar, SearchFilterBar } from '@/components/ui';
import { useBaseRequestQuery } from '@/hooks/useBaseRequestQuery';
import { Course } from '@/interface/course.interface';
import { Add as AddIcon, People as UsersIcon } from '@mui/icons-material';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CoursePage: React.FC = () => {
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

    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
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
                />

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
