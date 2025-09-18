
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteClassroom } from '@/apis/classroom';
import { Classroom } from '@/interface/classroom.interface';
import Button from '../ui/Button';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface DeleteClassroomModalProps {
  isOpen: boolean;
  onClose: () => void;
  classroom: Classroom | null;
}

const DeleteClassroomModal: React.FC<DeleteClassroomModalProps> = ({ isOpen, onClose, classroom }) => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteClassroom(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classrooms'] });
      onClose();
    },
  });

  const confirmDelete = () => {
    if (classroom) {
      deleteMutation.mutate(classroom.id);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center p-3 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="p-4 text-center">
          <div className="mx-auto flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Delete Classroom</h3>
          <p className="text-gray-600 mb-4 text-sm">
            Are you sure you want to delete
            <span className="font-semibold text-gray-900"> "{classroom?.name}"</span>?
            <br />
            <span className="text-sm text-red-600">This action cannot be undone.</span>
          </p>

          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <h4 className="text-xs font-semibold text-red-800 mb-1">Warning</h4>
                <ul className="text-xs text-red-700 space-y-0.5">
                  <li>• All classroom data will be permanently deleted</li>
                  <li>• Students will lose access to this classroom</li>
                  <li>• Associated assignments and grades may be affected</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 rounded-b-xl">
          <div className="flex justify-center space-x-2">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button variant="danger" onClick={confirmDelete} isLoading={deleteMutation.isPending}>
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteClassroomModal;
