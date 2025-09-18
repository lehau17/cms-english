import { useDeleteTeacher } from '@/hooks/useTeacher';
import { Trash2 } from 'lucide-react';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { UserResponse } from '@/interface/user.interface';

interface DeleteTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: UserResponse | null;
}

const DeleteTeacherModal: React.FC<DeleteTeacherModalProps> = ({ isOpen, onClose, teacher }) => {
  const deleteTeacherMutation = useDeleteTeacher();

  const handleDelete = () => {
    if (teacher) {
      deleteTeacherMutation.mutate(teacher.id, {
        onSuccess: () => {
          onClose();
        },
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Teacher"
      description={`Are you sure you want to delete ${teacher?.displayName}? This action cannot be undone.`}
      icon={<Trash2 className="w-6 h-6 text-red-600" />}
    >
      <div className="px-4 py-3 flex justify-end space-x-3">
        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        <Button type="button" variant="danger" onClick={handleDelete} isLoading={deleteTeacherMutation.isPending}>
          <span>Delete</span>
        </Button>
      </div>
    </Modal>
  );
};

export default DeleteTeacherModal;
