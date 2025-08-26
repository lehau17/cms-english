
import axiosInstance from "../config/axiosConfig";
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from "../interface/auth.interface";

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await axiosInstance.post<LoginResponse>("/public/v1/auth/admin-login", data);
  return response.data;
};

export const register = async (data: RegisterRequest): Promise<RegisterResponse> => {
  const response = await axiosInstance.post<RegisterResponse>("/public/v1/auth/admin-register", data);
  return response.data;
};

export const logout = async (): Promise<void> => {
  await axiosInstance.post("/public/v1/auth/logout");
};
