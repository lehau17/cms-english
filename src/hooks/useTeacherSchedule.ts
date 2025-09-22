import { getTeacherSchedule } from '@/apis/teacher-schedule';
import { TeacherWeeklySchedule } from '@/interface/teacher-schedule.interface';
import { useQuery } from '@tanstack/react-query';

export const useTeacherSchedule = (
  teacherId: string | null,
  weekStart?: string,
  weekEnd?: string,
  enabled: boolean = true
) => {
  return useQuery<TeacherWeeklySchedule>({
    queryKey: ['teacher-schedule', teacherId, weekStart, weekEnd],
    queryFn: () => getTeacherSchedule(teacherId!, weekStart, weekEnd),
    enabled: enabled && !!teacherId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
