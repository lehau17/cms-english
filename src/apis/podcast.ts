import { ApiResponse } from "@/interface/base-response.interface";
import axiosInstance from "../config/axiosConfig";
import { PageResponseDto } from "../interface/pagination.inerface";
import { RequestPagingDto } from "../interface/request-paging.interface";
import { CreatePodcastDto, Podcast, PodcastCategory, PodcastDifficulty, UpdatePodcastDto } from "../interface/podcast.interface";

export interface GetPodcastsQuery extends RequestPagingDto {
    category?: PodcastCategory;
    difficulty?: PodcastDifficulty;
    search?: string;
}

export const getPodcasts = async (params: GetPodcastsQuery): Promise<PageResponseDto<Podcast>> => {
    const response = await axiosInstance.get<PageResponseDto<Podcast>>("/private/v1/podcasts", { params });
    return response.data;
};

export const getPodcastById = async (id: string): Promise<ApiResponse<Podcast>> => {
    const response = await axiosInstance.get<ApiResponse<Podcast>>(`/private/v1/podcasts/${id}`);
    return response.data;
};

export const createPodcast = async (data: CreatePodcastDto): Promise<ApiResponse<Podcast>> => {
    const response = await axiosInstance.post<ApiResponse<Podcast>>("/private/v1/podcasts", data);
    return response.data;
};

export const updatePodcast = async (id: string, data: UpdatePodcastDto): Promise<ApiResponse<Podcast>> => {
    const response = await axiosInstance.patch<ApiResponse<Podcast>>(`/private/v1/podcasts/${id}`, data);
    return response.data;
};

export const deletePodcast = async (id: string): Promise<void> => {
    await axiosInstance.delete(`/private/v1/podcasts/${id}`);
};
