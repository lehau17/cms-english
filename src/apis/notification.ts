import axiosInstance from "../config/axiosConfig";

export interface CreateClassroomAnnouncementPayload {
    classroomId: string;
    title: string;
    content: string;
}

export interface CreateClassroomAnnouncementResponse {
    count: number;
    notificationIds: string[];
}

/**
 * Gửi thông báo đến tất cả học sinh trong lớp học
 * @param payload { classroomId, title, content }
 * @returns { count, notificationIds }
 */
export const createClassroomAnnouncement = async (
    payload: CreateClassroomAnnouncementPayload
): Promise<CreateClassroomAnnouncementResponse> => {
    const response = await axiosInstance.post<{
        statusCode: number;
        message: string;
        data: CreateClassroomAnnouncementResponse;
    }>("/private/v1/notifications/classroom-announcement", payload);
    return response.data.data;
};
