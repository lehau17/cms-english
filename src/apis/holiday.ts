import { ApiResponse } from '@/interface/base-response.interface';
import axiosInstance from '../config/axiosConfig';

export interface HolidayItem {
    date: string;
    name: string;
}

export interface YearlyHoliday {
    id: string;
    year: number;
    holidays: HolidayItem[];
    createdAt: string;
    updatedAt: string;
}

export interface UpdateYearlyHolidayDto {
    holidays: HolidayItem[];
}

const holidayApi = {
    getHolidays: (year: number) => {
        return axiosInstance.get<ApiResponse<YearlyHoliday>>(`/private/v1/holidays/${year}`);
    },

    updateHolidays: (year: number, data: UpdateYearlyHolidayDto) => {
        return axiosInstance.put<YearlyHoliday>(`/private/v1/holidays/${year}`, data);
    },
};

export default holidayApi;
