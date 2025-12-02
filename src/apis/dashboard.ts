import axiosInstance from "../config/axiosConfig";

// ==================== ADMIN DASHBOARD ====================

export interface RegistrationTrendPoint {
    date: string;
    count: number;
}

export interface RevenueTrendPoint {
    date: string;
    amount: number;
}

export interface CourseDistributionItem {
    label: string;
    value: number;
}

export interface TopCourseItem {
    id: string;
    title: string;
    enrollments: number;
    revenue: number;
}

export interface UpcomingClassItem {
    id: string;
    classroomName: string;
    courseTitle?: string;
    teacherName: string;
    startTime: string;
    endTime: string;
    roomName?: string | null;
    activeStudents: number;
    maxStudents?: number | null;
}

export interface RecentStudentItem {
    id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    displayName?: string;
}

export interface DashboardNotificationItem {
    id: string;
    title: string;
    message?: string | null;
    type: "success" | "warning" | "error" | "info";
    createdAt: string;
}

export interface AdminDashboardData {
    // Basic stats
    totalStudents: number;
    totalCourses: number;
    totalLessons: number;
    totalActivities: number;
    // Extended stats (NEW)
    totalTeachers: number;
    totalParents: number;
    totalClassrooms: number;
    activeClassrooms: number;
    totalRevenue: number;
    revenueThisMonth: number;
    averageCourseCompletionRate: number;
    pendingSubmissions: number;
    // Lists
    recentStudents: RecentStudentItem[];
    registrationTrend: RegistrationTrendPoint[];
    courseDistribution: CourseDistributionItem[];
    upcomingClasses: UpcomingClassItem[];
    notifications: DashboardNotificationItem[];
    // New lists
    revenueTrend: RevenueTrendPoint[];
    topCourses: TopCourseItem[];
}

export const getAdminDashboardData = async (): Promise<AdminDashboardData> => {
    const response = await axiosInstance.get<{
        statusCode: number;
        message: string;
        data: AdminDashboardData;
    }>("/private/v1/dashboard");

    return response.data.data;
};

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
    }>("/private/v1/dashboard/teacher");

    return response.data.data;
};
