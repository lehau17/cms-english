import { getParents } from '@/apis/parent';
import AssignParentModal from '@/components/parent/AssignParentModal';
import CreateParentModal from '@/components/parent/CreateParentModal';
import DeleteParentModal from '@/components/parent/DeleteParentModal';
import EditParentModal from '@/components/parent/EditParentModal';
import ViewParentModal from '@/components/parent/ViewParentModal';
import { useBaseRequestQuery } from '@/hooks/useBaseRequestQuery';
import { Parent } from '@/interface/parent.interface';
import {
  ChevronLeft,
  ChevronRight,
  Edit,
  Eye,
  Plus,
  Search,
  Trash2,
  UserPlus,
  Users
} from 'lucide-react';
import React, { useState } from 'react';

const ParentPage: React.FC = () => {
  const {
    data: parentData,
    isLoading,
    setPage,
    setLimit,
    setSearch,
    request,
  } = useBaseRequestQuery<Parent>({
    queryKey: ['parents'],
    queryFn: getParents,
  });

  const [selectedParent, setSelectedParent] = useState<Parent | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState<boolean>(false);

  const handleView = (parent: Parent) => {
    setSelectedParent(parent);
    setIsViewModalOpen(true);
  };

  const handleEdit = (parent: Parent) => {
    setSelectedParent(parent);
    setIsEditModalOpen(true);
  };

  const handleDelete = (parent: Parent) => {
    setSelectedParent(parent);
    setIsDeleteModalOpen(true);
  };

  const handleAssign = (parent: Parent) => {
    setSelectedParent(parent);
    setIsAssignModalOpen(true);
  };

  const closeModal = () => {
    setSelectedParent(null);
    setIsViewModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setIsCreateModalOpen(false);
    setIsAssignModalOpen(false);
  };

  const onSuccess = () => {
    request.refetch();
    closeModal();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Đang tải dữ liệu phụ huynh...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý phụ huynh</h1>
          <p className="text-gray-600 mt-1">
            Quản lý thông tin phụ huynh và liên kết với học sinh
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Thêm phụ huynh
        </button>
      </div>

      {/* Search and filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Tìm kiếm phụ huynh..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Parents table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phụ huynh
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số điện thoại
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Học sinh liên kết
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {parentData?.data?.data?.map((parent) => (
                <tr key={parent.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {parent.firstName} {parent.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {parent.id.slice(0, 8)}...
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {parent.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {parent.phoneNumber || 'Chưa có'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {parent.children?.length || 0} học sinh
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${parent.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                      }`}>
                      {parent.isActive ? 'Hoạt động' : 'Không hoạt động'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleView(parent)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Xem chi tiết"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(parent)}
                      className="text-yellow-600 hover:text-yellow-900"
                      title="Chỉnh sửa"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleAssign(parent)}
                      className="text-green-600 hover:text-green-900"
                      title="Gán học sinh"
                    >
                      <UserPlus className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(parent)}
                      className="text-red-600 hover:text-red-900"
                      title="Xóa"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {parentData && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setPage(Math.max(1, (parentData?.data?.page || 1) - 1))}
                disabled={parentData?.data?.page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Trước
              </button>
              <button
                onClick={() => setPage((parentData?.data?.page || 1) + 1)}
                disabled={!parentData?.data?.hasNextPage}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Sau
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Hiển thị{' '}
                  <span className="font-medium">
                    {((parentData?.data?.page || 1) - 1) * (parentData?.data?.limit || 10) + 1}
                  </span>{' '}
                  đến{' '}
                  <span className="font-medium">
                    {Math.min((parentData?.data?.page || 1) * (parentData?.data?.limit || 10), parentData?.data?.totalItems || 0)}
                  </span>{' '}
                  trong tổng số{' '}
                  <span className="font-medium">{parentData?.data?.totalItems || 0}</span> phụ huynh
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setPage(Math.max(1, (parentData?.data?.page || 1) - 1))}
                    disabled={parentData?.data?.page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setPage((parentData?.data?.page || 1) + 1)}
                    disabled={!parentData?.data?.hasNextPage}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateParentModal
        isOpen={isCreateModalOpen}
        onClose={closeModal}
        onSuccess={onSuccess}
      />

      {selectedParent && (
        <>
          <ViewParentModal
            isOpen={isViewModalOpen}
            onClose={closeModal}
            parent={selectedParent}
          />
          <EditParentModal
            isOpen={isEditModalOpen}
            onClose={closeModal}
            parent={selectedParent}
            onSuccess={onSuccess}
          />
          <DeleteParentModal
            isOpen={isDeleteModalOpen}
            onClose={closeModal}
            parent={selectedParent}
            onSuccess={onSuccess}
          />
          <AssignParentModal
            isOpen={isAssignModalOpen}
            onClose={closeModal}
            parent={selectedParent}
            onSuccess={onSuccess}
          />
        </>
      )}
    </div>
  );
};

export default ParentPage;
