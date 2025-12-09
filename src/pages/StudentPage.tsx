import {
  bulkDeleteStudents,
  downloadImportTemplate,
  exportStudents,
  getStudents,
  importStudents
} from '@/apis/student';
import CreateStudentModal from '@/components/student/CreateStudentModal';
import DeleteStudentModal from '@/components/student/DeleteStudentModal';
import EditStudentModal from '@/components/student/EditStudentModal';
import ViewStudentModal from '@/components/student/ViewStudentModal';
import { DataTable, PageHeader, PaginationBar, SearchFilterBar, type ActionButton, type TableColumn } from '@/components/ui';
import { useBaseRequestQuery } from '@/hooks/useBaseRequestQuery';
import { Student } from '@/interface/student.interface';
import {
  Add as AddIcon,
  CloudDownload as CloudDownloadIcon,
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import {
  Avatar,
  Button,
  Chip,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography
} from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const StudentPage: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    data: studentData,
    isLoading,
    setPage,
    setLimit,
    setSearch,
    request,
    setRequest,
  } = useBaseRequestQuery<Student>({
    queryKey: ['students'],
    queryFn: getStudents,
  });

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<(string | number)[]>([]);
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [genderFilter, setGenderFilter] = useState<string>('');

  const handleView = (student: Student) => {
    navigate(`/students/${student.id}`);
  };

  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    setIsEditModalOpen(true);
  };

  const handleDelete = (student: Student) => {
    setSelectedStudent(student);
    setIsDeleteModalOpen(true);
  };

  const handleCreate = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsViewModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setIsCreateModalOpen(false);
    setSelectedStudent(null);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= (studentData?.data.totalPages || 1)) {
      setPage(newPage);
    }
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setRequest({ ...request, status: value || undefined });
  };

  const handleGenderFilterChange = (value: string) => {
    setGenderFilter(value);
    setRequest({ ...request, gender: value || undefined });
  };

  const handleExport = async () => {
    try {
      const blob = await exportStudents(request);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `students-${new Date().toISOString()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Xuất danh sách học viên thành công');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Xuất danh sách học viên thất bại');
    }
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleDownloadTemplate = async () => {
    try {
      const blob = await downloadImportTemplate();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'students-import-template.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Tải mẫu thành công');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Tải mẫu thất bại');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const response = await importStudents(file);
      toast.success(`Đã import thành công ${response.data.created} học viên`);
      if (response.data.errors.length > 0) {
        toast.error(`${response.data.errors.length} lỗi xảy ra`);
      }
      queryClient.invalidateQueries({ queryKey: ['students'] });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Import học viên thất bại');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedStudents.length === 0) {
      toast.error('Vui lòng chọn học viên để xóa');
      return;
    }

    if (!confirm(`Bạn có chắc chắn muốn xóa ${selectedStudents.length} học viên không?`)) {
      return;
    }

    try {
      await bulkDeleteStudents(selectedStudents.map(id => String(id)));
      toast.success(`Đã xóa thành công ${selectedStudents.length} học viên`);
      setSelectedStudents([]);
      queryClient.invalidateQueries({ queryKey: ['students'] });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Xóa học viên thất bại');
    }
  };

  const formatDate = (dateString: string | Date | null | undefined): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const students = studentData?.data.data || [];
  const pagination = studentData?.data;

  const getStudentDisplayName = (student: Student): string => {
    if (student.username) return student.username;
    if (student.firstName && student.lastName) {
      return `${student.firstName} ${student.lastName}`.trim();
    }
    if (student.firstName) return student.firstName;
    if (student.lastName) return student.lastName;
    return student.email || 'N/A';
  };

  const columns: TableColumn<Student>[] = [
    {
      id: 'name',
      label: 'Tên',
      render: (student) => (
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            src={student.avatarUrl}
            sx={{ bgcolor: 'primary.light', width: 40, height: 40 }}
          >
            {getStudentDisplayName(student).charAt(0).toUpperCase()}
          </Avatar>
          <Stack spacing={0.5}>
            <Typography variant="body2" fontWeight={600}>
              {getStudentDisplayName(student)}
            </Typography>
            {student.username && student.username !== getStudentDisplayName(student) && (
              <Typography variant="caption" color="text.secondary">
                @{student.username}
              </Typography>
            )}
          </Stack>
        </Stack>
      ),
    },
    {
      id: 'email',
      label: 'Email',
      render: (student) => (
        <Typography variant="body2" color="text.secondary">
          {student.email}
        </Typography>
      ),
    },
    {
      id: 'phone',
      label: 'Số điện thoại',
      render: (student) => (
        <Typography variant="body2" color="text.secondary">
          {student.phone || 'N/A'}
        </Typography>
      ),
    },
    {
      id: 'status',
      label: 'Trạng thái',
      render: (student) => (
        <Chip
          label={student.status}
          color={student.status === 'active' ? 'success' : 'error'}
          size="small"
        />
      ),
    },
    {
      id: 'createdAt',
      label: 'Ngày tạo',
      render: (student) => (
        <Typography variant="body2" color="text.secondary">
          {formatDate(student.createdAt)}
        </Typography>
      ),
    },
  ];

  const actions: ActionButton<Student>[] = [
    {
      icon: <VisibilityIcon fontSize="small" />,
      label: 'Xem chi tiết',
      color: 'primary',
      onClick: handleView,
    },
    {
      icon: <EditIcon fontSize="small" />,
      label: 'Chỉnh sửa học viên',
      color: 'success',
      onClick: handleEdit,
    },
    {
      icon: <DeleteIcon fontSize="small" />,
      label: 'Xóa học viên',
      color: 'error',
      onClick: handleDelete,
    },
  ];

  return (
    <Container maxWidth="xl">
      <Stack spacing={3} sx={{ py: 3 }}>
        <PageHeader
          title="Quản lý học viên"
          description="Quản lý tất cả học viên và hoạt động học tập."
          createButtonLabel="Tạo học viên"
          onCreateClick={handleCreate}
          actionButton={
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleDownloadTemplate}
                disabled={isLoading}
              >
                Tải file mẫu
              </Button>
              <Button
                variant="outlined"
                startIcon={<CloudDownloadIcon />}
                onClick={handleExport}
                disabled={isLoading}
              >
                Xuất file
              </Button>
              <Button
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                onClick={handleImport}
                disabled={isLoading}
              >
                Import
              </Button>
              {selectedStudents.length > 0 && (
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleBulkDelete}
                  disabled={isLoading}
                >
                  Xóa ({selectedStudents.length})
                </Button>
              )}
            </Stack>
          }
        />

        {/* Filters */}
        <Stack direction="row" spacing={2} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Trạng thái</InputLabel>
            <Select
              value={statusFilter}
              label="Trạng thái"
              onChange={(e) => handleStatusFilterChange(e.target.value)}
            >
              <MenuItem value="">Tất cả</MenuItem>
              <MenuItem value="active">Hoạt động</MenuItem>
              <MenuItem value="inactive">Không hoạt động</MenuItem>
              <MenuItem value="banned">Cấm</MenuItem>
              <MenuItem value="pending">Chờ duyệt</MenuItem>
              <MenuItem value="suspended">Đình chỉ</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Giới tính</InputLabel>
            <Select
              value={genderFilter}
              label="Giới tính"
              onChange={(e) => handleGenderFilterChange(e.target.value)}
            >
              <MenuItem value="">Tất cả</MenuItem>
              <MenuItem value="male">Nam</MenuItem>
              <MenuItem value="female">Nữ</MenuItem>
              <MenuItem value="other">Khác</MenuItem>
              <MenuItem value="prefer_not_to_say">Không muốn tiết lộ</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        <SearchFilterBar
          searchValue={request.search || ''}
          onSearchChange={setSearch}
          searchPlaceholder="Tìm kiếm theo tên, email, số điện thoại..."
          limitValue={request.limit || 10}
          onLimitChange={setLimit}
          isLoading={isLoading}
        />

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        <DataTable
          columns={columns}
          data={students}
          isLoading={isLoading}
          actions={actions}
          getRowId={(student) => student.id}
          selectedRows={selectedStudents}
          onSelectionChange={setSelectedStudents}
          emptyState={{
            icon: <PersonIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />,
            title: 'Không tìm thấy học viên nào',
            description: 'Tạo học viên mới để bắt đầu.',
            actionButton: (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreate}
              >
                Tạo học viên đầu tiên
              </Button>
            ),
          }}
        />

        {pagination && (
          <PaginationBar
            page={pagination.page}
            totalPages={pagination.totalPages ?? 1}
            totalItems={pagination.totalItems ?? 0}
            limit={pagination.limit}
            onPageChange={handlePageChange}
          />
        )}
      </Stack>

      <CreateStudentModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseModals}
      />

      <EditStudentModal
        isOpen={isEditModalOpen}
        onClose={handleCloseModals}
        student={selectedStudent}
      />

      <DeleteStudentModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseModals}
        student={selectedStudent}
      />

      <ViewStudentModal
        isOpen={isViewModalOpen}
        onClose={handleCloseModals}
        student={selectedStudent}
      />
    </Container>
  );
};

export default StudentPage;
