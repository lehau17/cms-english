
import { getClassrooms } from '@/apis/classroom'; // Hàm gọi API lấy danh sách lớp
import CreateClassroomModal from '@/components/classroom/CreateClassroomModal'; // Modal tạo lớp
import DeleteClassroomModal from '@/components/classroom/DeleteClassroomModal'; // Modal xóa lớp
import EditClassroomModal from '@/components/classroom/EditClassroomModal'; // Modal sửa lớp
import { useBaseRequestQuery } from '@/hooks/useBaseRequestQuery'; // Hook chung cho phân trang + search
import { useUpdateClassroomStatus } from '@/hooks/useClassroom'; // Hook mutation cập nhật trạng thái lớp
import { Classroom, ClassroomStatus } from '@/interface/classroom.interface'; // Kiểu dữ liệu Classroom
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
} from 'lucide-react'; // Icon dùng trong UI
import React, { useState } from 'react'; // React + hook useState
import toast from 'react-hot-toast'; // Thông báo toast
import { useNavigate } from 'react-router-dom'; // Hook điều hướng

const ClassroomPage: React.FC = () => { // Component trang quản lý lớp học
    const {
        data: classroomData, // Dữ liệu trả về từ API
        isLoading, // Trạng thái đang tải
        setPage, // Hàm đổi trang
        setLimit, // Hàm đổi số item mỗi trang
        setSearch, // Hàm đổi từ khóa tìm kiếm
        request, // Object chứa page, limit, search hiện tại
    } = useBaseRequestQuery<Classroom>({
        queryKey: ['classrooms'], // Key cho React Query cache
        queryFn: getClassrooms, // Hàm gọi API
    });

    const navigate = useNavigate(); // Dùng để chuyển trang
    const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null); // Lớp đang chọn (sửa/xóa)
    const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false); // Mở modal sửa
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false); // Mở modal xóa
    const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false); // Mở modal tạo
    const [statusDropdownOpen, setStatusDropdownOpen] = useState<string | null>(null); // Lớp nào đang mở menu đổi trạng thái

    const updateStatusMutation = useUpdateClassroomStatus(); // Mutation cập nhật trạng thái lớp

    const handleView = (classroom: Classroom) => { // Xem chi tiết lớp
        navigate(`/classrooms/${classroom.id}`); // Điều hướng sang trang chi tiết
    };

    const handleEdit = (classroom: Classroom) => { // Mở modal sửa lớp
        setSelectedClassroom(classroom);
        setIsEditModalOpen(true);
    };

    const handleDelete = (classroom: Classroom) => { // Mở modal xóa lớp
        setSelectedClassroom(classroom);
        setIsDeleteModalOpen(true);
    };

    const handleCreate = () => { // Mở modal tạo lớp
        setIsCreateModalOpen(true);
    };

    const handleCloseModals = () => { // Đóng tất cả modal + reset lớp đang chọn
        setIsEditModalOpen(false);
        setIsDeleteModalOpen(false);
        setIsCreateModalOpen(false);
        setSelectedClassroom(null);
    };

    const handlePageChange = (newPage: number) => { // Đổi trang phân trang
        if (newPage > 0 && newPage <= (classroomData?.data.totalPages || 1)) {
            setPage(newPage);
        }
    };

    const handleLimitChange = (newLimit: number) => { // Đổi số bản ghi mỗi trang
        setLimit(newLimit);
    };

    const handleSearch = (search: string) => { // Đổi từ khóa tìm kiếm
        setSearch(search);
    };

    const formatDate = (dateString: string | Date | null | undefined): string => { // Định dạng ngày cho dễ đọc
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusBadge = (status: ClassroomStatus) => { // Trả về badge trạng thái (màu + text)
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

    const handleStatusChange = async (classroomId: string, newStatus: ClassroomStatus) => { // Đổi trạng thái lớp
        try {
            await updateStatusMutation.mutateAsync({ classroomId, status: newStatus }); // Gọi API update
            toast.success('Classroom status updated successfully!'); // Thông báo thành công
            setStatusDropdownOpen(null); // Đóng menu trạng thái
        } catch (error: any) {
            toast.error(`Failed to update status: ${error?.response?.data?.message || error.message}`); // Thông báo lỗi
        }
    };

    const classrooms = classroomData?.data.data || []; // Danh sách lớp (mảng)
    const pagination = classroomData?.data; // Thông tin phân trang

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50 p-3 sm:p-4 md:p-6"> {/* Nền trang + padding */}
            <div className="max-w-7xl mx-auto"> {/* Giới hạn chiều rộng nội dung */}
                <div className="mb-4 sm:mb-6 md:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                    <div className="min-w-0 flex-1">
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">
                            Classroom Management {/* Tiêu đề trang */}
                        </h1>
                        <p className="text-sm sm:text-base text-gray-600">
                            Oversee all classrooms and their activities. {/* Mô tả ngắn */}
                        </p>
                    </div>
                    <button
                        onClick={handleCreate} // Bấm => mở modal tạo lớp
                        className="flex-shrink-0 w-full sm:w-auto flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                        <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>Create Classroom</span> {/* Nút tạo lớp mới */}
                    </button>
                </div>

                {/* Thanh search + chọn số bản ghi */}
                <div className="mb-4 sm:mb-6 bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 md:p-6">
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-between">
                        <div className="flex-1 min-w-0">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                                <input
                                    type="text"
                                    placeholder="Search by classroom name..." // Gợi ý người dùng nhập tên lớp
                                    value={request.search || ''} // Giá trị lấy từ state request
                                    onChange={(e) => handleSearch(e.target.value)} // Mỗi lần gõ => cập nhật search
                                    className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <label className="text-xs sm:text-sm font-medium text-gray-700">Show:</label> {/* Nhãn dropdown limit */}
                            <select
                                value={request.limit} // Số bản ghi mỗi trang hiện tại
                                onChange={(e) => handleLimitChange(parseInt(e.target.value))} // Đổi limit
                                className="px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                disabled={isLoading} // Đang load thì disable
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Bảng danh sách lớp */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {isLoading && ( // Nếu đang tải dữ liệu
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div> {/* Spinner loading */}
                        </div>
                    )}

                    {!isLoading && ( // Chỉ hiển thị bảng khi đã load xong
                        <div className="overflow-x-auto -mx-3 sm:mx-0">
                            <div className="inline-block min-w-full align-middle px-3 sm:px-0">
                                <div className="min-w-[900px]"> {/* Đảm bảo bảng không quá hẹp */}
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Classroom</th>
                                                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Teacher</th>
                                                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Enrollment</th>
                                                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created At</th>
                                                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {classrooms.map((classroom) => ( // Lặp qua từng lớp
                                                <tr key={classroom.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                                                        <div className="font-semibold text-gray-900 text-sm">{classroom.name}</div> {/* Tên lớp */}
                                                        <div className="text-xs sm:text-sm text-gray-500">Code: {classroom.classCode}</div> {/* Mã lớp */}
                                                    </td>
                                                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                                                        <div className="flex items-center space-x-2">
                                                            <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                                                            <span className="text-xs sm:text-sm truncate">
                                                                {classroom.teacher?.firstName} {classroom.teacher?.lastName} {/* Tên giáo viên */}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                                                        <div className="relative">
                                                            <button
                                                                onClick={() => setStatusDropdownOpen(statusDropdownOpen === classroom.id ? null : classroom.id)} // Mở/đóng menu trạng thái
                                                                className="flex items-center space-x-1 sm:space-x-2 hover:opacity-80 transition-opacity"
                                                            >
                                                                {getStatusBadge(classroom.status)} {/* Hiển thị badge trạng thái */}
                                                                <MoreVertical className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                                                            </button>

                                                            {statusDropdownOpen === classroom.id && ( // Nếu menu của lớp này đang mở
                                                                <div className="absolute z-10 mt-2 w-40 sm:w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                                                                    <div className="py-1" role="menu">
                                                                        <div className="px-3 sm:px-4 py-2 text-xs text-gray-500 font-semibold">
                                                                            Change Status {/* Tiêu đề menu */}
                                                                        </div>
                                                                        {Object.values(ClassroomStatus).map((status) => ( // Lặp qua các trạng thái có thể chọn
                                                                            <button
                                                                                key={status}
                                                                                onClick={() => handleStatusChange(classroom.id, status)} // Chọn trạng thái mới
                                                                                className="block w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                                                                disabled={updateStatusMutation.isPending} // Đang update thì disable
                                                                            >
                                                                                {status.charAt(0).toUpperCase() + status.slice(1)} {/* Viết hoa chữ đầu */}
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                                                        <div className="flex items-center space-x-2">
                                                            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                                                            <span className="text-xs sm:text-sm">
                                                                {classroom.students?.length || 0} / {classroom.maxStudents || '∞'} {/* Số học sinh hiện tại / tối đa */}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-500">
                                                        {formatDate(classroom.createdAt)} {/* Ngày tạo lớp */}
                                                    </td>
                                                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                                                        <div className="flex space-x-1">
                                                            <button
                                                                onClick={() => handleView(classroom)} // Xem chi tiết
                                                                className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors tooltip"
                                                                title="View Details"
                                                            >
                                                                <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleEdit(classroom)} // Sửa lớp
                                                                className="p-1.5 sm:p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors tooltip"
                                                                title="Edit Classroom"
                                                            >
                                                                <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(classroom)} // Xóa lớp
                                                                className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors tooltip"
                                                                title="Delete Classroom"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Trạng thái: không có lớp nào */}
                    {!isLoading && classrooms.length === 0 && (
                        <div className="text-center py-12">
                            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-medium text-gray-900 mb-2">No Classrooms Found</h3>
                            <p className="text-gray-600 mb-4">Create a new classroom to get started.</p>
                            <button
                                onClick={handleCreate} // Bấm => tạo lớp đầu tiên
                                className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Create Your First Classroom</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Phân trang dưới bảng */}
                {!isLoading && pagination && pagination.totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 md:p-6 mt-4 sm:mt-6 gap-3 sm:gap-4">
                        <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                            {/* Hiển thị từ bản ghi số mấy đến mấy */}
                            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.totalItems || 0)} of {pagination.totalItems || 0} results
                        </div>
                        <div className="flex flex-col xs:flex-row items-center gap-2 w-full sm:w-auto">
                            <button
                                onClick={() => handlePageChange(pagination.page - 1)} // Trang trước
                                disabled={!pagination.hasPrevPage}
                                className="flex items-center justify-center w-full xs:w-auto px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:text-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
                                <span className="hidden xs:inline">Previous</span>
                                <span className="xs:hidden">Prev</span>
                            </button>
                            <div className="flex space-x-1 overflow-x-auto max-w-full">
                                {[...Array(Math.min(pagination.totalPages || 0, 5))].map((_, index) => {
                                    const pageNum = pagination.page <= 3 ? index + 1 : pagination.page - 2 + index; // Tính số trang hiển thị
                                    if (pageNum > (pagination.totalPages || 0)) return null;
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => handlePageChange(pageNum)} // Chuyển sang trang được chọn
                                            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex-shrink-0 ${pagination.page === pageNum
                                                ? 'bg-indigo-600 text-white shadow-sm' // Trang hiện tại
                                                : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>
                            <button
                                onClick={() => handlePageChange(pagination.page + 1)} // Trang tiếp theo
                                disabled={!pagination.hasNextPage}
                                className="flex items-center justify-center w-full xs:w-auto px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:text-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed"
                            >
                                Next
                                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Các modal tạo / sửa / xóa lớp */}
            <CreateClassroomModal
                isOpen={isCreateModalOpen} // Mở/đóng modal tạo
                onClose={handleCloseModals} // Đóng modal
            />

            <EditClassroomModal
                isOpen={isEditModalOpen} // Mở/đóng modal sửa
                onClose={handleCloseModals}
                classroom={selectedClassroom} // Truyền lớp đang chọn vào modal
            />

            <DeleteClassroomModal
                isOpen={isDeleteModalOpen} // Mở/đóng modal xóa
                onClose={handleCloseModals}
                classroom={selectedClassroom} // Truyền lớp đang chọn vào modal
            />

        </div>
    );
};

export default ClassroomPage; // Export component để dùng trong router
