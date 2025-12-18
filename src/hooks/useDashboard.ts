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

// ==========================================
// MOCK DATA CONFIGURATION
// ==========================================
const USE_MOCK_DATA = true; // Toggle this to false to use real API

const MOCK_ADMIN_DASHBOARD_DATA: AdminDashboardData = {
    totalStudents: 5240,
    totalCourses: 45,
    totalLessons: 1250,
    totalActivities: 8500,
    totalTeachers: 32,
    totalParents: 1560,
    totalClassrooms: 28,
    activeClassrooms: 15,
    totalRevenue: 3850000000,
    revenueThisMonth: 450000000,
    averageCourseCompletionRate: 68.5,
    pendingSubmissions: 24,
    recentStudents: [
        { id: "1", firstName: "Nguyễn", lastName: "Văn An", email: "an.nguyen@example.com", displayName: "An Nguyen" },
        { id: "2", firstName: "Trần", lastName: "Thị Bình", email: "binh.tran@example.com", displayName: "Binh Tran" },
        { id: "3", firstName: "Lê", lastName: "Hoàng Cường", email: "cuong.le@example.com", displayName: "Cuong Le" },
        { id: "4", firstName: "Phạm", lastName: "Thu Dung", email: "dung.pham@example.com", displayName: "Dung Pham" },
        { id: "5", firstName: "Hoàng", lastName: "Minh Em", email: "em.hoang@example.com", displayName: "Em Hoang" },
        { id: "6", firstName: "Đặng", lastName: "Tiến Dũng", email: "dung.dang@example.com", displayName: "Dung Dang" },
        { id: "7", firstName: "Bùi", lastName: "Thị Hoa", email: "hoa.bui@example.com", displayName: "Hoa Bui" },
        { id: "8", firstName: "Vũ", lastName: "Đức Hùng", email: "hung.vu@example.com", displayName: "Hung Vu" },
    ],
    registrationTrend: Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        return {
            date: date.toISOString().split('T')[0] as string,
            count: Math.floor(Math.random() * 20) + 5, // 5 to 25 registrations per day
        };
    }),
    revenueTrend: [
        { date: "2023-01", amount: 150000000 },
        { date: "2023-02", amount: 180000000 },
        { date: "2023-03", amount: 220000000 },
        { date: "2023-04", amount: 200000000 },
        { date: "2023-05", amount: 250000000 },
        { date: "2023-06", amount: 300000000 },
        { date: "2023-07", amount: 280000000 },
        { date: "2023-08", amount: 350000000 },
        { date: "2023-09", amount: 400000000 },
        { date: "2023-10", amount: 420000000 },
        { date: "2023-11", amount: 450000000 },
        { date: "2023-12", amount: 500000000 },
    ],
    courseDistribution: [
        { label: "Tiếng Anh Giao Tiếp", value: 35 },
        { label: "IELTS", value: 25 },
        { label: "TOEIC", value: 20 },
        { label: "Tiếng Anh Trẻ Em", value: 15 },
        { label: "Khác", value: 5 },
    ],
    topCourses: [
        { id: "c1", title: "IELTS Intensive Masterclass", enrollments: 450, revenue: 1200000000 },
        { id: "c2", title: "Giao Tiếp Công Sở Pro", enrollments: 380, revenue: 850000000 },
        { id: "c3", title: "TOEIC 800+ Trong 3 Tháng", enrollments: 320, revenue: 640000000 },
        { id: "c4", title: "English for IT Professionals", enrollments: 210, revenue: 520000000 },
        { id: "c5", title: "Basic English Foundation", enrollments: 180, revenue: 270000000 },
    ],
    upcomingClasses: [
        { id: "uc1", classroomName: "IELTS Fighter A1", teacherName: "Mr. David", startTime: new Date().toISOString(), endTime: new Date(Date.now() + 7200000).toISOString(), activeStudents: 18, maxStudents: 20 },
        { id: "uc2", classroomName: "TOEIC Prep B2", teacherName: "Ms. Sarah", startTime: new Date(Date.now() + 86400000).toISOString(), endTime: new Date(Date.now() + 93600000).toISOString(), activeStudents: 15, maxStudents: 25 },
        { id: "uc3", classroomName: "Kids English K1", teacherName: "Ms. Hoa", startTime: new Date(Date.now() + 172800000).toISOString(), endTime: new Date(Date.now() + 180000000).toISOString(), activeStudents: 12, maxStudents: 15 },
    ],
    notifications: [
        { id: "n1", title: "New Course Approved", message: "Course 'Advanced Speaking' has been approved", type: "success", createdAt: new Date().toISOString() },
        { id: "n2", title: "System Maintenance", message: "Maintenance scheduled for tonight", type: "warning", createdAt: new Date(Date.now() - 86400000).toISOString() },
        { id: "n3", title: "High Enrollment", message: "IELTS course reached 90% capacity", type: "info", createdAt: new Date(Date.now() - 172800000).toISOString() },
    ],
};

const useAdminDashboardQuery = <TSelected = AdminDashboardData>(
    select?: (data: AdminDashboardData) => TSelected
): UseQueryResult<TSelected, Error> => {
    return useQuery<AdminDashboardData, Error, TSelected>({
        queryKey: ADMIN_DASHBOARD_QUERY_KEY,
        queryFn: async () => {
            if (USE_MOCK_DATA) {
                // Simulate network delay
                await new Promise(resolve => setTimeout(resolve, 800));
                return MOCK_ADMIN_DASHBOARD_DATA;
            }
            return getAdminDashboardData();
        },
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
