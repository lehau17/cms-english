
import { useQuery } from '@tanstack/react-query'; // Hook fetch dữ liệu + cache
import {
    Award,
    CheckCircle,
    Download,
    Eye,
    Filter,
    Plus,
    Search,
    XCircle,
} from 'lucide-react'; // Bộ icon
import React, { useState } from 'react'; // React + useState
import toast from 'react-hot-toast'; // Thông báo toast
import { useNavigate } from 'react-router-dom'; // Điều hướng
import { certificateApi } from '../apis/certificate.api'; // API chứng chỉ

const CertificatesPage: React.FC = () => {
    const navigate = useNavigate(); // Dùng để chuyển trang
    const [searchQuery, setSearchQuery] = useState(''); // Từ khóa tìm kiếm
    const [filterRevoked, setFilterRevoked] = useState<boolean | undefined>(false); // Lọc trạng thái thu hồi
    const [page, setPage] = useState(1); // Trang hiện tại (phân trang)
    const pageSize = 20; // Số chứng chỉ mỗi trang

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['certificates', page, filterRevoked], // Key cache phụ thuộc page + filter
        queryFn: () =>
            certificateApi.getAll({
                skip: (page - 1) * pageSize, // Bỏ qua bao nhiêu bản ghi
                take: pageSize, // Lấy bao nhiêu bản ghi
                includeRevoked: filterRevoked, // Có lấy bản ghi đã thu hồi không
            }),
    });

    // data đã là dạng { data: [], total: 0 } từ API
    const filteredData = data?.data?.filter((cert) =>
        cert.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.certificateNumber.toLowerCase().includes(searchQuery.toLowerCase())
    ); // Lọc thêm theo từ khóa tìm kiếm

    const formatDate = (dateString: string) => { // Định dạng ngày theo kiểu vi-VN
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const handleDownloadCertificate = async (certificateId: string, certificateNumber: string) => { // Xử lý tải chứng chỉ (PDF)
        try {
            const blob = await certificateApi.downloadCertificate(certificateId); // Gọi API lấy file
            const url = window.URL.createObjectURL(blob); // Tạo URL tạm
            const a = document.createElement('a'); // Tạo thẻ <a> ẩn để tải
            a.href = url;
            a.download = `certificate-${certificateNumber}.pdf`; // Tên file tải về
            document.body.appendChild(a);
            a.click(); // Kích hoạt download
            window.URL.revokeObjectURL(url); // Giải phóng URL tạm
            document.body.removeChild(a);
            toast.success('Certificate downloaded successfully'); // Thông báo thành công
        } catch (error: any) {
            console.error('Download certificate error:', error);
            toast.error(error?.response?.data?.message || 'Failed to download certificate'); // Thông báo lỗi
        }
    };

    return (
        <div className="min-h-screen bg-gray-50"> {/* Nền trang nhạt, full chiều cao */}
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                <Award className="w-8 h-8 text-indigo-600" />
                                Quản Lý Chứng Chỉ {/* Tiêu đề trang */}
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Quản lý và theo dõi tất cả chứng chỉ đã cấp
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/certificate-templates')} // Điều hướng sang trang templates
                            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Quản lý Templates</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    {/* Tổng chứng chỉ đã cấp */}
                    <div className="bg-white rounded-xl p-6 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Tổng cấp</p>
                                <p className="text-2xl font-bold text-gray-900">{data?.total || 0}</p>
                            </div>
                            <div className="bg-indigo-100 rounded-full p-3">
                                <Award className="w-6 h-6 text-indigo-600" />
                            </div>
                        </div>
                    </div>

                    {/* Số chứng chỉ hợp lệ */}
                    <div className="bg-white rounded-xl p-6 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Hợp lệ</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {data?.data?.filter((c) => !c.isRevoked).length || 0}
                                </p>
                            </div>
                            <div className="bg-green-100 rounded-full p-3">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    {/* Số chứng chỉ đã thu hồi */}
                    <div className="bg-white rounded-xl p-6 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Đã thu hồi</p>
                                <p className="text-2xl font-bold text-red-600">
                                    {data?.data?.filter((c) => c.isRevoked).length || 0}
                                </p>
                            </div>
                            <div className="bg-red-100 rounded-full p-3">
                                <XCircle className="w-6 h-6 text-red-600" />
                            </div>
                        </div>
                    </div>

                    {/* Số chứng chỉ cấp trong tháng này */}
                    <div className="bg-white rounded-xl p-6 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Tháng này</p>
                                <p className="text-2xl font-bold text-purple-600">
                                    {data?.data?.filter((c) => {
                                        const issueDate = new Date(c.issueDate);
                                        const now = new Date();
                                        return (
                                            issueDate.getMonth() === now.getMonth() &&
                                            issueDate.getFullYear() === now.getFullYear()
                                        );
                                    }).length || 0}
                                </p>
                            </div>
                            <div className="bg-purple-100 rounded-full p-3">
                                <span className="text-2xl">📅</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Ô tìm kiếm */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Tìm theo tên học viên, khóa học hoặc số chứng chỉ..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)} // Cập nhật từ khóa tìm kiếm
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        {/* Bộ lọc trạng thái */}
                        <div className="flex items-center space-x-2">
                            <Filter className="w-5 h-5 text-gray-400" />
                            <select
                                value={filterRevoked === undefined ? 'all' : filterRevoked ? 'revoked' : 'valid'}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    // 'all' => undefined, 'revoked' => true, 'valid' => false
                                    setFilterRevoked(
                                        value === 'all' ? undefined : value === 'revoked'
                                    );
                                    setPage(1); // Reset về trang 1 khi đổi filter
                                }}
                                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="all">Tất cả</option>
                                <option value="valid">Hợp lệ</option>
                                <option value="revoked">Đã thu hồi</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Certificates Table */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    {isLoading ? ( // Trạng thái đang tải
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Đang tải...</p>
                        </div>
                    ) : filteredData && filteredData.length > 0 ? ( // Có dữ liệu sau khi lọc
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Số chứng chỉ
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Học viên
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Khóa học
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Ngày cấp
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Điểm
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Trạng thái
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Thao tác
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {filteredData.map((certificate) => (
                                            <tr key={certificate.id} className="hover:bg-gray-50">
                                                {/* Số chứng chỉ */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-mono font-medium text-gray-900">
                                                        {certificate.certificateNumber}
                                                    </div>
                                                </td>
                                                {/* Học viên */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10">
                                                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                                                <span className="text-indigo-600 font-semibold text-sm">
                                                                    {certificate.studentName.charAt(0).toUpperCase()} {/* Chữ cái đầu */}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {certificate.studentName}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {certificate.studentEmail}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                {/* Khóa học */}
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900 max-w-xs truncate">
                                                        {certificate.courseName}
                                                    </div>
                                                </td>
                                                {/* Ngày cấp */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {formatDate(certificate.issueDate)}
                                                    </div>
                                                </td>
                                                {/* Điểm */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {certificate.finalScore ? (
                                                        <div className="text-sm font-semibold text-gray-900">
                                                            {certificate.finalScore}%
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-gray-400">-</span>
                                                    )}
                                                </td>
                                                {/* Trạng thái hợp lệ / thu hồi */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {certificate.isRevoked ? (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                            Đã thu hồi
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                            Hợp lệ
                                                        </span>
                                                    )}
                                                </td>
                                                {/* Thao tác: xem + tải xuống */}
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex items-center justify-end space-x-2">
                                                        <button
                                                            onClick={() =>
                                                                navigate(`/certificates/${certificate.id}`) // Xem chi tiết chứng chỉ
                                                            }
                                                            className="text-indigo-600 hover:text-indigo-900"
                                                            title="Xem chi tiết"
                                                        >
                                                            <Eye className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDownloadCertificate(certificate.id, certificate.certificateNumber)} // Tải PDF
                                                            className="text-gray-600 hover:text-gray-900"
                                                            title="Tải xuống"
                                                        >
                                                            <Download className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
                                <div className="text-sm text-gray-700">
                                    Hiển thị{' '}
                                    <span className="font-medium">{(page - 1) * pageSize + 1}</span> đến
                                    <span className="font-medium">
                                        {Math.min(page * pageSize, data?.total || 0)}
                                    </span>
                                    trong tổng số <span className="font-medium">{data?.total || 0}</span>
                                    chứng chỉ
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => setPage((p) => Math.max(1, p - 1))} // Trang trước
                                        disabled={page === 1}
                                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Trước
                                    </button>
                                    <button
                                        onClick={() => setPage((p) => p + 1)} // Trang sau
                                        disabled={!data || page * pageSize >= data.total}
                                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Sau
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        // Không có chứng chỉ nào (sau khi lọc / tìm kiếm)
                        <div className="text-center py-12">
                            <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Không tìm thấy chứng chỉ
                            </h3>
                            <p className="text-gray-600">
                                {searchQuery
                                    ? 'Thử tìm kiếm với từ khóa khác'
                                    : 'Chưa có chứng chỉ nào được cấp'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CertificatesPage; // Export component để dùng trong router
