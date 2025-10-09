import { useTeacher } from '@/hooks/useTeacher';
import { UserResponse } from '@/interface/user.interface';
import { CalendarDays, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Modal from '../ui/Modal';

interface ViewTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: UserResponse | null;
}

const ViewTeacherModal: React.FC<ViewTeacherModalProps> = ({ isOpen, onClose, teacher }) => {
  const navigate = useNavigate();
  const { data: teacherData, isLoading } = useTeacher(teacher?.id || '');

  const handleViewSchedule = () => {
    if (teacher?.id) {
      navigate(`/teachers/${teacher.id}/schedule`);
      onClose();
    }
  };

  const renderDetail = (label: string, value: any) => (
    <div className="py-1.5 sm:grid sm:grid-cols-3 sm:gap-3">
      <dt className="text-xs font-medium text-gray-500">{label}</dt>
      <dd className="mt-0.5 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{value || 'N/A'}</dd>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Teacher Details"
      description={`Viewing details for ${teacher?.displayName}`}
      icon={<Eye className="w-6 h-6 text-blue-600" />}
    >
      <div className="p-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : teacherData ? (
          <>
            {/* Avatar Display - Always show */}
            <div className="flex justify-center mb-4">
              <img
                src={teacherData.data.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(teacherData.data.displayName || 'Teacher')}&background=3b82f6&color=fff&size=96`}
                alt={teacherData.data.displayName || 'Teacher'}
                className="w-24 h-24 rounded-full object-cover border-4 border-blue-100 shadow-lg"
                onError={(e) => {
                  e.currentTarget.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(teacherData.data.displayName || 'Teacher') + '&background=3b82f6&color=fff&size=96';
                }}
              />
            </div>

            <dl>
              {renderDetail('Full Name', `${teacherData.data.firstName} ${teacherData.data.lastName}`)}
              {renderDetail('Display Name', teacherData.data.displayName)}
              {renderDetail('Avatar URL', teacherData.data.avatarUrl)}
              {renderDetail('Email', teacherData.data.email)}
              {renderDetail('Phone', teacherData.data.phone)}
              {renderDetail('Gender', teacherData.data.gender)}
              {renderDetail('Created At', new Date(teacherData.data.createdAt).toLocaleString())}
              {renderDetail('Updated At', new Date(teacherData.data.updatedAt).toLocaleString())}
            </dl>

            {/* Action Buttons */}
            <div className="mt-6 pt-4 border-t flex justify-end gap-3">
              <button
                onClick={handleViewSchedule}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <CalendarDays className="w-4 h-4" />
                Xem lịch dạy
              </button>
            </div>
          </>
        ) : (
          <p>Could not load teacher details.</p>
        )}
      </div>
    </Modal>
  );
};

export default ViewTeacherModal;
