
import { ApiResponse } from "@/interface/base-response.interface";
import { User } from "@/interface/user.interface";
import axiosInstance from "../config/axiosConfig";
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from "../interface/auth.interface";

export const login = async (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
  const response = await axiosInstance.post<ApiResponse<LoginResponse>>("/public/v1/auth/admin-login", data);
  return response.data;
};

export const parentLogin = async (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
  const response = await axiosInstance.post<ApiResponse<LoginResponse>>("/public/v1/auth/parent-login", data);
  return response.data;
};

export const register = async (data: RegisterRequest): Promise<RegisterResponse> => {
  const response = await axiosInstance.post<RegisterResponse>("/public/v1/auth/admin-register", data);
  return response.data;
};

export const logout = async (): Promise<void> => {
  await axiosInstance.post("/public/v1/auth/logout");
};

export const getMe = async (): Promise<ApiResponse<User>> => {
  const response = await axiosInstance.get<ApiResponse<User>>("/private/v1/auth/me");
  return response.data;
};
