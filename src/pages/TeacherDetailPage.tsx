import { getClassrooms } from '@/apis/classroom';
import { useBaseRequestQuery } from '@/hooks/useBaseRequestQuery';
import { useTeacher } from '@/hooks/useTeacher';
import { Classroom, ClassroomStatus } from '@/interface/classroom.interface';
import { ArrowLeft, BookOpen, Calendar, Edit, RotateCcw, Trash2, User } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TeacherProfileView from '@/components/teacher/TeacherProfileView';
import TeacherScheduleView from '@/components/teacher/TeacherScheduleView';
import DeleteTeacherModal from '@/components/teacher/DeleteTeacherModal';
import EditTeacherModal from '@/components/teacher/EditTeacherModal';
import { DataTable, PageHeader, PaginationBar, SearchFilterBar, TableColumn } from '@/components/ui';
import { Chip } from '@mui/material';

const TeacherDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'overview' | 'classrooms' | 'schedule'>('overview');

    // Modal states
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const { data: teacherData, isLoading: isTeacherLoading, refetch: refetchTeacher } = useTeacher(id || '');
    const teacher = teacherData?.data;

    // Classrooms Query
    const {
        data: classroomData,
        isLoading: isClassroomLoading,
        setPage,
        setLimit,
        setSearch,
        request,
    } = useBaseRequestQuery<Classroom>({
        queryKey: ['teacher-classrooms', id || ''],
        queryFn: (params) => getClassrooms({ ...params, teacherId: id || '' }),
        enabled: activeTab === 'classrooms' && !!id,
    });

    const classrooms = classroomData?.data.data || [];
    const pagination = classroomData?.data;

    const handleBack = () => navigate('/teachers');

    if (isTeacherLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!teacher) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen gap-4">
                <p className="text-gray-500">Teacher not found</p>
                <button
                    onClick={handleBack}
                    className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" /> Go back
                </button>
            </div>
        );
    }

    const tabs = [
        { id: 'overview', label: 'Tổng quan', icon: User },
        { id: 'classrooms', label: 'Danh sách lớp học', icon: BookOpen },
        { id: 'schedule', label: 'Lịch giảng dạy', icon: Calendar },
    ] as const;

    const classroomColumns: TableColumn<Classroom>[] = [
        {
            id: 'name',
            label: 'Tên lớp',
            render: (row) => (
                <div>
                    <div className="font-medium text-gray-900">{row.name}</div>
                    <div className="text-xs text-gray-500">{row.classCode}</div>
                </div>
            ),
        },
        {
            id: 'course',
            label: 'Khóa học',
            render: (row) => <span className="text-gray-700">{row.course?.title || 'N/A'}</span>,
        },
        {
            id: 'students',
            label: 'Học viên',
            render: (row) => (
                <span className="text-gray-600">
                    {row._count?.students || 0}{row.maxStudents ? `/${row.maxStudents}` : ''}
                </span>
            ),
        },
        {
            id: 'status',
            label: 'Trạng thái',
            render: (row) => {
                let label = 'Đã hủy';
                let color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' = 'error';

                switch (row.status) {
                    case ClassroomStatus.upcoming:
                        label = 'Sắp diễn ra';
                        color = 'info';
                        break;
                    case ClassroomStatus.ongoing:
                        label = 'Đang hoạt động';
                        color = 'success';
                        break;
                    case ClassroomStatus.completed:
                        label = 'Hoàn thành';
                        color = 'default';
                        break;
                    case ClassroomStatus.cancelled:
                        label = 'Đã hủy';
                        color = 'error';
                        break;
                    default:
                        label = row.status;
                        color = 'default';
                }

                return (
                    <Chip
                        label={label}
                        color={color}
                        size="small"
                    />
                );
            },
        },
        {
            id: 'period',
            label: 'Thời gian',
            render: (row) => (
                <div className="text-xs text-gray-600">
                    <div>BĐ: {new Date(row.periodStart).toLocaleDateString()}</div>
                    <div>KT: {new Date(row.periodEnd).toLocaleDateString()}</div>
                </div>
            ),
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50/50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="py-4">
                        <button
                            onClick={handleBack}
                            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Quay lại danh sách
                        </button>

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <img
                                    src={teacher.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(teacher.displayName || 'Teacher')}&background=3b82f6&color=fff&size=96`}
                                    alt={teacher.displayName || 'Teacher'}
                                    className="w-16 h-16 rounded-full border-4 border-gray-100 shadow-sm"
                                />
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">{teacher.displayName}</h1>
                                    <p className="text-sm text-gray-500">{teacher.email} • {teacher.phone || 'No phone'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setIsEditModalOpen(true)}
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-sm"
                                >
                                    <Edit className="w-4 h-4 mr-2" />
                                    Chỉnh sửa
                                </button>
                                <button
                                    onClick={() => setIsDeleteModalOpen(true)}
                                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors shadow-sm"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Xóa
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex space-x-8 mt-2 overflow-x-auto no-scrollbar">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                                    flex items-center gap-2 py-4 border-b-2 text-sm font-medium transition-colors whitespace-nowrap
                                    ${isActive
                                            ? 'border-blue-600 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                                `}
                                >
                                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeTab === 'overview' && (
                    <div className="max-w-4xl mx-auto animation-fade-in">
                        <TeacherProfileView teacher={teacher} />
                    </div>
                )}

                {activeTab === 'classrooms' && (
                    <div className="space-y-4 animation-fade-in">
                        <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Danh sách lớp học đang dạy</h2>
                            <button className="text-gray-400 hover:text-gray-600">
                                <RotateCcw className="w-4 h-4" />
                            </button>
                        </div>

                        <SearchFilterBar
                            searchValue={request.search || ''}
                            onSearchChange={setSearch}
                            searchPlaceholder="Tìm kiếm lớp học..."
                            limitValue={request.limit || 10}
                            onLimitChange={setLimit}
                            isLoading={isClassroomLoading}
                        />

                        <DataTable
                            columns={classroomColumns}
                            data={classrooms}
                            isLoading={isClassroomLoading}
                            getRowId={(row) => row.id}
                            emptyState={{
                                title: 'Chưa có lớp học nào',
                                description: 'Giáo viên này chưa được phân công dạy lớp nào.',
                                icon: <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            }}
                        />
                        {pagination && (
                            <PaginationBar
                                page={pagination.page}
                                totalPages={pagination.totalPages ?? 1}
                                totalItems={pagination.totalItems ?? 0}
                                limit={pagination.limit}
                                onPageChange={setPage}
                            />
                        )}
                    </div>
                )}

                {activeTab === 'schedule' && (
                    <div className="animation-fade-in">
                        <TeacherScheduleView teacherId={id || null} />
                    </div>
                )}
            </div>

            {/* Modals */}
            <EditTeacherModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                teacher={teacher}
                onSuccess={() => {
                    refetchTeacher();
                    setIsEditModalOpen(false);
                }}
            />

            <DeleteTeacherModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                teacher={teacher}
                onSuccess={() => {
                    navigate('/teachers');
                }}
            />
        </div>
    );
};

export default TeacherDetailPage;
