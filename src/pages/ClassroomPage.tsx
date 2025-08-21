import { Calendar, CheckCircle, ChevronLeft, ChevronRight, Clock, Edit, Eye, Filter, Search, Trash2, User, Users, XCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';

// TypeScript interfaces based on Prisma schema
interface Teacher {
    id: string;
    firstName: string;
    lastName: string;
}

interface ClassroomStudent {
    student: {
        id: string;
        firstName: string;
        lastName: string;
    };
}

interface Classroom {
    id: string;
    name: string;
    description: string | null;
    classCode: string;
    isActive: boolean;
    maxStudents: number | null;
    teacher: Teacher;
    students: ClassroomStudent[];
    createdAt: string;
    updatedAt: string;
}

interface PaginationData {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

interface ApiResponse {
    statusCode: number;
    message: string;
    data: {
        data: Classroom[];
    } & PaginationData;
}

const ClassroomPage: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(5);
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [pagination, setPagination] = useState<Partial<PaginationData>>({});
    const [loading, setLoading] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>('');

    const fetchClassrooms = async (page: number, pageLimit: number, search: string = '') => {
        setLoading(true);
        // In a real app, you would use the useClassrooms hook here.
        // For now, we'll use mock data to build the UI.
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay

        const mockClassrooms: Classroom[] = [
            {
                id: 'cls1',
                name: 'English for Beginners',
                description: 'A fun introduction to the English language.',
                classCode: 'ENG101',
                isActive: true,
                maxStudents: 20,
                teacher: { id: 't1', firstName: 'John', lastName: 'Doe' },
                students: new Array(15).fill(null).map((_, i) => ({ student: { id: `s${i}`, firstName: `Student`, lastName: `${i + 1}` }})),
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
                students: new Array(10).fill(null).map((_, i) => ({ student: { id: `s${i}`, firstName: `Student`, lastName: `${i + 1}` }})),
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
                students: new Array(22).fill(null).map((_, i) => ({ student: { id: `s${i}`, firstName: `Student`, lastName: `${i + 1}` }})),
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
                                                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Eye className="w-4 h-4" /></button>
                                                    <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                                                    <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
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
        </div>
    );
};

export default ClassroomPage;
