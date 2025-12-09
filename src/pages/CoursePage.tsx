import { bulkDeleteCourses, bulkPublishCourses, bulkUnpublishCourses, exportCourses, getCourses } from '@/apis/course';
import CourseGrid from '@/components/course/CourseGrid';
import DeleteCourseModal from '@/components/course/DeleteCourseModal';
import { PageHeader, PaginationBar, SearchFilterBar } from '@/components/ui';
import { useBaseRequestQuery } from '@/hooks/useBaseRequestQuery';
import { Course } from '@/interface/course.interface';
import { DifficultyLevel } from '@/interface/enums';
import { Add as AddIcon, CloudDownload as CloudDownloadIcon, Delete as DeleteIcon, People as UsersIcon } from '@mui/icons-material';
import { Box, Button, Container, FormControl, InputLabel, MenuItem, Paper, Select, Stack, Typography } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const CoursePage: React.FC = () => {
  const queryClient = useQueryClient();

  const {
    data: courseData,
    isLoading,
    setPage,
    setLimit,
    setSearch,
    request,
    setRequest
  } = useBaseRequestQuery<Course>({
    queryKey: ['courses'],
    queryFn: getCourses,
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
      toast.success('Xuất khóa học thành công');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Xuất khóa học thất bại');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedCourses.length === 0) {
      toast.error('Vui lòng chọn khóa học để xóa');
      return;
    }
    if (!confirm(`Bạn có chắc chắn muốn xóa ${selectedCourses.length} khóa học này?`)) {
      return;
    }
    try {
      await bulkDeleteCourses(selectedCourses.map(id => String(id)));
      toast.success(`Đã xóa ${selectedCourses.length} khóa học thành công`);
      setSelectedCourses([]);
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Xóa khóa học thất bại');
    }
  };

  const handleBulkPublish = async () => {
    if (selectedCourses.length === 0) {
      toast.error('Vui lòng chọn khóa học để xuất bản');
      return;
    }
    try {
      await bulkPublishCourses(selectedCourses.map(id => String(id)));
      toast.success(`Đã xuất bản ${selectedCourses.length} khóa học thành công`);
      setSelectedCourses([]);
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Xuất bản khóa học thất bại');
    }
  };

  const handleBulkUnpublish = async () => {
    if (selectedCourses.length === 0) {
      toast.error('Vui lòng chọn khóa học để hủy xuất bản');
      return;
    }
    try {
      await bulkUnpublishCourses(selectedCourses.map(id => String(id)));
      toast.success(`Đã hủy xuất bản ${selectedCourses.length} khóa học thành công`);
      setSelectedCourses([]);
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Hủy xuất bản khóa học thất bại');
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
        Không tìm thấy khóa học nào
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Tạo khóa học mới để bắt đầu.
      </Typography>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={handleCreate}
      >
        Tạo khóa học đầu tiên
      </Button>
    </Box>
  );

  return (
    <Container maxWidth="xl">
      <Stack spacing={3} sx={{ py: 3 }}>
        <PageHeader
          title="Quản lý khóa học"
          description="Quản lý tất cả khóa học và hoạt động."
          createButtonLabel="Tạo khóa học"
          onCreateClick={handleCreate}
          actionButton={
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<CloudDownloadIcon />}
                onClick={handleExport}
                disabled={isLoading}
              >
                Xuất Excel
              </Button>
              {selectedCourses.length > 0 && (
                <>
                  <Button
                    variant="outlined"
                    color="success"
                    onClick={handleBulkPublish}
                    disabled={isLoading}
                  >
                    Xuất bản ({selectedCourses.length})
                  </Button>
                  <Button
                    variant="outlined"
                    color="warning"
                    onClick={handleBulkUnpublish}
                    disabled={isLoading}
                  >
                    Hủy xuất bản ({selectedCourses.length})
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={handleBulkDelete}
                    disabled={isLoading}
                  >
                    Xóa ({selectedCourses.length})
                  </Button>
                </>
              )}
            </Stack>
          }
        />

        {/* Advanced Filters */}
        <Paper sx={{ p: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => handleStatusFilterChange(e.target.value)}
              >
                <MenuItem value="">Tất cả</MenuItem>
                <MenuItem value="published">Đã xuất bản</MenuItem>
                <MenuItem value="draft">Bản nháp</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Độ khó</InputLabel>
              <Select
                value={difficultyFilter}
                label="Difficulty"
                onChange={(e) => handleDifficultyFilterChange(e.target.value)}
              >
                <MenuItem value="">Tất cả</MenuItem>
                <MenuItem value={DifficultyLevel.BEGINNER}>Cơ bản</MenuItem>
                <MenuItem value={DifficultyLevel.ELEMENTARY}>Sơ cấp</MenuItem>
                <MenuItem value={DifficultyLevel.INTERMEDIATE}>Trung cấp</MenuItem>
                <MenuItem value={DifficultyLevel.UPPER_INTERMEDIATE}>Trung cấp cao</MenuItem>
                <MenuItem value={DifficultyLevel.ADVANCED}>Nâng cao</MenuItem>
                <MenuItem value={DifficultyLevel.EXPERT}>Chuyên gia</MenuItem>
              </Select>
            </FormControl>

            {isFilterActive && (
              <Button
                variant="outlined"
                size="small"
                onClick={handleClearFilters}
                startIcon={<DeleteIcon />}
              >
                Xóa bộ lọc
              </Button>
            )}
          </Stack>
        </Paper>

        <SearchFilterBar
          searchValue={request.search || ''}
          onSearchChange={setSearch}
          searchPlaceholder="Tìm kiếm theo tên khóa học..."
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
