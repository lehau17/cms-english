import { transferStudent, TransferStudentPayload, TransferStudentResponse } from '@/apis/classroom';
import { useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * Hook để chuyển học sinh từ lớp này sang lớp khác
 */
export const useTransferStudent = () => {
    const queryClient = useQueryClient();

    return useMutation<TransferStudentResponse, Error, TransferStudentPayload>({
        mutationFn: (payload: TransferStudentPayload) => transferStudent(payload),
        onSuccess: (_, variables) => {
            // Invalidate cả 2 classroom (current và new) để refresh danh sách học sinh
            queryClient.invalidateQueries({
                queryKey: ['classroom-detail', variables.currentClassroomId],
            });
            queryClient.invalidateQueries({
                queryKey: ['classroom-detail', variables.newClassroomId],
            });
            queryClient.invalidateQueries({ queryKey: ['classrooms'] });
        },
    });
};
