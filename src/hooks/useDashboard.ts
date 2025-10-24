import { getTeacherDashboardData, TeacherDashboardData } from "@/apis/dashboard";
import { useQuery } from "@tanstack/react-query";

/**
 * Hook để lấy dữ liệu dashboard của giáo viên
 */
export const useGetTeacherDashboardData = () => {
    return useQuery<TeacherDashboardData, Error>({
        queryKey: ['teacher-dashboard'],
        queryFn: getTeacherDashboardData,
        staleTime: 1000 * 60 * 5, // 5 phút
        refetchOnWindowFocus: true,
    });
};

// ==================== ADMIN DASHBOARD HOOKS (TODO: Implement with real API) ====================
// NOTE: Các hooks dưới đây đang trả về dữ liệu mock/empty
// Cần implement API endpoints thực tế cho Admin Dashboard

/**
 * Hook để lấy phân bố khóa học (Admin Dashboard)
 */
export const useCourseDistribution = () => {
    return useQuery({
        queryKey: ['course-distribution'],
        queryFn: async () => [],
        staleTime: 1000 * 60 * 5,
    });
};

/**
 * Hook để lấy thông báo (Admin Dashboard)
 */
export const useNotifications = () => {
    return useQuery({
        queryKey: ['admin-notifications'],
        queryFn: async () => [],
        staleTime: 1000 * 60 * 5,
    });
};

/**
 * Hook để lấy lớp học sắp tới (Admin Dashboard)
 */
export const useUpcomingClasses = () => {
    return useQuery({
        queryKey: ['upcoming-classes'],
        queryFn: async () => [],
        staleTime: 1000 * 60 * 5,
    });
};

/**
 * Hook để lấy thống kê dashboard (Admin Dashboard)
 */
export const useDashboardStats = () => {
    return useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: async () => ({
            totalStudents: 0,
            totalTeachers: 0,
            totalCourses: 0,
            totalRevenue: 0,
        }),
        staleTime: 1000 * 60 * 5,
    });
};

/**
 * Hook để lấy xu hướng đăng ký (Admin Dashboard)
 */
export const useRegistrationTrend = () => {
    return useQuery({
        queryKey: ['registration-trend'],
        queryFn: async () => [],
        staleTime: 1000 * 60 * 5,
    });
};

/**
 * Hook để lấy học sinh mới (Admin Dashboard)
 */
export const useRecentStudents = () => {
    return useQuery({
        queryKey: ['recent-students'],
        queryFn: async () => [],
        staleTime: 1000 * 60 * 5,
    });
};
