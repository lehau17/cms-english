import {
    getSubmissionDetails,
    gradeSubmission,
    GradeSubmissionPayload,
    SubmissionDetail,
} from "@/apis/assignment";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

/**
 * Hook để lấy chi tiết bài nộp
 */
export const useGetSubmissionDetails = (submissionId: string | null) => {
    return useQuery<SubmissionDetail, Error>({
        queryKey: ['submission-details', submissionId],
        queryFn: () => {
            if (!submissionId) throw new Error('Submission ID is required');
            return getSubmissionDetails(submissionId);
        },
        enabled: !!submissionId,
        staleTime: 1000 * 60 * 2, // 2 phút
    });
};

/**
 * Hook để chấm điểm bài nộp
 */
export const useGradeSubmission = () => {
    const queryClient = useQueryClient();

    return useMutation<
        SubmissionDetail,
        Error,
        { submissionId: string; payload: GradeSubmissionPayload }
    >({
        mutationFn: ({ submissionId, payload }) =>
            gradeSubmission(submissionId, payload),
        onSuccess: (data, variables) => {
            toast.success("Đã chấm điểm bài tập thành công!");
            // Invalidate submission details to refresh
            queryClient.invalidateQueries({
                queryKey: ['submission-details', variables.submissionId],
            });
            // Invalidate teacher dashboard to update pending count
            queryClient.invalidateQueries({ queryKey: ['teacher-dashboard'] });
        },
        onError: (error) => {
            toast.error(`Lỗi khi chấm điểm: ${error.message}`);
        },
    });
};

