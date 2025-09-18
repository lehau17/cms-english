
import { ERole, EStatus, Gender } from "./enum.interface";

export interface Student {
  id: string;
  username: string;
  email: string;
  phone: string;
  status: EStatus;
  role: ERole;
  gender: Gender;
  avatar: string;
  createdAt: string;
  updatedAt: string;
}
