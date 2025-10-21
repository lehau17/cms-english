import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Award, Calendar, CheckCircle, Edit, Settings, User } from 'lucide-react';
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { certificateTemplateApi } from '../apis/certificate.api';

const CertificateTemplatePreviewPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    const { data: template, isLoading } = useQuery({
        queryKey: ['certificate-template', id],
        queryFn: () => certificateTemplateApi.getById(id!),
        enabled: !!id,
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải template...</p>
                </div>
            </div>
        );
    }

    if (!template) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Template không tồn tại</h3>
                    <button
                        onClick={() => navigate('/certificate-templates')}
                        className="text-indigo-600 hover:text-indigo-800"
                    >
                        Quay lại danh sách
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <button
                        onClick={() => navigate('/certificate-templates')}
                        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Quay lại</span>
                    </button>

                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                <Award className="w-8 h-8 text-indigo-600" />
                                {template.title}
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Template cho khóa học: <span className="font-medium">{template.course?.title}</span>
                            </p>
                        </div>

                        <div className="flex space-x-3">
                            <button
                                onClick={() => navigate(`/certificate-templates/${id}/edit`)}
                                className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                            >
                                <Edit className="w-5 h-5" />
                                <span>Chỉnh sửa</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Certificate Preview (Main) */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
                            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                                <h2 className="text-xl font-bold text-white">Certificate Preview</h2>
                                <p className="text-indigo-100 text-sm">
                                    Đây là cách chứng chỉ sẽ hiển thị
                                </p>
                            </div>

                            {/* Certificate Design Preview */}
                            <div className="p-8">
                                <div
                                    className="relative"
                                    style={{
                                        // Container
                                        padding: template.layout?.container?.padding || '48px',
                                        borderRadius: template.layout?.container?.borderRadius || template.layout?.border?.radius || '12px',
                                        boxShadow: template.layout?.container?.boxShadow || template.layout?.effects?.containerShadow || 'none',
                                        minHeight: template.layout?.container?.minHeight || '600px',

                                        // Border
                                        borderWidth: `${template.layout?.border?.width || 8}px`,
                                        borderStyle: template.layout?.border?.style || 'solid',
                                        borderColor: template.layout?.border?.color || '#1e3a8a',

                                        // Background
                                        background: template.layout?.background?.type === 'gradient'
                                            ? `linear-gradient(${template.layout?.background?.gradientAngle || '135deg'}, ${template.layout?.background?.gradientStart || '#667eea'} 0%, ${template.layout?.background?.gradientEnd || '#764ba2'} 100%)`
                                            : template.layout?.background?.type === 'image' && template.layout?.background?.imageUrl
                                                ? `url('${template.layout?.background?.imageUrl}') center/cover`
                                                : template.layout?.background?.color || '#ffffff',

                                        // Position for absolute children
                                        position: 'relative',
                                        overflow: 'hidden',
                                    }}
                                >
                                    {/* Watermark (Background) */}
                                    {template.layout?.decorations?.watermark?.enabled && (
                                        <div
                                            style={{
                                                position: 'absolute',
                                                top: '50%',
                                                left: '50%',
                                                transform: `translate(-50%, -50%) rotate(${template.layout?.decorations?.watermark?.rotation || '-45deg'})`,
                                                fontSize: `${template.layout?.decorations?.watermark?.fontSize || 120}px`,
                                                color: template.layout?.decorations?.watermark?.color || '#000000',
                                                opacity: template.layout?.decorations?.watermark?.opacity || 0.03,
                                                fontWeight: 'bold',
                                                pointerEvents: 'none',
                                                userSelect: 'none',
                                                zIndex: 0,
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {template.layout?.decorations?.watermark?.text || 'CERTIFIED'}
                                        </div>
                                    )}

                                    {/* Seal (Decoration) */}
                                    {template.layout?.decorations?.seal?.enabled && template.layout?.decorations?.seal?.imageUrl && (
                                        <img
                                            src={template.layout?.decorations?.seal?.imageUrl}
                                            alt="Seal"
                                            style={{
                                                position: 'absolute',
                                                width: template.layout?.decorations?.seal?.size || '120px',
                                                height: template.layout?.decorations?.seal?.size || '120px',
                                                opacity: template.layout?.decorations?.seal?.opacity || 1,
                                                zIndex: 10,
                                                ...template.layout?.decorations?.seal?.position,
                                            }}
                                        />
                                    )}

                                    {/* Header */}
                                    <div className="text-center" style={{ position: 'relative', zIndex: 1, marginBottom: template.layout?.header?.title?.marginBottom || '32px' }}>
                                        {template.layout?.header?.logo?.enabled && (
                                            <div className="mb-6">
                                                <Award
                                                    className="mx-auto"
                                                    style={{
                                                        width: template.layout?.header?.logo?.size || '80px',
                                                        height: template.layout?.header?.logo?.size || '80px',
                                                        color: template.layout?.header?.title?.color || '#4F46E5'
                                                    }}
                                                />
                                            </div>
                                        )}
                                        <h1
                                            className="font-bold"
                                            style={{
                                                fontSize: `${template.layout?.header?.title?.fontSize || 48}px`,
                                                color: template.layout?.header?.title?.color || '#1a365d',
                                                fontFamily: template.layout?.header?.title?.fontFamily || 'Georgia',
                                                fontWeight: template.layout?.header?.title?.fontWeight || 'bold',
                                                letterSpacing: template.layout?.header?.title?.letterSpacing || 'normal',
                                                lineHeight: template.layout?.header?.title?.lineHeight || '1.2',
                                                textAlign: (template.layout?.header?.title?.textAlign as any) || 'center',
                                                textShadow: template.layout?.header?.title?.textShadow || 'none',
                                                textTransform: (template.layout?.header?.title?.textTransform as any) || 'none',
                                                marginBottom: '8px',
                                            }}
                                        >
                                            {template.title}
                                        </h1>
                                        {template.layout?.header?.subtitle?.text && (
                                            <p
                                                style={{
                                                    fontSize: `${template.layout?.header?.subtitle?.fontSize || 18}px`,
                                                    color: template.layout?.header?.subtitle?.color || '#6B7280',
                                                    fontStyle: template.layout?.header?.subtitle?.fontStyle || 'italic',
                                                    marginTop: '8px',
                                                }}
                                            >
                                                {template.layout?.header?.subtitle?.text}
                                            </p>
                                        )}
                                        {template.description && !template.layout?.header?.subtitle?.text && (
                                            <p className="text-gray-600 text-lg italic mt-2">
                                                {template.description}
                                            </p>
                                        )}
                                    </div>

                                    {/* Body */}
                                    <div
                                        className="text-center space-y-6"
                                        style={{
                                            position: 'relative',
                                            zIndex: 1,
                                            padding: template.layout?.body?.padding || '0',
                                            marginBottom: '32px',
                                        }}
                                    >
                                        <p className="text-xl text-gray-700">This certifies that</p>
                                        <div
                                            style={{
                                                fontSize: `${template.layout?.body?.studentName?.fontSize || 36}px`,
                                                color: template.layout?.body?.studentName?.color || '#2d3748',
                                                fontFamily: template.layout?.body?.studentName?.fontFamily || 'Georgia',
                                                fontWeight: template.layout?.body?.studentName?.fontWeight || 'bold',
                                                textTransform: (template.layout?.body?.studentName?.transform as any) || 'uppercase',
                                                letterSpacing: template.layout?.body?.studentName?.letterSpacing || 'normal',
                                                lineHeight: template.layout?.body?.studentName?.lineHeight || '1.5',
                                                textShadow: template.layout?.body?.studentName?.textShadow || 'none',
                                                marginTop: template.layout?.body?.studentName?.marginTop || '16px',
                                                marginBottom: template.layout?.body?.studentName?.marginBottom || '16px',
                                                paddingTop: '16px',
                                                paddingBottom: '16px',
                                            }}
                                        >
                                            [Student Name]
                                        </div>
                                        <p className="text-xl text-gray-700">has successfully completed</p>
                                        <div
                                            style={{
                                                fontSize: `${template.layout?.body?.courseName?.fontSize || 28}px`,
                                                color: template.layout?.body?.courseName?.color || '#1a365d',
                                                fontFamily: template.layout?.body?.courseName?.fontFamily || 'Georgia',
                                                fontStyle: template.layout?.body?.courseName?.fontStyle || 'italic',
                                                letterSpacing: template.layout?.body?.courseName?.letterSpacing || 'normal',
                                                lineHeight: template.layout?.body?.courseName?.lineHeight || '1.4',
                                                marginTop: template.layout?.body?.courseName?.marginTop || '8px',
                                                marginBottom: template.layout?.body?.courseName?.marginBottom || '8px',
                                                paddingTop: '12px',
                                                paddingBottom: '12px',
                                            }}
                                        >
                                            {template.course?.title || '[Course Name]'}
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div
                                        style={{
                                            position: 'relative',
                                            zIndex: 1,
                                            marginTop: '48px',
                                            paddingTop: template.layout?.footer?.padding?.split(' ')[0] || '32px',
                                            borderTop: `${template.layout?.footer?.borderTop?.width || '2px'} ${template.layout?.footer?.borderTop?.style || 'solid'} ${template.layout?.footer?.borderTop?.color || template.layout?.border?.color || '#D1D5DB'}`,
                                        }}
                                    >
                                        <div className="grid grid-cols-2 gap-8">
                                            {template.layout?.footer?.signature?.enabled !== false && (
                                                <div className="text-center">
                                                    <div className="mb-2">
                                                        <div
                                                            className="h-16 mx-auto"
                                                            style={{
                                                                width: template.layout?.footer?.signature?.lineWidth || '192px',
                                                                borderBottom: `2px solid ${template.layout?.footer?.signature?.lineColor || template.layout?.border?.color || '#1F2937'}`
                                                            }}
                                                        ></div>
                                                    </div>
                                                    <p
                                                        className="font-semibold"
                                                        style={{
                                                            fontSize: `${template.layout?.footer?.signature?.fontSize || 14}px`,
                                                            fontWeight: template.layout?.footer?.signature?.fontWeight || 'semibold',
                                                            color: '#111827',
                                                        }}
                                                    >
                                                        {template.issuerName}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        {template.issuerTitle || 'Director'}
                                                    </p>
                                                </div>
                                            )}
                                            <div className="text-center">
                                                <div className="mb-2">
                                                    <div
                                                        className="h-16 mx-auto"
                                                        style={{
                                                            width: template.layout?.footer?.signature?.lineWidth || '192px',
                                                            borderBottom: `2px solid ${template.layout?.footer?.signature?.lineColor || template.layout?.border?.color || '#1F2937'}`
                                                        }}
                                                    ></div>
                                                </div>
                                                <p className="font-semibold text-gray-900">Date</p>
                                                <p
                                                    className="text-sm"
                                                    style={{
                                                        fontSize: `${template.layout?.footer?.issueDate?.fontSize || 12}px`,
                                                        color: template.layout?.footer?.issueDate?.color || '#6B7280',
                                                    }}
                                                >
                                                    [Issue Date]
                                                </p>
                                            </div>
                                        </div>

                                        {/* QR Code placeholder */}
                                        {template.layout?.footer?.qrCode?.enabled && (
                                            <div className="mt-6 text-center">
                                                <div
                                                    className="inline-block p-4 rounded"
                                                    style={{
                                                        border: `${template.layout?.footer?.qrCode?.borderWidth || '2px'} solid ${template.layout?.footer?.qrCode?.borderColor || template.layout?.border?.color || '#D1D5DB'}`
                                                    }}
                                                >
                                                    <div
                                                        className="bg-gray-100 flex items-center justify-center"
                                                        style={{
                                                            width: `${template.layout?.footer?.qrCode?.size || 96}px`,
                                                            height: `${template.layout?.footer?.qrCode?.size || 96}px`,
                                                        }}
                                                    >
                                                        <span className="text-xs text-gray-500">QR Code</span>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-2">Verification Code</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Template Details (Sidebar) */}
                    <div className="space-y-6">
                        {/* Status Card */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                Trạng thái
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Status</span>
                                    <span
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${template.isActive
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-gray-100 text-gray-800'
                                            }`}
                                    >
                                        {template.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Template Type</span>
                                    <span className="text-sm font-medium text-gray-900">
                                        {template.layout?.template || 'classic-elegant'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Requirements Card */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Settings className="w-5 h-5 text-indigo-600" />
                                Yêu cầu cấp chứng chỉ
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <span className="text-sm text-gray-600 block mb-1">
                                        Requirement Type
                                    </span>
                                    <span className="text-sm font-medium text-gray-900">
                                        {template.requirementType === 'course_completion'
                                            ? 'Course Completion'
                                            : template.requirementType === 'score_based'
                                                ? 'Score Based'
                                                : 'Combined'}
                                    </span>
                                </div>
                                {template.minScore && (
                                    <div>
                                        <span className="text-sm text-gray-600 block mb-1">
                                            Minimum Score
                                        </span>
                                        <span className="text-sm font-medium text-gray-900">
                                            {template.minScore}%
                                        </span>
                                    </div>
                                )}
                                <div>
                                    <span className="text-sm text-gray-600 block mb-1">
                                        Minimum Progress
                                    </span>
                                    <span className="text-sm font-medium text-gray-900">
                                        {template.minProgress}%
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Issuer Info Card */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <User className="w-5 h-5 text-purple-600" />
                                Thông tin tổ chức
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <span className="text-sm text-gray-600 block mb-1">Issuer Name</span>
                                    <span className="text-sm font-medium text-gray-900">
                                        {template.issuerName}
                                    </span>
                                </div>
                                {template.issuerTitle && (
                                    <div>
                                        <span className="text-sm text-gray-600 block mb-1">
                                            Issuer Title
                                        </span>
                                        <span className="text-sm font-medium text-gray-900">
                                            {template.issuerTitle}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Metadata Card */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-gray-600" />
                                Metadata
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <span className="text-sm text-gray-600 block mb-1">Created</span>
                                    <span className="text-sm font-medium text-gray-900">
                                        {new Date(template.createdAt).toLocaleDateString('vi-VN', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-600 block mb-1">Last Updated</span>
                                    <span className="text-sm font-medium text-gray-900">
                                        {new Date(template.updatedAt).toLocaleDateString('vi-VN', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CertificateTemplatePreviewPage;

