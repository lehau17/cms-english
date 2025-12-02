import {
    AdminDashboardData,
    CourseDistributionItem,
    DashboardNotificationItem,
    getAdminDashboardData,
    getTeacherDashboardData,
    RegistrationTrendPoint,
    RevenueTrendPoint,
    TeacherDashboardData,
    TopCourseItem,
    UpcomingClassItem,
} from "@/apis/dashboard";
import { useQuery, UseQueryResult } from "@tanstack/react-query";

type DashboardStats = Pick<AdminDashboardData, "totalStudents" | "totalCourses" | "totalLessons" | "totalActivities">;

type ExtendedDashboardStats = Pick<AdminDashboardData,
    "totalStudents" | "totalCourses" | "totalLessons" | "totalActivities" |
    "totalTeachers" | "totalParents" | "totalClassrooms" | "activeClassrooms" |
    "totalRevenue" | "revenueThisMonth" | "averageCourseCompletionRate" | "pendingSubmissions"
>;

type RecentStudentForUI = {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    displayName?: string;
};

const ADMIN_DASHBOARD_QUERY_KEY = ["admin-dashboard"] as const;

const useAdminDashboardQuery = <TSelected = AdminDashboardData>(
    select?: (data: AdminDashboardData) => TSelected
): UseQueryResult<TSelected, Error> => {
    return useQuery<AdminDashboardData, Error, TSelected>({
        queryKey: ADMIN_DASHBOARD_QUERY_KEY,
        queryFn: getAdminDashboardData,
        staleTime: 1000 * 60 * 5, // 5 phút
        refetchOnWindowFocus: true,
        select,
    });
};

/**
 * Hook để lấy dữ liệu dashboard của giáo viên
 */
export const useGetTeacherDashboardData = () => {
    return useQuery<TeacherDashboardData, Error>({
        queryKey: ["teacher-dashboard"],
        queryFn: getTeacherDashboardData,
        staleTime: 1000 * 60 * 5, // 5 phút
        refetchOnWindowFocus: true,
    });
};

/**
 * Hook để lấy thống kê dashboard cơ bản (Admin Dashboard)
 */
export const useDashboardStats = () =>
    useAdminDashboardQuery<DashboardStats>((data) => ({
        totalStudents: data.totalStudents,
        totalCourses: data.totalCourses,
        totalLessons: data.totalLessons,
        totalActivities: data.totalActivities,
    }));

/**
 * Hook để lấy thống kê dashboard mở rộng (Admin Dashboard)
 */
export const useExtendedDashboardStats = () =>
    useAdminDashboardQuery<ExtendedDashboardStats>((data) => ({
        totalStudents: data.totalStudents,
        totalCourses: data.totalCourses,
        totalLessons: data.totalLessons,
        totalActivities: data.totalActivities,
        totalTeachers: data.totalTeachers ?? 0,
        totalParents: data.totalParents ?? 0,
        totalClassrooms: data.totalClassrooms ?? 0,
        activeClassrooms: data.activeClassrooms ?? 0,
        totalRevenue: data.totalRevenue ?? 0,
        revenueThisMonth: data.revenueThisMonth ?? 0,
        averageCourseCompletionRate: data.averageCourseCompletionRate ?? 0,
        pendingSubmissions: data.pendingSubmissions ?? 0,
    }));

/**
 * Hook để lấy phân bố khóa học (Admin Dashboard)
 */
export const useCourseDistribution = () =>
    useAdminDashboardQuery<CourseDistributionItem[]>((data) => data.courseDistribution ?? []);

/**
 * Hook để lấy thông báo (Admin Dashboard)
 */
export const useNotifications = () =>
    useAdminDashboardQuery<DashboardNotificationItem[]>((data) => data.notifications ?? []);

/**
 * Hook để lấy lớp học sắp tới (Admin Dashboard)
 */
export const useUpcomingClasses = () =>
    useAdminDashboardQuery<UpcomingClassItem[]>((data) => data.upcomingClasses ?? []);

/**
 * Hook để lấy xu hướng đăng ký (Admin Dashboard)
 */
export const useRegistrationTrend = () =>
    useAdminDashboardQuery<RegistrationTrendPoint[]>((data) => data.registrationTrend ?? []);

/**
 * Hook để lấy xu hướng doanh thu (Admin Dashboard) - NEW
 */
export const useRevenueTrend = () =>
    useAdminDashboardQuery<RevenueTrendPoint[]>((data) => data.revenueTrend ?? []);

/**
 * Hook để lấy top khóa học (Admin Dashboard) - NEW
 */
export const useTopCourses = () =>
    useAdminDashboardQuery<TopCourseItem[]>((data) => data.topCourses ?? []);

/**
 * Hook để lấy học sinh mới (Admin Dashboard)
 */
export const useRecentStudents = () =>
    useAdminDashboardQuery<RecentStudentForUI[]>((data) =>
        (data.recentStudents ?? []).map((student, index) => {
            const fallbackName = student.displayName ?? student.email ?? "Học viên";
            const firstName = student.firstName && student.firstName.trim().length > 0 ? student.firstName : fallbackName;
            const lastName = student.lastName ?? "";

            return {
                id: student.id ?? student.email ?? student.displayName ?? `unknown-${index}`,
                firstName,
                lastName,
                email: student.email ?? "",
                displayName: student.displayName,
            };
        })
    );
