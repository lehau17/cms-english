import axiosInstance from '@/config/axiosConfig';
import { ParentChildrenSchedule } from '@/interface/parent-schedule.interface';

export const getParentChildrenSchedule = async (
  parentId: string,
  weekStart?: string,
  weekEnd?: string,
  timezone: string = 'Asia_Ho_Chi_Minh',
  days: number = 7
): Promise<ParentChildrenSchedule> => {
  const params = new URLSearchParams();
  if (weekStart) params.append('weekStart', weekStart);
  if (weekEnd) params.append('weekEnd', weekEnd);
  params.append('timezone', timezone);
  params.append('days', days.toString());

  const response = await axiosInstance.get<{
    statusCode: number;
    message: string;
    data: ParentChildrenSchedule;
  }>(
    `/private/v1/classrooms/parents/${parentId}/children-schedule/weekly?${params.toString()}`
  );
  return response.data.data;
};
