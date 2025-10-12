import { getDashboardData } from "@/apis/dashboard";
import { ApiResponse } from "@/interface/base-response.interface";
import { Dashboard } from "@/interface/dashboard.interface";
import { useQuery } from "@tanstack/react-query";

// Main query that fetches all data and is shared across smaller hooks
const useSharedDashboardQuery = () => {
    return useQuery<ApiResponse<Dashboard>, Error>({
        queryKey: ["dashboard"],
        queryFn: getDashboardData,
        // Keep data fresh for 5 minutes
        staleTime: 1000 * 60 * 5,
        // Share data across components
        refetchOnWindowFocus: false,
    });
};

// Hook for Stats Cards data
export const useDashboardStats = () => {
    const { data, isLoading, isError, error } = useSharedDashboardQuery();
    return {
        data: data?.data ? {
            totalStudents: data.data.totalStudents,
            totalCourses: data.data.totalCourses,
            totalLessons: data.data.totalLessons,
            totalActivities: data.data.totalActivities,
        } : undefined,
        isLoading,
        isError,
        error,
    };
};

// Hook for Registration Trend chart
export const useRegistrationTrend = () => {
    const { data, isLoading, isError, error } = useSharedDashboardQuery();
    return {
        data: data?.data?.registrationTrend,
        isLoading,
        isError,
        error,
    };
};

// Hook for Course Distribution chart
export const useCourseDistribution = () => {
    const { data, isLoading, isError, error } = useSharedDashboardQuery();
    return {
        data: data?.data?.courseDistribution,
        isLoading,
        isError,
        error,
    };
};

// Hook for Upcoming Classes table
export const useUpcomingClasses = () => {
    const { data, isLoading, isError, error } = useSharedDashboardQuery();
    return {
        data: data?.data?.upcomingClasses,
        isLoading,
        isError,
        error,
    };
};

// Hook for Notifications list
export const useNotifications = () => {
    const { data, isLoading, isError, error } = useSharedDashboardQuery();
    return {
        data: data?.data?.notifications,
        isLoading,
        isError,
        error,
    };
};

// Hook for Recent Students list
export const useRecentStudents = () => {
    const { data, isLoading, isError, error } = useSharedDashboardQuery();
    return {
        data: data?.data?.recentStudents,
        isLoading,
        isError,
        error,
    };
};