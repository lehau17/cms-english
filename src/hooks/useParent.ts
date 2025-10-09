import { getParentById } from '@/apis/parent';
import { Parent } from '@/interface/parent.interface';
import { useQuery } from '@tanstack/react-query';

export const useParent = (parentId: string) => {
  return useQuery<Parent>({
    queryKey: ['parent', parentId],
    queryFn: () => getParentById(parentId),
    enabled: !!parentId,
    staleTime: 5 * 60 * 1000,
  });
};
