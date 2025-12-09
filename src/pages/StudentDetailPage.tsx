import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getStudentById } from '@/apis/student';
import { ArrowLeft, Edit, Trash2, User, BookOpen, Calendar } from 'lucide-react';
import EditStudentModal from '@/components/student/EditStudentModal';
import DeleteStudentModal from '@/components/student/DeleteStudentModal';
import StudentProfileView from '@/components/student/StudentProfileView';
import StudentClassroomsView from '@/components/student/StudentClassroomsView';
import StudentScheduleView from '@/components/student/StudentScheduleView';

const StudentDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'overview' | 'classrooms' | 'schedule'>('overview');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const { data: studentResponse, isLoading, refetch } = useQuery({
        queryKey: ['student', id],
        queryFn: () => getStudentById(id || ''),
        enabled: !!id
    });

    const student = studentResponse?.data;

    const handleEditSuccess = () => {
        refetch();
    };

    const handleDeleteSuccess = () => {
        navigate('/students');
    };

    const tabs = [
        { key: 'overview' as const, label: 'Tổng quan', icon: User },
        { key: 'classrooms' as const, label: 'Lớp học đang tham gia', icon: BookOpen },
        { key: 'schedule' as const, label: 'Lịch học', icon: Calendar },
    ];

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!student) {
        return (
            <div className="flex h-screen flex-col items-center justify-center gap-4">
                <p className="text-gray-500">Không tìm thấy học viên</p>
                <button
                    onClick={() => navigate('/students')}
                    className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Quay lại danh sách
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/students')}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">
                                    {student.firstName && student.lastName
                                        ? `${student.firstName} ${student.lastName}`
                                        : student.username}
                                </h1>
                                <p className="text-sm text-gray-500 mt-0.5">
                                    Chi tiết học viên
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsEditModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <Edit className="w-4 h-4" />
                                <span className="hidden sm:inline">Chỉnh sửa</span>
                            </button>
                            <button
                                onClick={() => setIsDeleteModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                            >
                                <Trash2 className="w-4 h-4" />
                                <span className="hidden sm:inline">Xóa</span>
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="mt-6 flex border-b border-gray-200">
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.key
                                        ? 'border-indigo-600 text-indigo-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeTab === 'overview' && <StudentProfileView student={student} />}
                {activeTab === 'classrooms' && <StudentClassroomsView studentId={student.id} />}
                {activeTab === 'schedule' && <StudentScheduleView studentId={student.id} />}
            </div>

            {/* Modals */}
            <EditStudentModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                student={student}
                onSuccess={handleEditSuccess}
            />

            <DeleteStudentModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                student={student}
                onSuccess={handleDeleteSuccess}
            />
        </div>
    );
};

export default StudentDetailPage;
