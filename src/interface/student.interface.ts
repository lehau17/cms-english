
import { EGender, ERole, EStatus } from "./enum.interface";

export interface Student {
  id: string;
  username: string;
  email: string;
  phone: string;
  status: EStatus;
  role: ERole;
  gender: EGender;
  avatar: string;
  createdAt: string;
  updatedAt: string;
}
