import { getBlockingConfig, updateBlockingConfig } from '@/apis/attendance.api';
import { BlockingConfig, UpdateBlockingConfigRequest } from '@/interface/attendance.interface';
import { Save, Settings } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface BlockingConfigurationProps {
  classroomId: string;
}

export const BlockingConfiguration: React.FC<BlockingConfigurationProps> = ({
  classroomId,
}) => {
  const queryClient = useQueryClient();
  const [enabled, setEnabled] = useState(true);
  const [threshold, setThreshold] = useState(3);

  const { data: config, isLoading } = useQuery<BlockingConfig>({
    queryKey: ['blocking-config', classroomId],
    queryFn: () => getBlockingConfig(classroomId),
  });

  useEffect(() => {
    if (config) {
      setEnabled(config.enabled);
      setThreshold(config.threshold);
    }
  }, [config]);

  const updateMutation = useMutation({
    mutationFn: (data: UpdateBlockingConfigRequest) =>
      updateBlockingConfig(classroomId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocking-config', classroomId] });
      toast.success('Cấu hình chặn học đã được cập nhật');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật cấu hình');
    },
  });

  const handleSave = () => {
    if (threshold < 1 || threshold > 10) {
      toast.error('Ngưỡng phải từ 1 đến 10 buổi');
      return;
    }

    updateMutation.mutate({
      enabled,
      threshold,
    });
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" gap={1} mb={3}>
          <Settings />
          <Typography variant="h6">Cấu hình chặn học</Typography>
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          Học sinh sẽ bị chặn truy cập nội dung học tập khi vắng quá số buổi liên tiếp được cấu hình.
          Vắng có phép (excused) không tính vào số buổi vắng.
        </Alert>

        <Box display="flex" flexDirection="column" gap={3}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="body1" fontWeight="medium">
                Bật chặn học
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Kích hoạt tính năng chặn học dựa trên điểm danh
              </Typography>
            </Box>
            <Switch
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              color="primary"
            />
          </Box>

          {enabled && (
            <TextField
              label="Ngưỡng số buổi vắng liên tiếp"
              type="number"
              value={threshold}
              onChange={(e) => {
                const value = parseInt(e.target.value, 10);
                if (!isNaN(value) && value >= 1 && value <= 10) {
                  setThreshold(value);
                }
              }}
              inputProps={{ min: 1, max: 10 }}
              helperText="Số buổi vắng liên tiếp tối đa trước khi bị chặn (1-10)"
              fullWidth
            />
          )}

          <Box display="flex" justifyContent="flex-end" gap={2}>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleSave}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? 'Đang lưu...' : 'Lưu cấu hình'}
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};










