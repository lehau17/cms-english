import { getStudentSchedule } from '@/apis/student-schedule';
import { StudentWeeklySchedule } from '@/interface/student-schedule.interface';
import { useQuery } from '@tanstack/react-query';

export const useStudentSchedule = (
  studentId: string | null,
  weekStart?: string,
  weekEnd?: string,
  enabled: boolean = true
) => {
  return useQuery<StudentWeeklySchedule>({
    queryKey: ['student-schedule', studentId, weekStart, weekEnd],
    queryFn: () => getStudentSchedule(studentId!, weekStart, weekEnd),
    enabled: enabled && !!studentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

export const useStudentWeeklySchedule = (
  studentId: string,
  weekStart?: string,
  weekEnd?: string,
  enabled: boolean = true
) => {
  return useQuery<StudentWeeklySchedule>({
    queryKey: ['student-weekly-schedule', studentId, weekStart, weekEnd],
    queryFn: () => getStudentSchedule(studentId, weekStart, weekEnd),
    enabled: enabled && !!studentId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
