import { getClassrooms } from '@/apis/classroom';
import { useTransferStudent } from '@/hooks/useClassroomDetail';
import { yupResolver } from '@hookform/resolvers/yup';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, ArrowRightLeft, Search, User, X } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import * as yup from 'yup';
import Button from '../ui/Button';
import Modal from '../ui/Modal';

interface TransferStudentModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentClassroomId: string;
    currentClassroomName: string;
    student: {
        id: string;
        displayName?: string | null;
        firstName?: string | null;
        lastName?: string | null;
        email?: string | null;
    } | null;
}

interface TransferStudentFormValues {
    newClassroomId: string;
}

const schema = yup.object({
    newClassroomId: yup.string().required('Vui lòng chọn lớp học mới'),
});

const TransferStudentModal: React.FC<TransferStudentModalProps> = ({
    isOpen,
    onClose,
    currentClassroomId,
    currentClassroomName,
    student,
}) => {
    const mutation = useTransferStudent();
    const [searchTerm, setSearchTerm] = useState('');

    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors },
    } = useForm<TransferStudentFormValues>({
        resolver: yupResolver(schema),
        defaultValues: {
            newClassroomId: '',
        },
    });

    // Fetch danh sách classrooms
    const { data: classroomsData, isLoading: isLoadingClassrooms } = useQuery({
        queryKey: ['classrooms', { page: 1, limit: 100 }],
        queryFn: () => getClassrooms({ page: 1, limit: 100 }),
        enabled: isOpen,
    });

    // Reset form khi modal đóng hoặc mở
    useEffect(() => {
        if (isOpen) {
            reset();
            setSearchTerm('');
        }
    }, [isOpen, reset]);

    // Filter classrooms (loại bỏ lớp hiện tại và tìm kiếm)
    const availableClassrooms = useMemo(() => {
        const allClassrooms = classroomsData?.data?.data || [];
        return allClassrooms
            .filter((c) => c.id !== currentClassroomId) // Loại bỏ lớp hiện tại
            .filter((c) => {
                if (!searchTerm) return true;
                const searchLower = searchTerm.toLowerCase();
                return (
                    c.name.toLowerCase().includes(searchLower) ||
                    c.classCode?.toLowerCase().includes(searchLower)
                );
            });
    }, [classroomsData, currentClassroomId, searchTerm]);

    const selectedClassroomId = watch('newClassroomId');
    const selectedClassroom = useMemo(() => {
        return availableClassrooms.find((c) => c.id === selectedClassroomId);
    }, [availableClassrooms, selectedClassroomId]);

    const onSubmit = async (data: TransferStudentFormValues) => {
        if (!student) return;

        try {
            const result = await mutation.mutateAsync({
                studentId: student.id,
                currentClassroomId,
                newClassroomId: data.newClassroomId,
            });

            toast.success(result.message || 'Chuyển lớp thành công!');
            reset();
            onClose();
        } catch (error: any) {
            toast.error(
                `Lỗi khi chuyển lớp: ${error?.response?.data?.message || error.message}`
            );
        }
    };

    const getStudentName = () => {
        if (!student) return 'N/A';
        if (student.displayName) return student.displayName;
        if (student.firstName && student.lastName) {
            return `${student.firstName} ${student.lastName}`;
        }
        return student.email || 'N/A';
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Chuyển lớp học sinh"
            description={`Từ lớp: ${currentClassroomName}`}
            icon={
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
                    <ArrowRightLeft className="h-5 w-5 text-indigo-600" />
                </div>
            }
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Student Info */}
                <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                            <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-700">Học sinh</p>
                            <p className="text-base font-semibold text-gray-900">
                                {getStudentName()}
                            </p>
                            {student?.email && (
                                <p className="text-xs text-gray-500">{student.email}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Warning Alert */}
                <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-yellow-800">
                            <p className="font-medium mb-1">Lưu ý:</p>
                            <ul className="list-disc list-inside space-y-1">
                                <li>Học sinh sẽ được <strong>xóa khỏi lớp cũ</strong> và thêm vào lớp mới</li>
                                <li>Dữ liệu học tập (progress) sẽ được <strong>giữ nguyên</strong></li>
                                <li>Kiểm tra kỹ trước khi xác nhận</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Search Classroom */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tìm kiếm lớp học mới
                    </label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Tìm theo tên lớp hoặc mã lớp..."
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Select Classroom */}
                <div>
                    <label htmlFor="newClassroomId" className="block text-sm font-medium text-gray-700 mb-2">
                        Chọn lớp học mới <span className="text-red-500">*</span>
                    </label>

                    {isLoadingClassrooms ? (
                        <div className="text-center py-8">
                            <div className="inline-block h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                            <p className="text-sm text-gray-600 mt-2">Đang tải danh sách lớp học...</p>
                        </div>
                    ) : availableClassrooms.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <p>Không tìm thấy lớp học phù hợp</p>
                        </div>
                    ) : (
                        <div className="max-h-64 overflow-y-auto space-y-2 border border-gray-300 rounded-lg p-3">
                            {availableClassrooms.map((classroom) => (
                                <label
                                    key={classroom.id}
                                    className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${selectedClassroomId === classroom.id
                                        ? 'border-indigo-500 bg-indigo-50'
                                        : 'border-gray-200 hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="flex items-center gap-3 flex-1">
                                        <input
                                            type="radio"
                                            value={classroom.id}
                                            {...register('newClassroomId')}
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">{classroom.name}</p>
                                            <p className="text-xs text-gray-500">
                                                Mã: {classroom.classCode} |
                                                Học sinh: {classroom.students?.length || 0}/{classroom.maxStudents || '∞'}
                                            </p>
                                        </div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    )}

                    {errors.newClassroomId && (
                        <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {errors.newClassroomId.message}
                        </p>
                    )}
                </div>

                {/* Selected Classroom Info */}
                {selectedClassroom && (
                    <div className="rounded-lg bg-indigo-50 border border-indigo-200 p-4">
                        <p className="text-sm font-medium text-indigo-900 mb-2">Lớp học được chọn:</p>
                        <p className="text-base font-semibold text-indigo-900">{selectedClassroom.name}</p>
                        <div className="flex gap-4 mt-2 text-xs text-indigo-700">
                            <span>Mã: {selectedClassroom.classCode}</span>
                            <span>Sĩ số: {selectedClassroom.students?.length || 0}/{selectedClassroom.maxStudents || '∞'}</span>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onClose}
                        disabled={mutation.isPending}
                        className="flex items-center gap-2"
                    >
                        <X className="h-4 w-4" />
                        Hủy
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={mutation.isPending || !selectedClassroomId}
                        className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                    >
                        {mutation.isPending ? (
                            <>
                                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Đang chuyển...
                            </>
                        ) : (
                            <>
                                <ArrowRightLeft className="h-4 w-4" />
                                Xác nhận chuyển lớp
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default TransferStudentModal;

