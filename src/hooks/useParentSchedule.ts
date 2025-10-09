import { ParentChildrenSchedule } from '@/interface/parent-schedule.interface';
import { getParentChildrenSchedule } from '@/services/parent-schedule.service';
import { useQuery } from '@tanstack/react-query';

export const useParentChildrenSchedule = (
  parentId: string,
  weekStart?: string,
  weekEnd?: string,
  enabled: boolean = true
) => {
  return useQuery<ParentChildrenSchedule>({
    queryKey: ['parent-children-schedule', parentId, weekStart, weekEnd],
    queryFn: () => getParentChildrenSchedule(parentId, weekStart, weekEnd),
    enabled: enabled && !!parentId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
