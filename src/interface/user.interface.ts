import { Gender, LanguageCode, Status, TimezoneCode, UserRole } from "./enum.interface";

export interface User {
  id: string;
  email: string | null;
  phone: string | null;
  role: UserRole;
  status: Status;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  gender: Gender | null;
  dob: Date | null;
  nationality: string | null;
  nativeLanguage: LanguageCode | null;
  avatarUrl: string | null;
  bio: string | null;
  language: LanguageCode | null;
  timezone: TimezoneCode | null;
  lastLoginAt: Date | null;
  lastActiveAt: Date | null;
  emailVerified: boolean;
  phoneVerified: boolean;
  twoFactorEnabled: boolean;
  profileCompleteness: number;
  isOnline: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserResponse {
  id: string;
  email: string | null;
  phone: string | null;
  role: UserRole;
  status: Status;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  gender: Gender | null;
  dob: Date | null;
  nationality: string | null;
  nativeLanguage: LanguageCode | null;
  avatarUrl: string | null;
  bio: string | null;
  language: LanguageCode | null;
  timezone: TimezoneCode | null;
  lastLoginAt: Date | null;
  lastActiveAt: Date | null;
  emailVerified: boolean;
  phoneVerified: boolean;
  twoFactorEnabled: boolean;
  profileCompleteness: number;
  isOnline: boolean;
  createdAt: Date;
  updatedAt: Date;
}
