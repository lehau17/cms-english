
import axiosInstance from "../config/axiosConfig";
import { DashboardData } from "../interface/dashboard.interface";

export const getDashboardData = async (): Promise<DashboardData> => {
  const response = await axiosInstance.get<DashboardData>("/private/v1/dashboard");
  return response.data;
};
