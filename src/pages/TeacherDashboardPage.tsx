import GradeSubmissionModal from '@/components/assignment/GradeSubmissionModal';
import { useGetTeacherDashboardData } from '@/hooks/useDashboard';
import {
    AlertCircle,
    BookOpen,
    Calendar,
    CheckCircle,
    Clock,
    FileText,
    Loader2,
    School,
    TrendingUp,
    Users
} from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TeacherDashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const { data, isLoading, error } = useGetTeacherDashboardData();
    const [isGradingModalOpen, setIsGradingModalOpen] = useState(false);
    const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);

    const handleGradeSubmission = (submissionId: string) => {
        setSelectedSubmissionId(submissionId);
        setIsGradingModalOpen(true);
    };

    const handleCloseGradingModal = () => {
        setIsGradingModalOpen(false);
        setSelectedSubmissionId(null);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Đang tải dữ liệu dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
                    <p className="text-red-600 font-semibold mb-2">Lỗi tải dữ liệu</p>
                    <p className="text-gray-600">{error.message}</p>
                </div>
            </div>
        );
    }

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { bg: string; text: string; label: string }> = {
            upcoming: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Sắp diễn ra' },
            ongoing: { bg: 'bg-green-100', text: 'text-green-800', label: 'Đang diễn ra' },
            completed: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Hoàn thành' },
            cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Đã hủy' },
            scheduled: { bg: 'bg-indigo-100', text: 'text-indigo-800', label: 'Đã lên lịch' },
        };
        const config = statusMap[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status };
        return config;
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'success':
                return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'warning':
                return <AlertCircle className="w-5 h-5 text-yellow-600" />;
            case 'error':
                return <AlertCircle className="w-5 h-5 text-red-600" />;
            default:
                return <AlertCircle className="w-5 h-5 text-blue-600" />;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Dashboard Giáo Viên
                    </h1>
                    <p className="text-gray-600">Chào mừng trở lại! Đây là tổng quan công việc của bạn.</p>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Total Active Classrooms */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-indigo-100 rounded-lg">
                                <School className="w-6 h-6 text-indigo-600" />
                            </div>
                            <TrendingUp className="w-5 h-5 text-green-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">
                            {data?.totalActiveClassrooms || 0}
                        </h3>
                        <p className="text-sm text-gray-600">Lớp đang dạy</p>
                    </div>

                    {/* Total Students */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                            <TrendingUp className="w-5 h-5 text-green-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">
                            {data?.totalStudents || 0}
                        </h3>
                        <p className="text-sm text-gray-600">Học sinh</p>
                    </div>

                    {/* Upcoming Sessions */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <Calendar className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">
                            {data?.upcomingSessionsCount || 0}
                        </h3>
                        <p className="text-sm text-gray-600">Buổi học sắp tới (7 ngày)</p>
                    </div>

                    {/* Pending Submissions */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-orange-100 rounded-lg">
                                <FileText className="w-6 h-6 text-orange-600" />
                            </div>
                            <AlertCircle className="w-5 h-5 text-orange-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">
                            {data?.pendingSubmissionsCount || 0}
                        </h3>
                        <p className="text-sm text-gray-600">Bài tập cần chấm</p>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Active Classrooms - 2 columns */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-indigo-600" />
                                Lớp học đang dạy
                            </h2>
                            <button
                                onClick={() => navigate('/classrooms')}
                                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                            >
                                Xem tất cả →
                            </button>
                        </div>

                        {data?.activeClassrooms && data.activeClassrooms.length > 0 ? (
                            <div className="space-y-4">
                                {data.activeClassrooms.map((classroom) => (
                                    <div
                                        key={classroom.id}
                                        onClick={() => navigate(`/classrooms/${classroom.id}`)}
                                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200"
                                    >
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900 mb-1">
                                                {classroom.name}
                                            </h3>
                                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                                <span>Mã: {classroom.classCode}</span>
                                                <span>•</span>
                                                <span>
                                                    {classroom.studentsCount}/{classroom.maxStudents || '∞'} học sinh
                                                </span>
                                                {classroom.courseName && (
                                                    <>
                                                        <span>•</span>
                                                        <span>{classroom.courseName}</span>
                                                    </>
                                                )}
                                            </div>
                                            {classroom.nextSessionTime && (
                                                <div className="flex items-center gap-2 mt-2 text-xs text-indigo-600">
                                                    <Clock className="w-3 h-3" />
                                                    Buổi tiếp theo: {formatDateTime(classroom.nextSessionTime)}
                                                </div>
                                            )}
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(classroom.status).bg} ${getStatusBadge(classroom.status).text}`}>
                                            {getStatusBadge(classroom.status).label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <School className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600">Chưa có lớp học nào đang dạy</p>
                            </div>
                        )}
                    </div>

                    {/* Upcoming Sessions - 1 column */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-purple-600" />
                            Lịch dạy hôm nay
                        </h2>

                        {data?.upcomingSessions && data.upcomingSessions.length > 0 ? (
                            <div className="space-y-3">
                                {data.upcomingSessions.map((session) => (
                                    <div
                                        key={session.id}
                                        onClick={() => navigate(`/classrooms/${session.classroomId}`)}
                                        className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors cursor-pointer border border-purple-200"
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="font-semibold text-gray-900 text-sm">
                                                {session.classroomName}
                                            </h3>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(session.status).bg} ${getStatusBadge(session.status).text}`}>
                                                {getStatusBadge(session.status).label}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                                            <Clock className="w-3 h-3" />
                                            {formatTime(session.startTime)} - {formatTime(session.endTime)}
                                        </div>
                                        {session.roomName && (
                                            <div className="text-xs text-gray-600">
                                                Phòng: {session.roomName}
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1 text-xs text-gray-600 mt-2">
                                            <Users className="w-3 h-3" />
                                            {session.studentsCount} học sinh
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-sm text-gray-600">Không có buổi học nào trong 24h tới</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                    {/* Pending Submissions */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-orange-600" />
                                Bài tập cần chấm
                            </h2>
                        </div>

                        {data?.pendingSubmissions && data.pendingSubmissions.length > 0 ? (
                            <div className="space-y-3">
                                {data.pendingSubmissions.map((submission) => (
                                    <div
                                        key={submission.id}
                                        onClick={() => handleGradeSubmission(submission.id)}
                                        className="p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors border border-orange-200 cursor-pointer"
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="font-semibold text-gray-900 text-sm">
                                                {submission.assignmentTitle}
                                            </h3>
                                        </div>
                                        <div className="text-sm text-gray-700 mb-1">
                                            Học sinh: {submission.studentName}
                                        </div>
                                        <div className="text-xs text-gray-600">
                                            Lớp: {submission.classroomName}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                                            <Clock className="w-3 h-3" />
                                            Nộp lúc: {formatDateTime(submission.submittedAt)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-sm text-gray-600">Không có bài tập cần chấm</p>
                            </div>
                        )}
                    </div>

                    {/* Recent Notifications */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-blue-600" />
                            Thông báo gần đây
                        </h2>

                        {data?.recentNotifications && data.recentNotifications.length > 0 ? (
                            <div className="space-y-3">
                                {data.recentNotifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                                    >
                                        <div className="flex items-start gap-3">
                                            {getNotificationIcon(notification.type)}
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900 text-sm mb-1">
                                                    {notification.title}
                                                </h3>
                                                {notification.message && (
                                                    <p className="text-xs text-gray-600 mb-2">
                                                        {notification.message}
                                                    </p>
                                                )}
                                                <div className="text-xs text-gray-500">
                                                    {formatDateTime(notification.createdAt)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-sm text-gray-600">Không có thông báo mới</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Grading Modal */}
            <GradeSubmissionModal
                isOpen={isGradingModalOpen}
                onClose={handleCloseGradingModal}
                submissionId={selectedSubmissionId}
            />
        </div>
    );
};

export default TeacherDashboardPage;

