import { ApiResponse } from "@/interface/base-response.interface";
import { Dashboard } from "@/interface/dashboard.interface";
import axiosInstance from "../config/axiosConfig";

export const getDashboardData = async (): Promise<ApiResponse<Dashboard>> => {
  const response = await axiosInstance.get<ApiResponse<Dashboard>>("/private/v1/dashboard");
  return response.data;
};