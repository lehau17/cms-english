import axiosInstance from "../config/axiosConfig";

// ==================== TEACHER DASHBOARD ====================

export interface TeacherClassroomItem {
    id: string;
    name: string;
    classCode: string;
    status: string;
    studentsCount: number;
    maxStudents?: number | null;
    courseName?: string;
    nextSessionTime?: string | null;
}

export interface TeacherUpcomingSessionItem {
    id: string;
    classroomId: string;
    classroomName: string;
    startTime: string;
    endTime: string;
    roomName?: string | null;
    studentsCount: number;
    status: string;
}

export interface TeacherPendingSubmissionItem {
    id: string;
    assignmentId: string;
    assignmentTitle: string;
    studentName: string;
    studentEmail: string;
    submittedAt: string;
    classroomName: string;
}

export interface DashboardNotificationItem {
    id: string;
    title: string;
    message?: string | null;
    type: 'success' | 'warning' | 'error' | 'info';
    createdAt: string;
}

export interface TeacherDashboardData {
    totalActiveClassrooms: number;
    totalStudents: number;
    upcomingSessionsCount: number;
    pendingSubmissionsCount: number;
    activeClassrooms: TeacherClassroomItem[];
    upcomingSessions: TeacherUpcomingSessionItem[];
    pendingSubmissions: TeacherPendingSubmissionItem[];
    recentNotifications: DashboardNotificationItem[];
}

export const getTeacherDashboardData = async (): Promise<TeacherDashboardData> => {
    const response = await axiosInstance.get<{
        statusCode: number;
        message: string;
        data: TeacherDashboardData;
    }>('/private/v1/dashboard/teacher');
    return response.data.data;
};
