import React, { useState } from 'react';
import { useBaseRequestQuery } from '@/hooks/useBaseRequestQuery';
import { Classroom } from '@/interface/classroom.interface';
import { getClassrooms } from '@/apis/classroom';
import { DataTable, PaginationBar, SearchFilterBar, TableColumn, ActionButton } from '@/components/ui';
import { Chip, Stack, Typography, Button } from '@mui/material';
import { BookOpen, Calendar, Clock, Loader2, PlayCircle, Eye, ClipboardList } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StudentClassroomGradesModal from './StudentClassroomGradesModal';

interface StudentClassroomsViewProps {
    studentId: string;
}

const StudentClassroomsView: React.FC<StudentClassroomsViewProps> = ({ studentId }) => {
    const navigate = useNavigate();
    const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);
    const [isGradesModalOpen, setIsGradesModalOpen] = useState(false);

    const {
        data: classroomData,
        isLoading,
        setPage,
        setLimit,
        setSearch,
        request
    } = useBaseRequestQuery<Classroom>({
        queryKey: ['student-classrooms', studentId],
        queryFn: (params) => getClassrooms({
            ...params,
            studentId,
            // We might want to filter by active status by default, but listing all for now is safer
        }),
    });

    const classrooms = classroomData?.data.data || [];
    const pagination = classroomData?.data;

    const handleViewClassroom = (classroom: Classroom) => {
        navigate(`/classrooms/${classroom.id}`);
    };

    const handleViewGrades = (classroom: Classroom) => {
        setSelectedClassroom(classroom);
        setIsGradesModalOpen(true);
    };

    const columns: TableColumn<Classroom>[] = [
        {
            id: 'name',
            label: 'Tên lớp',
            render: (item) => (
                <Stack spacing={0.5}>
                    <Typography variant="body2" fontWeight={600}>
                        {item.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Mã: {item.classCode}
                    </Typography>
                </Stack>
            ),
        },
        {
            id: 'course',
            label: 'Khóa học',
            render: (item) => (
                <Stack direction="row" spacing={1} alignItems="center">
                    <BookOpen className="w-4 h-4 text-indigo-500" />
                    <Typography variant="body2">{item.course?.title || 'N/A'}</Typography>
                </Stack>
            )
        },
        {
            id: 'schedule',
            label: 'Lịch học',
            render: (item) => {
                // If we had slot info readily available in list API, we'd show it.
                // For now showing generic period
                if (!item.periodStart && !item.periodEnd) return 'Chưa cập nhật';
                return (
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <Typography variant="caption">
                            {item.periodStart ? new Date(item.periodStart).toLocaleDateString() : '?'}
                            {' - '}
                            {item.periodEnd ? new Date(item.periodEnd).toLocaleDateString() : '?'}
                        </Typography>
                    </Stack>
                )
            }
        },
        {
            id: 'status',
            label: 'Trạng thái',
            render: (item) => {
                let color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' = 'default';
                let label = item.status || 'N/A';

                switch (item.status) {
                    case 'ongoing':
                        color = 'success';
                        label = 'Đang diễn ra';
                        break;
                    case 'upcoming':
                        color = 'info';
                        label = 'Sắp diễn ra';
                        break;
                    case 'completed':
                        color = 'default';
                        label = 'Đã kết thúc';
                        break;
                    case 'cancelled':
                        color = 'error';
                        label = 'Đã hủy';
                        break;
                }

                return <Chip label={label} color={color} size="small" />;
            },
        },
    ];

    const actions: ActionButton<Classroom>[] = [
        {
            icon: <ClipboardList className="w-4 h-4" />,
            label: 'Xem điểm bài tập',
            color: 'secondary',
            onClick: handleViewGrades,
        },
        {
            icon: <Eye className="w-4 h-4" />,
            label: 'Xem chi tiết lớp học',
            color: 'primary',
            onClick: handleViewClassroom,
        },
    ];

    if (isLoading && !classrooms.length) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-indigo-600" />
                    Danh sách lớp học đã tham gia
                </h3>
            </div>

            <SearchFilterBar
                searchValue={request.search || ''}
                onSearchChange={setSearch}
                searchPlaceholder="Tìm kiếm lớp học..."
                limitValue={request.limit || 10}
                onLimitChange={setLimit}
                isLoading={isLoading}
            />

            <DataTable
                columns={columns}
                data={classrooms}
                isLoading={isLoading}
                getRowId={(item) => item.id}
                actions={actions}
                emptyState={{
                    icon: <BookOpen className="w-16 h-16 text-gray-300 mb-2" />,
                    title: 'Chưa tham gia lớp học nào',
                    description: 'Học viên này chưa được thêm vào lớp học nào.'
                }}
            />

            {pagination && (
                <PaginationBar
                    page={pagination.page}
                    totalPages={pagination.totalPages || 1}
                    totalItems={pagination.totalItems || 0}
                    limit={pagination.limit}
                    onPageChange={setPage}
                />
            )}

            {/* Grades Modal */}
            {selectedClassroom && (
                <StudentClassroomGradesModal
                    isOpen={isGradesModalOpen}
                    onClose={() => {
                        setIsGradesModalOpen(false);
                        setSelectedClassroom(null);
                    }}
                    classroom={selectedClassroom}
                    studentId={studentId}
                />
            )}
        </div>
    );
};

export default StudentClassroomsView;
