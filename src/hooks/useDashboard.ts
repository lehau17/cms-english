
import { getDashboardData } from "@/apis/dashboard";
import { ApiResponse } from "@/interface/base-response.interface";
import { Dashboard } from "@/interface/dashboard.interface";
import { useQuery } from "@tanstack/react-query";

export const useDashboardQuery = () => {
    return useQuery<ApiResponse<Dashboard>, Error>({
        queryKey: ["dashboard"],
        queryFn: getDashboardData,
    });
};
