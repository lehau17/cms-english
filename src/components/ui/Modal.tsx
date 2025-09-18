
import { X } from 'lucide-react';
import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title, description, icon }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-desc"
        className="relative w-full max-w-xl max-h-[90vh] overflow-hidden rounded-xl bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3">
          <div className="flex items-center gap-2">
            {icon && <div className="p-2 bg-white rounded-lg shadow-sm">{icon}</div>}
            <div>
              <h3 id="modal-title" className="text-lg font-semibold text-gray-800">{title}</h3>
              <p id="modal-desc" className="text-xs text-gray-600">{description}</p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-white hover:text-gray-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
