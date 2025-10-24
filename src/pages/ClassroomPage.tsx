import { getClassrooms } from '@/apis/classroom';
import CreateClassroomModal from '@/components/classroom/CreateClassroomModal';
import DeleteClassroomModal from '@/components/classroom/DeleteClassroomModal';
import EditClassroomModal from '@/components/classroom/EditClassroomModal';
import { useBaseRequestQuery } from '@/hooks/useBaseRequestQuery';
import { useUpdateClassroomStatus } from '@/hooks/useClassroom';
import { Classroom, ClassroomStatus } from '@/interface/classroom.interface';
import {
    ChevronLeft,
    ChevronRight,
    Edit,
    Eye,
    MoreVertical,
    Plus,
    Search,
    Trash2,
    User,
    Users
} from 'lucide-react';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const ClassroomPage: React.FC = () => {
    const {
        data: classroomData,
        isLoading,
        setPage,
        setLimit,
        setSearch,
        request,
    } = useBaseRequestQuery<Classroom>({
        queryKey: ['classrooms'],
        queryFn: getClassrooms,
    });

    const navigate = useNavigate();
    const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
    const [statusDropdownOpen, setStatusDropdownOpen] = useState<string | null>(null);

    const updateStatusMutation = useUpdateClassroomStatus();

    const handleView = (classroom: Classroom) => {
        navigate(`/classrooms/${classroom.id}`);
    };

    const handleEdit = (classroom: Classroom) => {
        setSelectedClassroom(classroom);
        setIsEditModalOpen(true);
    };

    const handleDelete = (classroom: Classroom) => {
        setSelectedClassroom(classroom);
        setIsDeleteModalOpen(true);
    };

    const handleCreate = () => {
        setIsCreateModalOpen(true);
    };

    const handleCloseModals = () => {
        setIsEditModalOpen(false);
        setIsDeleteModalOpen(false);
        setIsCreateModalOpen(false);
        setSelectedClassroom(null);
    };

    const handlePageChange = (newPage: number) => {
        if (newPage > 0 && newPage <= (classroomData?.data.totalPages || 1)) {
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

    const getStatusBadge = (status: ClassroomStatus) => {
        const statusConfig = {
            [ClassroomStatus.upcoming]: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Upcoming' },
            [ClassroomStatus.ongoing]: { bg: 'bg-green-100', text: 'text-green-800', label: 'Ongoing' },
            [ClassroomStatus.completed]: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Completed' },
            [ClassroomStatus.cancelled]: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' },
        };
        const config = statusConfig[status] || statusConfig[ClassroomStatus.upcoming];
        return (
            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                {config.label}
            </span>
        );
    };

    const handleStatusChange = async (classroomId: string, newStatus: ClassroomStatus) => {
        try {
            await updateStatusMutation.mutateAsync({ classroomId, status: newStatus });
            toast.success('Classroom status updated successfully!');
            setStatusDropdownOpen(null);
        } catch (error: any) {
            toast.error(`Failed to update status: ${error?.response?.data?.message || error.message}`);
        }
    };

    const classrooms = classroomData?.data.data || [];
    const pagination = classroomData?.data;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">Classroom Management</h1>
                        <p className="text-gray-600">Oversee all classrooms and their activities.</p>
                    </div>
                    <button
                        onClick={handleCreate}
                        className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Create Classroom</span>
                    </button>
                </div>

                <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex flex-wrap gap-4 items-center justify-between">
                        <div className="flex-1 min-w-72">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search by classroom name..."
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
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Classroom</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Teacher</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Enrollment</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created At</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {classrooms.map((classroom) => (
                                        <tr key={classroom.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-gray-900">{classroom.name}</div>
                                                <div className="text-sm text-gray-500">Code: {classroom.classCode}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-2">
                                                    <User className="w-4 h-4 text-gray-400" />
                                                    <span>{classroom.teacher?.firstName} {classroom.teacher?.lastName}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="relative">
                                                    <button
                                                        onClick={() => setStatusDropdownOpen(statusDropdownOpen === classroom.id ? null : classroom.id)}
                                                        className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
                                                    >
                                                        {getStatusBadge(classroom.status)}
                                                        <MoreVertical className="w-4 h-4 text-gray-400" />
                                                    </button>

                                                    {statusDropdownOpen === classroom.id && (
                                                        <div className="absolute z-10 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                                                            <div className="py-1" role="menu">
                                                                <div className="px-4 py-2 text-xs text-gray-500 font-semibold">Change Status</div>
                                                                {Object.values(ClassroomStatus).map((status) => (
                                                                    <button
                                                                        key={status}
                                                                        onClick={() => handleStatusChange(classroom.id, status)}
                                                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                                                        disabled={updateStatusMutation.isPending}
                                                                    >
                                                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-2">
                                                    <Users className="w-4 h-4 text-gray-400" />
                                                    <span>{classroom.students?.length || 0} / {classroom.maxStudents || '∞'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{formatDate(classroom.createdAt)}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex space-x-1">
                                                    <button
                                                        onClick={() => handleView(classroom)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors tooltip"
                                                        title="View Details"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(classroom)}
                                                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors tooltip"
                                                        title="Edit Classroom"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(classroom)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors tooltip"
                                                        title="Delete Classroom"
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

                    {!isLoading && classrooms.length === 0 && (
                        <div className="text-center py-12">
                            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-medium text-gray-900 mb-2">No Classrooms Found</h3>
                            <p className="text-gray-600 mb-4">Create a new classroom to get started.</p>
                            <button
                                onClick={handleCreate}
                                className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Create Your First Classroom</span>
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

            <CreateClassroomModal
                isOpen={isCreateModalOpen}
                onClose={handleCloseModals}
            />

            <EditClassroomModal
                isOpen={isEditModalOpen}
                onClose={handleCloseModals}
                classroom={selectedClassroom}
            />

            <DeleteClassroomModal
                isOpen={isDeleteModalOpen}
                onClose={handleCloseModals}
                classroom={selectedClassroom}
            />

        </div>
    );
};

export default ClassroomPage;
