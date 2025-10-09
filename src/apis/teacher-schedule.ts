import axiosInstance from "../config/axiosConfig";
import { TeacherWeeklySchedule } from "../interface/teacher-schedule.interface";

export const getTeacherSchedule = async (
  teacherId: string,
  weekStart?: string,
  weekEnd?: string,
  timezone: string = 'Asia_Ho_Chi_Minh',
  days: number = 7
): Promise<TeacherWeeklySchedule> => {
  const params = new URLSearchParams();
  if (weekStart) params.append('weekStart', weekStart);
  if (weekEnd) params.append('weekEnd', weekEnd);
  params.append('timezone', timezone);
  params.append('days', days.toString());

  const response = await axiosInstance.get<{
    statusCode: number;
    message: string;
    data: TeacherWeeklySchedule;
  }>(
    `/private/v1/classrooms/teacher/${teacherId}/schedule?${params.toString()}`
  );
  return response.data.data;
};

export interface TeacherAvailabilitySlot {
  classroomId: string;
  classroomName: string;
  courseTitle: string;
  startMinuteOfDay: number;
  endMinuteOfDay: number;
}

export interface TeacherWeeklyAvailability {
  teacherId: string;
  timezone: string;
  totalActiveClassrooms: number;
  schedule: {
    mon: TeacherAvailabilitySlot[];
    tue: TeacherAvailabilitySlot[];
    wed: TeacherAvailabilitySlot[];
    thu: TeacherAvailabilitySlot[];
    fri: TeacherAvailabilitySlot[];
    sat: TeacherAvailabilitySlot[];
    sun: TeacherAvailabilitySlot[];
  };
}

export const getTeacherAvailability = async (
  teacherId: string,
  weekStart?: string,
  timezone: string = 'Asia_Ho_Chi_Minh'
): Promise<TeacherWeeklyAvailability> => {
  const params = new URLSearchParams();
  if (weekStart) params.append('weekStart', weekStart);
  params.append('timezone', timezone);

  const response = await axiosInstance.get<{
    statusCode: number;
    message: string;
    data: TeacherWeeklyAvailability;
  }>(
    `/private/v1/classrooms/teacher/${teacherId}/availability?${params.toString()}`
  );
  return response.data.data;
};
