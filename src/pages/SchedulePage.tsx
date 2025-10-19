import { getClassrooms, getSystemSchedule, SystemScheduleParams, SystemScheduleResponse, SystemScheduleSession } from '@/apis/classroom';
import { getTeachers } from '@/apis/teacher';
import { UserResponse } from '@/interface/user.interface';
import {
    BookOpen,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Clock,
    Filter,
    Loader2,
    MapPin,
    Users,
    Video,
    X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

type ViewMode = 'week' | 'month';

// Helper function: Get Monday of a given week (MUST be outside component)
const getMonday = (date: Date): string => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    d.setDate(diff);
    return d.toISOString().split('T')[0] || ''; // Return YYYY-MM-DD
};

const SchedulePage: React.FC = () => {
    const [scheduleData, setScheduleData] = useState<SystemScheduleResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('week');
    const [currentWeekStart, setCurrentWeekStart] = useState<string>(getMonday(new Date()));
    const [showFilters, setShowFilters] = useState(false);

    // Filter states
    const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
    const [selectedClassroomId, setSelectedClassroomId] = useState<string>('');
    const [selectedStatus, setSelectedStatus] = useState<string>('');

    // Filter options
    const [teachers, setTeachers] = useState<UserResponse[]>([]);
    const [classrooms, setClassrooms] = useState<any[]>([]);
    const [isLoadingFilters, setIsLoadingFilters] = useState(false);

    // Selected session for detail modal
    const [selectedSession, setSelectedSession] = useState<SystemScheduleSession | null>(null);

    // Load filter options
    useEffect(() => {
        loadFilterOptions();
    }, []);

    // Load schedule
    useEffect(() => {
        loadSchedule();
    }, [currentWeekStart, viewMode, selectedTeacherId, selectedClassroomId, selectedStatus]);

    const loadFilterOptions = async () => {
        setIsLoadingFilters(true);
        try {
            const [teachersData, classroomsData] = await Promise.all([
                getTeachers({ page: 1, limit: 100 }),
                getClassrooms({ page: 1, limit: 100 }),
            ]);
            setTeachers((teachersData.data || []) as any);
            setClassrooms((classroomsData.data || []) as any);
        } catch (error) {
            console.error('Error loading filter options:', error);
        } finally {
            setIsLoadingFilters(false);
        }
    };

    const loadSchedule = async () => {
        setIsLoading(true);
        try {
            const params: SystemScheduleParams = {
                weekStart: currentWeekStart,
                days: viewMode === 'week' ? 7 : 31,
                timezone: 'Asia_Ho_Chi_Minh',
            };

            if (selectedTeacherId) params.teacherId = selectedTeacherId;
            if (selectedClassroomId) params.classroomId = selectedClassroomId;
            if (selectedStatus) params.status = selectedStatus;

            const data = await getSystemSchedule(params);
            setScheduleData(data);
        } catch (error) {
            console.error('Error loading schedule:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const goToPreviousWeek = () => {
        const date = new Date(currentWeekStart);
        const days = viewMode === 'week' ? 7 : 31;
        date.setDate(date.getDate() - days);
        setCurrentWeekStart(getMonday(date));
    };

    const goToNextWeek = () => {
        const date = new Date(currentWeekStart);
        const days = viewMode === 'week' ? 7 : 31;
        date.setDate(date.getDate() + days);
        setCurrentWeekStart(getMonday(date));
    };

    const goToToday = () => {
        setCurrentWeekStart(getMonday(new Date()));
    };

    const clearFilters = () => {
        setSelectedTeacherId('');
        setSelectedClassroomId('');
        setSelectedStatus('');
    };

    const getSessionStatusColor = (status: string) => {
        switch (status.toUpperCase()) {
            case 'SCHEDULED':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'COMPLETED':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'CANCELLED':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'IN_PROGRESS':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const formatTime = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const formatDayOfWeekLabel = (dayOfWeek: string): string => {
        const labels: Record<string, string> = {
            mon: 'Thứ Hai',
            tue: 'Thứ Ba',
            wed: 'Thứ Tư',
            thu: 'Thứ Năm',
            fri: 'Thứ Sáu',
            sat: 'Thứ Bảy',
            sun: 'Chủ Nhật',
        };
        return labels[dayOfWeek] || dayOfWeek;
    };

    const hasActiveFilters = selectedTeacherId || selectedClassroomId || selectedStatus;

    // Helper: Group sessions by time slot
    const getTimeSlot = (startTime: Date): string => {
        const hour = new Date(startTime).getHours();
        if (hour < 12) return 'morning'; // 0-11
        if (hour < 18) return 'afternoon'; // 12-17
        return 'evening'; // 18-23
    };

    const timeSlots = [
        { key: 'morning', label: '🌅 Sáng (6h-12h)', hours: [6, 7, 8, 9, 10, 11] },
        { key: 'afternoon', label: '☀️ Chiều (12h-18h)', hours: [12, 13, 14, 15, 16, 17] },
        { key: 'evening', label: '🌙 Tối (18h-22h)', hours: [18, 19, 20, 21] },
    ];

    const renderWeekTimeGrid = (days: any[]) => {
        return (
            <div>
                {timeSlots.map((slot) => (
                    <div key={slot.key} className="border-b border-gray-100 last:border-b-0">
                        {/* Slot Header */}
                        <div className="grid grid-cols-8">
                            <div className="p-4 bg-gray-50 border-r border-gray-200">
                                <div className="text-xs font-semibold text-gray-700">{slot.label}</div>
                            </div>

                            {/* Day Cells */}
                            {days.map((day, dayIndex) => {
                                const sessionsInSlot = day.sessions.filter((session: any) => {
                                    const hour = new Date(session.startTime).getHours();
                                    return slot.hours.includes(hour);
                                });

                                return (
                                    <div
                                        key={dayIndex}
                                        className="p-2 border-r border-gray-100 min-h-[120px] hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="space-y-1">
                                            {sessionsInSlot.map((session: any) => (
                                                <button
                                                    key={session.sessionId}
                                                    onClick={() => setSelectedSession(session)}
                                                    className={`w-full text-left p-2 rounded-md text-xs transition-all hover:shadow-sm border-l-3 ${session.state === 'ongoing'
                                                        ? 'bg-orange-50 border-orange-400 hover:bg-orange-100'
                                                        : session.state === 'completed'
                                                            ? 'bg-gray-100 border-gray-400 hover:bg-gray-200'
                                                            : 'bg-blue-50 border-blue-400 hover:bg-blue-100'
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="font-semibold text-gray-900 text-xs">
                                                            {formatTime(session.startTime)}
                                                        </span>
                                                        {session.state === 'ongoing' && (
                                                            <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                                                        )}
                                                    </div>
                                                    <div className="font-medium text-gray-900 truncate mb-0.5 text-xs">
                                                        {session.classroomName}
                                                    </div>
                                                    <div className="text-gray-600 truncate text-[10px]">
                                                        {session.course.title}
                                                    </div>
                                                </button>
                                            ))}
                                            {sessionsInSlot.length === 0 && (
                                                <div className="text-center text-gray-300 py-4 text-xs">
                                                    Trống
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
                                <Calendar className="w-8 h-8 text-indigo-600" />
                                <span>Lịch Hệ Thống</span>
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Quản lý lịch học toàn hệ thống
                            </p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${showFilters || hasActiveFilters
                                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <Filter className="w-4 h-4" />
                                <span>Bộ lọc</span>
                                {hasActiveFilters && (
                                    <span className="bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                        {[selectedTeacherId, selectedClassroomId, selectedStatus].filter(Boolean).length}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Filters */}
                    {showFilters && (
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Giáo viên
                                    </label>
                                    <select
                                        value={selectedTeacherId}
                                        onChange={(e) => setSelectedTeacherId(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        disabled={isLoadingFilters}
                                    >
                                        <option value="">Tất cả giáo viên</option>
                                        {teachers.map((teacher) => (
                                            <option key={teacher.id} value={teacher.id}>
                                                {teacher.firstName} {teacher.lastName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Lớp học
                                    </label>
                                    <select
                                        value={selectedClassroomId}
                                        onChange={(e) => setSelectedClassroomId(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        disabled={isLoadingFilters}
                                    >
                                        <option value="">Tất cả lớp học</option>
                                        {classrooms.map((classroom) => (
                                            <option key={classroom.id} value={classroom.id}>
                                                {classroom.name} ({classroom.classCode || classroom.code || 'N/A'})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Trạng thái
                                    </label>
                                    <select
                                        value={selectedStatus}
                                        onChange={(e) => setSelectedStatus(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="">Tất cả trạng thái</option>
                                        <option value="SCHEDULED">Đã lên lịch</option>
                                        <option value="COMPLETED">Hoàn thành</option>
                                        <option value="CANCELLED">Đã hủy</option>
                                        <option value="IN_PROGRESS">Đang diễn ra</option>
                                    </select>
                                </div>
                            </div>
                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                                >
                                    Xóa tất cả bộ lọc
                                </button>
                            )}
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={goToPreviousWeek}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={goToToday}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                Hôm nay
                            </button>
                            <button
                                onClick={goToNextWeek}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="text-lg font-semibold text-gray-900">
                            {scheduleData && (
                                <>
                                    {scheduleData.weekStart} - {scheduleData.weekEnd}
                                    <span className="text-sm text-gray-500 ml-2">
                                        ({scheduleData.summary.totalSessions} buổi học)
                                    </span>
                                </>
                            )}
                        </div>

                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setViewMode('week')}
                                className={`px-4 py-2 rounded-lg transition-colors ${viewMode === 'week'
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                Tuần
                            </button>
                            <button
                                onClick={() => setViewMode('month')}
                                className={`px-4 py-2 rounded-lg transition-colors ${viewMode === 'month'
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                Tháng
                            </button>
                        </div>
                    </div>
                </div>

                {/* Loading */}
                {isLoading && (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                    </div>
                )}

                {/* Schedule Grid */}
                {!isLoading && scheduleData && (
                    <>
                        {viewMode === 'week' ? (
                            // Week View: Time Grid (GitHub-style with time slots)
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                {/* Header Row */}
                                <div className="grid grid-cols-8 border-b border-gray-300">
                                    <div className="p-3 bg-gray-100 border-r border-gray-300 text-xs font-semibold text-gray-700">
                                        Thời gian
                                    </div>
                                    {scheduleData.days.map((day, index) => {
                                        const dayLabel = formatDayOfWeekLabel(day.dayOfWeek);
                                        const dateStr = new Date(day.date).toLocaleDateString('vi-VN', {
                                            day: '2-digit',
                                            month: '2-digit'
                                        });
                                        return (
                                            <div
                                                key={index}
                                                className="p-3 bg-gray-100 border-r border-gray-300 text-center"
                                            >
                                                <div className="text-xs font-semibold text-gray-900">{dayLabel}</div>
                                                <div className="text-xs text-gray-600 mt-1">{dateStr}</div>
                                                <div className="text-xs text-gray-700 font-medium mt-1">
                                                    {day.sessions.length} buổi
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Time Slots */}
                                {renderWeekTimeGrid(scheduleData.days)}
                            </div>
                        ) : (
                            // Month View: Calendar Grid (GitHub contribution style)
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="grid grid-cols-7 gap-2">
                                    {/* Day Headers */}
                                    {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day) => (
                                        <div key={day} className="text-center text-xs font-semibold text-gray-700 py-2">
                                            {day}
                                        </div>
                                    ))}

                                    {/* Calendar Days */}
                                    {scheduleData.days.map((day, index) => {
                                        const sessionCount = day.sessions.length;
                                        const intensity = sessionCount === 0 ? 0 : Math.min(Math.ceil(sessionCount / 2), 4);
                                        return (
                                            <div
                                                key={index}
                                                className={`rounded-lg border transition-all relative min-h-[120px] p-2 ${intensity === 0
                                                    ? 'bg-white border-gray-200'
                                                    : intensity === 1
                                                        ? 'bg-blue-50 border-blue-200'
                                                        : intensity === 2
                                                            ? 'bg-blue-100 border-blue-300'
                                                            : intensity === 3
                                                                ? 'bg-blue-200 border-blue-400'
                                                                : 'bg-blue-300 border-blue-500'
                                                    }`}
                                            >
                                                {/* Day Number */}
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-bold text-gray-900">
                                                        {new Date(day.date).getDate()}
                                                    </span>
                                                    {sessionCount > 0 && (
                                                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-800 text-white">
                                                            {sessionCount}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Sessions List */}
                                                <div className="space-y-1 max-h-[80px] overflow-y-auto">
                                                    {day.sessions.map((session) => (
                                                        <button
                                                            key={session.sessionId}
                                                            onClick={() => setSelectedSession(session)}
                                                            className={`w-full text-left p-1.5 rounded text-xs transition-all hover:shadow-sm border-l-2 ${session.state === 'ongoing'
                                                                ? 'bg-orange-100 border-orange-400 hover:bg-orange-200'
                                                                : session.state === 'completed'
                                                                    ? 'bg-gray-100 border-gray-400 hover:bg-gray-200'
                                                                    : 'bg-white border-blue-400 hover:bg-blue-50'
                                                                }`}
                                                        >
                                                            <div className="flex items-center justify-between mb-0.5">
                                                                <span className="font-semibold text-gray-900 text-[10px]">
                                                                    {formatTime(session.startTime)}
                                                                </span>
                                                                {session.state === 'ongoing' && (
                                                                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></span>
                                                                )}
                                                            </div>
                                                            <div className="text-gray-900 font-medium truncate text-[10px]">
                                                                {session.classroomName}
                                                            </div>
                                                        </button>
                                                    ))}
                                                    {sessionCount === 0 && (
                                                        <div className="text-center text-gray-400 text-xs py-4">
                                                            Không có buổi học
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Legend */}
                                <div className="flex items-center justify-center space-x-2 mt-6 pt-6 border-t border-gray-200">
                                    <span className="text-xs text-gray-600">Ít</span>
                                    <div className="w-4 h-4 bg-white border border-gray-200 rounded"></div>
                                    <div className="w-4 h-4 bg-blue-50 border border-blue-200 rounded"></div>
                                    <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
                                    <div className="w-4 h-4 bg-blue-200 border border-blue-400 rounded"></div>
                                    <div className="w-4 h-4 bg-blue-300 border border-blue-500 rounded"></div>
                                    <span className="text-xs text-gray-600">Nhiều</span>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Empty State */}
                {!isLoading && scheduleData && scheduleData.summary.totalSessions === 0 && (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Không có buổi học nào
                        </h3>
                        <p className="text-gray-600">
                            Không tìm thấy buổi học nào trong khoảng thời gian này với bộ lọc hiện tại.
                        </p>
                    </div>
                )}
            </div>

            {/* Session Detail Modal */}
            {selectedSession && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/20"
                        onClick={() => setSelectedSession(null)}
                    />
                    <div className="relative z-10 w-full max-w-2xl m-4 bg-white rounded-lg shadow-2xl max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 flex items-start justify-between">
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold mb-2">{selectedSession.title}</h2>
                                <div className="flex items-center space-x-2">
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-medium ${getSessionStatusColor(
                                            selectedSession.status
                                        )}`}
                                    >
                                        {selectedSession.stateLabel}
                                    </span>
                                    <span className="text-sm opacity-90">
                                        {selectedSession.classCode}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedSession(null)}
                                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 space-y-6">
                            {/* Time */}
                            <div className="flex items-start space-x-3">
                                <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <div className="text-sm font-medium text-gray-700">Thời gian</div>
                                    <div className="text-sm text-gray-900 mt-1">
                                        {formatTime(selectedSession.startTime)} -{' '}
                                        {formatTime(selectedSession.endTime)}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {new Date(selectedSession.startTime).toLocaleDateString('vi-VN', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Course */}
                            <div className="flex items-start space-x-3">
                                <BookOpen className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-gray-700">Khóa học</div>
                                    <div className="text-sm text-gray-900 mt-1">
                                        {selectedSession.course.title}
                                    </div>
                                    {selectedSession.course.description && (
                                        <div className="text-xs text-gray-600 mt-1">
                                            {selectedSession.course.description}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Classroom */}
                            <div className="flex items-start space-x-3">
                                <Users className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <div className="text-sm font-medium text-gray-700">Lớp học</div>
                                    <div className="text-sm text-gray-900 mt-1">
                                        {selectedSession.classroomName}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        Mã: {selectedSession.classCode}
                                    </div>
                                </div>
                            </div>

                            {/* Instructor */}
                            <div className="flex items-start space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                                    {selectedSession.instructor.firstName[0]}
                                    {selectedSession.instructor.lastName[0]}
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-gray-700">Giáo viên</div>
                                    <div className="text-sm text-gray-900 mt-1">
                                        {selectedSession.instructor.displayName ||
                                            `${selectedSession.instructor.firstName} ${selectedSession.instructor.lastName}`}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {selectedSession.instructor.email}
                                    </div>
                                </div>
                            </div>

                            {/* Type */}
                            <div className="flex items-start space-x-3">
                                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <div className="text-sm font-medium text-gray-700">Hình thức</div>
                                    <div className="text-sm text-gray-900 mt-1">
                                        {selectedSession.type === 'online' ? 'Trực tuyến' : selectedSession.type === 'offline' ? 'Trực tiếp' : 'Kết hợp'}
                                    </div>
                                </div>
                            </div>

                            {/* Meeting URL */}
                            {selectedSession.meetingUrl && (
                                <div className="flex items-start space-x-3">
                                    <Video className="w-5 h-5 text-gray-400 mt-0.5" />
                                    <div>
                                        <div className="text-sm font-medium text-gray-700">Link học trực tuyến</div>
                                        <a
                                            href={selectedSession.meetingUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-indigo-600 hover:text-indigo-800 underline mt-1 block"
                                        >
                                            Tham gia buổi học
                                        </a>
                                    </div>
                                </div>
                            )}

                            {/* Description */}
                            {selectedSession.description && (
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="text-sm font-medium text-gray-700 mb-2">Mô tả</div>
                                    <div className="text-sm text-gray-600 whitespace-pre-wrap">
                                        {selectedSession.description}
                                    </div>
                                </div>
                            )}

                            {/* Notes */}
                            {selectedSession.notes && (
                                <div className="bg-blue-50 rounded-lg p-4">
                                    <div className="text-sm font-medium text-gray-700 mb-2">Ghi chú</div>
                                    <div className="text-sm text-gray-600 whitespace-pre-wrap">
                                        {selectedSession.notes}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SchedulePage;
