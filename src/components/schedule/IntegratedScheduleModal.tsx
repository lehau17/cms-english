import { Weekday } from '@/interface/enums';
import { TeacherScheduleSlot } from '@/interface/teacher-schedule.interface';
import { Calendar, CheckCircle, Clock, Plus, User, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import Button from '../ui/Button';

interface ClassroomSlot {
  dayOfWeek: Weekday;
  startMinuteOfDay: number;
  endMinuteOfDay: number;
}

interface IntegratedScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacherName: string;
  schedule: { [dayOfWeek: string]: TeacherScheduleSlot[] } | null;
  isLoading: boolean;
  onSlotsChange: (slots: ClassroomSlot[]) => void;
  currentSlots: ClassroomSlot[];
}

const IntegratedScheduleModal: React.FC<IntegratedScheduleModalProps> = ({
  isOpen,
  onClose,
  teacherName,
  schedule,
  isLoading,
  onSlotsChange,
  currentSlots,
}) => {
  const [selectedSlots, setSelectedSlots] = useState<ClassroomSlot[]>(currentSlots);
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [newSlot, setNewSlot] = useState({
    dayOfWeek: Weekday.MON,
    startTime: '09:00',
    endTime: '10:30'
  });

  useEffect(() => {
    setSelectedSlots(currentSlots);
  }, [currentSlots]);

  if (!isOpen) return null;

  const dayLabels = {
    mon: 'Thứ 2',
    tue: 'Thứ 3',
    wed: 'Thứ 4',
    thu: 'Thứ 5',
    fri: 'Thứ 6',
    sat: 'Thứ 7',
    sun: 'Chủ Nhật',
  };

  const weekdayMapping = {
    mon: Weekday.MON,
    tue: Weekday.TUE,
    wed: Weekday.WED,
    thu: Weekday.THU,
    fri: Weekday.FRI,
    sat: Weekday.SAT,
    sun: Weekday.SUN,
  };

  const reverseWeekdayMapping = {
    [Weekday.MON]: 'mon',
    [Weekday.TUE]: 'tue',
    [Weekday.WED]: 'wed',
    [Weekday.THU]: 'thu',
    [Weekday.FRI]: 'fri',
    [Weekday.SAT]: 'sat',
    [Weekday.SUN]: 'sun',
  };

  // Define time periods
  const timePeriods = [
    {
      name: 'Sáng',
      start: 6 * 60, // 6:00
      end: 12 * 60,  // 12:00
      color: 'bg-yellow-100'
    },
    {
      name: 'Chiều',
      start: 12 * 60, // 12:00
      end: 18 * 60,   // 18:00
      color: 'bg-orange-100'
    },
    {
      name: 'Tối',
      start: 18 * 60, // 18:00
      end: 22 * 60,   // 22:00
      color: 'bg-purple-100'
    }
  ];

  const minutesToTimeString = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const timeStringToMinutes = (timeString: string): number => {
    const [hours, minutes] = timeString.split(':').map(num => parseInt(num, 10));
    return hours! * 60 + minutes!;
  };

  const getDaySchedule = (dayKey: string) => {
    if (!schedule) return [];
    return schedule[dayKey] || [];
  };

  const getSlotsInPeriod = (dayKey: string, period: typeof timePeriods[0]) => {
    const daySchedule = getDaySchedule(dayKey);
    const selectedDaySlots = selectedSlots.filter(slot =>
      slot.dayOfWeek === weekdayMapping[dayKey as keyof typeof weekdayMapping]
    );

    const existingSlots = daySchedule.filter(slot =>
      slot.startMinuteOfDay < period.end && slot.endMinuteOfDay > period.start
    );

    const newSlots = selectedDaySlots.filter(slot =>
      slot.startMinuteOfDay < period.end && slot.endMinuteOfDay > period.start
    );

    return { existingSlots, newSlots };
  };

  const handleAddSlot = () => {
    const startMinute = timeStringToMinutes(newSlot.startTime);
    const endMinute = timeStringToMinutes(newSlot.endTime);

    if (endMinute <= startMinute) {
      alert('Thời gian kết thúc phải sau thời gian bắt đầu!');
      return;
    }

    const dayKey = reverseWeekdayMapping[newSlot.dayOfWeek];
    const daySchedule = getDaySchedule(dayKey);

    // Check for conflicts
    const hasConflict = daySchedule.some(slot =>
      (startMinute < slot.endMinuteOfDay && endMinute > slot.startMinuteOfDay)
    );

    if (hasConflict) {
      alert('Thời gian này xung đột với lịch dạy hiện tại của giáo viên!');
      return;
    }

    // Check for duplicates
    const isDuplicate = selectedSlots.some(slot =>
      slot.dayOfWeek === newSlot.dayOfWeek &&
      slot.startMinuteOfDay === startMinute &&
      slot.endMinuteOfDay === endMinute
    );

    if (isDuplicate) {
      alert('Thời gian này đã được chọn!');
      return;
    }

    const updatedSlots = [...selectedSlots, {
      dayOfWeek: newSlot.dayOfWeek,
      startMinuteOfDay: startMinute,
      endMinuteOfDay: endMinute
    }];

    setSelectedSlots(updatedSlots);
    onSlotsChange(updatedSlots);
    setShowAddSlot(false);
  };

  const removeTimeSlot = (slotToRemove: ClassroomSlot) => {
    const updatedSlots = selectedSlots.filter(slot =>
      !(slot.dayOfWeek === slotToRemove.dayOfWeek &&
        slot.startMinuteOfDay === slotToRemove.startMinuteOfDay &&
        slot.endMinuteOfDay === slotToRemove.endMinuteOfDay)
    );
    setSelectedSlots(updatedSlots);
    onSlotsChange(updatedSlots);
  };

  const handleApplySlots = () => {
    onSlotsChange(selectedSlots);
    onClose();
  };

  const renderPeriodCell = (dayKey: string, period: typeof timePeriods[0]) => {
    const { existingSlots, newSlots } = getSlotsInPeriod(dayKey, period);

    return (
      <div className={`border border-gray-300 ${period.color} min-h-[120px] p-2 relative`}>
        {/* Existing slots */}
        {existingSlots.map((slot, index) => (
          <div
            key={`existing-${index}`}
            className="mb-2 p-2 bg-red-100 border border-red-300 rounded text-xs text-red-800"
          >
            <div className="font-medium flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              {minutesToTimeString(slot.startMinuteOfDay)} - {minutesToTimeString(slot.endMinuteOfDay)}
            </div>
            <div className="text-xs opacity-75 mt-1">{slot.classroomName}</div>
            <div className="text-xs opacity-60">{slot.type === 'session' ? 'Buổi học' : 'Lớp thường'}</div>
          </div>
        ))}

        {/* New selected slots */}
        {newSlots.map((slot, index) => (
          <div
            key={`new-${index}`}
            className="mb-2 p-2 bg-green-100 border border-green-300 rounded text-xs text-green-800 group relative"
          >
            <button
              onClick={() => removeTimeSlot(slot)}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-2 h-2" />
            </button>
            <div className="font-medium flex items-center">
              <CheckCircle className="w-3 h-3 mr-1" />
              {minutesToTimeString(slot.startMinuteOfDay)} - {minutesToTimeString(slot.endMinuteOfDay)}
            </div>
            <div className="text-xs opacity-75 mt-1">Lớp mới</div>
            <div className="text-xs opacity-60">
              {((slot.endMinuteOfDay - slot.startMinuteOfDay) / 60).toFixed(1)}h
            </div>
          </div>
        ))}

        {/* Empty state */}
        {existingSlots.length === 0 && newSlots.length === 0 && (
          <div className="text-gray-400 text-xs italic text-center pt-8">
            Chưa có lịch
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-[80%] h-full max-w-none max-h-none overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 p-6 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Calendar className="w-6 h-6" />
              <div>
                <h2 className="text-xl font-bold">Lịch Dạy & Chọn Thời Gian</h2>
                <p className="text-purple-100 text-sm flex items-center mt-1">
                  <User className="w-4 h-4 mr-1" />
                  {teacherName}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                type="button"
                onClick={() => setShowAddSlot(true)}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 flex flex-rol"
              >
                <Plus className="w-4 h-4 mr-2" />
                Thêm Lịch
              </Button>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-600 border-t-transparent"></div>
              <span className="ml-3 text-gray-600">Đang tải lịch...</span>
            </div>
          ) : (
            <>
              {/* Schedule Grid */}
              <div className="flex-1 overflow-auto p-6">
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  {/* Header Row */}
                  <div className="grid grid-cols-8 bg-gray-100">
                    <div className="p-4 font-semibold text-gray-700 border-r border-gray-300 text-center">
                      Ca học
                    </div>
                    {Object.entries(dayLabels).map(([dayKey, dayLabel]) => (
                      <div key={dayKey} className="p-4 font-semibold text-gray-700 text-center border-r border-gray-300 last:border-r-0">
                        <div className="text-base">{dayLabel}</div>
                      </div>
                    ))}
                  </div>

                  {/* Time Period Rows */}
                  {timePeriods.map((period) => (
                    <div key={period.name} className="grid grid-cols-8 border-t border-gray-300">
                      {/* Period Label */}
                      <div className={`${period.color} p-4 font-semibold text-gray-700 border-r border-gray-300 flex items-center justify-center`}>
                        <div className="text-center">
                          <div className="text-lg">{period.name}</div>
                          <div className="text-xs text-gray-600">
                            {minutesToTimeString(period.start)} - {minutesToTimeString(period.end)}
                          </div>
                        </div>
                      </div>

                      {/* Day Columns */}
                      {Object.keys(dayLabels).map((dayKey) => (
                        <div key={`${dayKey}-${period.name}`} className="border-r border-gray-300 last:border-r-0">
                          {renderPeriodCell(dayKey, period)}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div className="flex-shrink-0 p-4 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-center space-x-6 text-sm">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-100 border border-green-300 rounded mr-2"></div>
                    <span>Lịch học bình thường</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded mr-2"></div>
                    <span>Lịch thi</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-red-100 border border-red-300 rounded mr-2"></div>
                    <span>Lịch tạm ngưng</span>
                  </div>
                </div>
              </div>

              {/* Summary */}
              {selectedSlots.length > 0 && (
                <div className="flex-shrink-0 p-4 bg-green-50 border-t border-green-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center text-green-800">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        <span className="font-medium">
                          Đã chọn {selectedSlots.length} khung giờ
                        </span>
                      </div>
                      <div className="text-sm text-green-700">
                        Tổng: {selectedSlots.reduce((total, slot) =>
                          total + ((slot.endMinuteOfDay - slot.startMinuteOfDay) / 60), 0
                        ).toFixed(1)} giờ/tuần
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-2xl">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {selectedSlots.length} khung giờ được chọn
            </div>
            <div className="flex space-x-3">
              <Button type="button" variant="secondary" onClick={onClose}>
                Hủy
              </Button>
              <Button type="button" onClick={handleApplySlots}>
                Áp Dụng Lịch ({selectedSlots.length})
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Slot Modal */}
      {showAddSlot && (
        <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center z-60">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Thêm Khung Giờ Mới</h3>
              <button
                onClick={() => setShowAddSlot(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày trong tuần
                </label>
                <select
                  value={newSlot.dayOfWeek}
                  onChange={(e) => setNewSlot(prev => ({
                    ...prev,
                    dayOfWeek: e.target.value as Weekday
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {Object.entries(weekdayMapping).map(([key, value]) => (
                    <option key={key} value={value}>
                      {dayLabels[key as keyof typeof dayLabels]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giờ bắt đầu
                  </label>
                  <input
                    type="time"
                    value={newSlot.startTime}
                    onChange={(e) => setNewSlot(prev => ({
                      ...prev,
                      startTime: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giờ kết thúc
                  </label>
                  <input
                    type="time"
                    value={newSlot.endTime}
                    onChange={(e) => setNewSlot(prev => ({
                      ...prev,
                      endTime: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowAddSlot(false)}
                >
                  Hủy
                </Button>
                <Button type="button" onClick={handleAddSlot}>
                  Thêm Khung Giờ
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntegratedScheduleModal;
