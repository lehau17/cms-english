import { UserRole, Status, Gender } from "./enum.interface";

export interface Teacher {
  id: string;
  username: string;
  email: string;
  phone: string;
  status: Status;
  role: UserRole;
  gender: Gender;
  avatar: string;
  createdAt: string;
  updatedAt: string;
}
