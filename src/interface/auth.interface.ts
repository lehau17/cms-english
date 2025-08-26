import { UserResponse } from "./user.interface";

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: UserResponse
}

export interface RegisterResponse {
  accessToken: string;
  refreshToken: string;
  user: UserResponse
}


export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username?: string;
  email?: string;
  password?: string;
  phone?: string;
}
