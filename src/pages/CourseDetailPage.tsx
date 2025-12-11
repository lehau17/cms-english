import { getCourseById } from '@/apis/course'; // Hàm gọi API lấy chi tiết khóa học theo id
import { Course } from '@/interface/course.interface'; // Kiểu dữ liệu Course
import { Lesson } from '@/interface/lesson.interface'; // Kiểu dữ liệu Lesson
import { getActivityIcon } from '@/utils/activityIcons';
import { formatVNDAlways } from '@/utils/currency.utils';
import { useQuery } from '@tanstack/react-query'; // Hook useQuery để fetch dữ liệu
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
} from 'lucide-react'; // Bộ icon dùng trong UI
import React, { useState } from 'react'; // React và useState
import { useNavigate, useParams } from 'react-router-dom'; // Hook lấy params URL và điều hướng

const CourseDetailPage: React.FC = () => { // Component trang chi tiết khóa học
  const { id } = useParams<{ id: string }>(); // Lấy course id từ URL
  const navigate = useNavigate(); // Dùng để chuyển hướng trang
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null); // Lưu lesson nào đang được mở (expand)

  const { data: courseData, isLoading } = useQuery({
    queryKey: ['course-detail', id], // Key cache cho React Query
    queryFn: () => getCourseById(id as string), // Hàm gọi API lấy course theo id
    enabled: !!id, // Chỉ gọi nếu có id
  });

  const course = courseData?.data as Course | undefined; // Lấy course từ response (nếu có)

  const formatDate = (dateString: string | Date | null | undefined): string => { // Hàm format ngày cho dễ đọc
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDifficultyColor = (difficulty: string) => { // Trả về class màu theo độ khó
    switch (difficulty?.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActivityTypeIcon = (type: string) => { // Get MUI icon for activity type
    return getActivityIcon(type, { fontSize: 'medium' });
  };

  const getActivityTypeBadgeColor = (type: string) => { // Trả về class màu badge theo loại hoạt động
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

  const toggleLesson = (lessonId: string) => { // Mở/đóng lesson theo id
    setExpandedLesson(expandedLesson === lessonId ? null : lessonId);
  };

  if (isLoading) { // Nếu đang load dữ liệu
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div> {/* Vòng quay loading */}
      </div>
    );
  }

  if (!course) { // Nếu không tìm thấy course
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy khóa học</h2>
        <button
          onClick={() => navigate('/courses')} // Quay lại danh sách khóa học
          className="flex items-center text-indigo-600 hover:text-indigo-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại danh sách khóa học
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50"> {/* Nền mềm, toàn màn hình */}
      {/* Header Banner */}
      <div className="relative h-80 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 overflow-hidden"> {/* Banner phía trên */}
        {course.imageUrl ? ( // Nếu có ảnh khóa học
          <>
            <img
              src={course.imageUrl}
              alt={course.title}
              className="w-full h-full object-cover" // Ảnh phủ toàn bộ banner
            />
            <div className="absolute inset-0 bg-black bg-opacity-40"></div> {/* Lớp phủ tối để chữ dễ đọc */}
          </>
        ) : ( // Nếu không có ảnh
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-32 h-32 text-white opacity-30" /> {/* Icon sách làm hình nền */}
          </div>
        )}

        {/* Nút back + badge trạng thái xuất bản */}
        <div className="absolute top-6 left-6">
          <button
            onClick={() => navigate('/courses')} // Quay lại danh sách khóa học
            className="flex items-center text-white bg-black bg-opacity-30 hover:bg-opacity-50 backdrop-blur-sm px-4 py-2 rounded-lg transition-all mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại danh sách khóa học
          </button>
          <span className={`inline-flex px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm ${course.isPublished
            ? 'bg-green-500 bg-opacity-90 text-white'
            : 'bg-yellow-500 bg-opacity-90 text-white'
            }`}>
            {course.isPublished ? 'Đã xuất bản' : 'Bản nháp'} {/* Trạng thái published/draft */}
          </span>
        </div>

        {/* Khu vực nút action (Edit course) */}
        <div className="absolute top-6 right-6 flex gap-2">
          <button
            onClick={() => navigate(`/courses/edit/${course.id}`)} // Điều hướng sang trang chỉnh sửa
            className="flex items-center bg-white bg-opacity-90 hover:bg-opacity-100 backdrop-blur-sm text-gray-900 px-4 py-2 rounded-lg transition-all"
          >
            <Edit className="w-4 h-4 mr-2" />
            Chỉnh sửa khóa học
          </button>
        </div>

        {/* Tiêu đề course overlay trên banner */}
        <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black via-black/70 to-transparent">
          <h1 className="text-4xl font-bold text-white mb-2">{course.title}</h1> {/* Tên khóa học */}
          <div className="flex flex-wrap items-center gap-4 text-white">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(course.difficulty)} bg-opacity-90`}>
              {course.difficulty} {/* Độ khó: Beginner / Intermediate / Advanced */}
            </span>
            <span className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {course.totalDuration || 0} phút {/* Tổng thời lượng khóa học */}
            </span>
            <span className="flex items-center">
              <BookOpen className="w-4 h-4 mr-1" />
              {course.totalLessons || 0} bài học {/* Tổng số lesson */}
            </span>
            {course.instructor && ( // Thông tin giảng viên nếu có
              <span className="flex items-center">
                <User className="w-4 h-4 mr-1" />
                {course.instructor.firstName} {course.instructor.lastName}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Nội dung chính bên dưới banner */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6"> {/* Chia layout 2 cột trái + 1 cột phải */}
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Mô tả</h2>
              <p className="text-gray-700 leading-relaxed">
                {course.description || 'Chưa có mô tả.'} {/* Mô tả khóa học */}
              </p>
            </div>

            {/* Lessons & Activities */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Nội dung khóa học</h2>
                <span className="text-sm text-gray-600">
                  {/* Tổng số bài học và tổng số hoạt động */}
                  {course.lessons?.length || 0} Bài học · {course.lessons?.reduce((sum, lesson) => sum + (lesson.activities?.length || 0), 0) || 0} Hoạt động
                </span>
              </div>

              {course.lessons && course.lessons.length > 0 ? ( // Nếu có lesson
                <div className="space-y-3">
                  {course.lessons.map((lesson: Lesson, index: number) => ( // Lặp qua từng lesson
                    <div
                      key={lesson.id}
                      className="border border-gray-200 rounded-lg overflow-hidden hover:border-indigo-300 transition-colors"
                    >
                      {/* Lesson Header */}
                      <button
                        onClick={() => toggleLesson(lesson.id)} // Bấm để mở/đóng lesson
                        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <span className="flex-shrink-0 w-10 h-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-semibold">
                            {index + 1} {/* Số thứ tự lesson */}
                          </span>
                          <div className="text-left">
                            <h3 className="font-semibold text-gray-900">{lesson.title}</h3> {/* Tiêu đề lesson */}
                            {lesson.description && (
                              <p className="text-sm text-gray-600 line-clamp-1">{lesson.description}</p> // Mô tả ngắn gọn
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="flex items-center">
                              <FileText className="w-4 h-4 mr-1" />
                              {lesson.activities?.length || 0} hoạt động {/* Số hoạt động trong lesson */}
                            </span>
                            <span className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {lesson.estimatedTime || 0} phút {/* Thời gian ước tính */}
                            </span>
                            {lesson.isLocked && ( // Nếu lesson bị khóa
                              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                                Đã khóa
                              </span>
                            )}
                          </div>
                          {expandedLesson === lesson.id ? ( // Icon mở/đóng
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </button>

                      {/* Activities List */}
                      {expandedLesson === lesson.id && ( // Chỉ render list activity khi lesson đang mở
                        <div className="p-4 bg-white space-y-2">
                          {lesson.activities && lesson.activities.length > 0 ? ( // Nếu có activity
                            lesson.activities.map((activity: any, actIndex: number) => (
                              <div
                                key={activity.id}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                              >
                                <div className="flex items-center space-x-3">
                                  <span className="text-2xl">{getActivityTypeIcon(activity.type)}</span> {/* Icon loại hoạt động */}
                                  <div>
                                    <div className="flex items-center space-x-2">
                                      <span className="text-xs font-medium text-gray-500">#{actIndex + 1}</span> {/* STT activity */}
                                      <h4 className="text-sm font-medium text-gray-900">{activity.title}</h4> {/* Tiêu đề activity */}
                                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getActivityTypeBadgeColor(activity.type)}`}>
                                        {activity.type} {/* Loại activity: listening, speaking, ... */}
                                      </span>
                                    </div>
                                    {activity.instructions && (
                                      <p className="text-xs text-gray-600 mt-1 line-clamp-1">{activity.instructions}</p> // Hướng dẫn ngắn
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center space-x-3 text-xs text-gray-600">
                                  {activity.points !== undefined && ( // Điểm của activity (nếu có)
                                    <span className="flex items-center">
                                      <Star className="w-3 h-3 mr-1 text-yellow-500" />
                                      {activity.points} điểm
                                    </span>
                                  )}
                                  {activity.passingScore !== undefined && ( // Điểm đạt yêu cầu (nếu có)
                                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full">
                                      Đạt: {activity.passingScore}%
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))
                          ) : ( // Nếu lesson chưa có activity
                            <div className="text-center py-8 text-gray-500">
                              <ListChecks className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                              <p className="text-sm">Chưa có hoạt động nào trong bài học này</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : ( // Nếu course không có lesson nào
                <div className="text-center py-12 text-gray-500">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p>Chưa có bài học nào cho khóa học này</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Right Column */}
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Thống kê</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <BookOpen className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Bài học</span>
                  </div>
                  <span className="text-xl font-bold text-blue-600">{course.totalLessons || 0}</span> {/* Tổng lesson */}
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Thời lượng</span>
                  </div>
                  <span className="text-xl font-bold text-green-600">{course.totalDuration || 0}phút</span> {/* Tổng thời lượng */}
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-purple-600 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Giá</span>
                  </div>
                  <span className="text-xl font-bold text-purple-600">{formatVNDAlways(course.price)}</span> {/* Giá khóa học */}
                </div>

                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center">
                    {course.isPublished ? ( // Icon trạng thái
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    ) : (
                      <XCircle className="w-5 h-5 text-yellow-600 mr-2" />
                    )}
                    <span className="text-sm font-medium text-gray-700">Trạng thái</span>
                  </div>
                  <span className={`text-sm font-semibold ${course.isPublished ? 'text-green-600' : 'text-yellow-600'}`}>
                    {course.isPublished ? 'Đã xuất bản' : 'Bản nháp'} {/* Trạng thái xuất bản */}
                  </span>
                </div>
              </div>
            </div>

            {/* Instructor */}
            {course.instructor && ( // Chỉ hiển thị nếu có thông tin giảng viên
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Giáo viên</h2>
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden bg-gray-200">
                    <img
                      src={
                        course.instructor.avatarUrl || // Ảnh đại diện nếu có
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          `${course.instructor.firstName || ''} ${course.instructor.lastName || ''}`.trim() ||
                          course.instructor.displayName ||
                          'Instructor'
                        )}&background=8b5cf6&color=fff&size=56` // Sinh avatar từ tên nếu không có ảnh
                      }
                      alt={`${course.instructor.firstName} ${course.instructor.lastName}`}
                      className="w-full h-full object-cover"
                      onError={(e) => { // Nếu ảnh lỗi thì fallback về avatar text
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
                      {course.instructor.firstName} {course.instructor.lastName} {/* Tên giảng viên */}
                    </h3>
                    <p className="text-sm text-gray-600 truncate">{course.instructor.email}</p> {/* Email giảng viên */}
                    <p className="text-xs text-gray-500">Giáo viên phụ trách</p>
                  </div>
                </div>
              </div>
            )}

            {/* Tags */}
            {course.tags && course.tags.length > 0 && ( // Hiển thị tags nếu có
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Thẻ</h2>
                <div className="flex flex-wrap gap-2">
                  {course.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium hover:bg-gray-200 transition-colors"
                    >
                      {tag} {/* Tên tag */}
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

export default CourseDetailPage; // Export component để dùng trong router
