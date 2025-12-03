import { useQuery } from '@tanstack/react-query';
import { Award, Edit, Eye, Plus, Trash2 } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { certificateTemplateApi } from '../apis/certificate.api';

const CertificateTemplatesPage: React.FC = () => {
    const navigate = useNavigate();

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['certificate-templates'],
        queryFn: () => certificateTemplateApi.getAll(),
    });

    const handleDelete = async (id: string) => {
        if (!window.confirm('Bạn có chắc muốn xóa template này?')) return;

        try {
            await certificateTemplateApi.delete(id);
            alert('Xóa template thành công!');
            refetch();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Có lỗi xảy ra khi xóa template');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                <Award className="w-8 h-8 text-indigo-600" />
                                Certificate Templates
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Quản lý mẫu chứng chỉ cho các khóa học
                            </p>
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => navigate('/certificates')}
                                className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
                            >
                                <span>Danh sách chứng chỉ</span>
                            </button>
                            <button
                                onClick={() => navigate('/certificate-templates/create')}
                                className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                            >
                                <Plus className="w-5 h-5" />
                                <span>Tạo Template</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Đang tải...</p>
                    </div>
                ) : data?.data && data.data.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {data.data.map((template: any) => (
                            <div
                                key={template.id}
                                className="bg-white rounded-xl border-2 border-gray-200 hover:border-indigo-300 transition-all duration-200 overflow-hidden group"
                            >
                                {/* Preview */}
                                <div className="h-48 bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center border-b border-gray-200">
                                    <div className="text-center px-6">
                                        <Award className="w-16 h-16 text-indigo-600 mx-auto mb-3" />
                                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                                            {template.title}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {template.issuerName}
                                        </p>
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${template.isActive
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'
                                                }`}
                                        >
                                            {template.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                        {template.course && (
                                            <span className="text-xs text-gray-500 truncate ml-2">
                                                {template.course.title}
                                            </span>
                                        )}
                                    </div>

                                    {template.description && (
                                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                            {template.description}
                                        </p>
                                    )}

                                    <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                                        <div>
                                            <span className="text-gray-500">Requirement:</span>
                                            <p className="font-medium text-gray-900">
                                                {template.requirementType === 'course_completion'
                                                    ? 'Completion'
                                                    : template.requirementType === 'score_based'
                                                        ? 'Score'
                                                        : 'Combined'}
                                            </p>
                                        </div>
                                        {template.minScore && (
                                            <div>
                                                <span className="text-gray-500">Min Score:</span>
                                                <p className="font-medium text-gray-900">
                                                    {template.minScore}%
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() =>
                                                navigate(`/certificate-templates/${template.id}`)
                                            }
                                            className="flex-1 flex items-center justify-center space-x-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                                        >
                                            <Eye className="w-4 h-4" />
                                            <span>View</span>
                                        </button>
                                        <button
                                            onClick={() =>
                                                navigate(`/certificate-templates/${template.id}/edit`)
                                            }
                                            className="flex-1 flex items-center justify-center space-x-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                                        >
                                            <Edit className="w-4 h-4" />
                                            <span>Edit</span>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(template.id)}
                                            className="flex items-center justify-center bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                        <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Chưa có template nào
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Tạo template đầu tiên cho chứng chỉ của bạn
                        </p>
                        <button
                            onClick={() => navigate('/certificate-templates/create')}
                            className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Tạo Template</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CertificateTemplatesPage;

