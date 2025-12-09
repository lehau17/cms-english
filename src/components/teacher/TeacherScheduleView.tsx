
import { useTeacherSchedule } from '@/hooks/useTeacherSchedule';
import React, { useState } from 'react';
import ScheduleCalendar, { ScheduleDay, ScheduleSession } from '@/components/calendar/ScheduleCalendar';
import { Loader2 } from 'lucide-react';

interface TeacherScheduleViewProps {
    teacherId: string | null;
}

// Helper: Get Monday of a given week
const getMonday = (date: Date): string => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    d.setDate(diff);
    return d.toISOString().split('T')[0] || ''; // Return YYYY-MM-DD
};

const TeacherScheduleView: React.FC<TeacherScheduleViewProps> = ({ teacherId }) => {
    const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
    const [currentWeekStart, setCurrentWeekStart] = useState<string>(getMonday(new Date()));

    const { data: scheduleData, isLoading } = useTeacherSchedule(
        teacherId,
        currentWeekStart, // Pass dynamic week start
        undefined,
        'Asia_Ho_Chi_Minh',
        viewMode === 'week' ? 7 : 31, // Adjust days based on view mode
        !!teacherId
    );

    // Transform TeacherScheduleDay[] to ScheduleDay[]
    const days: ScheduleDay[] = scheduleData?.days.map(d => ({
        date: d.date,
        dayOfWeek: d.dayOfWeek,
        sessions: d.sessions.map(s => {
            const transformedSession: ScheduleSession = {
                sessionId: s.sessionId,
                classroomId: s.classroomId,
                classroomName: s.classroomName,
                classCode: '', // Not in TeacherSession, default empty
                title: s.title,
                description: s.description,
                status: s.status,
                type: s.type,
                startTime: s.startTime,
                endTime: s.endTime,
                timezone: s.timezone,
                meetingUrl: s.meetingUrl,
                notes: null, // Not in TeacherSession
                state: s.state,
                stateLabel: s.stateLabel,
                course: s.course ? {
                    title: s.course.title,
                    description: s.course.description
                } : null,
                instructor: s.instructor ? {
                    firstName: s.instructor.displayName?.split(' ')[0] || 'Teacher',
                    lastName: s.instructor.displayName?.split(' ').slice(1).join(' ') || '',
                    displayName: s.instructor.displayName,
                    email: '', // Not in SessionInstructor
                    avatarUrl: s.instructor.avatarUrl
                } : null
            };
            return transformedSession;
        })
    })) || [];

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                </div>
            ) : (
                <div className="p-4">
                    <ScheduleCalendar
                        days={days}
                        weekStart={scheduleData?.weekStart || ''}
                        weekEnd={scheduleData?.weekEnd || ''}
                        totalSessions={scheduleData?.summary.totalSessions || 0}
                        viewMode={viewMode}
                        onViewModeChange={setViewMode}
                        currentWeekStart={currentWeekStart}
                        onWeekChange={setCurrentWeekStart}
                    />
                </div>
            )}
        </div>
    );
};

export default TeacherScheduleView;
