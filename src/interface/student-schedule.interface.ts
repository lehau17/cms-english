export interface SessionInstructor {
  id: string;
  displayName: string;
  avatarUrl: string | null;
}

export interface SessionCourse {
  id: string;
  title: string;
  description: string | null;
}

export interface SessionScheduleInfo {
  courseSessionScheduleId: string;
  sessionNumber: number;
}

export interface SessionActivity {
  activityId: string;
  orderNo: number;
}

export interface ScheduleSession {
  id: string;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string;
  status: string;
  classroomId: string;
  classroomName: string;
  instructor: SessionInstructor | null;
  state: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  startsInMinutes: number | null;
  endsInMinutes: number | null;
  course: SessionCourse | null;
  sessionSchedule: SessionScheduleInfo | null;
  activities: SessionActivity[];
}

export interface ScheduleDay {
  date: string;
  dayOfWeek: string;
  label: string;
  sessions: ScheduleSession[];
}

export interface StudentWeeklySchedule {
  studentId: string;
  timezone: string;
  weekStart: string;
  weekEnd: string;
  days: ScheduleDay[];
  summary: {
    totalSessions: number;
    byState: Record<string, number>;
  };
}
