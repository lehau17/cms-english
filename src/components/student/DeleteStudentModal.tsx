import { useDeleteStudent } from '@/hooks/useStudent';
import { Student } from '@/interface/student.interface';
import { Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../ui/Button';
import Modal from '../ui/Modal';

interface DeleteStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
}

const DeleteStudentModal: React.FC<DeleteStudentModalProps> = ({ isOpen, onClose, student }) => {
  const deleteStudentMutation = useDeleteStudent();

  const handleDelete = () => {
    if (student) {
      deleteStudentMutation.mutate(student.id, {
        onSuccess: () => {
          toast.success('Student deleted successfully');
          onClose();
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || 'Failed to delete student');
        }
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Student"
      description={`Are you sure you want to delete ${student?.username}? This action cannot be undone.`}
      icon={<Trash2 className="w-6 h-6 text-red-600" />}
    >
      <div className="px-4 py-3 flex justify-end space-x-3">
        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        <Button type="button" variant="danger" onClick={handleDelete} isLoading={deleteStudentMutation.isPending}>
          <span>Delete</span>
        </Button>
      </div>
    </Modal>
  );
};

export default DeleteStudentModal;
