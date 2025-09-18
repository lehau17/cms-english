import { getTeachers } from '@/apis/teacher';
import CreateTeacherModal from '@/components/teacher/CreateTeacherModal';
import DeleteTeacherModal from '@/components/teacher/DeleteTeacherModal';
import EditTeacherModal from '@/components/teacher/EditTeacherModal';
import ViewTeacherModal from '@/components/teacher/ViewTeacherModal';
import { useBaseRequestQuery } from '@/hooks/useBaseRequestQuery';
import { UserResponse } from '@/interface/user.interface';
import {
  ChevronLeft,
  ChevronRight,
  Edit,
  Eye,
  Plus,
  Search,
  Trash2,
  User
} from 'lucide-react';
import React, { useState } from 'react';

const TeacherPage: React.FC = () => {
  const {
    data: teacherData,
    isLoading,
    setPage,
    setLimit,
    setSearch,
    request,
  } = useBaseRequestQuery<UserResponse>({
    queryKey: ['teachers'],
    queryFn: getTeachers,
  });

  const [selectedTeacher, setSelectedTeacher] = useState<UserResponse | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  const handleView = (teacher: UserResponse) => {
    setSelectedTeacher(teacher);
    setIsViewModalOpen(true);
  };

  const handleEdit = (teacher: UserResponse) => {
    setSelectedTeacher(teacher);
    setIsEditModalOpen(true);
  };

  const handleDelete = (teacher: UserResponse) => {
    setSelectedTeacher(teacher);
    setIsDeleteModalOpen(true);
  };

  const handleCreate = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsViewModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setIsCreateModalOpen(false);
    setSelectedTeacher(null);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= (teacherData?.data.totalPages || 1)) {
      setPage(newPage);
    }
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
  };

  const handleSearch = (search: string) => {
    setSearch(search);
  };

  const formatDate = (dateString: string | Date | null | undefined): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const teachers = teacherData?.data.data || [];
  const pagination = teacherData?.data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Teacher Management</h1>
            <p className="text-gray-600">Oversee all teachers and their activities.</p>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            <span>Create Teacher</span>
          </button>
        </div>

        <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex-1 min-w-72">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name, email..."
                  value={request.search || ''}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Show:</label>
              <select
                value={request.limit}
                onChange={(e) => handleLimitChange(parseInt(e.target.value))}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                disabled={isLoading}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {isLoading && (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          )}

          {!isLoading && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created At</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {teachers.map((teacher) => (
                    <tr key={teacher.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{teacher.displayName}</div>
                        <div className="text-sm text-gray-500">{teacher.firstName} {teacher.lastName}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{teacher.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{teacher.phone}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${teacher.status === "active" ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {teacher.status === "active" ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{formatDate(teacher.createdAt)}</td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleView(teacher)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors tooltip"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(teacher)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors tooltip"
                            title="Edit Teacher"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(teacher)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors tooltip"
                            title="Delete Teacher"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!isLoading && teachers.length === 0 && (
            <div className="text-center py-12">
              <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No Teachers Found</h3>
              <p className="text-gray-600 mb-4">Create a new teacher to get started.</p>
              <button
                onClick={handleCreate}
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Plus className="w-4 h-4" />
                <span>Create Your First Teacher</span>
              </button>
            </div>
          )}
        </div>

        {!isLoading && pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6">
            <div className="text-sm text-gray-600">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.totalItems || 0)} of {pagination.totalItems || 0} results
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.hasPrevPage}
                className="flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:text-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </button>
              <div className="flex space-x-1">
                {[...Array(pagination.totalPages || 0)].map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handlePageChange(index + 1)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${pagination.page === index + 1
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                      }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.hasNextPage}
                className="flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:text-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>

      <CreateTeacherModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseModals}
      />

      <EditTeacherModal
        isOpen={isEditModalOpen}
        onClose={handleCloseModals}
        teacher={selectedTeacher}
      />

      <DeleteTeacherModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseModals}
        teacher={selectedTeacher}
      />

      <ViewTeacherModal
        isOpen={isViewModalOpen}
        onClose={handleCloseModals}
        teacher={selectedTeacher}
      />

    </div>
  );
};

export default TeacherPage;
