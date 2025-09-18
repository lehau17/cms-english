import { deleteCourse } from '@/apis/course';
import { Course } from '@/interface/course.interface';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import Button from '../ui/Button';
import Modal from '../ui/Modal';

interface DeleteCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course | null;
}

const DeleteCourseModal: React.FC<DeleteCourseModalProps> = ({ isOpen, onClose, course }) => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => deleteCourse(course!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      onClose();
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Course"
      description={`Are you sure you want to delete the course "${course?.title}"?`}
      icon={<Trash2 className="w-6 h-6 text-red-600" />}
    >
      <div className="px-4 py-3 flex justify-end space-x-3">
        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        <Button type="button" variant="danger" onClick={handleDelete} isLoading={deleteMutation.isPending}>
          <span>Delete</span>
        </Button>
      </div>
    </Modal>
  );
};

export default DeleteCourseModal;
