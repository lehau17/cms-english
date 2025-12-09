
import axiosInstance from "../config/axiosConfig";
import { Activity } from "../interface/activity.interface";
import { ActivityType, DifficultyLevel } from "../interface/enums";
import { PageResponseDto } from "../interface/pagination.inerface";
import { RequestPagingDto } from "../interface/request-paging.interface";

// Re-export for convenience
export { ActivityType, DifficultyLevel };

// AI Activity Generation Types
export interface GenerateActivitiesRequest {
  courseTitle: string;
  courseDescription?: string;
  lessonTitle: string;
  lessonDescription?: string;
  userPrompt?: string;
  count: number;
  activityTypes?: ActivityType[];
  difficulty?: DifficultyLevel;
}

export interface GenerateActivitiesResponse {
  activities: Activity[];
}

export const getActivities = async (params: RequestPagingDto): Promise<PageResponseDto<Activity>> => {
  const response = await axiosInstance.get<PageResponseDto<Activity>>("/private/v1/activities", { params });
  return response.data;
};

export const getActivityById = async (id: string): Promise<Activity> => {
  const response = await axiosInstance.get<Activity>(`/private/v1/activities/${id}`);
  return response.data;
};

export const createActivity = async (data: any): Promise<Activity> => {
  const response = await axiosInstance.post<Activity>("/private/v1/activities", data);
  return response.data;
};

export const updateActivity = async (id: string, data: any): Promise<Activity> => {
  const response = await axiosInstance.put<Activity>(`/private/v1/activities/${id}`, data);
  return response.data;
};

export const deleteActivity = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/private/v1/activities/${id}`);
};

export const generateActivitiesWithAI = async (
  data: GenerateActivitiesRequest
): Promise<GenerateActivitiesResponse> => {
  const response = await axiosInstance.post<{ statusCode: number; message: string; data: GenerateActivitiesResponse }>(
    "/private/v1/admin/activities/ai-generate",
    data
  );
  return response.data.data;
};
