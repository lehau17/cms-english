import { ApiResponse } from "@/interface/base-response.interface";
import axiosInstance from "../config/axiosConfig";
import { CreateBroadcastNotificationDto, GetNotificationsQuery, Notification } from "../interface/notification.interface";
import { PageResponseDto } from "../interface/pagination.inerface";

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

export const getNotifications = async (params: GetNotificationsQuery): Promise<PageResponseDto<Notification>> => {
    const response = await axiosInstance.get<PageResponseDto<Notification>>("/private/v1/notifications", { params });
    return response.data;
};

export const broadcastNotification = async (data: CreateBroadcastNotificationDto): Promise<ApiResponse<{ count: number }>> => {
    const response = await axiosInstance.post<ApiResponse<{ count: number }>>("/private/v1/notifications/broadcast", data);
    return response.data;
};
