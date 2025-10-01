import { Course } from '@/interface/course.interface';
import { BookOpen, CheckCircle, Clock, Edit, Eye, Star, Trash2, Users, X, XCircle } from 'lucide-react';
import React from 'react';

interface ViewCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course | null;
  onEdit?: (course: Course) => void;
  onDelete?: (course: Course) => void;
  onTogglePublish?: (course: Course) => void;
}

const ViewCourseModal: React.FC<ViewCourseModalProps> = ({
  isOpen,
  onClose,
  course,
  onEdit,
  onDelete,
  onTogglePublish
}) => {
  if (!isOpen || !course) return null;

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="relative flex items-start justify-center min-h-screen px-4 pt-10 pb-10 text-center">
        <div
          aria-hidden="true"
          className="fixed inset-0 z-0 bg-gray-900/25 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        <div className="relative z-10 inline-block w-full max-w-5xl overflow-y-auto text-left align-bottom transition-all transform bg-white shadow-xl rounded-2xl sm:my-8 sm:align-middle max-h-[90vh]">
          {/* Header */}
          <div className="relative">
            {/* Course Image */}
            <div className="h-64 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 rounded-t-2xl relative overflow-hidden">
              {course.imageUrl ? (
                <img
                  src={course.imageUrl}
                  alt={course.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BookOpen className="w-24 h-24 text-white opacity-50" />
                </div>
              )}
              <div className="absolute inset-0 bg-black bg-opacity-20"></div>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-2 transition-all duration-200 shadow-lg"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>

            {/* Status Badge */}
            <div className="absolute top-4 left-4">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${course.isPublished
                ? 'bg-green-500 text-white'
                : 'bg-yellow-500 text-white'
                }`}>
                {course.isPublished ? 'Published' : 'Draft'}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Title and Basic Info */}
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">{course.title}</h1>
              <div className="flex items-center space-x-4 text-xs sm:text-sm text-gray-600">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(course.difficulty)}`}>
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
                <span className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {course.instructor?.firstName} {course.instructor?.lastName}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700 text-sm leading-relaxed">{course.description || 'No description provided.'}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Lessons</p>
                    <p className="text-2xl font-bold text-blue-900">{course.totalLessons || 0}</p>
                  </div>
                  <BookOpen className="w-8 h-8 text-blue-500" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Duration</p>
                    <p className="text-2xl font-bold text-green-900">{course.totalDuration || 0}m</p>
                  </div>
                  <Clock className="w-8 h-8 text-green-500" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Price</p>
                    <p className="text-2xl font-bold text-purple-900">${course.price || 0}</p>
                  </div>
                  <Star className="w-8 h-8 text-purple-500" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600">Status</p>
                    <p className="text-lg font-bold text-orange-900">
                      {course.isPublished ? 'Published' : 'Draft'}
                    </p>
                  </div>
                  {course.isPublished ? (
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  ) : (
                    <XCircle className="w-8 h-8 text-yellow-500" />
                  )}
                </div>
              </div>
            </div>

            {/* Instructor Info */}
            {course.instructor && (
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Instructor</h3>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xl">
                      {course.instructor.firstName?.[0]}{course.instructor.lastName?.[0]}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-gray-900">
                      {course.instructor.firstName} {course.instructor.lastName}
                    </h4>
                    <p className="text-gray-600 text-sm">{course.instructor.email}</p>
                    <p className="text-xs text-gray-500">Course Instructor</p>
                  </div>
                </div>
              </div>
            )}

            {/* Course Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Course Information</h3>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Course ID:</span>
                    <span className="font-mono text-sm text-gray-900">{course.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Language:</span>
                    <span className="text-gray-900">{course.language?.toUpperCase() || 'EN'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Difficulty:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(course.difficulty)}`}>
                      {course.difficulty}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order:</span>
                    <span className="text-gray-900">{course.orderNo || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created:</span>
                    <span className="text-gray-900">{formatDate(course.createdAt as string)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Updated:</span>
                    <span className="text-gray-900">{formatDate(course.updatedAt as string)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {course.tags && course.tags.length > 0 ? (
                    course.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-xs"
                      >
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500 italic">No tags</span>
                  )}
                </div>
              </div>
            </div>

            {/* Lessons Preview */}
            {course.lessons && course.lessons.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Lessons ({course.lessons.length})</h3>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {course.lessons.map((lesson, index) => (
                    <div key={lesson.id} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="bg-purple-100 text-purple-700 text-sm font-semibold px-3 py-1 rounded-full">
                            Lesson {index + 1}
                          </span>
                          <h4 className="text-sm font-medium text-gray-900">{lesson.title}</h4>
                        </div>
                        <span className="text-xs text-gray-500">
                          {lesson.estimatedTime || 0} min
                        </span>
                      </div>
                      {lesson.description && (
                        <p className="text-gray-600 text-xs mt-2 ml-20">{lesson.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              {onTogglePublish && (
                <button
                  onClick={() => onTogglePublish(course)}
                  className={`flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${course.isPublished
                    ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                >
                  {course.isPublished ? (
                    <>
                      <Eye className="w-4 h-4 mr-2" />
                      Unpublish
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Publish
                    </>
                  )}
                </button>
              )}

              {onEdit && (
                <button
                  onClick={() => onEdit(course)}
                  className="flex items-center px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </button>
              )}

              {onDelete && (
                <button
                  onClick={() => onDelete(course)}
                  className="flex items-center px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </button>
              )}

              <button
                onClick={onClose}
                className="px-4 py-1.5 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewCourseModal;
