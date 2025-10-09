import { getTeacherSchedule } from '@/apis/teacher-schedule';
import { TeacherWeeklySchedule } from '@/interface/teacher-schedule.interface';
import { useQuery } from '@tanstack/react-query';

export const useTeacherSchedule = (
  teacherId: string | null,
  weekStart?: string,
  weekEnd?: string,
  timezone: string = 'Asia_Ho_Chi_Minh',
  days: number = 7,
  enabled: boolean = true
) => {
  return useQuery<TeacherWeeklySchedule>({
    queryKey: ['teacher-schedule', teacherId, weekStart, weekEnd, timezone, days],
    queryFn: () => getTeacherSchedule(teacherId!, weekStart, weekEnd, timezone, days),
    enabled: enabled && !!teacherId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
