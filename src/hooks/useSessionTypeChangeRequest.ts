import {
  cancelTypeChangeRequest,
  createTypeChangeRequest,
  CreateTypeChangeRequestDto,
  getAllTypeChangeRequests,
  getMyTypeChangeRequests,
  getPendingTypeChangeRequestBySession,
  getPendingTypeChangeRequests,
  getSessionTypeChangeRequests,
  getTypeChangeRequestById,
  QueryTypeChangeRequestDto,
  reviewTypeChangeRequest,
  ReviewTypeChangeRequestDto,
} from '@/apis/session-type-change-request';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const QUERY_KEY = 'type-change-requests';

/**
 * Hook to get my type change requests (Teacher)
 */
export const useMyTypeChangeRequests = (params: QueryTypeChangeRequestDto = {}) => {
  return useQuery({
    queryKey: [QUERY_KEY, 'my', params],
    queryFn: () => getMyTypeChangeRequests(params),
  });
};

/**
 * Hook to get all type change requests (Admin) - with optional status filter
 */
export const useAllTypeChangeRequests = (params: QueryTypeChangeRequestDto = {}) => {
  return useQuery({
    queryKey: [QUERY_KEY, 'all', params],
    queryFn: () => getAllTypeChangeRequests(params),
  });
};

/**
 * Hook to get pending type change requests (Admin)
 */
export const usePendingTypeChangeRequests = (params: QueryTypeChangeRequestDto = {}) => {
  return useQuery({
    queryKey: [QUERY_KEY, 'pending', params],
    queryFn: () => getPendingTypeChangeRequests(params),
  });
};

/**
 * Hook to get type change requests for a session
 */
export const useSessionTypeChangeRequests = (
  sessionId: string | null,
  params: QueryTypeChangeRequestDto = {},
) => {
  return useQuery({
    queryKey: [QUERY_KEY, 'session', sessionId, params],
    queryFn: () => getSessionTypeChangeRequests(sessionId!, params),
    enabled: !!sessionId,
  });
};

/**
 * Hook to get type change request by ID
 */
export const useTypeChangeRequestById = (id: string | null) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => getTypeChangeRequestById(id!),
    enabled: !!id,
  });
};

/**
 * Hook to create a type change request
 */
export const useCreateTypeChangeRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionId,
      data,
    }: {
      sessionId: string;
      data: CreateTypeChangeRequestDto;
    }) => createTypeChangeRequest(sessionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['classroom-sessions'] });
      toast.success('Type change request submitted successfully');
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || 'Failed to submit type change request';
      toast.error(message);
    },
  });
};

/**
 * Hook to review (approve/reject) a type change request
 */
export const useReviewTypeChangeRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReviewTypeChangeRequestDto }) =>
      reviewTypeChangeRequest(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['classroom-sessions'] });
      toast.success(
        `Request ${variables.data.status === 'approved' ? 'approved' : 'rejected'} successfully`,
      );
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to review request';
      toast.error(message);
    },
  });
};

/**
 * Hook to cancel a type change request
 */
export const useCancelTypeChangeRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelTypeChangeRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Request cancelled successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to cancel request';
      toast.error(message);
    },
  });
};

/**
 * Hook to get pending request by sessionId (Teacher)
 */
export const usePendingTypeChangeRequestBySession = (sessionId: string | null) => {
  return useQuery({
    queryKey: [QUERY_KEY, 'pending', 'session', sessionId],
    queryFn: () => getPendingTypeChangeRequestBySession(sessionId!),
    enabled: !!sessionId,
  });
};

/**
 * Hook to get pending type change request count (Admin)
 * Optimized for badge display
 */
export const usePendingTypeChangeRequestCount = () => {
  return useQuery({
    queryKey: [QUERY_KEY, 'pending', 'count'],
    queryFn: async () => {
      const data = await getPendingTypeChangeRequests({ page: 1, limit: 1 });
      return data.total || 0;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};
