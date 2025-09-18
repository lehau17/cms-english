import { useTeacher } from '@/hooks/useTeacher';
import { Eye } from 'lucide-react';
import Modal from '../ui/Modal';
import { UserResponse } from '@/interface/user.interface';

interface ViewTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: UserResponse | null;
}

const ViewTeacherModal: React.FC<ViewTeacherModalProps> = ({ isOpen, onClose, teacher }) => {
  const { data: teacherData, isLoading } = useTeacher(teacher?.id || '');

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
          <dl>
            {renderDetail('Full Name', `${teacherData.data.firstName} ${teacherData.data.lastName}`)}
            {renderDetail('Display Name', teacherData.data.displayName)}
            {renderDetail('Email', teacherData.data.email)}
            {renderDetail('Phone', teacherData.data.phone)}
            {renderDetail('Gender', teacherData.data.gender)}
            {renderDetail('Status', teacherData.data.isActive ? 'Active' : 'Inactive')}
            {renderDetail('Created At', new Date(teacherData.data.createdAt).toLocaleString())}
            {renderDetail('Updated At', new Date(teacherData.data.updatedAt).toLocaleString())}
          </dl>
        ) : (
          <p>Could not load teacher details.</p>
        )}
      </div>
    </Modal>
  );
};

export default ViewTeacherModal;
