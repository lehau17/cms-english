import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { approveLinkRequest, getPendingRequests, GetPendingRequestsParams, rejectLinkRequest } from '../apis/parent-child';

const QUERY_KEY = 'link-requests';

/**
 * Hook để lấy danh sách các link request đang pending
 */
export const useGetPendingRequests = (params: GetPendingRequestsParams) => {
    return useQuery({
        queryKey: [QUERY_KEY, 'pending', params],
        queryFn: () => getPendingRequests(params),
    });
};

/**
 * Hook để approve link request
 */
export const useApproveLinkRequest = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (requestId: string) => approveLinkRequest(requestId),
        onSuccess: () => {
            // Invalidate tất cả query với key 'link-requests' để refresh data
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
        },
    });
};

/**
 * Hook để reject link request
 */
export const useRejectLinkRequest = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (requestId: string) => rejectLinkRequest(requestId),
        onSuccess: () => {
            // Invalidate tất cả query với key 'link-requests' để refresh data
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
        },
    });
};

