import { Calendar, CheckCircle, ChevronLeft, ChevronRight, Clock, Edit, Eye, Filter, Mail, Phone, Search, Trash2, User, XCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Modal, Box } from '@mui/material';

// TypeScript interfaces
interface Teacher {
    id: string;
    email: string;
    phone: string | null;
    username: string;
    passwordHash: string;
    role: string;
    status: 'active' | 'inactive';
    provider: 'local' | 'google' | 'facebook';
    providerId: string | null;
    firstName: string;
    lastName: string;
    gender: 'male' | 'female';
    dob: string | null;
    avatarUrl: string;
    bio: string;
    language: 'en' | 'vi';
    timezone: string;
    lastLoginAt: string | null;
    lastActiveAt: string | null;
    emailVerified: boolean;
    phoneVerified: boolean;
    preferences: any;
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
        data: Teacher[];
    } & PaginationData;
}

interface URLParams {
    page: number;
    limit: number;
    search: string;
    status: string;
}

const TeacherPage: React.FC = () => {
    // Mock data - tạo nhiều teachers để test phân trang
    const mockData: ApiResponse = {
        statusCode: 200,
        message: "Teachers listed successfully",
        data: {
            data: [
                {
                    id: "a3dfa795-7094-4f87-8dd6-284cab19f4ae",
                    email: "john@example.com",
                    phone: "+84123456789",
                    username: "john1",
                    passwordHash: "$2b$10$vxsETfvdDMeItRqJdP0uX.9NIYMdQ0e2VS0kNTg3jdVZ.ICEn3tUm",
                    role: "teacher",
                    status: "active" as const,
                    provider: "local" as const,
                    providerId: null,
                    firstName: "John",
                    lastName: "Michael",
                    gender: "male" as const,
                    dob: "1995-03-15",
                    avatarUrl: "https://i.pravatar.cc/150?u=john",
                    bio: "Computer Science Teacher",
                    language: "en" as const,
                    timezone: "Asia_Ho_Chi_Minh",
                    lastLoginAt: "2025-08-10T14:30:00.000Z",
                    lastActiveAt: "2025-08-10T15:45:00.000Z",
                    emailVerified: true,
                    phoneVerified: true,
                    preferences: null,
                    createdAt: "2025-08-10T15:53:05.543Z",
                    updatedAt: "2025-08-10T15:53:05.543Z"
                },
                {
                    id: "b4dfa795-7094-4f87-8dd6-284cab19f4bf",
                    email: "alice@example.com",
                    phone: "+84987654321",
                    username: "alice2",
                    passwordHash: "$2b$10$vxsETfvdDMeItRqJdP0uX.9NIYMdQ0e2VS0kNTg3jdVZ.ICEn3tUm",
                    role: "teacher",
                    status: "active" as const,
                    provider: "google" as const,
                    providerId: "google123",
                    firstName: "Alice",
                    lastName: "Johnson",
                    gender: "female" as const,
                    dob: "1998-07-22",
                    avatarUrl: "https://i.pravatar.cc/150?u=alice",
                    bio: "Marketing Teacher",
                    language: "vi" as const,
                    timezone: "Asia_Ho_Chi_Minh",
                    lastLoginAt: "2025-08-11T09:15:00.000Z",
                    lastActiveAt: "2025-08-11T10:20:00.000Z",
                    emailVerified: true,
                    phoneVerified: false,
                    preferences: null,
                    createdAt: "2025-08-09T10:20:30.543Z",
                    updatedAt: "2025-08-11T10:20:30.543Z"
                },
                {
                    id: "c5dfa795-7094-4f87-8dd6-284cab19f4cg",
                    email: "bob@example.com",
                    phone: null,
                    username: "bob3",
                    passwordHash: "$2b$10$vxsETfvdDMeItRqJdP0uX.9NIYMdQ0e2VS0kNTg3jdVZ.ICEn3tUm",
                    role: "teacher",
                    status: "inactive" as const,
                    provider: "local" as const,
                    providerId: null,
                    firstName: "Bob",
                    lastName: "Wilson",
                    gender: "male" as const,
                    dob: "1997-11-08",
                    avatarUrl: "https://i.pravatar.cc/150?u=bob",
                    bio: "Engineering Teacher",
                    language: "en" as const,
                    timezone: "Asia_Ho_Chi_Minh",
                    lastLoginAt: null,
                    lastActiveAt: "2025-08-05T16:30:00.000Z",
                    emailVerified: false,
                    phoneVerified: false,
                    preferences: null,
                    createdAt: "2025-08-05T12:15:20.543Z",
                    updatedAt: "2025-08-05T16:30:20.543Z"
                },
                {
                    id: "d6dfa795-7094-4f87-8dd6-284cab19f4dh",
                    email: "emma@example.com",
                    phone: "+84555123456",
                    username: "emma4",
                    passwordHash: "$2b$10$vxsETfvdDMeItRqJdP0uX.9NIYMdQ0e2VS0kNTg3jdVZ.ICEn3tUm",
                    role: "teacher",
                    status: "active" as const,
                    provider: "facebook" as const,
                    providerId: "fb456",
                    firstName: "Emma",
                    lastName: "Davis",
                    gender: "female" as const,
                    dob: "1996-05-12",
                    avatarUrl: "https://i.pravatar.cc/150?u=emma",
                    bio: "Art & Design Teacher",
                    language: "vi" as const,
                    timezone: "Asia_Ho_Chi_Minh",
                    lastLoginAt: "2025-08-11T08:45:00.000Z",
                    lastActiveAt: "2025-08-11T11:10:00.000Z",
                    emailVerified: true,
                    phoneVerified: true,
                    preferences: null,
                    createdAt: "2025-08-08T14:25:15.543Z",
                    updatedAt: "2025-08-11T11:10:15.543Z"
                },
                {
                    id: "e7dfa795-7094-4f87-8dd6-284cab19f4ei",
                    email: "charlie@example.com",
                    phone: "+84777888999",
                    username: "charlie5",
                    passwordHash: "$2b$10$vxsETfvdDMeItRqJdP0uX.9NIYMdQ0e2VS0kNTg3jdVZ.ICEn3tUm",
                    role: "teacher",
                    status: "active" as const,
                    provider: "local" as const,
                    providerId: null,
                    firstName: "Charlie",
                    lastName: "Brown",
                    gender: "male" as const,
                    dob: "1999-01-30",
                    avatarUrl: "https://i.pravatar.cc/150?u=charlie",
                    bio: "Business Teacher",
                    language: "en" as const,
                    timezone: "Asia_Ho_Chi_Minh",
                    lastLoginAt: "2025-08-10T20:15:00.000Z",
                    lastActiveAt: "2025-08-11T09:30:00.000Z",
                    emailVerified: true,
                    phoneVerified: false,
                    preferences: null,
                    createdAt: "2025-08-07T09:40:25.543Z",
                    updatedAt: "2025-08-11T09:30:25.543Z"
                },
                {
                    id: "f8dfa795-7094-4f87-8dd6-284cab19f4fj",
                    email: "sophia@example.com",
                    phone: "+84111222333",
                    username: "sophia6",
                    passwordHash: "$2b$10$vxsETfvdDMeItRqJdP0uX.9NIYMdQ0e2VS0kNTg3jdVZ.ICEn3tUm",
                    role: "teacher",
                    status: "inactive" as const,
                    provider: "google" as const,
                    providerId: "google789",
                    firstName: "Sophia",
                    lastName: "Garcia",
                    gender: "female" as const,
                    dob: "1994-09-18",
                    avatarUrl: "https://i.pravatar.cc/150?u=sophia",
                    bio: "Psychology Teacher",
                    language: "vi" as const,
                    timezone: "Asia_Ho_Chi_Minh",
                    lastLoginAt: "2025-08-03T13:20:00.000Z",
                    lastActiveAt: "2025-08-03T15:45:00.000Z",
                    emailVerified: true,
                    phoneVerified: true,
                    preferences: null,
                    createdAt: "2025-08-01T11:30:35.543Z",
                    updatedAt: "2025-08-03T15:45:35.543Z"
                },
                {
                    id: "g9dfa795-7094-4f87-8dd6-284cab19f4gk",
                    email: "david@example.com",
                    phone: "+84333444555",
                    username: "david7",
                    passwordHash: "$2b$10$vxsETfvdDMeItRqJdP0uX.9NIYMdQ0e2VS0kNTg3jdVZ.ICEn3tUm",
                    role: "teacher",
                    status: "active" as const,
                    provider: "local" as const,
                    providerId: null,
                    firstName: "David",
                    lastName: "Lee",
                    gender: "male" as const,
                    dob: "1993-12-05",
                    avatarUrl: "https://i.pravatar.cc/150?u=david",
                    bio: "Medical Teacher",
                    language: "en" as const,
                    timezone: "Asia_Ho_Chi_Minh",
                    lastLoginAt: "2025-08-11T07:20:00.000Z",
                    lastActiveAt: "2025-08-11T12:15:00.000Z",
                    emailVerified: true,
                    phoneVerified: true,
                    preferences: null,
                    createdAt: "2025-07-28T08:45:12.543Z",
                    updatedAt: "2025-08-11T12:15:12.543Z"
                },
                {
                    id: "h0dfa795-7094-4f87-8dd6-284cab19f4hl",
                    email: "lisa@example.com",
                    phone: null,
                    username: "lisa8",
                    passwordHash: "$2b$10$vxsETfvdDMeItRqJdP0uX.9NIYMdQ0e2VS0kNTg3jdVZ.ICEn3tUm",
                    role: "teacher",
                    status: "active" as const,
                    provider: "facebook" as const,
                    providerId: "fb789",
                    firstName: "Lisa",
                    lastName: "Wang",
                    gender: "female" as const,
                    dob: "1997-04-20",
                    avatarUrl: "https://i.pravatar.cc/150?u=lisa",
                    bio: "Law Teacher",
                    language: "vi" as const,
                    timezone: "Asia_Ho_Chi_Minh",
                    lastLoginAt: "2025-08-10T16:40:00.000Z",
                    lastActiveAt: "2025-08-11T08:25:00.000Z",
                    emailVerified: true,
                    phoneVerified: false,
                    preferences: null,
                    createdAt: "2025-07-25T13:20:08.543Z",
                    updatedAt: "2025-08-11T08:25:08.543Z"
                }
            ],
            page: 1,
            limit: 5,
            totalItems: 8,
            totalPages: 2,
            hasNextPage: true,
            hasPrevPage: false
        }
    };

    // State management with proper TypeScript typing
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(5);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [pagination, setPagination] = useState<Partial<PaginationData>>({});
    const [loading, setLoading] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    // Simulate API call với pagination - mô phỏng server-side pagination
    const fetchTeachers = async (
        page: number,
        pageLimit: number,
        search: string = '',
        status: 'all' | 'active' | 'inactive' = 'all'
    ): Promise<void> => {
        setLoading(true);

        // Simulate API delay
        await new Promise<void>(resolve => setTimeout(resolve, 500));

        // Simulate server-side API call
        // Trong thực tế sẽ gọi: GET /api/teachers?page=1&limit=5&search=john&status=active
        console.log(`API Call: /api/teachers?page=${page}&limit=${pageLimit}&search=${search}&status=${status}`);

        // Mock response từ server với pagination đã được xử lý
        let mockResponse: ApiResponse;

        if (page === 1 && pageLimit === 5) {
            mockResponse = {
                statusCode: 200,
                message: "Teachers listed successfully",
                data: {
                    data: mockData.data.data.slice(0, 5), // Server trả về 5 items đầu
                    page: 1,
                    limit: 5,
                    totalItems: 15, // Giả sử server có tổng 15 teachers
                    totalPages: 3,
                    hasNextPage: true,
                    hasPrevPage: false
                }
            };
        } else if (page === 2 && pageLimit === 5) {
            mockResponse = {
                statusCode: 200,
                message: "Teachers listed successfully",
                data: {
                    data: mockData.data.data.slice(5, 8), // Server trả về items 6-8
                    page: 2,
                    limit: 5,
                    totalItems: 15,
                    totalPages: 3,
                    hasNextPage: true,
                    hasPrevPage: true
                }
            };
        } else if (page === 3 && pageLimit === 5) {
            mockResponse = {
                statusCode: 200,
                message: "Teachers listed successfully",
                data: {
                    data: mockData.data.data.slice(0, 2), // Server trả về 2 items cuối
                    page: 3,
                    limit: 5,
                    totalItems: 15,
                    totalPages: 3,
                    hasNextPage: false,
                    hasPrevPage: true
                }
            };
        } else if (pageLimit === 10) {
            // Khi limit = 10
            const startIdx = (page - 1) * 10;
            const endIdx = Math.min(startIdx + 10, mockData.data.data.length);
            mockResponse = {
                statusCode: 200,
                message: "Teachers listed successfully",
                data: {
                    data: mockData.data.data.slice(startIdx, endIdx),
                    page: page,
                    limit: 10,
                    totalItems: 15,
                    totalPages: 2,
                    hasNextPage: page < 2,
                    hasPrevPage: page > 1
                }
            };
        } else {
            // Default response
            mockResponse = {
                statusCode: 200,
                message: "Teachers listed successfully",
                data: {
                    data: mockData.data.data.slice(0, Math.min(pageLimit, mockData.data.data.length)),
                    page: page,
                    limit: pageLimit,
                    totalItems: 15,
                    totalPages: Math.ceil(15 / pageLimit),
                    hasNextPage: page < Math.ceil(15 / pageLimit),
                    hasPrevPage: page > 1
                }
            };
        }

        // Apply search filter (giả sử server đã xử lý)
        if (search) {
            const filtered = mockResponse.data.data.filter(teacher =>
                teacher.firstName.toLowerCase().includes(search.toLowerCase()) ||
                teacher.lastName.toLowerCase().includes(search.toLowerCase()) ||
                teacher.email.toLowerCase().includes(search.toLowerCase()) ||
                teacher.username.toLowerCase().includes(search.toLowerCase())
            );
            mockResponse.data.data = filtered;
            mockResponse.data.totalItems = filtered.length;
            mockResponse.data.totalPages = Math.ceil(filtered.length / pageLimit);
        }

        // Apply status filter (giả sử server đã xử lý)
        if (status !== 'all') {
            const filtered = mockResponse.data.data.filter(teacher => teacher.status === status);
            mockResponse.data.data = filtered;
            mockResponse.data.totalItems = filtered.length;
            mockResponse.data.totalPages = Math.ceil(filtered.length / pageLimit);
        }

        setTeachers(mockResponse.data.data);
        setPagination({
            page: mockResponse.data.page,
            limit: mockResponse.data.limit,
            totalItems: mockResponse.data.totalItems,
            totalPages: mockResponse.data.totalPages,
            hasNextPage: mockResponse.data.hasNextPage,
            hasPrevPage: mockResponse.data.hasPrevPage
        });

        setLoading(false);
    };

    // Update URL query params với search và filter
    const updateURLParams = (
        page: number,
        pageLimit: number,
        search: string = '',
        status: string = 'all'
    ): void => {
        const url = new URL(window.location.href);
        url.searchParams.set('page', page.toString());
        url.searchParams.set('limit', pageLimit.toString());

        if (search) {
            url.searchParams.set('search', search);
        } else {
            url.searchParams.delete('search');
        }

        if (status !== 'all') {
            url.searchParams.set('status', status);
        } else {
            url.searchParams.delete('status');
        }

        window.history.replaceState({}, '', url);
    };

    // Get query params from URL
    const getURLParams = (): URLParams => {
        const urlParams = new URLSearchParams(window.location.search);
        const page = parseInt(urlParams.get('page') || '1') || 1;
        const pageLimit = parseInt(urlParams.get('limit') || '5') || 5;
        const search = urlParams.get('search') || '';
        const status = urlParams.get('status') || 'all';
        return { page, limit: pageLimit, search, status };
    };

    // Load initial data từ URL params
    useEffect(() => {
        const { page, limit: pageLimit, search, status } = getURLParams();
        setCurrentPage(page);
        setLimit(pageLimit);
        setSearchTerm(search);
        setStatusFilter(status as 'all' | 'active' | 'inactive');
        fetchTeachers(page, pageLimit, search, status as 'all' | 'active' | 'inactive');
    }, []);

    // Handle page change
    const handlePageChange = (newPage: number): void => {
        setCurrentPage(newPage);
        updateURLParams(newPage, limit, searchTerm, statusFilter);
        fetchTeachers(newPage, limit, searchTerm, statusFilter);
    };

    // Handle limit change
    const handleLimitChange = (newLimit: number): void => {
        setLimit(newLimit);
        setCurrentPage(1);
        updateURLParams(1, newLimit, searchTerm, statusFilter);
        fetchTeachers(1, newLimit, searchTerm, statusFilter);
    };

    // Handle search
    const handleSearch = (search: string): void => {
        setSearchTerm(search);
        setCurrentPage(1);
        updateURLParams(1, limit, search, statusFilter);
        fetchTeachers(1, limit, search, statusFilter);
    };

    // Handle status filter
    const handleStatusFilter = (status: 'all' | 'active' | 'inactive'): void => {
        setStatusFilter(status);
        setCurrentPage(1);
        updateURLParams(1, limit, searchTerm, status);
        fetchTeachers(1, limit, searchTerm, status);
    };

    // Format date
    const formatDate = (dateString: string | null): string => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    // Format datetime
    const formatDateTime = (dateString: string | null): string => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Handle action buttons
    const handleViewTeacher = (teacher: Teacher): void => {
        setSelectedTeacher(teacher);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedTeacher(null);
    };

    const handleEditTeacher = (teacherId: string): void => {
        console.log('Edit teacher:', teacherId);
    };

    const handleDeleteTeacher = (teacherId: string): void => {
        console.log('Delete teacher:', teacherId);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Teacher Management</h1>
                    <p className="text-gray-600">Manage and view all teacher information</p>
                </div>

                {/* Controls */}
                <div className="mb-6 bg-white rounded-lg shadow-md p-6">
                    <div className="flex flex-wrap gap-4 items-center justify-between">
                        {/* Search */}
                        <div className="flex-1 min-w-72">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search by name, email, or username..."
                                    value={searchTerm}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="flex gap-4 items-center">
                            <div className="flex items-center gap-2">
                                <Filter className="w-4 h-4 text-gray-500" />
                                <select
                                    value={statusFilter}
                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                                        handleStatusFilter(e.target.value as 'all' | 'active' | 'inactive')
                                    }
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="all">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium text-gray-700">Show:</label>
                                <select
                                    value={limit}
                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                                        handleLimitChange(parseInt(e.target.value))
                                    }
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    disabled={loading}
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {loading && (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    )}

                    {!loading && (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Teacher
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Contact
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Provider
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Last Activity
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {teachers.map((teacher: Teacher) => (
                                        <tr key={teacher.id} className="hover:bg-gray-50 transition-colors">
                                            {/* Teacher Info */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-3">
                                                    <img
                                                        src={teacher.avatarUrl}
                                                        alt={`${teacher.firstName} ${teacher.lastName}`}
                                                        className="w-10 h-10 rounded-full object-cover"
                                                    />
                                                    <div>
                                                        <div className="font-semibold text-gray-900">
                                                            {teacher.firstName} {teacher.lastName}
                                                        </div>
                                                        <div className="text-sm text-gray-500">@{teacher.username}</div>
                                                        <div className="text-xs text-gray-400 italic">{teacher.bio}</div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Contact */}
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center space-x-2 text-sm">
                                                        <Mail className="w-4 h-4 text-gray-400" />
                                                        <span className="text-gray-600">{teacher.email}</span>
                                                        {teacher.emailVerified ? (
                                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                                        ) : (
                                                            <XCircle className="w-4 h-4 text-red-500" />
                                                        )}
                                                    </div>
                                                    <div className="flex items-center space-x-2 text-sm">
                                                        <Phone className="w-4 h-4 text-gray-400" />
                                                        <span className="text-gray-600">{teacher.phone || 'N/A'}</span>
                                                        {teacher.phone && (teacher.phoneVerified ? (
                                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                                        ) : (
                                                            <XCircle className="w-4 h-4 text-red-500" />
                                                        ))}
                                                    </div>
                                                    <div className="flex items-center space-x-2 text-sm">
                                                        <Calendar className="w-4 h-4 text-gray-400" />
                                                        <span className="text-gray-600">{formatDate(teacher.dob)}</span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Status */}
                                            <td className="px-6 py-4">
                                                <div className="space-y-2">
                                                    <span
                                                        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${teacher.status === 'active'
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-red-100 text-red-800'
                                                            }`}
                                                    >
                                                        {teacher.status}
                                                    </span>
                                                    <div className="text-xs text-gray-500">
                                                        {teacher.gender} • {teacher.language.toUpperCase()}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Provider */}
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${teacher.provider === 'google'
                                                            ? 'bg-red-100 text-red-800'
                                                            : teacher.provider === 'facebook'
                                                                ? 'bg-blue-100 text-blue-800'
                                                                : 'bg-gray-100 text-gray-800'
                                                        }`}
                                                >
                                                    {teacher.provider}
                                                </span>
                                            </td>

                                            {/* Last Activity */}
                                            <td className="px-6 py-4">
                                                <div className="space-y-1 text-xs text-gray-500">
                                                    <div className="flex items-center space-x-2">
                                                        <Clock className="w-3 h-3" />
                                                        <span>Login: {formatDateTime(teacher.lastLoginAt)}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Clock className="w-3 h-3" />
                                                        <span>Active: {formatDateTime(teacher.lastActiveAt)}</span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleViewTeacher(teacher)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        aria-label={`View ${teacher.firstName} ${teacher.lastName}`}
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEditTeacher(teacher.id)}
                                                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                        aria-label={`Edit ${teacher.firstName} ${teacher.lastName}`}
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteTeacher(teacher.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        aria-label={`Delete ${teacher.firstName} ${teacher.lastName}`}
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

                    {/* Empty State */}
                    {!loading && teachers.length === 0 && (
                        <div className="text-center py-12">
                            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-medium text-gray-900 mb-2">No teachers found</h3>
                            <p className="text-gray-600">No teachers match your current filters.</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {!loading && pagination.totalPages && pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between bg-white rounded-lg shadow-md p-4 mt-6">
                        <div className="text-sm text-gray-600">
                            Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, pagination.totalItems || 0)} of {pagination.totalItems || 0} results
                        </div>

                        <div className="flex items-center space-x-2">
                            {/* Previous Button */}
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={!pagination.hasPrevPage}
                                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${pagination.hasPrevPage
                                        ? 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                                        : 'text-gray-400 bg-gray-50 cursor-not-allowed'
                                    }`}
                            >
                                <ChevronLeft className="w-4 h-4 mr-1" />
                                Previous
                            </button>

                            {/* Page Numbers */}
                            <div className="flex space-x-1">
                                {[...Array(pagination.totalPages || 0)].map((_, index: number) => {
                                    const pageNum = index + 1;
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => handlePageChange(pageNum)}
                                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentPage === pageNum
                                                    ? 'bg-blue-600 text-white'
                                                    : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Next Button */}
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={!pagination.hasNextPage}
                                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${pagination.hasNextPage
                                        ? 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                                        : 'text-gray-400 bg-gray-50 cursor-not-allowed'
                                    }`}
                            >
                                Next
                                <ChevronRight className="w-4 h-4 ml-1" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Summary Stats */}
                {!loading && (
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center">
                                <div className="p-3 rounded-full bg-blue-100">
                                    <User className="w-6 h-6 text-blue-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Total Teachers</p>
                                    <p className="text-2xl font-semibold text-gray-900">{pagination.totalItems || 0}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center">
                                <div className="p-3 rounded-full bg-green-100">
                                    <CheckCircle className="w-6 h-6 text-green-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Active Teachers</p>
                                    <p className="text-2xl font-semibold text-gray-900">
                                        {mockData.data.data.filter((s: Teacher) => s.status === 'active').length}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center">
                                <div className="p-3 rounded-full bg-red-100">
                                    <XCircle className="w-6 h-6 text-red-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Inactive Teachers</p>
                                    <p className="text-2xl font-semibold text-gray-900">
                                        {mockData.data.data.filter((s: Teacher) => s.status === 'inactive').length}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Teacher Detail Modal */}
            <Modal
                open={isModalOpen}
                onClose={handleCloseModal}
                aria-labelledby="teacher-detail-modal-title"
                aria-describedby="teacher-detail-modal-description"
            >
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 400,
                    bgcolor: 'background.paper',
                    border: '2px solid #000',
                    boxShadow: 24,
                    p: 4,
                }}>
                    {selectedTeacher && (
                        <div>
                            <h2 id="teacher-detail-modal-title">{selectedTeacher.firstName} {selectedTeacher.lastName}</h2>
                            <img src={selectedTeacher.avatarUrl} alt={`${selectedTeacher.firstName} ${selectedTeacher.lastName}`} style={{ width: '100px', height: '100px', borderRadius: '50%' }} />
                            <p id="teacher-detail-modal-description">
                                Email: {selectedTeacher.email}
                            </p>
                            <p>
                                Phone: {selectedTeacher.phone || 'N/A'}
                            </p>
                            <p>
                                Username: {selectedTeacher.username}
                            </p>
                            <p>
                                Status: {selectedTeacher.status}
                            </p>
                            <p>
                                Gender: {selectedTeacher.gender}
                            </p>
                            <p>
                                Date of Birth: {formatDate(selectedTeacher.dob)}
                            </p>
                            <p>
                                Last Login: {formatDateTime(selectedTeacher.lastLoginAt)}
                            </p>
                        </div>
                    )}
                </Box>
            </Modal>
        </div>
    );
};

export default TeacherPage;
