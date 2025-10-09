// Reuse same interfaces as student schedule for consistency
import { SessionActivity, SessionCourse, SessionInstructor, SessionScheduleInfo } from './student-schedule.interface';

export interface TeacherSession {
  sessionId: string;
  classroomId: string;
  classroomName: string;
  title: string;
  description: string | null;
  status: string;
  type: string;
  startTime: string;
  endTime: string;
  timezone: string;
  durationHours: number | null;
  meetingUrl: string | null;
  agenda: string | null;
  materials: any;
  instructor: SessionInstructor | null;
  state: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  stateLabel: string;
  startsInMinutes: number | null;
  endsInMinutes: number | null;
  course: SessionCourse | null;
  sessionSchedule: SessionScheduleInfo | null;
  activities: SessionActivity[];
}

export interface TeacherScheduleDay {
  date: string;
  dayOfWeek: string;
  label: string;
  sessions: TeacherSession[];
}

export interface TeacherWeeklySchedule {
  teacherId: string;
  timezone: string;
  weekStart: string;
  weekEnd: string;
  days: TeacherScheduleDay[];
  summary: {
    totalSessions: number;
    byState: Record<string, number>;
  };
}
