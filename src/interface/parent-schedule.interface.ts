import { ScheduleSession } from './student-schedule.interface';

export interface ParentChild {
  id: string;
  username: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
}

export interface ChildSessionWithInfo extends ScheduleSession {
  childId: string;
  childName: string;
}

export interface ParentScheduleDay {
  date: string;
  dayOfWeek: string;
  label: string;
  sessions: ChildSessionWithInfo[];
}

export interface ChildScheduleSummary {
  childId: string;
  childName: string;
  childEmail: string;
  totalSessions: number;
  byState: Record<string, number>;
}

export interface ParentChildrenSchedule {
  parentId: string;
  children: ParentChild[];
  timezone: string;
  weekStart: string;
  weekEnd: string;
  combinedSchedule: {
    days: ParentScheduleDay[];
    summary: {
      totalSessions: number;
      byState: Record<string, number>;
    };
  };
  childrenSchedules: ChildScheduleSummary[];
}
