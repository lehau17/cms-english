import {
    cancelRescheduleRequest,
    createRescheduleRequest,
    getAllRescheduleRequests,
    getClassroomRescheduleRequests,
    getMyRescheduleRequests,
    getPendingRequestBySession,
    getPendingRescheduleRequests,
    getRescheduleRequestById,
    getSessionRescheduleRequests,
    QueryRescheduleRequestDto,
    reviewRescheduleRequest,
    ReviewRescheduleRequestDto,
    updateRescheduleRequest,
} from '@/apis/reschedule';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const QUERY_KEY = 'reschedule-requests';

/**
 * Hook to get my reschedule requests (Teacher)
 */
export const useMyRescheduleRequests = (params: QueryRescheduleRequestDto = {}) => {
    return useQuery({
        queryKey: [QUERY_KEY, 'my', params],
        queryFn: () => getMyRescheduleRequests(params),
    });
};

/**
 * Hook to get all reschedule requests (Admin) - with optional status filter
 */
export const useAllRescheduleRequests = (params: QueryRescheduleRequestDto = {}) => {
    return useQuery({
        queryKey: [QUERY_KEY, 'all', params],
        queryFn: () => getAllRescheduleRequests(params),
    });
};

/**
 * Hook to get pending reschedule requests (Admin)
 */
export const usePendingRescheduleRequests = (params: QueryRescheduleRequestDto = {}) => {
    return useQuery({
        queryKey: [QUERY_KEY, 'pending', params],
        queryFn: () => getPendingRescheduleRequests(params),
    });
};

/**
 * Hook to get reschedule requests for a session
 */
export const useSessionRescheduleRequests = (
    sessionId: string,
    params: QueryRescheduleRequestDto = {},
) => {
    return useQuery({
        queryKey: [QUERY_KEY, 'session', sessionId, params],
        queryFn: () => getSessionRescheduleRequests(sessionId, params),
        enabled: !!sessionId,
    });
};

/**
 * Hook to get reschedule requests for a classroom
 */
export const useClassroomRescheduleRequests = (
    classroomId: string,
    params: QueryRescheduleRequestDto = {},
) => {
    return useQuery({
        queryKey: [QUERY_KEY, 'classroom', classroomId, params],
        queryFn: () => getClassroomRescheduleRequests(classroomId, params),
        enabled: !!classroomId,
    });
};

/**
 * Hook to get reschedule request by ID
 */
export const useRescheduleRequestById = (id: string | null) => {
    return useQuery({
        queryKey: [QUERY_KEY, id],
        queryFn: () => getRescheduleRequestById(id!),
        enabled: !!id,
    });
};

/**
 * Hook to create a reschedule request
 */
export const useCreateRescheduleRequest = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ sessionId, data }: { sessionId: string; data: Parameters<typeof createRescheduleRequest>[1] }) =>
            createRescheduleRequest(sessionId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
        },
    });
};

/**
 * Hook to review (approve/reject) a reschedule request
 */
export const useReviewRescheduleRequest = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: ReviewRescheduleRequestDto }) =>
            reviewRescheduleRequest(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
        },
    });
};

/**
 * Hook to cancel a reschedule request
 */
export const useCancelRescheduleRequest = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: cancelRescheduleRequest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
        },
    });
};

/**
 * Hook to get pending request by sessionId (Teacher)
 */
export const usePendingRequestBySession = (sessionId: string | null) => {
    return useQuery({
        queryKey: [QUERY_KEY, 'pending', 'session', sessionId],
        queryFn: () => getPendingRequestBySession(sessionId!),
        enabled: !!sessionId,
    });
};

/**
 * Hook to update a reschedule request
 */
export const useUpdateRescheduleRequest = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Parameters<typeof updateRescheduleRequest>[1]> }) =>
            updateRescheduleRequest(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
        },
    });
};

/**
 * Hook to get pending reschedule request count (Admin)
 * Optimized for badge display
 */
export const usePendingRescheduleRequestCount = () => {
    return useQuery({
        queryKey: [QUERY_KEY, 'pending', 'count'],
        queryFn: async () => {
            const data = await getPendingRescheduleRequests({ page: 1, limit: 1 });
            return data.total || 0;
        },
        refetchInterval: 30000, // Refetch every 30 seconds
    });
};

