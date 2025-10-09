import { useAuth } from '@/hooks/useAuth';
import { useTeacher } from '@/hooks/useTeacher';
import { useTeacherSchedule } from '@/hooks/useTeacherSchedule';
import { ArrowLeft, Calendar, Clock, FileText, Video } from 'lucide-react';
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const TeacherSchedulePage: React.FC = () => {
  const { user } = useAuth();
  const { teacherId } = useParams<{ teacherId?: string }>();
  const navigate = useNavigate();

  // If teacherId is provided (admin viewing teacher), use it; otherwise use current user
  const effectiveTeacherId = teacherId || user?.id || null;
  const isAdminView = !!teacherId && teacherId !== user?.id;

  // Fetch teacher data if admin viewing
  const { data: teacherData } = useTeacher(effectiveTeacherId || '');

  // Fetch the teacher's schedule using their ID with new format
  const { data: scheduleData, isLoading } = useTeacherSchedule(
    effectiveTeacherId,
    undefined,
    undefined,
    'Asia_Ho_Chi_Minh',
    7,
    !!effectiveTeacherId
  );

  const teacherName = isAdminView
    ? teacherData?.data?.displayName || 'Teacher'
    : user?.displayName || 'My';

  const formatTime = (dateString: string): string => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const getStateColor = (state: string) => {
    switch (state) {
      case 'upcoming':
        return 'bg-blue-50 border-blue-500 text-blue-700';
      case 'ongoing':
        return 'bg-green-50 border-green-500 text-green-700';
      case 'completed':
        return 'bg-gray-50 border-gray-400 text-gray-600';
      case 'cancelled':
        return 'bg-red-50 border-red-500 text-red-700';
      default:
        return 'bg-gray-50 border-gray-300 text-gray-600';
    }
  };

  const getStateBadge = (state: string) => {
    switch (state) {
      case 'upcoming':
        return 'Upcoming';
      case 'ongoing':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return state;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          {isAdminView && (
            <button
              onClick={() => navigate('/teachers')}
              className="mb-3 inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Quay lại danh sách giáo viên
            </button>
          )}
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Calendar className="w-10 h-10 text-purple-600" />
            {isAdminView ? `Lịch dạy của ${teacherName}` : 'My Teaching Schedule'}
          </h1>
          <p className="text-gray-600">
            {isAdminView
              ? 'Xem lịch giảng dạy hàng tuần và phân công lớp học.'
              : 'View your weekly teaching schedule and classroom assignments.'}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Weekly Schedule</h2>
                <p className="text-purple-100 text-sm mt-1">
                  {teacherName}
                </p>
              </div>
              {scheduleData && (
                <div className="text-right">
                  <div className="text-sm text-purple-100">Week Period</div>
                  <div className="font-medium">
                    {scheduleData.weekStart} - {scheduleData.weekEnd}
                  </div>
                  <div className="text-xs text-purple-200 mt-1">
                    {scheduleData.summary.totalSessions} sessions total
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
            ) : !scheduleData ? (
              <div className="text-center py-12 text-gray-500">
                No schedule data available
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
                {scheduleData.days.map((day) => {

                  return (
                    <div
                      key={day.dayOfWeek}
                      className="border border-gray-200 rounded-xl overflow-hidden bg-gradient-to-b from-gray-50 to-white"
                    >
                      {/* Day Header */}
                      <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-3">
                        <div className="font-bold text-center">{day.label}</div>
                        <div className="text-xs text-center text-purple-100 mt-1">
                          {new Date(day.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                      </div>

                      {/* Sessions */}
                      <div className="p-3 space-y-2 min-h-[200px]">
                        {day.sessions.length === 0 ? (
                          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                            No classes
                          </div>
                        ) : (
                          day.sessions.map((session) => (
                            <div
                              key={session.sessionId}
                              className={`p-3 rounded-lg border-l-4 ${getStateColor(
                                session.state
                              )} hover:shadow-md transition-shadow cursor-pointer`}
                            >
                              {/* Time */}
                              <div className="flex items-start gap-2 mb-2">
                                <Clock className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                                <div className="text-xs font-semibold text-gray-700">
                                  {formatTime(session.startTime)} -{' '}
                                  {formatTime(session.endTime)}
                                </div>
                              </div>

                              {/* Classroom & Title */}
                              <div className="text-sm font-bold text-gray-900 mb-1">
                                {session.classroomName}
                              </div>
                              {session.title !== session.classroomName && (
                                <div className="text-xs text-gray-600 mb-2">
                                  {session.title}
                                </div>
                              )}

                              {/* State Badge */}
                              <div className="flex items-center justify-between">
                                <span className="text-xs px-2 py-0.5 rounded-full bg-white bg-opacity-50 font-medium">
                                  {getStateBadge(session.state)}
                                </span>

                                {/* Icons */}
                                <div className="flex items-center gap-1">
                                  {session.meetingUrl && (
                                    <Video className="w-3 h-3 text-purple-500" />
                                  )}
                                  {session.materials && (
                                    <FileText className="w-3 h-3 text-blue-500" />
                                  )}
                                  {session.course && (
                                    <span className="text-xs text-gray-500" title={session.course.title}>
                                      📚
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Timing info */}
                              {session.startsInMinutes !== null && session.startsInMinutes > 0 && (
                                <div className="mt-2 text-xs text-blue-600">
                                  Starts in {session.startsInMinutes} min
                                </div>
                              )}
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
            {scheduleData && !isLoading && (
              <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200">
                <div className="flex items-center gap-6">
                  <div className="text-purple-700">
                    <span className="font-medium">Total Sessions: </span>
                    {scheduleData.summary.totalSessions}
                  </div>
                  {Object.entries(scheduleData.summary.byState).map(([state, count]) => (
                    <div key={state} className="text-purple-700">
                      <span className="font-medium capitalize">{state}: </span>
                      {count}
                    </div>
                  ))}
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
