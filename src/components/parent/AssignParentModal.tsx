import { assignChildrenToParent, getUnassignedStudents, removeChildFromParent } from '@/apis/parent';
import { Parent, StudentForParent } from '@/interface/parent.interface';
import { Search, UserMinus, UserPlus, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

interface AssignParentModalProps {
  isOpen: boolean;
  onClose: () => void;
  parent: Parent;
  onSuccess: () => void;
}

const AssignParentModal: React.FC<AssignParentModalProps> = ({
  isOpen,
  onClose,
  parent,
  onSuccess,
}) => {
  const [unassignedStudents, setUnassignedStudents] = useState<StudentForParent[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchUnassignedStudents();
    }
  }, [isOpen]);

  const fetchUnassignedStudents = async () => {
    try {
      const students = await getUnassignedStudents();
      setUnassignedStudents(students);
    } catch (error) {
      toast.error('Lỗi khi tải danh sách học sinh');
    }
  };

  const handleAssignStudents = async () => {
    if (selectedStudents.length === 0) {
      toast.error('Vui lòng chọn ít nhất một học sinh');
      return;
    }

    setLoading(true);
    try {
      await assignChildrenToParent(parent.id, { studentIds: selectedStudents });
      toast.success(`Đã gán ${selectedStudents.length} học sinh cho phụ huynh`);
      onSuccess();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Lỗi khi gán học sinh');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveChild = async (childId: string) => {
    setLoading(true);
    try {
      await removeChildFromParent(parent.id, childId);
      toast.success('Đã hủy liên kết học sinh');
      onSuccess();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Lỗi khi hủy liên kết');
    } finally {
      setLoading(false);
    }
  };

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const filteredUnassignedStudents = unassignedStudents.filter(student =>
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Gán học sinh cho phụ huynh
            </h2>
            <p className="text-gray-600 mt-1">
              {parent.firstName} {parent.lastName} ({parent.email})
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-12rem)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Current Children */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Học sinh hiện tại ({parent.children?.length || 0})
              </h3>

              {parent.children && parent.children.length > 0 ? (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {parent.children.map((child) => (
                    <div
                      key={child.id}
                      className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-green-600">
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
                      <button
                        onClick={() => handleRemoveChild(child.id)}
                        disabled={loading}
                        className="text-red-600 hover:text-red-800 disabled:opacity-50"
                        title="Hủy liên kết"
                      >
                        <UserMinus className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <UserPlus className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Chưa có học sinh nào được gán</p>
                </div>
              )}
            </div>

            {/* Available Students */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Học sinh có thể gán ({filteredUnassignedStudents.length})
                </h3>
              </div>

              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Tìm kiếm học sinh..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {filteredUnassignedStudents.length > 0 ? (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {filteredUnassignedStudents.map((student) => (
                    <div
                      key={student.id}
                      className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${selectedStudents.includes(student.id)
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        }`}
                      onClick={() => toggleStudentSelection(student.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            {student.name[0]?.toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {student.name}
                          </p>
                          <p className="text-xs text-gray-500">{student.email}</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student.id)}
                        onChange={() => toggleStudentSelection(student.id)}
                        className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Không có học sinh phù hợp</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            {selectedStudents.length > 0 && (
              <span>Đã chọn {selectedStudents.length} học sinh</span>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              onClick={handleAssignStudents}
              disabled={loading || selectedStudents.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Đang xử lý...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Gán học sinh ({selectedStudents.length})
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignParentModal;
