import axiosInstance from "../config/axiosConfig";
import { StudentWeeklySchedule } from "../interface/student-schedule.interface";

export const getStudentSchedule = async (
  studentId: string,
  weekStart?: string,
  weekEnd?: string
): Promise<StudentWeeklySchedule> => {
  const params = new URLSearchParams();
  if (weekStart) params.append('weekStart', weekStart);
  if (weekEnd) params.append('weekEnd', weekEnd);

  const response = await axiosInstance.get<{
    statusCode: number;
    message: string;
    data: StudentWeeklySchedule;
  }>(
    `/private/v1/classrooms/student/${studentId}/schedule?${params.toString()}`
  );
  return response.data.data;
};
