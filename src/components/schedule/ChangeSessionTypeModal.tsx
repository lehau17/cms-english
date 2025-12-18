import React, { useState } from 'react';
import { X, AlertCircle, Video, Building, Layers } from 'lucide-react';
import { SessionType } from '@/interface/classroom.interface';
import { getSessionTypeLabel } from '@/utils/session-type-helpers';
import Button from '../ui/Button';
import Modal from '../ui/Modal';

interface ChangeSessionTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: {
    id: string;
    title: string;
    type: SessionType;
    meetingUrl?: string | null;
  };
  onConfirm: (sessionId: string, newType: SessionType, generateMeetLink: boolean) => void;
  isLoading?: boolean;
}

const ChangeSessionTypeModal: React.FC<ChangeSessionTypeModalProps> = ({
  isOpen,
  onClose,
  session,
  onConfirm,
  isLoading = false,
}) => {
  const [newType, setNewType] = useState<SessionType>(session.type);
  const [generateMeetLink, setGenerateMeetLink] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(session.id, newType, generateMeetLink);
  };

  const isTypeChanged = newType !== session.type;
  const willRemoveMeetLink = newType === 'offline' && session.meetingUrl;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Change Session Type"
      description={`Update type for "${session.title}"`}
      icon={<AlertCircle className="w-6 h-6 text-orange-600" />}
    >
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-800">
            <strong>Current type:</strong> {getSessionTypeLabel(session.type)}
          </p>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">
            New Session Type *
          </label>
          <div className="space-y-2">
            <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="sessionType"
                value="online"
                checked={newType === 'online'}
                onChange={(e) => setNewType(e.target.value as SessionType)}
                className="w-4 h-4 text-blue-600"
              />
              <Video className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">Online</span>
            </label>

            <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="sessionType"
                value="offline"
                checked={newType === 'offline'}
                onChange={(e) => setNewType(e.target.value as SessionType)}
                className="w-4 h-4 text-gray-600"
              />
              <Building className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium">Offline</span>
            </label>

            <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="sessionType"
                value="hybrid"
                checked={newType === 'hybrid'}
                onChange={(e) => setNewType(e.target.value as SessionType)}
                className="w-4 h-4 text-purple-600"
              />
              <Layers className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium">Hybrid</span>
            </label>
          </div>
        </div>

        {newType === 'online' && (
          <label className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <input
              type="checkbox"
              checked={generateMeetLink}
              onChange={(e) => setGenerateMeetLink(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-green-600"
            />
            <span className="text-xs text-green-800">
              Auto-generate Google Meet link for this session
            </span>
          </label>
        )}

        {willRemoveMeetLink && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <p className="text-xs text-orange-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>
                Changing to offline will remove the existing meeting link.
              </span>
            </p>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={!isTypeChanged || isLoading}>
            {isLoading ? 'Updating...' : 'Update Type'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ChangeSessionTypeModal;
