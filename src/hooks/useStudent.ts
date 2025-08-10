// hooks/useStudents.js
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../config/axiosConfig";

export const useStudents = (page = 1, limit = 10) => {
    return useQuery({
        queryKey: ["students", page, limit],
        queryFn: async () => {
            const res = await axiosInstance.get(
                `/api/private/v1/students?page=${page}&limit=${limit}&sortOrder=asc`
            );
            return res.data.data.data
        },
    });
};


