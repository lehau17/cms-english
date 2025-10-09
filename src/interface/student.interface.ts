
import { Gender, Status, UserRole } from "./enum.interface";

export interface Student {
  id: string;
  username: string;
  email: string;
  phone: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  status: Status;
  role: UserRole;
  gender: Gender;
  avatar: string;
  createdAt: string;
  updatedAt: string;
}
