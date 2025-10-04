import { Assignment, assignmentApi } from '@/apis/assignment';
import { getClassroomById } from '@/apis/classroom';
import { getClassroomDetail } from '@/apis/classroom-detail';
import { getCourseById } from '@/apis/course';
import { Classroom } from '@/interface/classroom.interface';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  Edit,
  FileText,
  User,
  Users
} from 'lucide-react';
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const ClassroomDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Fetch classroom data
  const { data: classroomData, isLoading: isLoadingClassroom } = useQuery({
    queryKey: ['classroom', id],
    queryFn: () => getClassroomById(id as string),
    enabled: !!id,
  });

  // Fetch classroom detail (may include course info)
  const { data: classroomDetailData, isLoading: isLoadingDetail } = useQuery({
    queryKey: ['classroom-detail', id],
    queryFn: () => getClassroomDetail(id as string),
    enabled: !!id,
  });

  // Fetch assignments for this classroom
  const { data: assignmentsData, isLoading: isLoadingAssignments } = useQuery({
    queryKey: ['classroom-assignments', id],
    queryFn: () => assignmentApi.getClassroomAssignments(id as string),
    enabled: !!id,
  });

  // Fetch course data if classroom has a courseId
  const classroom = (classroomData || classroomDetailData?.data) as Classroom | undefined;
  const courseId = classroom?.courseId;

  const { data: courseData, isLoading: isLoadingCourse } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => getCourseById(courseId as string),
    enabled: !!courseId,
  });

  const formatDate = (dateString: string | Date | null | undefined): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isLoading = isLoadingClassroom || isLoadingDetail || isLoadingCourse || isLoadingAssignments;

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

  const course = courseData?.data;
  const assignments: Assignment[] = assignmentsData?.data?.assignments || [];

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
                        {course.lessons.map((lesson, index) => (
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
                  {classroom.students.map((student, index) => (
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
                  onClick={() => {/* TODO: Add edit functionality */}}
                  className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit Classroom</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassroomDetailPage;
