import { useStudent } from '@/hooks/useStudent';
import { Student } from '@/interface/student.interface';
import { Eye } from 'lucide-react';
import Modal from '../ui/Modal';

interface ViewStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
}

const ViewStudentModal: React.FC<ViewStudentModalProps> = ({ isOpen, onClose, student }) => {
  const { data: studentData, isLoading } = useStudent(student?.id || '');

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
      title="Student Details"
      description={`Viewing details for ${student?.username}`}
      icon={<Eye className="w-6 h-6 text-blue-600" />}
    >
      <div className="p-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : studentData ? (
          <dl>
            {renderDetail('Username', studentData.data.username)}
            {renderDetail('Email', studentData.data.email)}
            {renderDetail('Phone', studentData.data.phone)}
            {renderDetail('Gender', studentData.data.gender)}
            {renderDetail('Status', studentData.data.status)}
            {renderDetail('Created At', new Date(studentData.data.createdAt).toLocaleString())}
            {renderDetail('Updated At', new Date(studentData.data.updatedAt).toLocaleString())}
          </dl>
        ) : (
          <p>Could not load student details.</p>
        )}
      </div>
    </Modal>
  );
};

export default ViewStudentModal;
