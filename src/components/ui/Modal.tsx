
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
    <div className="fixed inset-0 flex justify-center items-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-white rounded-xl shadow-sm">{icon}</div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
                <p className="text-sm text-gray-600">{description}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-gray-500 hover:bg-white hover:text-gray-800 transition-all duration-200 shadow-sm"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
