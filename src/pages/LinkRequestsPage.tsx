import { useApproveLinkRequest, useGetPendingRequests, useRejectLinkRequest } from '@/hooks/useLinkRequest';
import { ParentChildLinkRequest } from '@/interface/parent-child.interface';
import { CheckCircle, ChevronLeft, ChevronRight, Clock, Users, XCircle } from 'lucide-react';
import { useState } from 'react';

const LinkRequestsPage = () => {
    const [page, setPage] = useState(1);
    const [limit] = useState(10);

    const { data, isLoading, refetch } = useGetPendingRequests({ page, limit });
    const approveMutation = useApproveLinkRequest();
    const rejectMutation = useRejectLinkRequest();

    const handleApprove = async (requestId: string) => {
        if (!confirm('Bạn có chắc chắn muốn duyệt yêu cầu liên kết này?')) return;

        try {
            await approveMutation.mutateAsync(requestId);
            alert('Duyệt yêu cầu thành công!');
            refetch();
        } catch (error: any) {
            alert('Lỗi: ' + (error?.response?.data?.message || 'Không thể duyệt yêu cầu'));
        }
    };

    const handleReject = async (requestId: string) => {
        if (!confirm('Bạn có chắc chắn muốn từ chối yêu cầu liên kết này?')) return;

        try {
            await rejectMutation.mutateAsync(requestId);
            alert('Từ chối yêu cầu thành công!');
            refetch();
        } catch (error: any) {
            alert('Lỗi: ' + (error?.response?.data?.message || 'Không thể từ chối yêu cầu'));
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('vi-VN');
    };

    const getUserName = (request: ParentChildLinkRequest, type: 'parent' | 'student') => {
        const user = type === 'parent' ? request.parent : request.student;
        return user.displayName || user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`.trim()
            : user.email || 'N/A';
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-lg">Đang tải dữ liệu...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Users className="h-7 w-7" />
                        Yêu cầu liên kết Phụ huynh - Học sinh
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Duyệt các yêu cầu liên kết giữa phụ huynh và học sinh
                    </p>
                </div>
                <div className="bg-blue-50 px-4 py-2 rounded-lg flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <span className="text-blue-900 font-medium">
                        {data?.meta?.total || 0} yêu cầu đang chờ
                    </span>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Phụ huynh
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Học sinh
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ngày yêu cầu
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
                            {data?.data && data.data.length > 0 ? (
                                data.data.map((request) => (
                                    <tr key={request.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {getUserName(request, 'parent')}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {request.parent.email}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {getUserName(request, 'student')}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {request.student.email}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {formatDate(request.requestedAt)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                Đang chờ
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleApprove(request.id)}
                                                    disabled={approveMutation.isPending || rejectMutation.isPending}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                    title="Duyệt"
                                                >
                                                    <CheckCircle className="h-4 w-4" />
                                                    Duyệt
                                                </button>
                                                <button
                                                    onClick={() => handleReject(request.id)}
                                                    disabled={approveMutation.isPending || rejectMutation.isPending}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                    title="Từ chối"
                                                >
                                                    <XCircle className="h-4 w-4" />
                                                    Từ chối
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        Không có yêu cầu nào đang chờ duyệt
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {data?.data && data.data.length > 0 && data.meta && (
                    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                        <div className="flex-1 flex justify-between sm:hidden">
                            <button
                                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                                disabled={page === 1}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Trước
                            </button>
                            <button
                                onClick={() => setPage((prev) => prev + 1)}
                                disabled={page >= (data.meta?.totalPages || 1)}
                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Sau
                            </button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Hiển thị <span className="font-medium">{(page - 1) * limit + 1}</span> đến{' '}
                                    <span className="font-medium">
                                        {Math.min(page * limit, data.meta?.total || 0)}
                                    </span>{' '}
                                    trong tổng số <span className="font-medium">{data.meta?.total || 0}</span> kết quả
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                    <button
                                        onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                                        disabled={page === 1}
                                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft className="h-5 w-5" />
                                    </button>
                                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                        Trang {page} / {data.meta?.totalPages || 1}
                                    </span>
                                    <button
                                        onClick={() => setPage((prev) => prev + 1)}
                                        disabled={page >= (data.meta?.totalPages || 1)}
                                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronRight className="h-5 w-5" />
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LinkRequestsPage;

