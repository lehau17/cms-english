import { StudentScheduleSlot } from '@/interface/student-schedule.interface';
import { Calendar, Clock, User } from 'lucide-react';
import React from 'react';

interface StudentScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  schedule: { [dayOfWeek: string]: StudentScheduleSlot[] } | null;
  isLoading: boolean;
}

const StudentScheduleModal: React.FC<StudentScheduleModalProps> = ({
  isOpen,
  onClose,
  studentName,
  schedule,
  isLoading,
}) => {
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

  const minutesToTimeString = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const getDaySchedule = (dayKey: string) => {
    if (!schedule) return [];
    return schedule[dayKey] || [];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Calendar className="w-6 h-6" />
              <div>
                <h2 className="text-xl font-bold">Student Schedule</h2>
                <p className="text-indigo-100 text-sm flex items-center mt-1">
                  <User className="w-4 h-4 mr-1" />
                  {studentName}
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
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent"></div>
              <span className="ml-3 text-gray-600">Loading schedule...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
              {Object.entries(dayLabels).map(([dayKey, dayLabel]) => {
                const daySchedule = getDaySchedule(dayKey);
                const isWeekend = dayKey === 'sat' || dayKey === 'sun';

                return (
                  <div
                    key={dayKey}
                    className={`border rounded-lg p-3 ${isWeekend ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-300'
                      }`}
                  >
                    <h3 className={`font-semibold text-sm mb-3 ${isWeekend ? 'text-gray-600' : 'text-gray-800'
                      }`}>
                      {dayLabel}
                    </h3>

                    <div className="space-y-2">
                      {daySchedule.length === 0 ? (
                        <div className="text-xs text-gray-400 italic py-2">
                          No scheduled classes
                        </div>
                      ) : (
                        daySchedule.map((slot, index) => {
                          const duration = (slot.endMinuteOfDay - slot.startMinuteOfDay) / 60;

                          return (
                            <div
                              key={`${slot.classroomId}-${index}`}
                              className={`p-2 rounded text-xs border-l-4 ${slot.status === 'occupied'
                                ? 'bg-blue-50 border-blue-400 text-blue-800'
                                : 'bg-green-50 border-green-400 text-green-800'
                                }`}
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

                              {slot.sessionTitle && (
                                <div className="text-xs font-medium mt-1">
                                  {slot.sessionTitle}
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Show total hours for the day */}
                    {daySchedule.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-gray-200">
                        <div className="text-xs text-gray-600">
                          Total: {daySchedule.reduce((total, slot) =>
                            total + ((slot.endMinuteOfDay - slot.startMinuteOfDay) / 60), 0
                          ).toFixed(1)}h
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Summary */}
          {schedule && !isLoading && (
            <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
              <h4 className="font-semibold text-indigo-800 mb-2 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Weekly Summary
              </h4>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-indigo-700">
                  <span className="font-medium">Total Classes: </span>
                  {Object.values(schedule).flat().length}
                </div>
                <div className="text-indigo-700">
                  <span className="font-medium">Total Hours: </span>
                  {Object.values(schedule).flat().reduce((total, slot) =>
                    total + ((slot.endMinuteOfDay - slot.startMinuteOfDay) / 60), 0
                  ).toFixed(1)}h
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-2xl">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentScheduleModal;
