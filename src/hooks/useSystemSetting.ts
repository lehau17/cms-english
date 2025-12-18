import systemSettingApi from '@/apis/system-setting';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

const DEFAULT_OPEN_TIME = '07:00';
const DEFAULT_CLOSE_TIME = '22:00';

export const useSystemSettings = () => {
    // 1 hour stale time because these change rarely
    const { data, isLoading, error } = useQuery({
        queryKey: ['system-settings', 'public'],
        queryFn: () => systemSettingApi.getPublicSettings(),
        staleTime: 60 * 60 * 1000,
        retry: 1,
    });
    console.log(data)

    const settingsMap = useMemo(() => {
        const map = new Map<string, string>();
        if (data?.data) {
            data?.data?.data.forEach(setting => {
                map.set(setting.key, setting.value);
            });
        }
        return map;
    }, [data]);

    const openTime = settingsMap.get('center_open_time') || DEFAULT_OPEN_TIME;
    const closeTime = settingsMap.get('center_close_time') || DEFAULT_CLOSE_TIME;

    return {
        openTime,
        closeTime,
        isLoading,
        error,
        settingsMap
    };
};
