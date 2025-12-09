import { getStudentSchedule } from '@/apis/student-schedule';
import ScheduleCalendar, { ScheduleDay, ScheduleSession } from '@/components/calendar/ScheduleCalendar';
import { StudentWeeklySchedule } from '@/interface/student-schedule.interface';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import React, { useState } from 'react';

interface StudentScheduleViewProps {
    studentId: string;
}

// Helper: Get Monday of a given week
const getMonday = (date: Date): string => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    d.setDate(diff);
    return d.toISOString().split('T')[0] || ''; // Return YYYY-MM-DD
};

const StudentScheduleView: React.FC<StudentScheduleViewProps> = ({ studentId }) => {
    const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
    const [currentWeekStart, setCurrentWeekStart] = useState<string>(getMonday(new Date()));

    const { data: scheduleData, isLoading } = useQuery<StudentWeeklySchedule>({
        queryKey: ['student-schedule', studentId, currentWeekStart],
        queryFn: () => getStudentSchedule(studentId, currentWeekStart),
        enabled: !!studentId
    });

    // Transform StudentWeeklySchedule to ScheduleDay[]
    // Explicitly set all required ScheduleSession properties
    const days: ScheduleDay[] = scheduleData?.days.map(d => ({
        date: d.date,
        dayOfWeek: d.dayOfWeek,
        sessions: d.sessions.map(s => {
            const session: ScheduleSession = {
                sessionId: s.id,
                classroomId: s.classroomId,
                classroomName: s.classroomName,
                classCode: '',
                title: s.title,
                description: s.description,
                status: s.status,
                type: 'offline', // Default, student schedule might not have type
                startTime: s.startTime,
                endTime: s.endTime,
                timezone: 'Asia_Ho_Chi_Minh',
                meetingUrl: null,
                notes: null,
                state: s.state,
                stateLabel: s.state.charAt(0).toUpperCase() + s.state.slice(1),
                course: s.course ? {
                    title: s.course.title,
                    description: s.course.description
                } : null,
                instructor: s.instructor ? {
                    firstName: s.instructor.displayName?.split(' ')[0] || 'Teacher',
                    lastName: s.instructor.displayName?.split(' ').slice(1).join(' ') || '',
                    displayName: s.instructor.displayName,
                    email: '',
                    avatarUrl: s.instructor.avatarUrl
                } : null
            };
            return session;
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

export default StudentScheduleView;
