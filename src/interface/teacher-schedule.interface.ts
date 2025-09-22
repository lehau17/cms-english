export interface TeacherScheduleSlot {
  type: 'classroom_slot' | 'session';
  dayOfWeek: string;
  startMinuteOfDay: number;
  endMinuteOfDay: number;
  classroomId: string;
  classroomName: string;
  status: 'occupied' | 'available';
  sessionId?: string;
  sessionTitle?: string;
  sessionStatus?: string;
}

export interface TeacherWeeklySchedule {
  teacherId: string;
  weekStart: Date;
  weekEnd: Date;
  schedule: {
    [dayOfWeek: string]: TeacherScheduleSlot[];
  };
}
