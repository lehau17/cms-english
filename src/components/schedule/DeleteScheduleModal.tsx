import { Trash2 } from 'lucide-react';
import Button from '../ui/Button';
import Modal from '../ui/Modal';

interface DeleteScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: any | null;
  onEventDelete: (eventId: any) => void;
}

const DeleteScheduleModal: React.FC<DeleteScheduleModalProps> = ({ isOpen, onClose, event, onEventDelete }) => {
  const handleDelete = () => {
    if (event) {
      onEventDelete(event.id);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Schedule"
      description={`Are you sure you want to delete "${event?.title}"? This action cannot be undone.`}
      icon={<Trash2 className="w-6 h-6 text-red-600" />}
    >
      <div className="p-6 flex justify-end space-x-3">
        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        <Button type="button" variant="danger" onClick={handleDelete}>
          <span>Delete</span>
        </Button>
      </div>
    </Modal>
  );
};

export default DeleteScheduleModal;