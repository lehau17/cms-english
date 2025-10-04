import { useAuth } from '@/hooks/useAuth';
import { useTeacherSchedule } from '@/hooks/useTeacherSchedule';
import { TeacherScheduleSlot } from '@/interface/teacher-schedule.interface';
import { Calendar, Clock } from 'lucide-react';
import React from 'react';

const TeacherSchedulePage: React.FC = () => {
  const { user } = useAuth();
  
  // Fetch the teacher's schedule using their ID
  const { data: scheduleData, isLoading } = useTeacherSchedule(
    user?.id || null,
    undefined,
    undefined,
    !!user?.id
  );

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

  const getDaySchedule = (dayKey: string): TeacherScheduleSlot[] => {
    if (!scheduleData?.schedule) return [];
    return scheduleData.schedule[dayKey] || [];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Calendar className="w-10 h-10 text-purple-600" />
            My Teaching Schedule
          </h1>
          <p className="text-gray-600">View your weekly teaching schedule and classroom assignments.</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Weekly Schedule</h2>
                <p className="text-purple-100 text-sm mt-1">
                  {user?.displayName || user?.email}
                </p>
              </div>
              {scheduleData && (
                <div className="text-right">
                  <div className="text-sm text-purple-100">Week Period</div>
                  <div className="font-medium">
                    {new Date(scheduleData.weekStart).toLocaleDateString()} - {new Date(scheduleData.weekEnd).toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-600 border-t-transparent"></div>
                <span className="ml-3 text-gray-600">Loading schedule...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
                {Object.entries(dayLabels).map(([dayKey, dayLabel]) => {
                  const daySchedule = getDaySchedule(dayKey);
                  
                  return (
                    <div
                      key={dayKey}
                      className="border border-gray-200 rounded-xl overflow-hidden bg-gradient-to-b from-gray-50 to-white"
                    >
                      {/* Day Header */}
                      <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-3">
                        <div className="font-bold text-center">{dayLabel}</div>
                      </div>

                      {/* Time Slots */}
                      <div className="p-3 space-y-2 min-h-[200px]">
                        {daySchedule.length === 0 ? (
                          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                            No classes
                          </div>
                        ) : (
                          daySchedule.map((slot, idx) => (
                            <div
                              key={idx}
                              className={`p-3 rounded-lg border-l-4 ${
                                slot.status === 'occupied'
                                  ? 'bg-purple-50 border-purple-500'
                                  : 'bg-gray-50 border-gray-300'
                              } hover:shadow-md transition-shadow`}
                            >
                              <div className="flex items-start gap-2 mb-2">
                                <Clock className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                                <div className="text-xs font-semibold text-gray-700">
                                  {minutesToTimeString(slot.startMinuteOfDay)} - {minutesToTimeString(slot.endMinuteOfDay)}
                                </div>
                              </div>
                              
                              <div className="text-sm font-bold text-gray-900 mb-1">
                                {slot.classroomName}
                              </div>
                              
                              {slot.sessionTitle && (
                                <div className="text-xs text-gray-600 mb-1">
                                  {slot.sessionTitle}
                                </div>
                              )}
                              
                              <div className="flex items-center justify-between mt-2">
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                  slot.status === 'occupied'
                                    ? 'bg-purple-100 text-purple-700'
                                    : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {slot.type === 'classroom_slot' ? 'Classroom' : 'Session'}
                                </span>
                                {slot.sessionStatus && (
                                  <span className="text-xs text-gray-500 capitalize">
                                    {slot.sessionStatus}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Summary */}
            {scheduleData?.schedule && !isLoading && (
              <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200">
                <div className="flex items-center justify-between">
                  <div className="text-purple-700">
                    <span className="font-medium">Total Classes: </span>
                    {Object.values(scheduleData.schedule).flat().length}
                  </div>
                  <div className="text-purple-700">
                    <span className="font-medium">Total Hours: </span>
                    {Object.values(scheduleData.schedule).flat().reduce((total, slot) =>
                      total + ((slot.endMinuteOfDay - slot.startMinuteOfDay) / 60), 0
                    ).toFixed(1)}h
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherSchedulePage;
