import { Weekday } from '@/interface/enums';
import { TeacherScheduleSlot } from '@/interface/teacher-schedule.interface';
import { Calendar, CheckCircle, Clock, Plus, Trash2, User } from 'lucide-react';
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

  useEffect(() => {
    setSelectedSlots(currentSlots);
  }, [currentSlots]);

  if (!isOpen) return null;

  const dayLabels = {
    mon: 'Monday',
    tue: 'Tuesday',
    wed: 'Wednesday',
    thu: 'Thursday',
    fri: 'Friday',
    sat: 'Saturday',
    sun: 'Sunday',
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

  const minutesToTimeString = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const timeStringToMinutes = (timeString: string): number => {
    const [hours, minutes] = timeString.split(':').map(num => parseInt(num, 10));
    return hours * 60 + minutes;
  };

  const getDaySchedule = (dayKey: string) => {
    if (!schedule) return [];
    return schedule[dayKey] || [];
  };

  const isTimeSlotConflict = (dayKey: string, startMinute: number, endMinute: number): boolean => {
    const daySchedule = getDaySchedule(dayKey);
    return daySchedule.some(slot =>
      (startMinute < slot.endMinuteOfDay && endMinute > slot.startMinuteOfDay)
    );
  };

  const addTimeSlot = (dayKey: string, startMinute: number, endMinute: number) => {
    const dayOfWeek = weekdayMapping[dayKey as keyof typeof weekdayMapping];
    const newSlot: ClassroomSlot = {
      dayOfWeek,
      startMinuteOfDay: startMinute,
      endMinuteOfDay: endMinute,
    };

    // Check for conflicts
    if (isTimeSlotConflict(dayKey, startMinute, endMinute)) {
      alert('This time slot conflicts with teacher\'s existing schedule!');
      return;
    }

    // Check for duplicates
    const isDuplicate = selectedSlots.some(slot =>
      slot.dayOfWeek === dayOfWeek &&
      slot.startMinuteOfDay === startMinute &&
      slot.endMinuteOfDay === endMinute
    );

    if (isDuplicate) {
      alert('This time slot is already added!');
      return;
    }

    const updatedSlots = [...selectedSlots, newSlot];
    setSelectedSlots(updatedSlots);
    onSlotsChange(updatedSlots);
  };

  const removeTimeSlot = (index: number) => {
    const updatedSlots = selectedSlots.filter((_, i) => i !== index);
    setSelectedSlots(updatedSlots);
    onSlotsChange(updatedSlots);
  };

  const handleApplySlots = () => {
    onSlotsChange(selectedSlots);
    onClose();
  };

  const TimeSlotCreator = ({ dayKey, dayLabel }: { dayKey: string; dayLabel: string }) => {
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('10:30');

    const handleAddSlot = () => {
      const startMinute = timeStringToMinutes(startTime);
      const endMinute = timeStringToMinutes(endTime);

      if (endMinute <= startMinute) {
        alert('End time must be after start time!');
        return;
      }

      addTimeSlot(dayKey, startMinute, endMinute);
    };

    return (
      <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <h5 className="text-sm font-medium text-blue-800 mb-2">Add Class Time</h5>
        <div className="grid grid-cols-3 gap-2">
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="px-2 py-1 text-xs border rounded focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="px-2 py-1 text-xs border rounded focus:ring-2 focus:ring-blue-500"
          />
          <Button
            type="button"
            onClick={handleAddSlot}
            size="sm"
            className="text-xs py-1"
          >
            <Plus className="w-3 h-3 mr-1" />
            Add
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Calendar className="w-6 h-6" />
              <div>
                <h2 className="text-xl font-bold">Schedule & Time Selection</h2>
                <p className="text-purple-100 text-sm flex items-center mt-1">
                  <User className="w-4 h-4 mr-1" />
                  {teacherName}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-200px)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-600 border-t-transparent"></div>
              <span className="ml-3 text-gray-600">Loading schedule...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Teacher's Current Schedule */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Teacher's Current Schedule
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
                  {Object.entries(dayLabels).map(([dayKey, dayLabel]) => {
                    const daySchedule = getDaySchedule(dayKey);
                    const isWeekend = dayKey === 'sat' || dayKey === 'sun';
                    const selectedDaySlots = selectedSlots.filter(slot =>
                      slot.dayOfWeek === weekdayMapping[dayKey as keyof typeof weekdayMapping]
                    );

                    return (
                      <div
                        key={dayKey}
                        className={`border rounded-lg p-4 ${isWeekend ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-300'
                          }`}
                      >
                        <h4 className={`font-semibold text-sm mb-3 ${isWeekend ? 'text-gray-600' : 'text-gray-800'
                          }`}>
                          {dayLabel}
                        </h4>

                        {/* Existing Schedule */}
                        <div className="space-y-2 mb-4">
                          <h5 className="text-xs font-medium text-gray-600 uppercase">Existing Classes</h5>
                          {daySchedule.length === 0 ? (
                            <div className="text-xs text-gray-400 italic py-2">
                              No scheduled classes
                            </div>
                          ) : (
                            daySchedule.map((slot, index) => {
                              const duration = (slot.endMinuteOfDay - slot.startMinuteOfDay) / 60;

                              return (
                                <div
                                  key={`existing-${slot.classroomId}-${index}`}
                                  className="p-2 rounded text-xs border-l-4 bg-red-50 border-red-400 text-red-800"
                                >
                                  <div className="flex items-center space-x-1 mb-1">
                                    <Clock className="w-3 h-3" />
                                    <span className="font-medium">
                                      {minutesToTimeString(slot.startMinuteOfDay)} - {minutesToTimeString(slot.endMinuteOfDay)}
                                    </span>
                                  </div>
                                  <div className="text-xs opacity-80">
                                    {slot.classroomName}
                                  </div>
                                  <div className="text-xs opacity-60 mt-1">
                                    {duration.toFixed(1)}h • {slot.type === 'session' ? 'Session' : 'Regular Class'}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>

                        {/* Selected New Slots */}
                        {selectedDaySlots.length > 0 && (
                          <div className="space-y-2 mb-4">
                            <h5 className="text-xs font-medium text-green-600 uppercase">New Class Times</h5>
                            {selectedDaySlots.map((slot, index) => {
                              const globalIndex = selectedSlots.findIndex(s =>
                                s.dayOfWeek === slot.dayOfWeek &&
                                s.startMinuteOfDay === slot.startMinuteOfDay &&
                                s.endMinuteOfDay === slot.endMinuteOfDay
                              );
                              const duration = (slot.endMinuteOfDay - slot.startMinuteOfDay) / 60;

                              return (
                                <div
                                  key={`selected-${index}`}
                                  className="p-2 rounded text-xs border-l-4 bg-green-50 border-green-400 text-green-800 flex items-center justify-between"
                                >
                                  <div>
                                    <div className="flex items-center space-x-1 mb-1">
                                      <CheckCircle className="w-3 h-3" />
                                      <span className="font-medium">
                                        {minutesToTimeString(slot.startMinuteOfDay)} - {minutesToTimeString(slot.endMinuteOfDay)}
                                      </span>
                                    </div>
                                    <div className="text-xs opacity-80">
                                      New Class • {duration.toFixed(1)}h
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => removeTimeSlot(globalIndex)}
                                    className="text-red-500 hover:text-red-700 ml-2"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Add New Time Slot */}
                        <TimeSlotCreator dayKey={dayKey} dayLabel={dayLabel} />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selected Slots Summary */}
              {selectedSlots.length > 0 && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Selected Class Schedule ({selectedSlots.length} slots)
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-green-700">
                    {selectedSlots.map((slot, index) => {
                      const duration = (slot.endMinuteOfDay - slot.startMinuteOfDay) / 60;
                      return (
                        <div key={index} className="flex items-center justify-between bg-white p-2 rounded">
                          <span>
                            {dayLabels[slot.dayOfWeek]} {minutesToTimeString(slot.startMinuteOfDay)}-{minutesToTimeString(slot.endMinuteOfDay)} ({duration.toFixed(1)}h)
                          </span>
                          <button
                            onClick={() => removeTimeSlot(index)}
                            className="text-red-500 hover:text-red-700 ml-2"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-3 pt-3 border-t border-green-200 text-sm text-green-800">
                    <strong>Total weekly hours: {selectedSlots.reduce((total, slot) =>
                      total + ((slot.endMinuteOfDay - slot.startMinuteOfDay) / 60), 0
                    ).toFixed(1)}h</strong>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-2xl">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {selectedSlots.length} time slot{selectedSlots.length !== 1 ? 's' : ''} selected
            </div>
            <div className="flex space-x-3">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="button" onClick={handleApplySlots}>
                Apply Schedule ({selectedSlots.length})
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegratedScheduleModal;
