import { ApiResponse } from '@/interface/base-response.interface';
import axiosClient from '../config/axiosConfig';

export interface SystemSetting {
    id: string;
    key: string;
    value: string;
    description?: string;
    isPublic: boolean;
    type?: string;
}

const systemSettingApi = {
    getPublicSettings: () => {
        return axiosClient.get<ApiResponse<SystemSetting[]>>('/public/v1/system-settings/public');
    },
    getSettingByKey: (key: string) => {
        return axiosClient.get<ApiResponse<SystemSetting>>(`/public/v1/system-settings/${key}`);
    },
    updateSetting: (key: string, data: Partial<SystemSetting>) => {
        return axiosClient.put<ApiResponse<SystemSetting>>(`/public/v1/system-settings/${key}`, data);
    }
};

export default systemSettingApi;
