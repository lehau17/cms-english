import { getMediaById, getMediaList, searchMedia, type MediaListParams } from '@/apis/media';
import { useQuery } from '@tanstack/react-query';

export function useMediaList(params?: MediaListParams) {
  return useQuery({
    queryKey: ['media', 'list', params],
    queryFn: () => getMediaList(params),
  });
}

export function useMediaById(id: string | undefined) {
  return useQuery({
    queryKey: ['media', id],
    queryFn: () => getMediaById(id!),
    enabled: !!id,
  });
}

export function useMediaSearch(
  query: string,
  params?: { type?: string; category?: string; page?: number; limit?: number },
) {
  return useQuery({
    queryKey: ['media', 'search', query, params],
    queryFn: () => searchMedia(query, params),
    enabled: !!query && query.length > 0,
  });
}








