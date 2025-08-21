// hooks/useClassroom.ts
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../config/axiosConfig";

export const useClassrooms = (page = 1, limit = 10) => {
    return useQuery({
        queryKey: ["classrooms", page, limit],
        queryFn: async () => {
            const res = await axiosInstance.get(
                `/private/v1/classrooms?page=${page}&limit=${limit}&sortOrder=asc`
            );
            return res.data.data; // Assuming the API response structure is similar to students
        },
    });
};
