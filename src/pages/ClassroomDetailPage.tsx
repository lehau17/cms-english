
import { Assignment, assignmentApi } from '@/apis/assignment';
import { exportClassroomGradebook, getClassroomDetail, getClassroomGradebook } from '@/apis/classroom-detail';
import { AttendanceDialog } from '@/components/attendance/AttendanceDialog';
import AssignmentDetailModal from '@/components/classroom/AssignmentDetailModal';
import StudentGradeDetailModal from '@/components/student/StudentGradeDetailModal';
import ViewStudentModal from '@/components/student/ViewStudentModal';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/interface/enum.interface';
import { Student } from '@/interface/student.interface';
import { getActivityIcon } from '@/utils/activityIcons';
import { Tab, Tabs } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Clock,
  Download,
  Edit,
  FileText,
  GraduationCap,
  Hash,
  ListChecks,
  Plus,
  Star,
  User,
  Users,
  XCircle
} from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

type TabValue = 'overview' | 'slots' | 'students' | 'assignments' | 'attendance' | 'gradebook';

const ClassroomDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabValue>('overview');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isViewStudentModalOpen, setIsViewStudentModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<{ id: string; title: string; status?: string } | null>(null);
  const [isAttendanceDialogOpen, setIsAttendanceDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [selectedStudentForDetails, setSelectedStudentForDetails] = useState<{
    studentId: string;
    studentName: string;
  } | null>(null);
  const [isGradeDetailModalOpen, setIsGradeDetailModalOpen] = useState(false);
  const { user } = useAuth();
  const isAdmin = user?.role === UserRole.ADMIN;

  const dayOfWeekMap: Record<string, string> = {
    mon: 'Thứ 2',
    tue: 'Thứ 3',
    wed: 'Thứ 4',
    thu: 'Thứ 5',
    fri: 'Thứ 6',
    sat: 'Thứ 7',
    sun: 'Chủ nhật',
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const { data: classroomData, isLoading } = useQuery({
    queryKey: ['classroom-detail', id],
    queryFn: () => getClassroomDetail(id as string),
    enabled: !!id,
  });

  const { data: gradebookData, isLoading: isLoadingGradebook } = useQuery({
    queryKey: ['classroom-gradebook', id],
    queryFn: () => getClassroomGradebook(id as string),
    enabled: !!id && activeTab === 'gradebook',
  });

  // Fetch assignment detail when selected
  const { data: assignmentDetail, isLoading: loadingAssignment } = useQuery({
    queryKey: ['assignment-detail', selectedAssignment?.id],
    queryFn: () => assignmentApi.getAssignmentById(selectedAssignment!.id),
    enabled: !!selectedAssignment?.id,
  });

  const classroom = classroomData as any | undefined; // Lấy classroom từ response (nếu có)
  const course = classroom?.course; // Lấy course từ classroom (nếu có)

  const formatDate = (dateString: string | Date | null | undefined): string => { // Hàm format ngày cho dễ đọc
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => { // Trả về class màu theo trạng thái lớp học
    switch (status?.toLowerCase()) {
      case 'ongoing': return 'bg-green-100 text-green-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!classroom) { // Nếu không tìm thấy classroom
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy lớp học</h2>
        <button
          onClick={() => navigate('/classrooms')} // Quay lại danh sách lớp học
          className="flex items-center text-indigo-600 hover:text-indigo-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại danh sách lớp học
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50"> {/* Nền mềm, toàn màn hình */}
      {/* Header Banner */}
      <div className="relative h-80 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 overflow-hidden"> {/* Banner phía trên */}
        {course?.imageUrl ? ( // Nếu có ảnh khóa học
          <img
            src={course.imageUrl}
            alt={course.title}
            className="w-full h-full object-cover" // Ảnh phủ toàn bộ banner
          />
        ) : ( // Nếu không có ảnh
          <div className="w-full h-full flex items-center justify-center">
            <Users className="w-32 h-32 text-white opacity-30" /> {/* Icon lớp học làm hình nền */}
          </div>
        )}

        {/* Nút back + badge trạng thái */}
        <div className="absolute top-6 left-6">
          <button
            onClick={() => navigate('/classrooms')} // Quay lại danh sách lớp học
            className="flex items-center text-white bg-black bg-opacity-30 hover:bg-opacity-50 backdrop-blur-sm px-4 py-2 rounded-lg transition-all mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại danh sách lớp học
          </button>
          <span className={`inline-flex px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm ${getStatusColor(classroom.status)} bg-opacity-90`}>
            {classroom.status?.charAt(0).toUpperCase() + classroom.status?.slice(1) || 'Unknown'} {/* Trạng thái lớp học */}
          </span>
        </div>

        {/* Khu vực nút action (Edit classroom) */}
        <div className="absolute top-6 right-6 flex gap-2">
          <button
            onClick={() => navigate('/classrooms')} // Quay lại danh sách để chỉnh sửa
            className="flex items-center bg-white bg-opacity-90 hover:bg-opacity-100 backdrop-blur-sm text-gray-900 px-4 py-2 rounded-lg transition-all"
          >
            <Edit className="w-4 h-4 mr-2" />
            Quản lý lớp học
          </button>
        </div>

        {/* Tiêu đề classroom overlay trên banner - chỉ che phần dưới để text dễ đọc */}
        <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
          <h1 className="text-4xl font-bold text-white mb-2">{classroom.name}</h1> {/* Tên lớp học */}
          <div className="flex flex-wrap items-center gap-4 text-white">
            <span className="flex items-center">
              <Hash className="w-4 h-4 mr-1" />
              {classroom.classCode} {/* Mã lớp học */}
            </span>
            {classroom.teacher && ( // Thông tin giáo viên nếu có
              <span className="flex items-center">
                <User className="w-4 h-4 mr-1" />
                {classroom.teacher.firstName} {classroom.teacher.lastName}
              </span>
            )}
            <span className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              {classroom._count?.students || 0} / {classroom.maxStudents || '∞'} học viên {/* Số học sinh */}
            </span>
            {course && ( // Thông tin khóa học nếu có
              <span className="flex items-center">
                <BookOpen className="w-4 h-4 mr-1" />
                {course.title}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Nội dung chính bên dưới banner */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Tabs Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
          <Tabs
            value={activeTab}
            onChange={(_, newValue: TabValue) => setActiveTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 500,
                minHeight: 64,
              },
            }}
          >
            <Tab
              label="Tổng quan"
              value="overview"
              icon={<BookOpen className="w-5 h-5" />}
              iconPosition="start"
            />
            <Tab
              label="Lịch học"
              value="slots"
              icon={<Calendar className="w-5 h-5" />}
              iconPosition="start"
            />
            <Tab
              label="Học viên"
              value="students"
              icon={<Users className="w-5 h-5" />}
              iconPosition="start"
            />
            <Tab
              label="Bài tập"
              value="assignments"
              icon={<FileText className="w-5 h-5" />}
              iconPosition="start"
            />
            <Tab
              label="Điểm danh"
              value="attendance"
              icon={<CheckCircle className="w-5 h-5" />}
              iconPosition="start"
            />
            <Tab
              label="Bảng điểm"
              value="gradebook"
              icon={<GraduationCap className="w-5 h-5" />}
              iconPosition="start"
            />
          </Tabs>
        </div>

        {/* Tab Panels */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content - Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Mô tả</h2>
                <p className="text-gray-700 leading-relaxed">
                  {classroom.description || 'Chưa có mô tả.'}
                </p>
              </div>

              {/* Lessons & Activities */}
              {classroom.lessons && classroom.lessons.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Nội dung khóa học</h2>
                    <span className="text-sm text-gray-600">
                      {/* Tổng số bài học và tổng số hoạt động */}
                      {classroom.lessons?.length || 0} Bài học · {classroom.lessons?.reduce((sum: number, lesson: any) => sum + (lesson.activities?.length || 0), 0) || 0} Hoạt động
                    </span>
                  </div>

                  {classroom.lessons && classroom.lessons.length > 0 ? ( // Nếu có lesson
                    <div className="space-y-3">
                      {classroom.lessons.map((lesson: any, index: number) => ( // Lặp qua từng lesson
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
                  ) : ( // Nếu không có lesson nào
                    <div className="text-center py-12 text-gray-500">
                      <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                      <p>Chưa có bài học nào</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar - Right Column */}
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Thống kê</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <Users className="w-5 h-5 text-blue-600 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Học viên</span>
                    </div>
                    <span className="text-xl font-bold text-blue-600">{classroom._count?.students || 0} / {classroom.maxStudents || '∞'}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-green-600 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Bài tập</span>
                    </div>
                    <span className="text-xl font-bold text-green-600">{classroom._count?.assignments || 0}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center">
                      <BookOpen className="w-5 h-5 text-purple-600 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Bài học</span>
                    </div>
                    <span className="text-xl font-bold text-purple-600">{classroom.lessons?.length || 0}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center">
                      {classroom.isActive ? (
                        <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600 mr-2" />
                      )}
                      <span className="text-sm font-medium text-gray-700">Trạng thái</span>
                    </div>
                    <span className={`text-sm font-semibold ${getStatusColor(classroom.status)}`}>
                      {(() => {
                        switch (classroom.status?.toLowerCase()) {
                          case 'upcoming': return 'Sắp diễn ra';
                          case 'ongoing': return 'Đang diễn ra';
                          case 'completed': return 'Đã hoàn thành';
                          case 'cancelled': return 'Đã hủy';
                          default: return classroom.status?.charAt(0).toUpperCase() + classroom.status?.slice(1) || 'Unknown';
                        }
                      })()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Teacher */}
              {classroom.teacher && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Giáo viên</h2>
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden bg-gray-200">
                      <img
                        src={
                          classroom.teacher.avatarUrl ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            `${classroom.teacher.firstName || ''} ${classroom.teacher.lastName || ''}`.trim() ||
                            classroom.teacher.displayName ||
                            'Teacher'
                          )}&background=8b5cf6&color=fff&size=56`
                        }
                        alt={`${classroom.teacher.firstName} ${classroom.teacher.lastName}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.currentTarget;
                          const name = `${classroom.teacher?.firstName || ''} ${classroom.teacher?.lastName || ''}`.trim() ||
                            classroom.teacher?.displayName ||
                            'Teacher';
                          target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=8b5cf6&color=fff&size=56`;
                        }}
                      />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {classroom.teacher.firstName} {classroom.teacher.lastName}
                      </h3>
                      <p className="text-sm text-gray-600 truncate">{classroom.teacher.email}</p>
                      <p className="text-xs text-gray-500">Giáo viên chủ nhiệm</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Course Info */}
              {course && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Khóa học</h2>
                  <div className="space-y-2">
                    <h3 className="font-medium text-gray-900">{course.title}</h3>
                    {course.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'slots' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Lịch học</h2>
              <span className="text-sm text-gray-600">
                {classroom.slots?.filter((s: any) => s.isActive).length || 0} buổi học
              </span>
            </div>

            {classroom.slots && classroom.slots.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thứ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thời gian
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thời lượng
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      {isAdmin && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Thao tác
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {classroom.slots.map((slot: any) => (
                      <tr key={slot.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">
                            {dayOfWeekMap[slot.dayOfWeek] || slot.dayOfWeek}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">
                            {slot.startTime || formatTime(slot.startMinuteOfDay)} - {slot.endTime || formatTime(slot.endMinuteOfDay)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600">
                            {slot.duration ? `${slot.duration} phút` : 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${slot.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                            }`}>
                            {slot.isActive ? 'Đang hoạt động' : 'Không hoạt động'}
                          </span>
                        </td>
                        {isAdmin && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => {
                                // TODO: Implement edit slot modal
                                alert('Edit slot functionality coming soon');
                              }}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Sửa
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p>Chưa có lịch học nào</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'students' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Học viên</h2>
              <span className="text-sm text-gray-600">
                {classroom.students?.length || 0} đã tham gia
              </span>
            </div>

            {classroom.students && classroom.students.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {classroom.students.map((student: any) => {
                  const studentName = student.displayName ||
                    `${student.firstName || ''} ${student.lastName || ''}`.trim() ||
                    'Học viên không tên';

                  return (
                    <div
                      key={student.id}
                      onClick={() => {
                        const studentData: Student = {
                          id: student.id,
                          username: student.displayName || student.email || '',
                          email: student.email || '',
                          phone: student.phone || '',
                          firstName: student.firstName,
                          lastName: student.lastName,
                          avatarUrl: student.avatarUrl,
                          status: student.studentRecord?.isActive ? 'active' as any : 'inactive' as any,
                          role: 'student' as any,
                          gender: 'other' as any,
                          avatar: student.avatarUrl || '',
                          createdAt: student.studentRecord?.joinedAt || new Date().toISOString(),
                          updatedAt: new Date().toISOString(),
                        };
                        setSelectedStudent(studentData);
                        setIsViewStudentModalOpen(true);
                      }}
                      className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden bg-gray-200">
                          {student.avatarUrl ? (
                            <img
                              src={student.avatarUrl}
                              alt={studentName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.currentTarget;
                                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(studentName)}&background=6366f1&color=fff&size=48`;
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-700 font-semibold">
                              {studentName.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-gray-900 truncate">{studentName}</h3>
                          <p className="text-sm text-gray-600 truncate">{student.email}</p>
                          {student.studentRecord?.joinedAt && (
                            <p className="text-xs text-gray-500 mt-1">
                              Tham gia {formatDate(student.studentRecord.joinedAt)}
                            </p>
                          )}
                        </div>
                        {student.studentRecord?.isActive ? (
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p>Chưa có học viên nào tham gia</p>
              </div>
            )}

            <ViewStudentModal
              isOpen={isViewStudentModalOpen}
              onClose={() => {
                setIsViewStudentModalOpen(false);
                setSelectedStudent(null);
              }}
              student={selectedStudent}
            />
          </div>
        )}

        {activeTab === 'assignments' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Bài tập</h2>
              <button
                onClick={() => navigate(`/classrooms/${id}/create-assignment`)}
                className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Thêm bài tập</span>
              </button>
            </div>

            {classroom.assignments && classroom.assignments.length > 0 ? (
              <div className="space-y-4">
                {classroom.assignments
                  .sort((a: any, b: any) => {
                    const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
                    const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
                    return dateA - dateB;
                  })
                  .map((assignment: any) => {
                    const isOverdue = assignment.dueDate && new Date(assignment.dueDate) < new Date();
                    const dueDateFormatted = assignment.dueDate
                      ? formatDate(assignment.dueDate)
                      : 'Không có hạn nộp';

                    return (
                      <div
                        key={assignment.id}
                        onClick={() => {
                          setSelectedAssignment(assignment);
                          setIsAssignmentModalOpen(true);
                        }}
                        className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">{assignment.title}</h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${assignment.isPublished
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                                }`}>
                                {assignment.isPublished ? 'Đã xuất bản' : 'Bản nháp'}
                              </span>
                              {assignment.type && (
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {assignment.type}
                                </span>
                              )}
                            </div>
                            {assignment.description && (
                              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                {assignment.description}
                              </p>
                            )}
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span className={`flex items-center ${isOverdue ? 'text-red-600 font-semibold' : ''}`}>
                                <Clock className="w-4 h-4 mr-1" />
                                Hạn nộp: {dueDateFormatted}
                              </span>
                              <span className="flex items-center">
                                <Star className="w-4 h-4 mr-1 text-yellow-500" />
                                {assignment.totalPoints || 0} điểm
                              </span>
                              <span className="flex items-center">
                                <FileText className="w-4 h-4 mr-1" />
                                {assignment._count?.submissions || 0} bài nộp
                              </span>
                            </div>
                            {/* Edit Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/classrooms/${id}/edit-assignment/${assignment.id}`);
                              }}
                              className="flex-shrink-0 p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Chỉnh sửa bài tập"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="mb-4">Chưa có bài tập nào</p>
                <button
                  onClick={() => navigate(`/classrooms/${id}/create-assignment`)}
                  className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  <span>Tạo bài tập</span>
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'gradebook' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Bảng điểm lớp</h2>
              <button
                onClick={async () => {
                  try {
                    const blob = await exportClassroomGradebook(id as string);
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `bang-diem-${classroom?.name || 'classroom'}-${Date.now()}.xlsx`;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                  } catch (error) {
                    console.error('Export failed:', error);
                  }
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Xuất Excel</span>
              </button>
            </div>

            {isLoadingGradebook ? (
              <div className="text-center py-12 text-gray-500">
                <p>Đang tải dữ liệu...</p>
              </div>
            ) : gradebookData && gradebookData.students && gradebookData.students.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Họ và tên
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Giữa kỳ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cuối kỳ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bài kiểm tra
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hoạt động
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Điểm tổng kết
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {gradebookData.students.map((student) => (
                      <tr key={student.studentId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <div className="flex items-center space-x-2">
                            <span>{student.studentName}</span>
                            <button
                              onClick={() => {
                                setSelectedStudentForDetails({
                                  studentId: student.studentId,
                                  studentName: student.studentName,
                                });
                                setIsGradeDetailModalOpen(true);
                              }}
                              className="text-indigo-600 hover:text-indigo-800 text-xs font-medium"
                            >
                              Xem chi tiết
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.midterm !== null && student.midterm !== undefined
                            ? student.midterm.toFixed(1)
                            : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.final !== null && student.final !== undefined
                            ? student.final.toFixed(1)
                            : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.tests !== null && student.tests !== undefined
                            ? student.tests.toFixed(1)
                            : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.activities !== null && student.activities !== undefined
                            ? student.activities.toFixed(1)
                            : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          {student.finalGrade.toFixed(1)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <GraduationCap className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p>Chưa có dữ liệu điểm</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Quản lý điểm danh</h2>

            {course?.sessionSchedules && course.sessionSchedules.length > 0 ? (
              <div className="space-y-4">
                {course.sessionSchedules.map((session: any) => (
                  <div
                    key={session.id}
                    onClick={() => {
                      setSelectedSession({
                        id: session.id,
                        title: session.title || `Session ${session.sessionNumber}`,
                        status: session.status,
                      });
                      setIsAttendanceDialogOpen(true);
                    }}
                    className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {session.title || `Session ${session.sessionNumber}`}
                          </h3>
                          {session.status && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${session.status === 'ongoing'
                              ? 'bg-green-100 text-green-800'
                              : session.status === 'completed'
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-blue-100 text-blue-800'
                              }`}>
                              {session.status}
                            </span>
                          )}
                        </div>
                        {session.description && (
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {session.description}
                          </p>
                        )}
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center">
                            <Hash className="w-4 h-4 mr-1" />
                            Session #{session.sessionNumber}
                          </span>
                          {session.activities && session.activities.length > 0 && (
                            <span className="flex items-center">
                              <FileText className="w-4 h-4 mr-1" />
                              {session.activities.length} activities
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-indigo-600" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p>No sessions scheduled</p>
              </div>
            )}

            {selectedSession && (
              <AttendanceDialog
                open={isAttendanceDialogOpen}
                onClose={() => {
                  setIsAttendanceDialogOpen(false);
                  setSelectedSession(null);
                }}
                sessionId={selectedSession.id}
                sessionTitle={selectedSession.title}
                classroomId={id || ''}
                classroomName={classroom.name}
                sessionStatus={selectedSession.status}
              />
            )}
          </div>
        )}

        {/* Assignment Detail Modal - Moved outside tab conditions so it renders regardless of active tab */}
        <AssignmentDetailModal
          isOpen={isAssignmentModalOpen}
          onClose={() => {
            setIsAssignmentModalOpen(false);
            setSelectedAssignment(null);
          }}
          assignment={(assignmentDetail?.data || assignmentDetail || selectedAssignment) as Assignment | null}
        />

        {/* Student Grade Detail Modal */}
        {isGradeDetailModalOpen && selectedStudentForDetails && (
          <StudentGradeDetailModal
            open={isGradeDetailModalOpen}
            onClose={() => {
              setIsGradeDetailModalOpen(false);
              setSelectedStudentForDetails(null);
            }}
            classroomId={id as string}
            studentId={selectedStudentForDetails.studentId}
            studentName={selectedStudentForDetails.studentName}
          />
        )}
      </div>
    </div>
  );
};

export default ClassroomDetailPage; // Export component để dùng trong router
