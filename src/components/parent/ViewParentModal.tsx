import { Parent } from '@/interface/parent.interface';
import { Calendar, CalendarDays, Mail, Phone, Shield, User, X } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface ViewParentModalProps {
  isOpen: boolean;
  onClose: () => void;
  parent: Parent;
}

const ViewParentModal: React.FC<ViewParentModalProps> = ({
  isOpen,
  onClose,
  parent,
}) => {
  const navigate = useNavigate();

  const handleViewSchedule = () => {
    if (parent?.id) {
      navigate(`/parents/${parent.id}/schedule`);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Thông tin phụ huynh
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {parent.firstName} {parent.lastName}
                </h3>
                <p className="text-gray-600">{parent.displayName}</p>
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Email</p>
                  <p className="text-sm text-gray-600">{parent.email}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Số điện thoại</p>
                  <p className="text-sm text-gray-600">{parent.phoneNumber || 'Chưa có'}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Trạng thái</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${parent.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                    }`}>
                    {parent.isActive ? 'Hoạt động' : 'Không hoạt động'}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Ngày tạo</p>
                  <p className="text-sm text-gray-600">
                    {new Date(parent.createdAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </div>
            </div>

            {/* Children */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-3">
                Học sinh liên kết ({parent.children?.length || 0})
              </h4>
              {parent.children && parent.children.length > 0 ? (
                <div className="space-y-2">
                  {parent.children.map((child) => (
                    <div
                      key={child.id}
                      className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {child.name[0]?.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {child.name}
                        </p>
                        <p className="text-xs text-gray-500">{child.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Chưa có học sinh nào được gán</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between px-6 py-4 border-t bg-gray-50">
          <button
            onClick={handleViewSchedule}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <CalendarDays className="h-4 w-4" />
            Xem lịch các con
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewParentModal;
