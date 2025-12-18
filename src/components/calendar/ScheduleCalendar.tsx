import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, X, Clock, BookOpen, Users, Video, MapPin, Calendar, Sunrise, Sun, Moon, RefreshCw, PartyPopper } from 'lucide-react';
import RequestSessionTypeChangeModal from '@/components/schedule/RequestSessionTypeChangeModal';
import ChangeSessionTypeModal from '@/components/schedule/ChangeSessionTypeModal';
import holidayApi from '@/apis/holiday';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/interface/enum.interface';
import { useSessionTypeChange } from '@/hooks/useSessionTypeChange';
import { SessionType } from '@/interface/classroom.interface';
import toast from 'react-hot-toast';

// Common interfaces
export interface ScheduleSession {
    sessionId: string;
    classroomId: string;
    classroomName: string;
    classCode: string;
    title: string;
    description: string | null;
    status: string;
    type: string;
    startTime: string; // ISO string
    endTime: string; // ISO string
    timezone: string;
    meetingUrl: string | null;
    notes: string | null;
    course: {
        title: string;
        description?: string | null;
    } | null;
    instructor: {
        firstName: string;
        lastName: string;
        displayName?: string | null;
        email: string;
        avatarUrl?: string | null;
    } | null;
    state: string;
    stateLabel: string;
}

export interface ScheduleDay {
    date: Date | string;
    dayOfWeek: string;
    sessions: ScheduleSession[];
}

interface ScheduleCalendarProps {
    days: ScheduleDay[];
    weekStart: string;
    weekEnd: string;
    totalSessions: number;
    viewMode: 'week' | 'month';
    onViewModeChange: (mode: 'week' | 'month') => void;
    currentWeekStart: string;
    onWeekChange: (newStart: string) => void;
    title?: string;
    subtitle?: string;
}

const getSessionStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
        case 'SCHEDULED':
            return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'APP_SCHEDULED': // For teacher schedule
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

// Helper function: Get Monday of a given week
const getMonday = (date: Date): string => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    d.setDate(diff);
    return d.toISOString().split('T')[0] || ''; // Return YYYY-MM-DD
};

