import axiosInstance from "../config/axiosConfig";
import { TeacherWeeklySchedule } from "../interface/teacher-schedule.interface";

export const getTeacherSchedule = async (
  teacherId: string,
  weekStart?: string,
  weekEnd?: string
): Promise<TeacherWeeklySchedule> => {
  const params = new URLSearchParams();
  if (weekStart) params.append('weekStart', weekStart);
  if (weekEnd) params.append('weekEnd', weekEnd);

  const response = await axiosInstance.get<{
    statusCode: number;
    message: string;
    data: TeacherWeeklySchedule;
  }>(
    `/private/v1/classrooms/teacher/${teacherId}/schedule?${params.toString()}`
  );
  return response.data.data;
};
