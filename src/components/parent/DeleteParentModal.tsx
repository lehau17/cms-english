import { deleteParent } from '@/apis/parent';
import { Parent } from '@/interface/parent.interface';
import { AlertTriangle, X } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

interface DeleteParentModalProps {
  isOpen: boolean;
  onClose: () => void;
  parent: Parent;
  onSuccess: () => void;
}

const DeleteParentModal: React.FC<DeleteParentModalProps> = ({
  isOpen,
  onClose,
  parent,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteParent(parent.id);
      toast.success('Đã xóa tài khoản phụ huynh');
      onSuccess();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Lỗi khi xóa tài khoản');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Xóa tài khoản phụ huynh
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Xác nhận xóa
              </h3>
              <p className="text-gray-600">
                Hành động này không thể hoàn tác
              </p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h4 className="font-medium text-gray-900 mb-2">
              Thông tin phụ huynh sẽ bị xóa:
            </h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Họ tên:</strong> {parent.firstName} {parent.lastName}</p>
              <p><strong>Email:</strong> {parent.email}</p>
              <p><strong>Số học sinh liên kết:</strong> {parent.children?.length || 0}</p>
            </div>
          </div>

          {parent.children && parent.children.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg mb-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <p className="text-sm text-yellow-800">
                  <strong>Lưu ý:</strong> Các học sinh liên kết sẽ mất kết nối với phụ huynh này.
                </p>
              </div>
            </div>
          )}

          <p className="text-sm text-gray-600 mb-6">
            Bạn có chắc chắn muốn xóa tài khoản phụ huynh{' '}
            <strong>{parent.firstName} {parent.lastName}</strong>?
          </p>

          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Đang xóa...
                </>
              ) : (
                'Xóa tài khoản'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteParentModal;
