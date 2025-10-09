import { Assignment } from '@/apis/assignment';
import { getClassroomDetail } from '@/apis/classroom-detail';
import { getCourseById } from '@/apis/course';
import AddStudentToClassModal from '@/components/classroom/AddStudentToClassModal';
import CreateAssignmentModal from '@/components/classroom/CreateAssignmentModal';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  Edit,
  FileText,
  LayoutDashboard,
  Plus,
  User,
  UserPlus,
  Users
} from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

type TabType = 'overview' | 'assignments' | 'students' | 'schedule';

const ClassroomDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [isCreateAssignmentModalOpen, setIsCreateAssignmentModalOpen] = useState(false);

  // Fetch classroom detail with full data (students, course, assignments, etc.)
  const { data: classroomDetailData, isLoading: isLoadingDetail } = useQuery({
    queryKey: ['classroom-detail', id],
    queryFn: () => getClassroomDetail(id as string),
    enabled: !!id,
  });

  // Debug logging
  console.log('=== ClassroomDetailPage Debug ===');
  console.log('classroomDetailData:', classroomDetailData);
  console.log('isLoadingDetail:', isLoadingDetail);

  // Use classroom detail data (has everything we need)
  const classroom = classroomDetailData as any;
  console.log('classroom extracted:', classroom);
  console.log('classroom.students:', classroom?.students);
  console.log('classroom.students type:', typeof classroom?.students);
  console.log('classroom.students length:', classroom?.students?.length);

  const courseFromClassroom = classroom?.course; // Course is already in detail API response
  const courseId = classroom?.courseId;
  console.log('courseFromClassroom:', courseFromClassroom);
  console.log('courseId:', courseId);

  const { data: courseData, isLoading: isLoadingCourse } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => getCourseById(courseId as string),
    enabled: !!courseId && !courseFromClassroom, // Only fetch if course not already in classroom data
  });

  const formatDate = (dateString: string | Date | null | undefined): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isLoading = isLoadingDetail || isLoadingCourse;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!classroom) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Classroom Not Found</h2>
        <button
          onClick={() => navigate('/classrooms')}
          className="flex items-center text-indigo-600 hover:text-indigo-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Classrooms
        </button>
      </div>
    );
  }

  // Use course from classroom detail API (already included) or fallback to separate course API
  const course = courseFromClassroom || courseData?.data;
  // Assignments are already included in classroom detail
  const assignments: Assignment[] = classroom.assignments || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Back Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/classrooms')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Classrooms
          </button>

          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
            <h1 className="text-3xl font-bold mb-2">{classroom.name}</h1>
            <p className="text-indigo-100 mb-4">{classroom.description}</p>
            <div className="flex flex-wrap gap-3">
              <div className="inline-flex items-center bg-white/20 px-3 py-1.5 rounded-full text-sm font-medium">
                <Calendar className="w-4 h-4 mr-2" />
                Code: {classroom.classCode}
              </div>
              <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${classroom.isActive
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
                }`}>
                <CheckCircle className="w-4 h-4 mr-2" />
                {classroom.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${activeTab === 'overview'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Tổng Quan</span>
            </button>
            <button
              onClick={() => setActiveTab('assignments')}
              className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${activeTab === 'assignments'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <FileText className="w-5 h-5" />
              <span>Bài Tập</span>
              <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                {assignments.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${activeTab === 'students'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <Users className="w-5 h-5" />
              <span>Học Sinh</span>
              <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                {classroom.students?.length || 0}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${activeTab === 'schedule'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <Calendar className="w-5 h-5" />
              <span>Lịch Học</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Teacher Information */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center mb-4">
                  <User className="w-5 h-5 text-indigo-600 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-900">Teacher Information</h2>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {classroom.teacher?.firstName?.[0]}{classroom.teacher?.lastName?.[0]}
                    </span>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-900">
                      {classroom.teacher?.firstName} {classroom.teacher?.lastName}
                    </p>
                    <p className="text-sm text-gray-600">{classroom.teacher?.email}</p>
                  </div>
                </div>
              </div>

              {/* Course Information */}
              {course && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center mb-4">
                    <BookOpen className="w-5 h-5 text-indigo-600 mr-2" />
                    <h2 className="text-xl font-semibold text-gray-900">Course Information</h2>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.title}</h3>
                      <p className="text-gray-700 text-sm">{course.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-xs text-blue-600 font-medium mb-1">Difficulty</p>
                        <p className="text-sm font-semibold text-gray-900 capitalize">{course.difficulty}</p>
                      </div>
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <p className="text-xs text-purple-600 font-medium mb-1">Language</p>
                        <p className="text-sm font-semibold text-gray-900 uppercase">{course.language}</p>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <p className="text-xs text-green-600 font-medium mb-1">Total Lessons</p>
                        <p className="text-sm font-semibold text-gray-900">{course.totalLessons || 0}</p>
                      </div>
                      <div className="bg-orange-50 p-3 rounded-lg">
                        <p className="text-xs text-orange-600 font-medium mb-1">Duration</p>
                        <p className="text-sm font-semibold text-gray-900">{course.totalDuration || 0} min</p>
                      </div>
                    </div>
                    {course.lessons && course.lessons.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">Course Lessons</h4>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {course.lessons.map((lesson: any, index: number) => (
                            <div key={lesson.id} className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-1 rounded-full">
                                  {index + 1}
                                </span>
                                <div>
                                  <h5 className="text-sm font-medium text-gray-900">{lesson.title}</h5>
                                  {lesson.description && (
                                    <p className="text-xs text-gray-600 mt-0.5">{lesson.description}</p>
                                  )}
                                </div>
                              </div>
                              <span className="text-xs text-gray-500">
                                {lesson.estimatedTime || 0} min
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Assignments */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 text-indigo-600 mr-2" />
                    <h2 className="text-xl font-semibold text-gray-900">Assignments</h2>
                  </div>
                  <span className="bg-indigo-100 text-indigo-700 text-sm font-semibold px-3 py-1 rounded-full">
                    {assignments.length}
                  </span>
                </div>
                {assignments.length > 0 ? (
                  <div className="space-y-3">
                    {assignments.map((assignment) => (
                      <div key={assignment.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-sm font-semibold text-gray-900 mb-1">{assignment.title}</h3>
                            {assignment.description && (
                              <p className="text-xs text-gray-600 mb-2">{assignment.description}</p>
                            )}
                            <div className="flex flex-wrap gap-2">
                              {assignment.dueDate && (
                                <span className="inline-flex items-center text-xs text-gray-600">
                                  <Clock className="w-3 h-3 mr-1" />
                                  Due: {formatDate(assignment.dueDate)}
                                </span>
                              )}
                              {assignment.totalPoints && (
                                <span className="inline-flex items-center text-xs text-gray-600">
                                  <FileText className="w-3 h-3 mr-1" />
                                  {assignment.totalPoints} points
                                </span>
                              )}
                            </div>
                          </div>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${assignment.isPublished
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                            }`}>
                            {assignment.isPublished ? 'Published' : 'Draft'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No assignments yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Students & Stats */}
            <div className="space-y-6">
              {/* Statistics */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <Users className="w-5 h-5 text-blue-600 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Students</span>
                    </div>
                    <span className="text-xl font-bold text-blue-600">
                      {classroom.students?.length || 0}/{classroom.maxStudents}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-purple-600 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Assignments</span>
                    </div>
                    <span className="text-xl font-bold text-purple-600">{assignments.length}</span>
                  </div>
                  {course && (
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center">
                        <BookOpen className="w-5 h-5 text-green-600 mr-2" />
                        <span className="text-sm font-medium text-gray-700">Lessons</span>
                      </div>
                      <span className="text-xl font-bold text-green-600">{course.totalLessons || 0}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 text-orange-600 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Created</span>
                    </div>
                    <span className="text-sm font-semibold text-orange-600">{formatDate(classroom.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Students List */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Users className="w-5 h-5 text-indigo-600 mr-2" />
                    <h2 className="text-lg font-semibold text-gray-900">Students</h2>
                  </div>
                  <span className="bg-indigo-100 text-indigo-700 text-sm font-semibold px-3 py-1 rounded-full">
                    {classroom.students?.length || 0}
                  </span>
                </div>
                {classroom.students && classroom.students.length > 0 ? (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {classroom.students.map((student: any, index: number) => (
                      <div key={student.id || index} className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center mr-3">
                          <span className="text-white font-semibold text-sm">
                            {student.firstName?.[0]}{student.lastName?.[0]}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {student.firstName} {student.lastName}
                          </p>
                          <p className="text-xs text-gray-600 truncate">{student.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No students enrolled</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
                <div className="space-y-2">
                  <button
                    onClick={() => {/* TODO: Add edit functionality */ }}
                    className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit Classroom</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Assignments Tab */}
        {activeTab === 'assignments' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Quản Lý Bài Tập</h2>
              <button
                onClick={() => setIsCreateAssignmentModalOpen(true)}
                className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
              >
                <Plus className="w-5 h-5" />
                <span>Tạo Bài Tập</span>
              </button>
            </div>
            {assignments.length > 0 ? (
              <div className="space-y-4">
                {assignments.map((assignment) => (
                  <div key={assignment.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors border border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{assignment.title}</h3>
                        {assignment.description && (
                          <p className="text-sm text-gray-600 mb-3">{assignment.description}</p>
                        )}
                        <div className="flex flex-wrap gap-3">
                          {assignment.dueDate && (
                            <span className="inline-flex items-center text-sm text-gray-600 bg-white px-3 py-1 rounded-full">
                              <Clock className="w-4 h-4 mr-2" />
                              Hạn: {formatDate(assignment.dueDate)}
                            </span>
                          )}
                          {assignment.totalPoints && (
                            <span className="inline-flex items-center text-sm text-gray-600 bg-white px-3 py-1 rounded-full">
                              <FileText className="w-4 h-4 mr-2" />
                              {assignment.totalPoints} điểm
                            </span>
                          )}
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${assignment.isPublished
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {assignment.isPublished ? 'Đã xuất bản' : 'Nháp'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">Chưa có bài tập nào</p>
                <p className="text-gray-500 text-sm mt-2">Tạo bài tập đầu tiên để bắt đầu</p>
              </div>
            )}
          </div>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Danh Sách Học Sinh</h2>
                <div className="text-sm text-gray-600 mt-1">
                  <span className="font-semibold">{classroom.students?.length || 0}</span> / {classroom.maxStudents} học sinh
                </div>
              </div>
              <button
                onClick={() => setIsAddStudentModalOpen(true)}
                className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
              >
                <UserPlus className="w-5 h-5" />
                <span>Thêm Học Viên</span>
              </button>
            </div>
            {classroom.students && classroom.students.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {classroom.students.map((student: any, index: number) => (
                  <div key={student.id || index} className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center mr-4">
                      <span className="text-white font-bold text-lg">
                        {student.firstName?.[0]}{student.lastName?.[0]}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {student.firstName} {student.lastName}
                      </p>
                      <p className="text-xs text-gray-600 truncate">{student.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">Chưa có học sinh nào</p>
                <p className="text-gray-500 text-sm mt-2">Thêm học sinh để bắt đầu lớp học</p>
              </div>
            )}
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Lịch Học</h2>
            {classroom.slots && classroom.slots.length > 0 ? (
              <div className="space-y-4">
                {classroom.slots.map((slot: any, index: number) => (
                  <div key={slot.id || index} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-gray-900 capitalize">
                          {slot.dayOfWeek === 'mon' && 'Thứ Hai'}
                          {slot.dayOfWeek === 'tue' && 'Thứ Ba'}
                          {slot.dayOfWeek === 'wed' && 'Thứ Tư'}
                          {slot.dayOfWeek === 'thu' && 'Thứ Năm'}
                          {slot.dayOfWeek === 'fri' && 'Thứ Sáu'}
                          {slot.dayOfWeek === 'sat' && 'Thứ Bảy'}
                          {slot.dayOfWeek === 'sun' && 'Chủ Nhật'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {slot.startTime} - {slot.endTime} ({slot.duration} phút)
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-indigo-600">
                      {(slot.duration / 60).toFixed(1)}h
                    </span>
                  </div>
                ))}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Thời gian học</p>
                      <p className="text-xs text-gray-600 mt-1">{formatDate(classroom.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-indigo-600">{classroom.course?.plannedSessions || 0}</p>
                      <p className="text-xs text-gray-600">buổi học dự kiến</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">Chưa có lịch học</p>
                <p className="text-gray-500 text-sm mt-2">Lịch học sẽ được tạo tự động khi tạo lớp</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Student Modal */}
      <AddStudentToClassModal
        isOpen={isAddStudentModalOpen}
        onClose={() => setIsAddStudentModalOpen(false)}
        classroom={classroom || null}
      />

      {/* Create Assignment Modal */}
      <CreateAssignmentModal
        open={isCreateAssignmentModalOpen}
        onClose={() => setIsCreateAssignmentModalOpen(false)}
        classroomId={id || ''}
        onSuccess={(assignmentId) => {
          // Refresh assignments list after creation
          queryClient.invalidateQueries({ queryKey: ['classroom-detail', id] });
          setIsCreateAssignmentModalOpen(false);
        }}
      />
    </div>
  );
};

export default ClassroomDetailPage;
