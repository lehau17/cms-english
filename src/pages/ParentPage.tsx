import { getParents } from '@/apis/parent'; // Hàm gọi API lấy danh sách phụ huynh
import AssignParentModal from '@/components/parent/AssignParentModal'; // Modal gán học sinh cho phụ huynh
import CreateParentModal from '@/components/parent/CreateParentModal'; // Modal tạo phụ huynh mới
import DeleteParentModal from '@/components/parent/DeleteParentModal'; // Modal xóa phụ huynh
import EditParentModal from '@/components/parent/EditParentModal'; // Modal chỉnh sửa phụ huynh
import ViewParentModal from '@/components/parent/ViewParentModal'; // Modal xem chi tiết phụ huynh
import { useBaseRequestQuery } from '@/hooks/useBaseRequestQuery'; // Hook chung cho phân trang + search
import { Parent } from '@/interface/parent.interface'; // Kiểu dữ liệu Parent
import {
    ChevronLeft,
    ChevronRight,
    Edit,
    Eye,
    Plus,
    Search,
    Trash2,
    UserPlus,
    Users,
} from 'lucide-react'; // Icon dùng trong UI
import React, { useState } from 'react'; // React + useState

const ParentPage: React.FC = () => { // Component trang quản lý phụ huynh
    const {
        data: parentData, // Dữ liệu phụ huynh từ API
        isLoading, // Trạng thái đang tải
        setPage, // Hàm đổi trang
        setLimit, // Hàm đổi số item mỗi trang
        setSearch, // Hàm đổi từ khóa tìm kiếm
        request, // Object chứa page, limit, search hiện tại
    } = useBaseRequestQuery<Parent>({
        queryKey: ['parents'], // Key cho React Query cache
        queryFn: getParents, // Hàm gọi API
    });

    const [selectedParent, setSelectedParent] = useState<Parent | null>(null); // Phụ huynh đang chọn (xem/sửa/xóa/gán)
    const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false); // Mở modal xem chi tiết
    const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false); // Mở modal sửa
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false); // Mở modal xóa
    const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false); // Mở modal tạo
    const [isAssignModalOpen, setIsAssignModalOpen] = useState<boolean>(false); // Mở modal gán học sinh

    const handleView = (parent: Parent) => { // Mở modal xem chi tiết phụ huynh
        setSelectedParent(parent);
        setIsViewModalOpen(true);
    };

    const handleEdit = (parent: Parent) => { // Mở modal sửa phụ huynh
        setSelectedParent(parent);
        setIsEditModalOpen(true);
    };

    const handleDelete = (parent: Parent) => { // Mở modal xóa phụ huynh
        setSelectedParent(parent);
        setIsDeleteModalOpen(true);
    };

    const handleAssign = (parent: Parent) => { // Mở modal gán học sinh cho phụ huynh
        setSelectedParent(parent);
        setIsAssignModalOpen(true);
    };

    const closeModal = () => { // Đóng tất cả modal + reset phụ huynh đang chọn
        setSelectedParent(null);
        setIsViewModalOpen(false);
        setIsEditModalOpen(false);
        setIsDeleteModalOpen(false);
        setIsCreateModalOpen(false);
        setIsAssignModalOpen(false);
    };

    const onSuccess = () => { // Callback khi thao tác thành công (tạo/sửa/xóa/gán)
        request.refetch(); // Làm mới danh sách phụ huynh
        closeModal(); // Đóng modal
    };

    if (isLoading) { // Nếu đang tải dữ liệu
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-sm sm:text-base lg:text-lg">Đang tải dữ liệu phụ huynh...</div> {/* Thông báo loading */}
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6"> {/* Container chính với spacing */}
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                <div className="min-w-0 flex-1">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Quản lý phụ huynh</h1> {/* Tiêu đề trang */}
                    <p className="text-sm sm:text-base text-gray-600 mt-1">
                        Quản lý thông tin phụ huynh và liên kết với học sinh {/* Mô tả ngắn */}
                    </p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)} // Bấm => mở modal tạo phụ huynh
                    className="flex-shrink-0 w-full sm:w-auto bg-blue-600 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                    <Plus className="h-4 w-4" />
                    Thêm phụ huynh {/* Nút tạo phụ huynh mới */}
                </button>
            </div>

            {/* Search and filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
                <div className="flex gap-3 sm:gap-4 items-center">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm phụ huynh..."
                            className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            onChange={(e) => setSearch(e.target.value)} // Mỗi lần gõ => cập nhật search
                        />
                    </div>
                </div>
            </div>

            {/* Parents table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto -mx-3 sm:mx-0">
                    <div className="inline-block min-w-full align-middle px-3 sm:px-0">
                        <div className="min-w-[800px]"> {/* Đảm bảo bảng không quá hẹp */}
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Phụ huynh
                                        </th>
                                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Email
                                        </th>
                                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Số điện thoại
                                        </th>
                                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Học sinh liên kết
                                        </th>
                                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Trạng thái
                                        </th>
                                        <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Thao tác
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {parentData?.data?.data?.map((parent) => ( // Lặp qua từng phụ huynh
                                        <tr key={parent.id} className="hover:bg-gray-50">
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                                        <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" /> {/* Icon phụ huynh */}
                                                    </div>
                                                    <div className="ml-2 sm:ml-4 min-w-0">
                                                        <div className="text-sm font-medium text-gray-900 truncate">
                                                            {parent.firstName} {parent.lastName} {/* Tên phụ huynh */}
                                                        </div>
                                                        <div className="text-xs sm:text-sm text-gray-500 truncate">
                                                            ID: {parent.id.slice(0, 8)}... {/* Hiển thị 8 ký tự đầu của ID */}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                                                {parent.email} {/* Email phụ huynh */}
                                            </td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                                                {parent.phoneNumber || 'Chưa có'} {/* Số điện thoại hoặc "Chưa có" */}
                                            </td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                                <div className="text-xs sm:text-sm text-gray-900">
                                                    {parent.children?.length || 0} học sinh {/* Số lượng học sinh liên kết */}
                                                </div>
                                            </td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${parent.isActive
                                                        ? 'bg-green-100 text-green-800' // Màu xanh cho hoạt động
                                                        : 'bg-red-100 text-red-800' // Màu đỏ cho không hoạt động
                                                        }`}
                                                >
                                                    {parent.isActive ? 'Hoạt động' : 'Không hoạt động'} {/* Badge trạng thái */}
                                                </span>
                                            </td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end gap-1 sm:gap-2">
                                                    <button
                                                        onClick={() => handleView(parent)} // Xem chi tiết
                                                        className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                                                        title="Xem chi tiết"
                                                    >
                                                        <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(parent)} // Chỉnh sửa
                                                        className="text-yellow-600 hover:text-yellow-900 p-1 hover:bg-yellow-50 rounded"
                                                        title="Chỉnh sửa"
                                                    >
                                                        <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleAssign(parent)} // Gán học sinh
                                                        className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded"
                                                        title="Gán học sinh"
                                                    >
                                                        <UserPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(parent)} // Xóa
                                                        className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                                                        title="Xóa"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
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

                {/* Pagination */}
                {parentData && ( // Chỉ hiển thị pagination nếu có dữ liệu
                    <div className="bg-white px-3 sm:px-4 py-3 flex items-center justify-between border-t border-gray-200">
                        {/* Pagination cho mobile (hiển thị trên màn hình nhỏ) */}
                        <div className="flex-1 flex justify-between sm:hidden">
                            <button
                                onClick={() => setPage(Math.max(1, (parentData?.data?.page || 1) - 1))} // Trang trước
                                disabled={parentData?.data?.page === 1}
                                className="relative inline-flex items-center px-3 py-2 border border-gray-200 text-xs sm:text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                            >
                                Trước
                            </button>
                            <button
                                onClick={() => setPage((parentData?.data?.page || 1) + 1)} // Trang sau
                                disabled={!parentData?.data?.hasNextPage}
                                className="ml-3 relative inline-flex items-center px-3 py-2 border border-gray-200 text-xs sm:text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                            >
                                Sau
                            </button>
                        </div>
                        {/* Pagination cho desktop (hiển thị trên màn hình lớn) */}
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-xs sm:text-sm text-gray-700">
                                    {/* Hiển thị thông tin: đang xem từ bản ghi số mấy đến mấy */}
                                    Hiển thị{' '}
                                    <span className="font-medium">
                                        {((parentData?.data?.page || 1) - 1) *
                                            (parentData?.data?.limit || 10) +
                                            1}
                                    </span>{' '}
                                    đến{' '}
                                    <span className="font-medium">
                                        {Math.min(
                                            (parentData?.data?.page || 1) *
                                            (parentData?.data?.limit || 10),
                                            parentData?.data?.totalItems || 0
                                        )}
                                    </span>{' '}
                                    trong tổng số{' '}
                                    <span className="font-medium">
                                        {parentData?.data?.totalItems || 0}
                                    </span>{' '}
                                    phụ huynh
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                    <button
                                        onClick={() => setPage(Math.max(1, (parentData?.data?.page || 1) - 1))} // Trang trước
                                        disabled={parentData?.data?.page === 1}
                                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-200 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                                    </button>
                                    <button
                                        onClick={() => setPage((parentData?.data?.page || 1) + 1)} // Trang sau
                                        disabled={!parentData?.data?.hasNextPage}
                                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-200 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            <CreateParentModal
                isOpen={isCreateModalOpen} // Trạng thái mở/đóng
                onClose={closeModal} // Hàm đóng modal
                onSuccess={onSuccess} // Callback khi tạo thành công
            />

            {selectedParent && ( // Chỉ render các modal này nếu có phụ huynh được chọn
                <>
                    <ViewParentModal
                        isOpen={isViewModalOpen} // Trạng thái mở/đóng
                        onClose={closeModal} // Hàm đóng modal
                        parent={selectedParent} // Phụ huynh đang được chọn
                    />
                    <EditParentModal
                        isOpen={isEditModalOpen} // Trạng thái mở/đóng
                        onClose={closeModal} // Hàm đóng modal
                        parent={selectedParent} // Phụ huynh đang được chọn
                        onSuccess={onSuccess} // Callback khi sửa thành công
                    />
                    <DeleteParentModal
                        isOpen={isDeleteModalOpen} // Trạng thái mở/đóng
                        onClose={closeModal} // Hàm đóng modal
                        parent={selectedParent} // Phụ huynh đang được chọn
                        onSuccess={onSuccess} // Callback khi xóa thành công
                    />
                    <AssignParentModal
                        isOpen={isAssignModalOpen} // Trạng thái mở/đóng
                        onClose={closeModal} // Hàm đóng modal
                        parent={selectedParent} // Phụ huynh đang được chọn
                        onSuccess={onSuccess} // Callback khi gán thành công
                    />
                </>
            )}
        </div>
    );
};

export default ParentPage; // Export component để dùng trong router