const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({
    days,
    weekStart,
    weekEnd,
    totalSessions,
    viewMode,
    onViewModeChange,
    currentWeekStart,
    onWeekChange,
    title,
    subtitle
}) => {
    const { user } = useAuth();
    const isTeacher = user?.role === UserRole.TEACHER;
    const isAdmin = user?.role === UserRole.ADMIN;
    const [selectedSession, setSelectedSession] = useState<ScheduleSession | null>(null);
    const [showTypeChangeRequest, setShowTypeChangeRequest] = useState(false);
    const [showChangeTypeModal, setShowChangeTypeModal] = useState(false);

    // Admin direct type change mutation
    const sessionTypeChangeMutation = useSessionTypeChange();

    // Fetch holidays
    // Calculate start and end year of the current view
    const { startYear, endYear } = useMemo(() => {
        const start = new Date(currentWeekStart);
        const end = new Date(start);
        if (viewMode === 'week') {
            end.setDate(end.getDate() + 6);
        } else {
            end.setDate(end.getDate() + 31); // Rough estimate for month view
        }
        return { startYear: start.getFullYear(), endYear: end.getFullYear() };
    }, [currentWeekStart, viewMode]);

    const [holidays, setHolidays] = useState<any[]>([]);

    useEffect(() => {
        const fetchHolidays = async () => {
            try {
                const yearsToFetch = new Set([startYear, endYear]);
                const promises = Array.from(yearsToFetch).map(year => holidayApi.getHolidays(year));

                const responses = await Promise.all(promises);

                // Merge holidays from all responses
                const allHolidays = responses.flatMap(res => res.data.data.holidays || []);

                setHolidays(allHolidays);
            } catch (error) {
                console.error('Error fetching holidays', error);
            }
        };
        fetchHolidays();
    }, [startYear, endYear]);

    // Helper to check holiday
    const getHolidayForDate = (date: Date | string) => {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        const dateStr = dateObj.toISOString().split('T')[0];
        return holidays.find(h => h.date === dateStr);
    };

    const timeSlots = [
        { key: 'morning', label: 'Sáng (6h-12h)', hours: [6, 7, 8, 9, 10, 11], icon: <Sunrise size={16} className="mr-1" /> },
        { key: 'afternoon', label: 'Chiều (12h-18h)', hours: [12, 13, 14, 15, 16, 17], icon: <Sun size={16} className="mr-1" /> },
        { key: 'evening', label: 'Tối (18h-22h)', hours: [18, 19, 20, 21], icon: <Moon size={16} className="mr-1" /> },
    ];

    const goToPreviousWeek = () => {
        const date = new Date(currentWeekStart);
        const diff = viewMode === 'week' ? 7 : 31;
        date.setDate(date.getDate() - diff);
        onWeekChange(getMonday(date));
    };

    const goToNextWeek = () => {
        const date = new Date(currentWeekStart);
        const diff = viewMode === 'week' ? 7 : 31;
        date.setDate(date.getDate() + diff);
        onWeekChange(getMonday(date));
    };

    const goToToday = () => {
        onWeekChange(getMonday(new Date()));
    };

    const renderWeekTimeGrid = () => {
        return (
            <div>
                {timeSlots.map((slot) => (
                    <div key={slot.key} className="border-b border-gray-100 last:border-b-0">
                        {/* Slot Header */}
                        <div className="grid grid-cols-8">
                            <div className="p-4 bg-gray-50 border-r border-gray-200">
                                <div className="text-xs font-semibold text-gray-700 flex items-center">{slot.icon}{slot.label}</div>
                            </div>

                            {/* Day Cells */}
                            {days.map((day, dayIndex) => {
                                const sessionsInSlot = day.sessions.filter((session) => {
                                    const hour = new Date(session.startTime).getHours();
                                    return slot.hours.includes(hour);
                                });

                                return (
                                    <div
                                        key={dayIndex}
                                        className="p-2 border-r border-gray-100 min-h-[120px] hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="space-y-1">
                                            {sessionsInSlot.map((session) => (
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
                                                        {session.course?.title || 'Unknown Course'}
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
        <div>
            {/* Navigation and Header */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    {/* Title Section (Optional) */}
                    {title && (
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
                                <Calendar className="w-8 h-8 text-indigo-600" />
                                <span>{title}</span>
                            </h1>
                            {subtitle && (
                                <p className="text-gray-600 mt-1">{subtitle}</p>
                            )}
                        </div>
                    )}

                    {/* Period Info */}
                    <div className="flex-1 text-center md:text-left">
                        <div className="text-lg font-semibold text-gray-900">
                            {weekStart} - {weekEnd}
                            <span className="text-sm text-gray-500 ml-2">
                                ({totalSessions} buổi học)
                            </span>
                        </div>
                    </div>


                    {/* Navigation Controls */}
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

                        <div className="border-l border-gray-300 h-6 mx-2"></div>

                        <button
                            onClick={() => onViewModeChange('week')}
                            className={`px-4 py-2 rounded-lg transition-colors ${viewMode === 'week'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            Tuần
                        </button>
                        <button
                            onClick={() => onViewModeChange('month')}
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

            {/* Calendar Grid */}
            {viewMode === 'week' ? (
                // Week View
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    {/* Header Row */}
                    <div className="grid grid-cols-8 border-b border-gray-300">
                        <div className="p-3 bg-gray-100 border-r border-gray-300 text-xs font-semibold text-gray-700">
                            Thời gian
                        </div>
                        {days.map((day, index) => {
                            const dayLabel = formatDayOfWeekLabel(day.dayOfWeek);
                            const dateObj = typeof day.date === 'string' ? new Date(day.date) : day.date;
                            const dateStr = dateObj.toLocaleDateString('vi-VN', {
                                day: '2-digit',
                                month: '2-digit'
                            });
                            const holiday = getHolidayForDate(day.date);

                            return (
                                <div
                                    key={index}
                                    className={`p-3 border-r border-gray-300 text-center relative ${holiday ? 'bg-red-50' : 'bg-gray-100'}`}
                                >
                                    {holiday && (
                                        <div className="absolute top-0 left-0 right-0 bg-red-500 text-white text-[10px] py-0.5 font-bold uppercase tracking-wider shadow-sm z-10">
                                            {holiday.name}
                                        </div>
                                    )}
                                    <div className={`text-xs font-semibold ${holiday ? 'text-red-700 mt-3' : 'text-gray-900'}`}>{dayLabel}</div>
                                    <div className={`text-xs mt-1 ${holiday ? 'text-red-600 font-medium' : 'text-gray-600'}`}>{dateStr}</div>
                                    <div className="text-xs text-gray-700 font-medium mt-1">
                                        {day.sessions.length} buổi
                                    </div>
                                    {holiday && (
                                        <div className="mt-1 flex justify-center text-red-500">
                                            <PartyPopper className="w-4 h-4" />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Time Slots */}
                    {renderWeekTimeGrid()}
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
                        {days.map((day, index) => {
                            const sessionCount = day.sessions.length;
                            const intensity = sessionCount === 0 ? 0 : Math.min(Math.ceil(sessionCount / 2), 4);
                            const dateObj = typeof day.date === 'string' ? new Date(day.date) : day.date;

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
                                            {dateObj.getDate()}
                                        </span>
                                        <div className="flex items-center gap-1">
                                            {(() => {
                                                const holiday = getHolidayForDate(day.date);
                                                if (!holiday) return null;
                                                return (
                                                    <div className="group relative">
                                                        <PartyPopper className="w-4 h-4 text-red-500 cursor-help" />
                                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                                                            {holiday.name}
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                            {sessionCount > 0 && (
                                                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-800 text-white">
                                                    {sessionCount}
                                                </span>
                                            )}
                                        </div>
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
                            {selectedSession.course && (
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
                            )}

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
                            {selectedSession.instructor && (
                                <div className="flex items-start space-x-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                                        {selectedSession.instructor.firstName?.[0] || 'T'}
                                        {selectedSession.instructor.lastName?.[0] || 'E'}
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
                            )}

                            {/* Type */}
                            <div className="flex items-start space-x-3">
                                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-gray-700">Hình thức</div>
                                    <div className="flex items-center justify-between mt-1">
                                        <div className="text-sm text-gray-900">
                                            {selectedSession.type === 'online' ? 'Trực tuyến' : selectedSession.type === 'offline' ? 'Trực tiếp' : 'Kết hợp'}
                                        </div>
                                        {isTeacher && selectedSession.state === 'upcoming' && (
                                            <button
                                                onClick={() => setShowTypeChangeRequest(true)}
                                                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
                                            >
                                                <RefreshCw className="w-3 h-3 mr-1" />
                                                Yêu cầu đổi hình thức
                                            </button>
                                        )}
                                        {isAdmin && selectedSession.state === 'upcoming' && (
                                            <button
                                                onClick={() => setShowChangeTypeModal(true)}
                                                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-md transition-colors"
                                            >
                                                <RefreshCw className="w-3 h-3 mr-1" />
                                                Đổi hình thức
                                            </button>
                                        )}
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

            {/* Request Type Change Modal (Teacher) */}
            {selectedSession && showTypeChangeRequest && (
                <RequestSessionTypeChangeModal
                    open={showTypeChangeRequest}
                    onClose={() => setShowTypeChangeRequest(false)}
                    session={{
                        id: selectedSession.sessionId,
                        title: selectedSession.title,
                        type: selectedSession.type as 'online' | 'offline' | 'hybrid'
                    }}
                />
            )}

            {/* Direct Type Change Modal (Admin) */}
            {selectedSession && showChangeTypeModal && (
                <ChangeSessionTypeModal
                    isOpen={showChangeTypeModal}
                    onClose={() => setShowChangeTypeModal(false)}
                    session={{
                        id: selectedSession.sessionId,
                        title: selectedSession.title,
                        type: selectedSession.type as SessionType,
                        meetingUrl: selectedSession.meetingUrl
                    }}
                    onConfirm={(sessionId, newType, generateMeetLink) => {
                        sessionTypeChangeMutation.mutate(
                            { sessionId, type: newType, generateMeetLink },
                            {
                                onSuccess: () => {
                                    toast.success('Đổi hình thức buổi học thành công');
                                    setShowChangeTypeModal(false);
                                    setSelectedSession(null);
                                },
                                onError: (error: any) => {
                                    toast.error(error?.response?.data?.message || 'Đổi hình thức thất bại');
                                }
                            }
                        );
                    }}
                    isLoading={sessionTypeChangeMutation.isPending}
                />
            )}
        </div>
    );
};

export default ScheduleCalendar;
