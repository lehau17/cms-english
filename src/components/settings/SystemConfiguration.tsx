import systemSettingApi from '@/apis/system-setting';
import { useSystemSettings } from '@/hooks/useSystemSetting';
import { Box, Button, Card, CardContent, CircularProgress, Grid, TextField, Typography } from '@mui/material';
import { Clock, Save } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';

const SystemConfiguration: React.FC = () => {
    const { openTime, closeTime, isLoading } = useSystemSettings();
    const queryClient = useQueryClient();

    const [start, setStart] = useState(openTime);
    const [end, setEnd] = useState(closeTime);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (openTime) setStart(openTime);
        if (closeTime) setEnd(end || closeTime);
    }, [openTime, closeTime]);

    // Update end time only if it hasn't been modified by user yet (simple sync on load)
    useEffect(() => {
        if (closeTime && end === '22:00' && closeTime !== '22:00') { // rudimentary check to avoid overwriting user edits if they started typing before load
            setEnd(closeTime);
        } else if (closeTime && !end) {
            setEnd(closeTime);
        }
    }, [closeTime]);


    const handleSave = async () => {
        if (!start || !end) {
            toast.error('Vui lòng nhập đầy đủ giờ mở và đóng cửa');
            return;
        }

        const [startH, startM] = start.split(':').map(Number);
        const [endH, endM] = end.split(':').map(Number);

        if (endH < startH || (endH === startH && endM <= startM)) {
            toast.error('Giờ đóng cửa phải sau giờ mở cửa');
            return;
        }

        try {
            setIsSaving(true);
            await Promise.all([
                systemSettingApi.updateSetting('center_open_time', { value: start, isPublic: true, type: 'time' }),
                systemSettingApi.updateSetting('center_close_time', { value: end, isPublic: true, type: 'time' })
            ]);

            toast.success('Cập nhật cấu hình thành công');
            // Invalidate query to refresh data
            queryClient.invalidateQueries({ queryKey: ['system-settings', 'public'] });
        } catch (error) {
            console.error(error);
            toast.error('Có lỗi xảy ra khi lưu cấu hình');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                <div className="p-2 bg-indigo-50 rounded-lg">
                    <Clock className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-gray-800">Cấu hình hệ thống</h2>
                    <p className="text-sm text-gray-500">Thiết lập thời gian hoạt động của trung tâm</p>
                </div>
            </div>

            <Grid container spacing={3} alignItems="flex-end">
                <Grid item xs={12} md={4}>
                    <TextField
                        label="Giờ mở cửa"
                        type="time"
                        fullWidth
                        value={start}
                        onChange={(e) => setStart(e.target.value)}
                        InputLabelProps={{
                            shrink: true,
                        }}
                        size="small"
                        helperText="Thời gian bắt đầu các ca học trong ngày"
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <TextField
                        label="Giờ đóng cửa"
                        type="time"
                        fullWidth
                        value={end}
                        onChange={(e) => setEnd(e.target.value)}
                        InputLabelProps={{
                            shrink: true,
                        }}
                        size="small"
                        helperText="Thời gian kết thúc ca học cuối cùng"
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSave}
                        disabled={isSaving}
                        startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <Save size={18} />}
                        fullWidth
                        sx={{ height: 40, mb: 2.5 }} // Align with inputs roughly
                    >
                        {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </Button>
                </Grid>
            </Grid>
        </div>
    );
};

export default SystemConfiguration;
