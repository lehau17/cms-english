import { getCourseById } from '@/apis/course';
import { Course } from '@/interface/course.interface';
import { Lesson } from '@/interface/lesson.interface';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Clock,
  Edit,
  FileText,
  ListChecks,
  Star,
  User,
  XCircle
} from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const CourseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);

  const { data: courseData, isLoading } = useQuery({
    queryKey: ['course-detail', id],
    queryFn: () => getCourseById(id as string),
    enabled: !!id,
  });

  const course = courseData?.data as Course | undefined;

  const formatDate = (dateString: string | Date | null | undefined): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActivityTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'listening': return '🎧';
      case 'speaking': return '🎤';
      case 'reading': return '📖';
      case 'writing': return '✍️';
      case 'vocabulary': return '📚';
      case 'grammar': return '📝';
      case 'quiz': return '❓';
      case 'pronunciation': return '🗣️';
      default: return '📄';
    }
  };

  const getActivityTypeBadgeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'listening': return 'bg-blue-100 text-blue-800';
      case 'speaking': return 'bg-purple-100 text-purple-800';
      case 'reading': return 'bg-green-100 text-green-800';
      case 'writing': return 'bg-orange-100 text-orange-800';
      case 'vocabulary': return 'bg-pink-100 text-pink-800';
      case 'grammar': return 'bg-indigo-100 text-indigo-800';
      case 'quiz': return 'bg-yellow-100 text-yellow-800';
      case 'pronunciation': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const toggleLesson = (lessonId: string) => {
    setExpandedLesson(expandedLesson === lessonId ? null : lessonId);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h2>
        <button
          onClick={() => navigate('/courses')}
          className="flex items-center text-indigo-600 hover:text-indigo-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Courses
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50">
      {/* Header Banner */}
      <div className="relative h-80 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 overflow-hidden">
        {course.imageUrl ? (
          <>
            <img
              src={course.imageUrl}
              alt={course.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-32 h-32 text-white opacity-30" />
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-6 left-6">
          <button
            onClick={() => navigate('/courses')}
            className="flex items-center text-white bg-black bg-opacity-30 hover:bg-opacity-50 backdrop-blur-sm px-4 py-2 rounded-lg transition-all mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </button>
          <span className={`inline-flex px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm ${course.isPublished
            ? 'bg-green-500 bg-opacity-90 text-white'
            : 'bg-yellow-500 bg-opacity-90 text-white'
            }`}>
            {course.isPublished ? 'Published' : 'Draft'}
          </span>
        </div>

        {/* Actions */}
        <div className="absolute top-6 right-6 flex gap-2">
          <button
            onClick={() => navigate(`/courses/edit/${course.id}`)}
            className="flex items-center bg-white bg-opacity-90 hover:bg-opacity-100 backdrop-blur-sm text-gray-900 px-4 py-2 rounded-lg transition-all"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Course
          </button>
        </div>

        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black via-black/70 to-transparent">
          <h1 className="text-4xl font-bold text-white mb-2">{course.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-white">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(course.difficulty)} bg-opacity-90`}>
              {course.difficulty}
            </span>
            <span className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {course.totalDuration || 0} min
            </span>
            <span className="flex items-center">
              <BookOpen className="w-4 h-4 mr-1" />
              {course.totalLessons || 0} lessons
            </span>
            {course.instructor && (
              <span className="flex items-center">
                <User className="w-4 h-4 mr-1" />
                {course.instructor.firstName} {course.instructor.lastName}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-700 leading-relaxed">{course.description || 'No description provided.'}</p>
            </div>

            {/* Lessons & Activities */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Course Content</h2>
                <span className="text-sm text-gray-600">
                  {course.lessons?.length || 0} Lessons · {course.lessons?.reduce((sum, lesson) => sum + (lesson.activities?.length || 0), 0) || 0} Activities
                </span>
              </div>

              {course.lessons && course.lessons.length > 0 ? (
                <div className="space-y-3">
                  {course.lessons.map((lesson: Lesson, index: number) => (
                    <div
                      key={lesson.id}
                      className="border border-gray-200 rounded-lg overflow-hidden hover:border-indigo-300 transition-colors"
                    >
                      {/* Lesson Header */}
                      <button
                        onClick={() => toggleLesson(lesson.id)}
                        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <span className="flex-shrink-0 w-10 h-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-semibold">
                            {index + 1}
                          </span>
                          <div className="text-left">
                            <h3 className="font-semibold text-gray-900">{lesson.title}</h3>
                            {lesson.description && (
                              <p className="text-sm text-gray-600 line-clamp-1">{lesson.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="flex items-center">
                              <FileText className="w-4 h-4 mr-1" />
                              {lesson.activities?.length || 0} activities
                            </span>
                            <span className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {lesson.estimatedTime || 0} min
                            </span>
                            {lesson.isLocked && (
                              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                                Locked
                              </span>
                            )}
                          </div>
                          {expandedLesson === lesson.id ? (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </button>

                      {/* Activities List */}
                      {expandedLesson === lesson.id && (
                        <div className="p-4 bg-white space-y-2">
                          {lesson.activities && lesson.activities.length > 0 ? (
                            lesson.activities.map((activity: any, actIndex: number) => (
                              <div
                                key={activity.id}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                              >
                                <div className="flex items-center space-x-3">
                                  <span className="text-2xl">{getActivityTypeIcon(activity.type)}</span>
                                  <div>
                                    <div className="flex items-center space-x-2">
                                      <span className="text-xs font-medium text-gray-500">#{actIndex + 1}</span>
                                      <h4 className="text-sm font-medium text-gray-900">{activity.title}</h4>
                                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getActivityTypeBadgeColor(activity.type)}`}>
                                        {activity.type}
                                      </span>
                                    </div>
                                    {activity.instructions && (
                                      <p className="text-xs text-gray-600 mt-1 line-clamp-1">{activity.instructions}</p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center space-x-3 text-xs text-gray-600">
                                  {activity.points !== undefined && (
                                    <span className="flex items-center">
                                      <Star className="w-3 h-3 mr-1 text-yellow-500" />
                                      {activity.points} pts
                                    </span>
                                  )}
                                  {activity.passingScore !== undefined && (
                                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full">
                                      Pass: {activity.passingScore}%
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              <ListChecks className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                              <p className="text-sm">No activities in this lesson</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p>No lessons available for this course</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Right Column */}
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <BookOpen className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Lessons</span>
                  </div>
                  <span className="text-xl font-bold text-blue-600">{course.totalLessons || 0}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Duration</span>
                  </div>
                  <span className="text-xl font-bold text-green-600">{course.totalDuration || 0}m</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-purple-600 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Price</span>
                  </div>
                  <span className="text-xl font-bold text-purple-600">${course.price || 0}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center">
                    {course.isPublished ? (
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    ) : (
                      <XCircle className="w-5 h-5 text-yellow-600 mr-2" />
                    )}
                    <span className="text-sm font-medium text-gray-700">Status</span>
                  </div>
                  <span className={`text-sm font-semibold ${course.isPublished ? 'text-green-600' : 'text-yellow-600'}`}>
                    {course.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
              </div>
            </div>

            {/* Instructor */}
            {course.instructor && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Instructor</h2>
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden bg-gray-200">
                    <img
                      src={
                        course.instructor.avatarUrl ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          `${course.instructor.firstName || ''} ${course.instructor.lastName || ''}`.trim() ||
                          course.instructor.displayName ||
                          'Instructor'
                        )}&background=8b5cf6&color=fff&size=56`
                      }
                      alt={`${course.instructor.firstName} ${course.instructor.lastName}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.currentTarget;
                        const name = `${course.instructor?.firstName || ''} ${course.instructor?.lastName || ''}`.trim() ||
                          course.instructor?.displayName ||
                          'Instructor';
                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=8b5cf6&color=fff&size=56`;
                      }}
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {course.instructor.firstName} {course.instructor.lastName}
                    </h3>
                    <p className="text-sm text-gray-600 truncate">{course.instructor.email}</p>
                    <p className="text-xs text-gray-500">Course Instructor</p>
                  </div>
                </div>
              </div>
            )}

            {/* Tags */}
            {course.tags && course.tags.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {course.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium hover:bg-gray-200 transition-colors"
                    >
                      {tag}
                    </span>
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

export default CourseDetailPage;
