import TeacherScheduleView from '@/components/teacher/TeacherScheduleView';
import { useAuth } from '@/hooks/useAuth';
import { useTeacher } from '@/hooks/useTeacher';
import { ArrowLeft, Calendar } from 'lucide-react';
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

  const teacherName = isAdminView
    ? teacherData?.data?.displayName || 'Teacher'
    : user?.displayName || 'My';

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
        <TeacherScheduleView teacherId={effectiveTeacherId} />
      </div>
    </div>
  );
};

export default TeacherSchedulePage;

