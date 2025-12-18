import { getClassroomSessions, getSystemSchedule, SystemScheduleDay, SystemScheduleResponse } from '@/apis/classroom';
import { getClassroomDetail } from '@/apis/classroom-detail';
import holidayApi, { YearlyHoliday } from '@/apis/holiday';
import type { RescheduleRequest } from '@/apis/reschedule';
import { uploadFile } from '@/apis/upload';
import { useCreateRescheduleRequest, useUpdateRescheduleRequest, useCancelRescheduleRequest } from '@/hooks/useRescheduleRequest';
import { useSystemSettings } from '@/hooks/useSystemSetting';


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
  Divider,
  Grid,
  IconButton,
  Tooltip,
  TextField,
  Typography,
  Chip,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Info, PartyPopper, Upload, X } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
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
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [reason, setReason] = useState('');
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [startTimeStr, setStartTimeStr] = useState<string>('');
  const [endTimeStr, setEndTimeStr] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<{
    startTime?: string;
    endTime?: string;
  }>({});

  const { openTime, closeTime } = useSystemSettings();

  const TIME_SLOTS = useMemo(() => {
    const slots: string[] = [];
    const [startH, startM] = openTime.split(':').map(Number);
    const [endH, endM] = closeTime.split(':').map(Number);

    let currentH = startH;
    let currentM = startM;

    // Convert to minutes for easier comparison
    const endTotalMinutes = endH * 60 + endM;

    while (true) {
      const currentTotalMinutes = currentH * 60 + currentM;
      if (currentTotalMinutes > endTotalMinutes) break;

      slots.push(`${currentH.toString().padStart(2, '0')}:${currentM.toString().padStart(2, '0')}`);

      currentM += 15;
      if (currentM >= 60) {
        currentH++;
        currentM = 0;
      }
    }
    return slots;
  }, [openTime, closeTime]);

  // Fetch classroom data to determine schedule range
  const { data: classroomData } = useQuery({
    queryKey: ['classroom-detail', classroomId],
    queryFn: () => getClassroomDetail(classroomId),
    enabled: isOpen && !!classroomId,
  });

  const classroom = classroomData as any;
  // Determine range: from now (or periodStart if future) to periodEnd (or +3 months)
  const rangeStart = useMemo(() => {
    const now = new Date();
    if (classroom?.periodStart && new Date(classroom.periodStart) > now) {
      return new Date(classroom.periodStart);
    }
    return now;
  }, [classroom]);

  const rangeEnd = useMemo(() => {
    if (classroom?.periodEnd) {
      return new Date(classroom.periodEnd);
    }
    // Default to +3 months if no end date
    const end = new Date();
    end.setMonth(end.getMonth() + 3);
    return end;
  }, [classroom]);

  // Calculate days difference for API
  const daysToFetch = useMemo(() => {
    const diffTime = Math.abs(rangeEnd.getTime() - rangeStart.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(diffDays, 30); // At least 30 days
  }, [rangeStart, rangeEnd]);

  // Fetch System Schedule
  const { data: systemSchedule, isLoading: isLoadingSchedule } = useQuery({
    queryKey: ['system-schedule', rangeStart.toISOString(), daysToFetch],
    queryFn: () => getSystemSchedule({
      weekStart: rangeStart.toISOString(),
      days: daysToFetch,
      timezone: 'Asia_Ho_Chi_Minh' // Or user timezone
    }),
    enabled: isOpen && !!classroom,
  });

  // Filter sessions for the selected day
  const dailySessions = useMemo(() => {
    if (!selectedDate || !systemSchedule) return [];
    const dayData = systemSchedule.days.find(d => new Date(d.date).toDateString() === selectedDate.toDateString());
    return dayData?.sessions || [];
  }, [selectedDate, systemSchedule]);

  // Check if a specific time slot is blocked by an existing session
  const isTimeBlocked = (timeStr: string) => {
    if (!selectedDate || dailySessions.length === 0) return false;

    const [h, m] = timeStr.split(':').map(Number);
    const slotTime = h * 60 + m; // Minutes from midnight

    return dailySessions.some(session => {
      const start = new Date(session.startTime);
      const end = new Date(session.endTime);

      const startMinutes = start.getHours() * 60 + start.getMinutes();
      const endMinutes = end.getHours() * 60 + end.getMinutes();

      // Block if slot is strictly within [start, end)
      // We allow slot == end (can start immediately after)
      // We allow slot == start (cannot ? Actually if class starts at 8:00, 8:00 is occupied. So inclusive start)
      return slotTime >= startMinutes && slotTime < endMinutes;
    });
  };

  // Get the first blocked time after a given start time
  const getNextBlockedTime = (startStr: string) => {
    if (!selectedDate || dailySessions.length === 0) return null;

    const [h, m] = startStr.split(':').map(Number);
    const startMinutes = h * 60 + m;

    // Find sessions that start AFTER the chosen start time
    const nextSessions = dailySessions
      .map(session => {
        const start = new Date(session.startTime);
        return start.getHours() * 60 + start.getMinutes();
      })
      .filter(s => s > startMinutes)
      .sort((a, b) => a - b);

    return nextSessions.length > 0 ? nextSessions[0] : null;
  };

  const createMutation = useCreateRescheduleRequest();
  const updateMutation = useUpdateRescheduleRequest();
  const cancelRequestMutation = useCancelRescheduleRequest();

  const handleWithdraw = async () => {
    if (!existingRequest) return;

    if (confirm('Bạn có chắc chắn muốn rút lại yêu cầu dời lịch này không?')) {
      try {
        await cancelRequestMutation.mutateAsync(existingRequest.id);
        toast.success('Đã rút lại yêu cầu thành công');
        onClose();
      } catch (error) {
        toast.error('Có lỗi xảy ra khi rút lại yêu cầu');
      }
    }
  };

  // Helper to format date for input (local time)
  const toLocalISOString = (date: Date) => {
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
  };

  // Pre-fill form if editing
  useEffect(() => {
    if (isEditMode && existingRequest) {
      const start = new Date(existingRequest.newStartTime);
      const end = new Date(existingRequest.newEndTime);
      setNewStartTime(start);
      setNewEndTime(end);
      setSelectedDate(start);
      setStartTimeStr(`${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')}`);
      setEndTimeStr(`${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`);

      setReason(existingRequest.reason);
    } else {
      setNewStartTime(null);
      setNewEndTime(null);
      setSelectedDate(null);
      setStartTimeStr('');
      setEndTimeStr('');
      setReason('');
    }
  }, [isEditMode, existingRequest, isOpen]);



  // Fetch Holidays (Current and Next Year to be safe)
  const currentYear = new Date().getFullYear();
  const { data: holidaysCurrent } = useQuery({
    queryKey: ['holidays', currentYear],
    queryFn: () => holidayApi.getHolidays(currentYear),
    enabled: isOpen,
  });
  const { data: holidaysNext } = useQuery({
    queryKey: ['holidays', currentYear + 1],
    queryFn: () => holidayApi.getHolidays(currentYear + 1),
    enabled: isOpen,
  });

  // Merge holidays
  const allHolidays = useMemo(() => {
    const holidays: any[] = [];
    if (holidaysCurrent?.data?.data?.holidays) holidays.push(...holidaysCurrent.data.data.holidays);
    if (holidaysNext?.data?.data?.holidays) holidays.push(...holidaysNext.data.data.holidays);
    return holidays;
  }, [holidaysCurrent, holidaysNext]);

  const getHolidayForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return allHolidays.find(h => h.date.split('T')[0] === dateStr);
  };

  // Group days by Month for rendering
  const monthsData = useMemo(() => {
    if (!systemSchedule?.days) return [];

    const groups: { monthLabel: string; days: SystemScheduleDay[] }[] = [];
    let currentMonthLabel = '';
    let currentGroup: SystemScheduleDay[] = [];

    systemSchedule.days.forEach(day => {
      const date = new Date(day.date);
      const monthLabel = date.toLocaleString('vi-VN', { month: 'long', year: 'numeric' });

      if (monthLabel !== currentMonthLabel) {
        if (currentGroup.length > 0) {
          groups.push({ monthLabel: currentMonthLabel, days: currentGroup });
        }
        currentMonthLabel = monthLabel;
        currentGroup = [];
      }
      currentGroup.push(day);
    });
    if (currentGroup.length > 0) {
      groups.push({ monthLabel: currentMonthLabel, days: currentGroup });
    }
    return groups;
  }, [systemSchedule]);

  // Handle Date Selection from Calendar
  const handleDateClick = (date: Date) => {
    if (isPastDate(date)) {
      toast.error('Không thể chọn ngày trong quá khứ');
      return;
    }
    const holiday = getHolidayForDate(date);
    if (holiday) {
      toast.error(`Ngày lễ: ${holiday.name}. Vui lòng chọn ngày khác.`);
      return;
    }

    setSelectedDate(date);

    // Reset times when date changes
    setStartTimeStr('');
    setEndTimeStr('');
    setNewStartTime(null);
    setNewEndTime(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setEvidenceFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setEvidenceFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!selectedDate || !startTimeStr || !endTimeStr) {
      toast.error('Vui lòng chọn đầy đủ ngày và giờ');
      return;
    }

    // Construct Date objects
    const [startH, startM] = startTimeStr.split(':').map(Number);
    const [endH, endM] = endTimeStr.split(':').map(Number);

    const finalStartTime = new Date(selectedDate);
    finalStartTime.setHours(startH, startM, 0, 0);

    const finalEndTime = new Date(selectedDate);
    finalEndTime.setHours(endH, endM, 0, 0);

    if (finalEndTime <= finalStartTime) {
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
      for (const file of evidenceFiles) {
        const response = await uploadFile(file);
        if (response.data?.url) evidenceUrls.push(response.data.url);
      }

      const payload = {
        newStartTime: finalStartTime.toISOString(),
        newEndTime: finalEndTime.toISOString(),
        reason: reason.trim(),
        evidenceUrls: evidenceUrls.length > 0 ? evidenceUrls : undefined,
      };

      if (isEditMode && existingRequest) {
        await updateMutation.mutateAsync({ id: existingRequest.id, data: payload });
        toast.success('Đã cập nhật yêu cầu dời lịch thành công!');
      } else {
        await createMutation.mutateAsync({ sessionId, data: payload });
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
    setStartTimeStr('');
    setEndTimeStr('');
    setSelectedDate(null);
    setReason('');
    setEvidenceFiles([]);
    onClose();
  };

  // Render Day Cell
  const renderDayCell = (day: SystemScheduleDay) => {
    const date = new Date(day.date);
    const isToday = new Date().toDateString() === date.toDateString();
    const isSelected = selectedDate?.toDateString() === date.toDateString();
    const isPast = isPastDate(date);
    const holiday = getHolidayForDate(date);
    // Filter sessions to see if there are any for *this* classroom or blocking ones
    const sessionsCount = day.sessions.length;

    const isCurrentSessionDate = currentStartTime && new Date(date).toDateString() === new Date(currentStartTime).toDateString();

    // Determine cell style
    let bgClass = 'bg-white';
    let textClass = 'text-gray-900';
    let borderClass = 'border-gray-200';
    let cursorClass = 'cursor-pointer hover:bg-indigo-50 hover:border-indigo-300';

    if (isSelected) {
      bgClass = 'bg-indigo-600';
      textClass = 'text-white';
      borderClass = 'border-indigo-600';
      cursorClass = 'cursor-default shadow-md transform scale-105';
    } else if (isCurrentSessionDate) {
      bgClass = 'bg-amber-50';
      textClass = 'text-amber-900';
      borderClass = 'border-amber-400 ring-2 ring-amber-100';
    } else if (holiday) {
      bgClass = 'bg-red-50';
      textClass = 'text-red-800';
      borderClass = 'border-red-200';
    } else if (isPast) {
      bgClass = 'bg-gray-100';
      textClass = 'text-gray-400';
      cursorClass = 'cursor-not-allowed';
    } else if (isToday) {
      bgClass = 'bg-blue-50';
      borderClass = 'border-blue-300';
    }

    return (
      <div
        key={day.date.toString()}
        onClick={() => !isPast && handleDateClick(date)}
        className={`
                relative flex flex-col items-center justify-start p-2 rounded-lg border transition-all duration-200 h-24
                ${bgClass} ${borderClass} ${cursorClass} ${!isPast && !isSelected && !holiday ? 'hover:shadow-sm' : ''}
            `}
      >
        <div className={`text-sm font-semibold mb-1 ${isSelected ? 'text-white' : ''}`}>
          {date.getDate()}
        </div>

        {/* Current Session Badge */}
        {isCurrentSessionDate && !isSelected && (
          <div className="mt-1 flex flex-col items-center w-full">
            <span className="text-[10px] bg-amber-100 text-amber-800 px-1 py-0.5 rounded text-center font-medium w-full truncate border border-amber-200">
              Lịch cũ
            </span>
          </div>
        )}

        {/* Holiday Badge */}
        {holiday && !isSelected && (
          <div className="mt-1 flex flex-col items-center">
            <PartyPopper className="w-4 h-4 text-red-500 mb-1" />
            <span className="text-[10px] bg-red-100 text-red-700 px-1 py-0.5 rounded text-center leading-tight line-clamp-2 w-full">
              {holiday.name}
            </span>
          </div>
        )}

        {/* System Schedule Indicators */}
        {!holiday && !isCurrentSessionDate && sessionsCount > 0 && !isSelected && (
          <div className="mt-auto w-full flex flex-wrap gap-1 justify-center">
            {/* Show up to 3 dots for sessions */}
            {Array.from({ length: Math.min(sessionsCount, 4) }).map((_, i) => (
              <div key={i} className={`w-1.5 h-1.5 rounded-full ${isPast ? 'bg-gray-300' : 'bg-indigo-400'}`} />
            ))}
            {sessionsCount > 4 && <span className="text-[10px] text-gray-400">+</span>}
          </div>
        )}

        {/* Active Indication (e.g. Current Time overlap could be added here) */}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle className="flex justify-between items-center pb-2">
        <Box>
          <Typography variant="h6" component="div">
            {isEditMode ? 'Chỉnh sửa yêu cầu dời lịch' : 'Dời lịch buổi học'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {sessionTitle} - {currentStartTime && new Date(currentStartTime).toLocaleString('vi-VN')}
          </Typography>
        </Box>
        <IconButton onClick={handleClose}>
          <X className="w-5 h-5" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers className="p-0">
        <Grid container sx={{ height: '70vh' }}>
          {/* Left Col: Calendar Selection */}
          <Grid item xs={12} md={8} sx={{
            borderRight: '1px solid #e0e0e0',
            overflowY: 'auto',
            p: 3,
            bgcolor: '#f8fafc'
          }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-indigo-600" />
                Chọn ngày mới
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Lịch hiển thị các ngày lễ và các lớp học khác đang diễn ra.
              </Typography>
            </Box>

            {isLoadingSchedule ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                <CircularProgress />
              </Box>
            ) : (
              <div className="space-y-8">
                {monthsData.map((group, idx) => (
                  <div key={idx}>
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 sticky top-0 bg-[#f8fafc] py-2 z-10">
                      Tháng {group.monthLabel}
                    </h3>
                    <div className="grid grid-cols-7 gap-2">
                      {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(d => (
                        <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">
                          {d}
                        </div>
                      ))}
                      {/* Offset first day */}
                      {Array.from({ length: group.days[0] ? new Date(group.days[0].date).getDay() : 0 }).map((_, i) => (
                        <div key={`empty-${i}`} />
                      ))}
                      {group.days.map(day => renderDayCell(day))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Grid>

          {/* Right Col: Time & Reason */}
          <Grid item xs={12} md={4} sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3, overflowY: 'auto' }}>
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                Thiết lập thời gian
              </Typography>

              {!selectedDate ? (
                <Box sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50', borderRadius: 2, border: '1px dashed #ccc' }}>
                  <Typography variant="body2" color="text.secondary">
                    Vui lòng chọn một ngày bên trái để tiếp tục.
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={2} className="animate-in fade-in slide-in-from-right-4 duration-300">
                  <Box sx={{ bgcolor: 'indigo.50', p: 2, borderRadius: 2 }}>
                    <Typography variant="subtitle2" color="indigo.900" fontWeight="bold">
                      Ngày đã chọn:
                    </Typography>
                    <Typography variant="body1" color="indigo.700">
                      {selectedDate.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </Typography>

                    {/* Check if there are existing sessions on this day */}
                    {(() => {
                      const dayData = systemSchedule?.days.find(d => new Date(d.date).toDateString() === selectedDate.toDateString());
                      const sessions = dayData?.sessions || [];

                      if (sessions.length > 0) {
                        return (
                          <Box sx={{ mt: 2, borderTop: '1px solid #e0e7ff', pt: 2 }}>
                            <Typography variant="caption" fontWeight="bold" color="indigo.800" sx={{ display: 'block', mb: 1 }}>
                              Các lớp học đã có trong ngày ({sessions.length}):
                            </Typography>
                            <Stack spacing={1}>
                              {sessions.map((session, idx) => {
                                const start = new Date(session.startTime);
                                const end = new Date(session.endTime);
                                const timeStr = `${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')} - ${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`;

                                return (
                                  <Box key={idx} sx={{ bgcolor: 'white', p: 1, borderRadius: 1, border: '1px solid #c7d2fe', fontSize: '0.75rem' }}>
                                    <div className="flex justify-between items-center mb-0.5">
                                      <span className="font-bold text-indigo-700">{timeStr}</span>
                                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${session.type === 'online' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                        {session.type}
                                      </span>
                                    </div>
                                    <div className="font-medium truncate">{session.title}</div>
                                    <div className="text-gray-500 truncate text-[10px]">GV: {session.instructor.displayName || session.instructor.firstName}</div>
                                  </Box>
                                );
                              })}
                            </Stack>
                          </Box>
                        );
                      }
                      return null;
                    })()}
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Giờ bắt đầu</InputLabel>
                        <Select
                          value={startTimeStr}
                          label="Giờ bắt đầu"
                          onChange={(e) => {
                            setStartTimeStr(e.target.value);
                            setEndTimeStr(''); // Reset end time when start time changes
                          }}
                        >
                          {TIME_SLOTS.slice(0, -1).map((time) => {
                            const blocked = isTimeBlocked(time);
                            return (
                              <MenuItem key={time} value={time} disabled={blocked}>
                                {time} {blocked ? '(Đã kín)' : ''}
                              </MenuItem>
                            );
                          })}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                      <FormControl fullWidth size="small" disabled={!startTimeStr}>
                        <InputLabel>Giờ kết thúc</InputLabel>
                        <Select
                          value={endTimeStr}
                          label="Giờ kết thúc"
                          onChange={(e) => setEndTimeStr(e.target.value)}
                        >
                          {TIME_SLOTS.map((time) => {
                            // End time must be > Start time
                            if (!startTimeStr) return null;

                            const [sH, sM] = startTimeStr.split(':').map(Number);
                            const [eH, eM] = time.split(':').map(Number);
                            const startMin = sH * 60 + sM;
                            const endMin = eH * 60 + eM;

                            if (endMin <= startMin) return null;

                            // Blocking logic for End time:
                            // Cannot select a time that would span across a blocked session
                            const nextBlocked = getNextBlockedTime(startTimeStr);
                            const blocked = nextBlocked !== null && endMin > nextBlocked;

                            // Also block if the specific slot itself is a start time of another session (logic covered by nextBlocked check mostly)
                            // But careful: if next session starts at 9:00, can I end at 9:00? Yes. 
                            // So blocked if endMin > nextBlocked. If endMin == nextBlocked, it is fine.

                            return (
                              <MenuItem key={time} value={time} disabled={blocked}>
                                {time}
                              </MenuItem>
                            );
                          })}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Stack>
              )}
            </Box>

            <Divider />

            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom className="flex items-center gap-2">
                <Info className="w-5 h-5 text-indigo-600" />
                Chi tiết yêu cầu
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Lý do dời lịch (Bắt buộc)"
                placeholder="VD: Giáo viên bị ốm, bận việc đột xuất..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                sx={{ mb: 2 }}
              />

              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                Minh chứng (Tùy chọn)
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
                  fullWidth
                >
                  Tải lên file
                </Button>
              </label>

              {evidenceFiles.length > 0 && (
                <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {evidenceFiles.map((file, index) => (
                    <Chip
                      key={index}
                      label={file.name}
                      onDelete={() => removeFile(index)}
                      size="small"
                    />
                  ))}
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3, borderTop: '1px solid #e0e0e0', justifyContent: 'space-between' }}>
        <div className="flex gap-2">
          {isEditMode && existingRequest?.status === 'pending' && (
            <Button
              onClick={handleWithdraw}
              color="error"
              variant="outlined"
              disabled={cancelRequestMutation.isPending}
            >
              Rút lại yêu cầu
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button onClick={handleClose} disabled={uploading || createMutation.isPending || updateMutation.isPending || cancelRequestMutation.isPending}>
            Hủy bỏ
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!selectedDate || !startTimeStr || !endTimeStr || !reason || uploading || createMutation.isPending || updateMutation.isPending || cancelRequestMutation.isPending}
            startIcon={(uploading || createMutation.isPending || updateMutation.isPending || cancelRequestMutation.isPending) ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {isEditMode ? 'Cập nhật yêu cầu' : 'Gửi yêu cầu'}
          </Button>
        </div>
      </DialogActions>
    </Dialog>
  );
};
