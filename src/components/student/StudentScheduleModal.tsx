import { StudentWeeklySchedule } from '@/interface/student-schedule.interface';
import { BookOpen, Calendar, Clock, MapPin, User } from 'lucide-react';
import React from 'react';

interface StudentScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  schedule: StudentWeeklySchedule | null;
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

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const getStateColor = (state: string) => {
    switch (state) {
      case 'ongoing':
        return 'bg-green-50 border-green-400 text-green-800';
      case 'upcoming':
        return 'bg-blue-50 border-blue-400 text-blue-800';
      case 'completed':
        return 'bg-gray-50 border-gray-400 text-gray-600';
      case 'cancelled':
        return 'bg-red-50 border-red-400 text-red-600';
      default:
        return 'bg-gray-50 border-gray-300 text-gray-700';
    }
  };

  const getStateBadge = (state: string) => {
    const colors = {
      ongoing: 'bg-green-100 text-green-800',
      upcoming: 'bg-blue-100 text-blue-800',
      completed: 'bg-gray-100 text-gray-600',
      cancelled: 'bg-red-100 text-red-600',
    };
    return colors[state as keyof typeof colors] || 'bg-gray-100 text-gray-600';
  };

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
          ) : schedule ? (
            <>
              {/* Week Range */}
              <div className="mb-4 text-sm text-gray-600 text-center">
                Week: {new Date(schedule.weekStart).toLocaleDateString()} - {new Date(schedule.weekEnd).toLocaleDateString()}
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
                {schedule.days.map((day) => {
                  const isWeekend = day.dayOfWeek === 'Saturday' || day.dayOfWeek === 'Sunday';

                  return (
                    <div
                      key={day.date}
                      className={`border rounded-lg p-3 ${isWeekend ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-300'
                        }`}
                    >
                      <h3 className={`font-semibold text-sm mb-3 ${isWeekend ? 'text-gray-600' : 'text-gray-800'
                        }`}>
                        {day.label}
                      </h3>

                      <div className="space-y-2">
                        {day.sessions.length === 0 ? (
                          <div className="text-xs text-gray-400 italic py-2">
                            No scheduled classes
                          </div>
                        ) : (
                          day.sessions.map((session) => (
                            <div
                              key={session.id}
                              className={`p-2 rounded text-xs border-l-4 ${getStateColor(session.state)}`}
                            >
                              {/* Time */}
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-3 h-3" />
                                  <span className="font-medium">
                                    {formatTime(session.startTime)} - {formatTime(session.endTime)}
                                  </span>
                                </div>
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${getStateBadge(session.state)}`}>
                                  {session.state}
                                </span>
                              </div>

                              {/* Title */}
                              <div className="font-medium text-xs mb-1">
                                {session.title}
                              </div>

                              {/* Classroom */}
                              <div className="flex items-center space-x-1 text-xs opacity-80 mb-1">
                                <MapPin className="w-3 h-3" />
                                <span>{session.classroomName}</span>
                              </div>

                              {/* Instructor */}
                              {session.instructor && (
                                <div className="flex items-center space-x-1 text-xs opacity-70">
                                  <User className="w-3 h-3" />
                                  <span>{session.instructor.displayName}</span>
                                </div>
                              )}

                              {/* Course */}
                              {session.course && (
                                <div className="flex items-center space-x-1 text-xs opacity-70 mt-1">
                                  <BookOpen className="w-3 h-3" />
                                  <span>{session.course.title}</span>
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>

                      {/* Day total */}
                      {day.sessions.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-gray-200">
                          <div className="text-xs text-gray-600">
                            {day.sessions.length} session{day.sessions.length > 1 ? 's' : ''}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Summary */}
              <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                <h4 className="font-semibold text-indigo-800 mb-2 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Weekly Summary
                </h4>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-indigo-700">
                    <span className="font-medium">Total Sessions: </span>
                    {schedule.summary.totalSessions}
                  </div>
                  <div className="text-indigo-700">
                    <span className="font-medium">By State: </span>
                    {Object.entries(schedule.summary.byState).map(([state, count]) => (
                      <span key={state} className="ml-2">
                        {state}: {count}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center text-gray-500 py-12">
              No schedule data available
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
