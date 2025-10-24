import {
    createClassroomAnnouncement,
    CreateClassroomAnnouncementPayload,
    CreateClassroomAnnouncementResponse,
} from '@/apis/notification';
import { useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * Hook để gửi thông báo đến tất cả học sinh trong lớp
 */
export const useCreateClassroomAnnouncement = () => {
    const queryClient = useQueryClient();

    return useMutation<
        CreateClassroomAnnouncementResponse,
        Error,
        CreateClassroomAnnouncementPayload
    >({
        mutationFn: (payload: CreateClassroomAnnouncementPayload) =>
            createClassroomAnnouncement(payload),
        onSuccess: (_, variables) => {
            // Invalidate các query liên quan nếu cần
            // Ví dụ: invalidate classroom detail để refresh thông tin
            queryClient.invalidateQueries({ queryKey: ['classroom-detail', variables.classroomId] });
        },
    });
};

