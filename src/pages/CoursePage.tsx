
import { getCourses } from '@/apis/course'; // Hàm gọi API lấy danh sách khóa học
import DeleteCourseModal from '@/components/course/DeleteCourseModal'; // Modal xác nhận xóa khóa học
import { useBaseRequestQuery } from '@/hooks/useBaseRequestQuery'; // Hook dùng chung cho phân trang + search
import { Course } from '@/interface/course.interface'; // Kiểu dữ liệu Course
import {
    BookOpen,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    Clock,
    Edit,
    Eye,
    Plus,
    Search,
    Trash2,
    User,
    Users,
    XCircle
} from 'lucide-react'; // Bộ icon dùng trong giao diện
import React, { useState } from 'react'; // React + useState
import { useNavigate } from 'react-router-dom'; // Hook điều hướng trang

const CoursePage: React.FC = () => { // Component trang quản lý khóa học
    const {
        data: courseData, // Dữ liệu khóa học từ API
        isLoading, // Trạng thái đang loading
        setPage, // Hàm đổi trang hiện tại
        setLimit, // Hàm đổi số item mỗi trang
        setSearch, // Hàm đổi từ khóa tìm kiếm
        request, // Object chứa state request (page, limit, search)
    } = useBaseRequestQuery<Course>({
        queryKey: ['courses'], // Key dùng cho React Query cache
        queryFn: getCourses, // Hàm gọi API lấy danh sách khóa học
    });

    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null); // Khóa học đang chọn (khi xóa)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false); // Trạng thái mở/đóng modal xóa
    const navigate = useNavigate(); // Dùng để chuyển trang

    const handleView = (course: Course) => { // Xem chi tiết khóa học
        navigate(`/courses/${course.id}`);
    };

    const handleEdit = (course: Course) => { // Chuyển sang trang sửa khóa học
        navigate(`/courses/edit/${course.id}`);
    };

    const handleDelete = (course: Course) => { // Mở modal xóa khóa học
        setSelectedCourse(course);
        setIsDeleteModalOpen(true);
    };

    const handleCreate = () => { // Chuyển sang trang tạo khóa học
        navigate("/create-course");
    };

    const handleCloseModals = () => { // Đóng modal xóa + reset course chọn
        setIsDeleteModalOpen(false);
        setSelectedCourse(null);
    };

    const handlePageChange = (newPage: number) => { // Đổi trang phân trang
        if (newPage > 0 && newPage <= (courseData?.data.totalPages || 1)) {
            setPage(newPage);
        }
    };

    const handleLimitChange = (newLimit: number) => { // Đổi số item mỗi trang
        setLimit(newLimit);
    };

    const handleSearch = (search: string) => { // Cập nhật từ khóa tìm kiếm
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

    const courses = courseData?.data.data || []; // Danh sách khóa học (mảng)
    const pagination = courseData?.data; // Thông tin phân trang

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50 p-3 sm:p-4 md:p-6"> {/* Nền trang + padding */}
            <div className="max-w-7xl mx-auto"> {/* Giới hạn chiều rộng tối đa */}
                {/* Header: tiêu đề + nút tạo khóa học */}
                <div className="mb-4 sm:mb-6 md:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                    <div className="min-w-0 flex-1">
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">
                            Course Management {/* Tiêu đề trang */}
                        </h1>
                        <p className="text-sm sm:text-base text-gray-600">
                            Oversee all courses and their activities. {/* Mô tả ngắn */}
                        </p>
                    </div>
                    <button
                        onClick={handleCreate} // Bấm => sang trang tạo khóa học
                        className="flex-shrink-0 w-full sm:w-auto flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                        <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>Create Course</span> {/* Nút tạo khóa học */}
                    </button>
                </div>

                {/* Thanh tìm kiếm + chọn số bản ghi */}
                <div className="mb-4 sm:mb-6 bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 md:p-6">
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-between">
                        <div className="flex-1 min-w-0">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                                <input
                                    type="text"
                                    placeholder="Search by course name..." // Gợi ý tìm theo tên khóa học
                                    value={request.search || ''} // Giá trị search hiện tại
                                    onChange={(e) => handleSearch(e.target.value)} // Mỗi lần gõ => cập nhật search
                                    className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <label className="text-xs sm:text-sm font-medium text-gray-700">Show:</label> {/* Nhãn số lượng hiển thị */}
                            <select
                                value={request.limit} // Limit hiện tại
                                onChange={(e) => handleLimitChange(parseInt(e.target.value))} // Đổi limit
                                className="px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                disabled={isLoading} // Đang load thì khóa lại
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Trạng thái loading */}
                {isLoading && (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div> {/* Vòng quay loading */}
                    </div>
                )}

                {/* Không có khóa học nào */}
                {!isLoading && courses.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
                        <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-gray-900 mb-2">No Courses Found</h3>
                        <p className="text-gray-600 mb-4">Create a new course to get started.</p>
                        <button
                            onClick={handleCreate} // Tạo khóa học đầu tiên
                            className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Create Your First Course</span>
                        </button>
                    </div>
                )}

                {/* Có dữ liệu khóa học */}
                {!isLoading && courses.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {courses.map((course) => ( // Lặp qua từng course để vẽ card
                            <div
                                key={course.id}
                                className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-indigo-200 transform hover:-translate-y-1"
                            >
                                {/* Phần ảnh / nền khóa học */}
                                <div className="relative h-36 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 overflow-hidden">
                                    {course.imageUrl ? ( // Nếu có ảnh course
                                        <img
                                            src={course.imageUrl}
                                            alt={course.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" // Hover phóng to nhẹ
                                        />
                                    ) : ( // Nếu không có ảnh => dùng nền gradient + icon
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400">
                                            <BookOpen className="w-12 h-12 text-white opacity-50" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div> {/* Lớp phủ tối */}

                                    {/* Badge độ khó */}
                                    <div className="absolute top-2 right-2">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold backdrop-blur-sm ${course.difficulty === 'beginner' ? 'bg-green-500/90 text-white' :
                                                course.difficulty === 'intermediate' ? 'bg-yellow-500/90 text-white' :
                                                    course.difficulty === 'advanced' ? 'bg-red-500/90 text-white' :
                                                        'bg-gray-500/90 text-white'
                                            }`}>
                                            {course.difficulty?.toUpperCase() || 'N/A'} {/* BEGINNER / INTERMEDIATE / ADVANCED */}
                                        </span>
                                    </div>

                                    {/* Badge trạng thái Published/Draft */}
                                    <div className="absolute top-2 left-2">
                                        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold backdrop-blur-sm ${course.isPublished
                                                ? 'bg-green-500/90 text-white'
                                                : 'bg-gray-500/90 text-white'
                                            }`}>
                                            {course.isPublished ? (
                                                <>
                                                    <CheckCircle className="w-3 h-3" />
                                                    <span>Published</span>
                                                </>
                                            ) : (
                                                <>
                                                    <XCircle className="w-3 h-3" />
                                                    <span>Draft</span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Badge giá khóa học */}
                                    <div className="absolute bottom-2 left-2">
                                        <div className="bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full shadow-lg">
                                            <span className="text-sm font-bold text-indigo-600">
                                                {course.price === 0 || !course.price ? 'FREE' : `$${course.price}`} {/* Miễn phí hoặc hiển thị giá */}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Nội dung thông tin khóa học */}
                                <div className="p-4">
                                    <h3 className="text-base font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors min-h-[40px]">
                                        {course.title} {/* Tên khóa học */}
                                    </h3>

                                    <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-2">
                                        <User className="w-3.5 h-3.5" />
                                        <span className="truncate">
                                            {course.instructor?.firstName} {course.instructor?.lastName || 'Unknown'} {/* Tên giảng viên */}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
                                        <Clock className="w-3.5 h-3.5" />
                                        <span>{formatDate(course.createdAt)}</span> {/* Ngày tạo khóa học */}
                                    </div>

                                    {/* Nhóm nút hành động: xem / sửa / xóa */}
                                    <div className="flex gap-1.5 pt-3 border-t border-gray-100">
                                        <button
                                            onClick={() => handleView(course)} // Xem chi tiết course
                                            className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-xs font-medium transition-colors"
                                            title="View Details"
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                            <span>View</span>
                                        </button>
                                        <button
                                            onClick={() => handleEdit(course)} // Chỉnh sửa course
                                            className="flex items-center justify-center px-2 py-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                                            title="Edit Course"
                                        >
                                            <Edit className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(course)} // Mở modal xóa course
                                            className="flex items-center justify-center px-2 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                            title="Delete Course"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Phân trang ở dưới cùng */}
                {!isLoading && pagination && pagination.totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 md:p-6 mt-4 sm:mt-6 gap-3 sm:gap-4">
                        <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                            {/* Hiển thị thông tin: đang xem từ bản ghi số mấy đến mấy */}
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

            {/* Modal xóa khóa học */}
            <DeleteCourseModal
                isOpen={isDeleteModalOpen} // Trạng thái mở/đóng
                onClose={handleCloseModals} // Hàm đóng modal
                course={selectedCourse} // Khóa học đang được chọn để xóa
            />
        </div>
    );
};

export default CoursePage; // Export component để dùng trong router
