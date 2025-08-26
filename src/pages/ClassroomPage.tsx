import { Classroom } from '@/interface/classroom.interface';
import { PaginationData } from '@/interface/pagination.inerface';
import { ChevronLeft, ChevronRight, Edit, Eye, Search, Trash2, User, Users, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';


const ClassroomPage: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(5);
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [pagination, setPagination] = useState<Partial<PaginationData>>({});
    const [loading, setLoading] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>('');

    // State for modals and selected classroom
    const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
    const [editFormData, setEditFormData] = useState<Partial<Classroom>>({});

    const fetchClassrooms = async (page: number, pageLimit: number, search: string = '') => {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 500));

        const mockClassrooms: Classroom[] = [
            {
                id: 'cls1',
                name: 'English for Beginners',
                description: 'A fun introduction to the English language.',
                classCode: 'ENG101',
                isActive: true,
                maxStudents: 20,
                teacher: { id: 't1', firstName: 'John', lastName: 'Doe' },
                students: new Array(15).fill(null).map((_, i) => ({ student: { id: `s${i}`, firstName: `Student`, lastName: `${i + 1}` } })),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
            {
                id: 'cls2',
                name: 'Advanced Grammar',
                description: 'Master the intricacies of English grammar.',
                classCode: 'ENG303',
                isActive: true,
                maxStudents: 15,
                teacher: { id: 't2', firstName: 'Jane', lastName: 'Smith' },
                students: new Array(10).fill(null).map((_, i) => ({ student: { id: `s${i}`, firstName: `Student`, lastName: `${i + 1}` } })),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
            {
                id: 'cls3',
                name: 'Business English',
                description: 'Learn English for the professional world.',
                classCode: 'BUS201',
                isActive: false,
                maxStudents: 25,
                teacher: { id: 't1', firstName: 'John', lastName: 'Doe' },
                students: new Array(22).fill(null).map((_, i) => ({ student: { id: `s${i}`, firstName: `Student`, lastName: `${i + 1}` } })),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
        ];

        const filteredClassrooms = mockClassrooms.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
        const totalItems = filteredClassrooms.length;
        const totalPages = Math.ceil(totalItems / pageLimit);
        const paginatedData = filteredClassrooms.slice((page - 1) * pageLimit, page * pageLimit);

        setClassrooms(paginatedData);
        setPagination({
            page,
            limit: pageLimit,
            totalItems,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
        });
        setLoading(false);
    };

    useEffect(() => {
        fetchClassrooms(currentPage, limit, searchTerm);
    }, [currentPage, limit, searchTerm]);

    // Modal Handlers
    const handleView = (classroom: Classroom) => {
        setSelectedClassroom(classroom);
        setIsViewModalOpen(true);
    };

    const handleEdit = (classroom: Classroom) => {
        setSelectedClassroom(classroom);
        setEditFormData({
            name: classroom.name,
            description: classroom.description,
            maxStudents: classroom.maxStudents,
            classCode: classroom.classCode,
            isActive: classroom.isActive
        });
        setIsEditModalOpen(true);
    };

    const handleDelete = (classroom: Classroom) => {
        setSelectedClassroom(classroom);
        setIsDeleteModalOpen(true);
    };

    const handleCloseModals = () => {
        setIsViewModalOpen(false);
        setIsEditModalOpen(false);
        setIsDeleteModalOpen(false);
        setSelectedClassroom(null);
    };

    const confirmDelete = () => {
        if (selectedClassroom) {
            setClassrooms(prev => prev.filter(c => c.id !== selectedClassroom.id));
            handleCloseModals();
        }
    };

    const handleUpdateClassroom = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedClassroom) {
            setClassrooms(prev => prev.map(c => c.id === selectedClassroom.id ? { ...c, ...editFormData } as Classroom : c));
            handleCloseModals();
        }
    };

    const handlePageChange = (newPage: number) => {
        if (newPage > 0 && newPage <= (pagination.totalPages || 1)) {
            setCurrentPage(newPage);
        }
    };

    const handleLimitChange = (newLimit: number) => {
        setLimit(newLimit);
        setCurrentPage(1);
    };

    const handleSearch = (search: string) => {
        setSearchTerm(search);
        setCurrentPage(1);
    };

    const formatDate = (dateString: string | null): string => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Classroom Management</h1>
                    <p className="text-gray-600">Oversee all classrooms and their activities.</p>
                </div>

                <div className="mb-6 bg-white rounded-lg shadow-md p-6">
                    <div className="flex flex-wrap gap-4 items-center justify-between">
                        <div className="flex-1 min-w-72">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search by classroom name..."
                                    value={searchTerm}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-gray-700">Show:</label>
                            <select
                                value={limit}
                                onChange={(e) => handleLimitChange(parseInt(e.target.value))}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                disabled={loading}
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {loading && (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                        </div>
                    )}

                    {!loading && (
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
                                                    <span>{classroom.teacher.firstName} {classroom.teacher.lastName}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${classroom.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {classroom.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-2">
                                                    <Users className="w-4 h-4 text-gray-400" />
                                                    <span>{classroom.students.length} / {classroom.maxStudents || '∞'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{formatDate(classroom.createdAt)}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex space-x-2">
                                                    <button onClick={() => handleView(classroom)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Eye className="w-4 h-4" /></button>
                                                    <button onClick={() => handleEdit(classroom)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                                                    <button onClick={() => handleDelete(classroom)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {!loading && classrooms.length === 0 && (
                        <div className="text-center py-12">
                            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-medium text-gray-900 mb-2">No Classrooms Found</h3>
                            <p className="text-gray-600">Create a new classroom to get started.</p>
                        </div>
                    )}
                </div>

                {!loading && pagination.totalPages && pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between bg-white rounded-lg shadow-md p-4 mt-6">
                        <div className="text-sm text-gray-600">
                            Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, pagination.totalItems || 0)} of {pagination.totalItems || 0} results
                        </div>
                        <div className="flex items-center space-x-2">
                            <button onClick={() => handlePageChange(currentPage - 1)} disabled={!pagination.hasPrevPage} className="flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:text-gray-400 disabled:bg-gray-50">
                                <ChevronLeft className="w-4 h-4 mr-1" />
                                Previous
                            </button>
                            <div className="flex space-x-1">
                                {[...Array(pagination.totalPages || 0)].map((_, index) => (
                                    <button key={index} onClick={() => handlePageChange(index + 1)} className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentPage === index + 1 ? 'bg-indigo-600 text-white' : 'text-gray-700 bg-gray-100 hover:bg-gray-200'}`}>
                                        {index + 1}
                                    </button>
                                ))}
                            </div>
                            <button onClick={() => handlePageChange(currentPage + 1)} disabled={!pagination.hasNextPage} className="flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:text-gray-400 disabled:bg-gray-50">
                                Next
                                <ChevronRight className="w-4 h-4 ml-1" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* View Modal - NO DARK BACKGROUND */}
            {isViewModalOpen && selectedClassroom && (
                <div className="fixed inset-0 flex justify-center items-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
                        <div className="p-6 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
                            <h3 className="text-2xl font-bold text-gray-800">Classroom Details</h3>
                            <button onClick={handleCloseModals} className="p-2 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-4 space-y-4">
                            <h4 className="text-xl font-semibold text-indigo-600">{selectedClassroom.name}</h4>
                            <p className="text-gray-600">{selectedClassroom.description}</p>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-500">Code:</span> {selectedClassroom.classCode}
                                </div>
                                <div>
                                    <span className="text-gray-500">Teacher:</span> {selectedClassroom.teacher.firstName} {selectedClassroom.teacher.lastName}
                                </div>
                                <div>
                                    <span className="text-gray-500">Students:</span> {selectedClassroom.students.length}/{selectedClassroom.maxStudents}
                                </div>
                                <div>
                                    <span className="text-gray-500">Status:</span>
                                    <span className={selectedClassroom.isActive ? 'text-green-600' : 'text-red-600'}>
                                        {selectedClassroom.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 text-right rounded-b-xl">
                            <button onClick={handleCloseModals} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold transition-colors">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal - NO DARK BACKGROUND */}
            {isEditModalOpen && selectedClassroom && (
                <div className="fixed inset-0 flex justify-center items-center p-4 z-50">
                    <form onSubmit={handleUpdateClassroom} className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
                        <div className="p-6 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
                            <h3 className="text-2xl font-bold text-gray-800">Edit Classroom</h3>
                            <button type="button" onClick={handleCloseModals} className="p-2 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-4 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                    <input
                                        type="text"
                                        value={editFormData.name || ''}
                                        onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Class Code</label>
                                    <input
                                        type="text"
                                        value={editFormData.classCode || ''}
                                        onChange={(e) => setEditFormData({ ...editFormData, classCode: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={editFormData.description || ''}
                                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                                    rows={2}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Students</label>
                                    <input
                                        type="number"
                                        value={editFormData.maxStudents || ''}
                                        onChange={(e) => setEditFormData({ ...editFormData, maxStudents: parseInt(e.target.value) || null })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Active</label>
                                    <input
                                        type="checkbox"
                                        checked={editFormData.isActive || false}
                                        onChange={(e) => setEditFormData({ ...editFormData, isActive: e.target.checked })}
                                        className="mt-2 w-4 h-4 text-indigo-600 border-gray-300 rounded"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="p-6 bg-gray-50 flex justify-end space-x-4 rounded-b-xl">
                            <button type="button" onClick={handleCloseModals} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold transition-colors">
                                Cancel
                            </button>
                            <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold transition-colors shadow-sm">
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Delete Modal - NO DARK BACKGROUND */}
            {isDeleteModalOpen && selectedClassroom && (
                <div className="fixed inset-0 flex justify-center items-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                        <div className="p-4 text-center">
                            <Trash2 className="w-12 h-12 text-red-500 mx-auto mb-3" />
                            <h3 className="text-lg font-bold text-gray-900">Delete Classroom</h3>
                            <p className="text-gray-600 mt-2">Delete "{selectedClassroom.name}"?</p>
                        </div>
                        <div className="p-6 bg-gray-50 flex justify-center space-x-4 rounded-b-xl">
                            <button onClick={handleCloseModals} className="px-8 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold transition-colors">
                                Cancel
                            </button>
                            <button onClick={confirmDelete} className="px-8 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-colors shadow-sm">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClassroomPage;
