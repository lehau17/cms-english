import { getClassroomSessions } from '@/apis/classroom';
import { getClassroomDetail } from '@/apis/classroom-detail';
import type { RescheduleRequest } from '@/apis/reschedule';
import { uploadFile } from '@/apis/upload';
import { useCreateRescheduleRequest, useUpdateRescheduleRequest } from '@/hooks/useRescheduleRequest';
import { getBookedDateErrorMessage, getBookedDates, getPastDateErrorMessage, isDateBooked, isPastDate } from '@/utils/dateValidation';
import { get15MinuteIntervalErrorMessage, isValid15MinuteInterval } from '@/utils/timeValidation';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { Upload, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

interface RescheduleRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  classroomId: string;
  sessionTitle?: string;
  currentStartTime?: Date;
  currentEndTime?: Date;
  existingRequest?: RescheduleRequest | null;
}

export const RescheduleRequestModal: React.FC<RescheduleRequestModalProps> = ({
  isOpen,
  onClose,
  sessionId,
  classroomId,
  sessionTitle,
  currentStartTime,
  currentEndTime,
  existingRequest,
}) => {
  const isEditMode = !!existingRequest;
  const [newStartTime, setNewStartTime] = useState<Date | null>(null);
  const [newEndTime, setNewEndTime] = useState<Date | null>(null);
  const [reason, setReason] = useState('');
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    startTime?: string;
    endTime?: string;
  }>({});
  const [timeValidationErrors, setTimeValidationErrors] = useState<{
    startTime?: string;
    endTime?: string;
  }>({});
  const [dateValidationErrors, setDateValidationErrors] = useState<{
    startTime?: string;
  }>({});

  const createMutation = useCreateRescheduleRequest();
  const updateMutation = useUpdateRescheduleRequest();

  // Pre-fill form if editing
  useEffect(() => {
    if (isEditMode && existingRequest) {
      setNewStartTime(new Date(existingRequest.newStartTime));
      setNewEndTime(new Date(existingRequest.newEndTime));
      setReason(existingRequest.reason);
    } else {
      setNewStartTime(null);
      setNewEndTime(null);
      setReason('');
    }
  }, [isEditMode, existingRequest, isOpen]);

  // Fetch classroom sessions for date restriction
  const { data: classroomSessions } = useQuery({
    queryKey: ['classroom-sessions', classroomId],
    queryFn: () => getClassroomSessions(classroomId),
    enabled: isOpen && !!classroomId,
  });

  // Calculate booked dates
  const bookedDates = useMemo(() => {
    if (!classroomSessions) return new Set<string>();
    return getBookedDates(classroomSessions);
  }, [classroomSessions]);

  // Fetch classroom data to get periodStart and periodEnd
  const { data: classroomData, isLoading: isLoadingClassroom } = useQuery({
    queryKey: ['classroom-detail', classroomId],
    queryFn: () => getClassroomDetail(classroomId),
    enabled: isOpen && !!classroomId,
  });

  const classroom = classroomData as any;
  const periodStart = classroom?.periodStart ? new Date(classroom.periodStart) : null;
  const periodEnd = classroom?.periodEnd ? new Date(classroom.periodEnd) : null;

  // Calculate min/max datetime strings for input constraints
  const minDateTime = useMemo(() => {
    if (!periodStart) return new Date().toISOString().slice(0, 16);
    const min = new Date(periodStart);
    min.setHours(7, 0, 0, 0);
    return min.toISOString().slice(0, 16);
  }, [periodStart]);

  const maxDateTime = useMemo(() => {
    if (!periodEnd) return '';
    const max = new Date(periodEnd);
    max.setHours(21, 59, 0, 0);
    return max.toISOString().slice(0, 16);
  }, [periodEnd]);

  // Client-side validation
  const validateTimes = (start: Date | null, end: Date | null) => {
    const errors: { startTime?: string; endTime?: string } = {};

    if (!start || !end) {
      return errors;
    }

    // Validate 15-minute intervals
    if (!isValid15MinuteInterval(start)) {
      errors.startTime = get15MinuteIntervalErrorMessage();
    }
    if (!isValid15MinuteInterval(end)) {
      errors.endTime = get15MinuteIntervalErrorMessage();
    }

    // Validate time window (7:00 - 22:00)
    const startHour = start.getHours();
    const startMinute = start.getMinutes();
    if (startHour < 7 || (startHour === 7 && startMinute < 0)) {
      errors.startTime = 'Thời gian bắt đầu phải từ 7:00';
    }

    const endHour = end.getHours();
    if (endHour >= 22) {
      errors.endTime = 'Thời gian kết thúc phải trước 10:00 PM (22:00)';
    }

    // Validate classroom period
    if (periodStart && start < periodStart) {
      errors.startTime = `Thời gian phải nằm trong khoảng thời gian hiệu lực của lớp học (từ ${periodStart.toLocaleString('vi-VN')})`;
    }

    if (periodEnd && end > periodEnd) {
      errors.endTime = `Thời gian phải nằm trong khoảng thời gian hiệu lực của lớp học (đến ${periodEnd.toLocaleString('vi-VN')})`;
    }

    // Validate date restrictions
    if (isPastDate(start)) {
      errors.startTime = getPastDateErrorMessage();
    } else if (isDateBooked(start, bookedDates)) {
      errors.startTime = getBookedDateErrorMessage();
    }

    return errors;
  };

  // Validate on time change
  useEffect(() => {
    if (newStartTime || newEndTime) {
      const errors = validateTimes(newStartTime, newEndTime);
      setValidationErrors(errors);

      // Separate time and date errors
      const timeErrors: { startTime?: string; endTime?: string } = {};
      const dateErrors: { startTime?: string } = {};

      if (newStartTime && !isValid15MinuteInterval(newStartTime)) {
        timeErrors.startTime = get15MinuteIntervalErrorMessage();
      }
      if (newEndTime && !isValid15MinuteInterval(newEndTime)) {
        timeErrors.endTime = get15MinuteIntervalErrorMessage();
      }
      if (newStartTime) {
        if (isPastDate(newStartTime)) {
          dateErrors.startTime = getPastDateErrorMessage();
        } else if (isDateBooked(newStartTime, bookedDates)) {
          dateErrors.startTime = getBookedDateErrorMessage();
        }
      }

      setTimeValidationErrors(timeErrors);
      setDateValidationErrors(dateErrors);
    } else {
      setValidationErrors({});
      setTimeValidationErrors({});
      setDateValidationErrors({});
    }
  }, [newStartTime, newEndTime, periodStart, periodEnd, bookedDates]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setEvidenceFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setEvidenceFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!newStartTime || !newEndTime) {
      toast.error('Vui lòng chọn thời gian mới');
      return;
    }

    if (newEndTime <= newStartTime) {
      toast.error('Thời gian kết thúc phải sau thời gian bắt đầu');
      return;
    }

    if (!reason.trim()) {
      toast.error('Vui lòng nhập lý do dời lịch');
      return;
    }

    try {
      setUploading(true);
      const evidenceUrls: string[] = [];

      // Upload evidence files
      for (const file of evidenceFiles) {
        try {
          const response = await uploadFile(file);
          const url = response.data?.url;
          if (url) {
            evidenceUrls.push(url);
          }
        } catch (error) {
          console.error('Failed to upload file:', error);
          toast.error(`Không thể tải lên file: ${file.name}`);
        }
      }

      if (isEditMode && existingRequest) {
        // Update existing request
        await updateMutation.mutateAsync({
          id: existingRequest.id,
          data: {
            newStartTime: newStartTime.toISOString(),
            newEndTime: newEndTime.toISOString(),
            reason: reason.trim(),
            evidenceUrls: evidenceUrls.length > 0 ? evidenceUrls : undefined,
          },
        });

        toast.success('Đã cập nhật yêu cầu dời lịch thành công!');
      } else {
        // Create new request
        await createMutation.mutateAsync({
          sessionId,
          data: {
            newStartTime: newStartTime.toISOString(),
            newEndTime: newEndTime.toISOString(),
            reason: reason.trim(),
            evidenceUrls: evidenceUrls.length > 0 ? evidenceUrls : undefined,
          },
        });

        toast.success('Đã gửi yêu cầu dời lịch thành công!');
      }

      handleClose();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể tạo yêu cầu dời lịch');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setNewStartTime(null);
    setNewEndTime(null);
    setReason('');
    setEvidenceFiles([]);
    setValidationErrors({});
    setTimeValidationErrors({});
    setDateValidationErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6" component="div">
          {isEditMode ? 'Chỉnh sửa yêu cầu dời lịch' : 'Yêu cầu dời lịch buổi học'}
        </Typography>
        {sessionTitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {sessionTitle}
          </Typography>
        )}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
          {currentStartTime && currentEndTime && (
            <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Thời gian hiện tại:
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {new Date(currentStartTime).toLocaleString('vi-VN')} -{' '}
                {new Date(currentEndTime).toLocaleString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Typography>
            </Box>
          )}

          <TextField
            fullWidth
            label="Thời gian bắt đầu mới"
            type="datetime-local"
            value={newStartTime ? new Date(newStartTime.getTime() - newStartTime.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
            onChange={(e) => {
              const value = e.target.value ? new Date(e.target.value) : null;
              setNewStartTime(value);
              // Update end time min if start time changes
              if (value && newEndTime && newEndTime <= value) {
                setNewEndTime(null);
              }
              // Clear errors on change
              if (timeValidationErrors.startTime) {
                setTimeValidationErrors(prev => ({ ...prev, startTime: undefined }));
              }
              if (dateValidationErrors.startTime) {
                setDateValidationErrors(prev => ({ ...prev, startTime: undefined }));
              }
            }}
            required
            error={!!validationErrors.startTime || !!timeValidationErrors.startTime || !!dateValidationErrors.startTime}
            helperText={
              validationErrors.startTime ||
              timeValidationErrors.startTime ||
              dateValidationErrors.startTime ||
              (periodStart && periodEnd ? `Từ ${periodStart.toLocaleDateString('vi-VN')} 07:00 đến ${periodEnd.toLocaleDateString('vi-VN')} 21:59. Thời gian phải là bội số của 15 phút.` : 'Thời gian bắt đầu từ 7:00, phải là bội số của 15 phút')
            }
            InputLabelProps={{ shrink: true }}
            inputProps={{
              step: 900, // 15 minutes = 900 seconds
              min: minDateTime,
              max: maxDateTime || undefined,
            }}
            disabled={isLoadingClassroom}
          />

          <TextField
            fullWidth
            label="Thời gian kết thúc mới"
            type="datetime-local"
            value={newEndTime ? new Date(newEndTime.getTime() - newEndTime.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
            onChange={(e) => {
              setNewEndTime(e.target.value ? new Date(e.target.value) : null);
              // Clear errors on change
              if (timeValidationErrors.endTime) {
                setTimeValidationErrors(prev => ({ ...prev, endTime: undefined }));
              }
            }}
            required
            error={!!validationErrors.endTime || !!timeValidationErrors.endTime}
            helperText={
              validationErrors.endTime ||
              timeValidationErrors.endTime ||
              'Thời gian kết thúc trước 22:00 (10:00 PM). Thời gian phải là bội số của 15 phút.'
            }
            InputLabelProps={{ shrink: true }}
            inputProps={{
              step: 900, // 15 minutes = 900 seconds
              min: newStartTime ? new Date(newStartTime.getTime() - newStartTime.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : minDateTime,
              max: maxDateTime || undefined,
            }}
            disabled={isLoadingClassroom}
          />

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Lý do dời lịch"
            placeholder="Vui lòng giải thích lý do cần dời lịch buổi học này..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            helperText={`${reason.length} ký tự`}
          />

          <Box>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              Minh chứng (tùy chọn)
            </Typography>
            <input
              type="file"
              id="evidence-upload"
              multiple
              accept="image/*,.pdf,.doc,.docx"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <label htmlFor="evidence-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<Upload className="w-4 h-4" />}
                size="small"
              >
                Tải lên minh chứng
              </Button>
            </label>

            {evidenceFiles.length > 0 && (
              <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                {evidenceFiles.map((file, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 1,
                      bgcolor: 'grey.50',
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="body2" sx={{ flex: 1 }}>
                      {file.name}
                    </Typography>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => removeFile(index)}
                      startIcon={<X className="w-4 h-4" />}
                    >
                      Xóa
                    </Button>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={createMutation.isPending || uploading}>
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={
            createMutation.isPending ||
            updateMutation.isPending ||
            uploading ||
            isLoadingClassroom ||
            !newStartTime ||
            !newEndTime ||
            !reason.trim() ||
            Object.keys(validationErrors).length > 0 ||
            Object.keys(timeValidationErrors).length > 0 ||
            Object.keys(dateValidationErrors).length > 0
          }
          startIcon={
            (createMutation.isPending || updateMutation.isPending || uploading) ? (
              <CircularProgress size={16} />
            ) : null
          }
        >
          {uploading
            ? 'Đang tải lên...'
            : createMutation.isPending || updateMutation.isPending
              ? isEditMode
                ? 'Đang cập nhật...'
                : 'Đang gửi...'
              : isEditMode
                ? 'Cập nhật yêu cầu'
                : 'Gửi yêu cầu'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

