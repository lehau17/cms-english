import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Award, Eye, Save } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { certificateTemplateApi } from '../apis/certificate.api';
import { getCourses } from '../apis/course';
import LayoutEditorForm from '../components/certificate/LayoutEditorForm';
import { CertificateLayout, CertificateRequirementType } from '../types/certificate.type';

const CreateCertificateTemplatePage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEdit = !!id;

    const [formData, setFormData] = useState({
        courseId: '',
        title: 'Certificate of Completion',
        description: 'This certificate is awarded for successfully completing the course',
        issuerName: 'English Learning Platform',
        issuerTitle: 'Director of Education',
        issuerSignature: '',
        logoUrl: '',
        requirementType: 'course_completion' as CertificateRequirementType,
        minScore: 0,
        minProgress: 100,
        isActive: true,
    });

    const [layout, setLayout] = useState<CertificateLayout | undefined>(undefined);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Load courses for dropdown
    const { data: coursesData, isLoading: isLoadingCourses } = useQuery({
        queryKey: ['courses-list'],
        queryFn: () => getCourses({ page: 1, limit: 1000 }),
    });

    // Load existing template if editing
    const { data: existingTemplate, isLoading: isLoadingTemplate } = useQuery({
        queryKey: ['certificate-template', id],
        queryFn: () => certificateTemplateApi.getById(id!),
        enabled: isEdit && !!id,
    });

    // Populate form data when template is loaded
    useEffect(() => {
        if (existingTemplate) {
            setFormData({
                courseId: existingTemplate.courseId,
                title: existingTemplate.title,
                description: existingTemplate.description || '',
                issuerName: existingTemplate.issuerName,
                issuerTitle: existingTemplate.issuerTitle || '',
                issuerSignature: existingTemplate.issuerSignature || '',
                logoUrl: existingTemplate.logoUrl || '',
                requirementType: existingTemplate.requirementType,
                minScore: existingTemplate.minScore || 0,
                minProgress: existingTemplate.minProgress,
                isActive: existingTemplate.isActive,
            });
            // Load layout config
            setLayout(existingTemplate.layout);
        }
    }, [existingTemplate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.courseId) {
            alert('Vui lòng nhập Course ID');
            return;
        }

        setIsSubmitting(true);

        try {
            const payload = {
                ...formData,
                layout: layout, // Include layout config
            };

            if (isEdit && id) {
                await certificateTemplateApi.update(id, payload);
                alert('Cập nhật template thành công!');
            } else {
                await certificateTemplateApi.create(payload);
                alert('Tạo template thành công!');
            }
            navigate('/certificate-templates');
        } catch (error: any) {
            alert(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Use edited layout or existing template layout for preview
    const previewLayout = layout || existingTemplate?.layout;

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
                            <h1 className="text-3xl font-bold text-gray-900">
                                {isEdit ? 'Chỉnh Sửa Template' : 'Tạo Certificate Template'}
                            </h1>
                            <p className="text-gray-600 mt-1">
                                {isEdit ? 'Cập nhật thông tin template và xem preview' : 'Tạo mẫu chứng chỉ mới cho khóa học'}
                            </p>
                        </div>
                        {isEdit && (
                            <button
                                onClick={() => navigate(`/certificate-templates/${id}`)}
                                className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
                            >
                                <Eye className="w-5 h-5" />
                                <span>Full Preview</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left: Form */}
                    <div>
                        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Template Settings</h2>

                            {/* Course Selection */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Khóa học <span className="text-red-500">*</span>
                                </label>
                                {isEdit ? (
                                    <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100">
                                        {isLoadingTemplate ? (
                                            <p className="text-sm text-gray-500">Đang tải thông tin template...</p>
                                        ) : existingTemplate?.course?.title ? (
                                            <p className="text-sm font-medium text-gray-900">
                                                {existingTemplate.course.title}
                                            </p>
                                        ) : (
                                            <p className="text-sm text-gray-500">
                                                Không tìm thấy thông tin khóa học
                                            </p>
                                        )}
                                        <p className="text-xs text-gray-500 mt-1">
                                            Không thể thay đổi khóa học sau khi tạo template
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        {isLoadingCourses ? (
                                            <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
                                                <p className="text-sm text-gray-500">Đang tải danh sách khóa học...</p>
                                            </div>
                                        ) : (
                                            <select
                                                value={formData.courseId}
                                                onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                required
                                            >
                                                <option value="">-- Chọn khóa học --</option>
                                                {coursesData?.data?.map((course) => (
                                                    <option key={course.id} value={course.id}>
                                                        {course.title} {course.isPublished ? '✓ Published' : '(Draft)'}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                        <p className="text-xs text-gray-500 mt-1">
                                            Chọn khóa học mà bạn muốn tạo template chứng chỉ
                                        </p>
                                    </>
                                )}
                            </div>

                            {/* Title */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tiêu đề chứng chỉ
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Certificate of Completion"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            {/* Description */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Mô tả
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="This certificate is awarded for..."
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            {/* Issuer Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tên tổ chức cấp
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.issuerName}
                                        onChange={(e) =>
                                            setFormData({ ...formData, issuerName: e.target.value })
                                        }
                                        placeholder="English Learning Platform"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Chức danh người ký
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.issuerTitle}
                                        onChange={(e) =>
                                            setFormData({ ...formData, issuerTitle: e.target.value })
                                        }
                                        placeholder="Director of Education"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            {/* Requirements */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Điều kiện cấp chứng chỉ
                                </label>
                                <select
                                    value={formData.requirementType}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            requirementType: e.target.value as CertificateRequirementType,
                                        })
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="course_completion">Hoàn thành khóa học</option>
                                    <option value="score_based">Dựa trên điểm số</option>
                                    <option value="combined">Kết hợp cả hai</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Điểm tối thiểu (%)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={formData.minScore}
                                        onChange={(e) =>
                                            setFormData({ ...formData, minScore: Number(e.target.value) })
                                        }
                                        disabled={formData.requirementType === 'course_completion'}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tiến độ tối thiểu (%)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={formData.minProgress}
                                        onChange={(e) =>
                                            setFormData({ ...formData, minProgress: Number(e.target.value) })
                                        }
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            {/* Status */}
                            <div className="mb-8">
                                <label className="flex items-center space-x-3">
                                    <input
                                        type="checkbox"
                                        checked={formData.isActive}
                                        onChange={(e) =>
                                            setFormData({ ...formData, isActive: e.target.checked })
                                        }
                                        className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">
                                        Template đang hoạt động
                                    </span>
                                </label>
                            </div>

                            {/* Layout Editor */}
                            <div className="mb-8">
                                <div className="mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Layout Configuration</h3>
                                    <p className="text-sm text-gray-600">
                                        Tùy chỉnh giao diện chứng chỉ (màu sắc, typography, decorations, etc.)
                                    </p>
                                </div>
                                <LayoutEditorForm
                                    layout={layout || existingTemplate?.layout}
                                    onChange={setLayout}
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end space-x-4">
                                <button
                                    type="button"
                                    onClick={() => navigate('/certificate-templates')}
                                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                                >
                                    <Save className="w-5 h-5" />
                                    <span>{isSubmitting ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Tạo Template'}</span>
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Right: Live Preview */}
                    <div className="sticky top-8 self-start">
                        <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
                            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Eye className="w-5 h-5" />
                                    Live Preview
                                </h2>
                                <p className="text-indigo-100 text-sm">
                                    Thay đổi sẽ hiển thị real-time
                                </p>
                            </div>

                            {/* Certificate Preview */}
                            <div className="p-6 bg-gray-50">
                                <div
                                    className="relative"
                                    style={{
                                        // Container
                                        padding: previewLayout?.container?.padding || '40px',
                                        borderRadius: previewLayout?.container?.borderRadius || previewLayout?.border?.radius || '12px',
                                        boxShadow: previewLayout?.container?.boxShadow || previewLayout?.effects?.containerShadow || 'none',
                                        minHeight: previewLayout?.container?.minHeight || '600px',

                                        // Border
                                        borderWidth: `${previewLayout?.border?.width || 8}px`,
                                        borderStyle: previewLayout?.border?.style || 'solid',
                                        borderColor: previewLayout?.border?.color || '#1e3a8a',

                                        // Background
                                        background: previewLayout?.background?.type === 'gradient'
                                            ? `linear-gradient(${previewLayout?.background?.gradientAngle || '135deg'}, ${previewLayout?.background?.gradientStart || '#667eea'} 0%, ${previewLayout?.background?.gradientEnd || '#764ba2'} 100%)`
                                            : previewLayout?.background?.type === 'image' && previewLayout?.background?.imageUrl
                                                ? `url('${previewLayout?.background?.imageUrl}') center/cover`
                                                : previewLayout?.background?.color || '#ffffff',

                                        // Position for absolute children
                                        position: 'relative',
                                        overflow: 'hidden',
                                    }}
                                >
                                    {/* Watermark (Background) */}
                                    {previewLayout?.decorations?.watermark?.enabled && (
                                        <div
                                            style={{
                                                position: 'absolute',
                                                top: '50%',
                                                left: '50%',
                                                transform: `translate(-50%, -50%) rotate(${previewLayout?.decorations?.watermark?.rotation || '-45deg'})`,
                                                fontSize: `${previewLayout?.decorations?.watermark?.fontSize || 120}px`,
                                                color: previewLayout?.decorations?.watermark?.color || '#000000',
                                                opacity: previewLayout?.decorations?.watermark?.opacity || 0.03,
                                                fontWeight: 'bold',
                                                pointerEvents: 'none',
                                                userSelect: 'none',
                                                zIndex: 0,
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {previewLayout?.decorations?.watermark?.text || 'CERTIFIED'}
                                        </div>
                                    )}

                                    {/* Seal (Decoration) */}
                                    {previewLayout?.decorations?.seal?.enabled && previewLayout?.decorations?.seal?.imageUrl && (
                                        <img
                                            src={previewLayout?.decorations?.seal?.imageUrl}
                                            alt="Seal"
                                            style={{
                                                position: 'absolute',
                                                width: previewLayout?.decorations?.seal?.size || '120px',
                                                height: previewLayout?.decorations?.seal?.size || '120px',
                                                opacity: previewLayout?.decorations?.seal?.opacity || 1,
                                                zIndex: 10,
                                                ...previewLayout?.decorations?.seal?.position,
                                            }}
                                        />
                                    )}

                                    {/* Header */}
                                    <div className="text-center" style={{ position: 'relative', zIndex: 1, marginBottom: previewLayout?.header?.title?.marginBottom || '32px' }}>
                                        {previewLayout?.header?.logo?.enabled !== false && (
                                            <Award
                                                className="mx-auto mb-4"
                                                style={{
                                                    width: previewLayout?.header?.logo?.size || '64px',
                                                    height: previewLayout?.header?.logo?.size || '64px',
                                                    color: previewLayout?.header?.title?.color || '#4F46E5'
                                                }}
                                            />
                                        )}
                                        <h1
                                            className="font-bold"
                                            style={{
                                                fontSize: `${previewLayout?.header?.title?.fontSize || 40}px`,
                                                color: previewLayout?.header?.title?.color || '#1a365d',
                                                fontFamily: previewLayout?.header?.title?.fontFamily || 'Georgia',
                                                fontWeight: previewLayout?.header?.title?.fontWeight || 'bold',
                                                letterSpacing: previewLayout?.header?.title?.letterSpacing || 'normal',
                                                lineHeight: previewLayout?.header?.title?.lineHeight || '1.2',
                                                textAlign: (previewLayout?.header?.title?.textAlign as any) || 'center',
                                                textShadow: previewLayout?.header?.title?.textShadow || 'none',
                                                textTransform: (previewLayout?.header?.title?.textTransform as any) || 'none',
                                                marginBottom: '8px',
                                            }}
                                        >
                                            {formData.title || 'Certificate Title'}
                                        </h1>
                                        {previewLayout?.header?.subtitle?.text && (
                                            <p
                                                style={{
                                                    fontSize: `${previewLayout?.header?.subtitle?.fontSize || 18}px`,
                                                    color: previewLayout?.header?.subtitle?.color || '#6B7280',
                                                    fontStyle: previewLayout?.header?.subtitle?.fontStyle || 'italic',
                                                    marginTop: '8px',
                                                }}
                                            >
                                                {previewLayout?.header?.subtitle?.text}
                                            </p>
                                        )}
                                        {formData.description && !previewLayout?.header?.subtitle?.text && (
                                            <p className="italic text-sm mt-2" style={{ color: '#4B5563' }}>
                                                {formData.description}
                                            </p>
                                        )}
                                    </div>

                                    {/* Body */}
                                    <div
                                        className="text-center space-y-4"
                                        style={{
                                            position: 'relative',
                                            zIndex: 1,
                                            padding: previewLayout?.body?.padding || '0',
                                            marginBottom: '32px',
                                        }}
                                    >
                                        <p className="text-base" style={{ color: '#374151' }}>This certifies that</p>
                                        <div
                                            style={{
                                                fontSize: `${previewLayout?.body?.studentName?.fontSize || 32}px`,
                                                color: previewLayout?.body?.studentName?.color || '#2d3748',
                                                fontFamily: previewLayout?.body?.studentName?.fontFamily || 'Georgia',
                                                fontWeight: previewLayout?.body?.studentName?.fontWeight || 'bold',
                                                textTransform: (previewLayout?.body?.studentName?.transform as any) || 'uppercase',
                                                letterSpacing: previewLayout?.body?.studentName?.letterSpacing || 'normal',
                                                lineHeight: previewLayout?.body?.studentName?.lineHeight || '1.5',
                                                textShadow: previewLayout?.body?.studentName?.textShadow || 'none',
                                                marginTop: previewLayout?.body?.studentName?.marginTop || '12px',
                                                marginBottom: previewLayout?.body?.studentName?.marginBottom || '12px',
                                                paddingTop: '12px',
                                                paddingBottom: '12px',
                                            }}
                                        >
                                            [Student Name]
                                        </div>
                                        <p className="text-base" style={{ color: '#374151' }}>has successfully completed</p>
                                        <div
                                            style={{
                                                fontSize: `${previewLayout?.body?.courseName?.fontSize || 24}px`,
                                                color: previewLayout?.body?.courseName?.color || '#1a365d',
                                                fontFamily: previewLayout?.body?.courseName?.fontFamily || 'Georgia',
                                                fontStyle: previewLayout?.body?.courseName?.fontStyle || 'italic',
                                                letterSpacing: previewLayout?.body?.courseName?.letterSpacing || 'normal',
                                                lineHeight: previewLayout?.body?.courseName?.lineHeight || '1.4',
                                                marginTop: previewLayout?.body?.courseName?.marginTop || '8px',
                                                marginBottom: previewLayout?.body?.courseName?.marginBottom || '8px',
                                                paddingTop: '8px',
                                                paddingBottom: '8px',
                                            }}
                                        >
                                            {existingTemplate?.course?.title || '[Course Name]'}
                                        </div>

                                        {/* Requirements Badge */}
                                        <div className="pt-4">
                                            <div
                                                className="inline-block rounded-lg px-4 py-2 border"
                                                style={{
                                                    backgroundColor: `${previewLayout?.header?.title?.color || '#4F46E5'}10`,
                                                    borderColor: `${previewLayout?.header?.title?.color || '#4F46E5'}40`,
                                                }}
                                            >
                                                <p className="text-xs mb-1" style={{ color: '#6B7280' }}>Requirements:</p>
                                                <p
                                                    className="text-sm font-semibold"
                                                    style={{ color: previewLayout?.header?.title?.color || '#4F46E5' }}
                                                >
                                                    {formData.requirementType === 'course_completion' && 'Complete Course'}
                                                    {formData.requirementType === 'score_based' && `Score ≥ ${formData.minScore}%`}
                                                    {formData.requirementType === 'combined' && `Score ≥ ${formData.minScore}% + Complete`}
                                                </p>
                                                <p className="text-xs" style={{ color: '#6B7280' }}>Progress: {formData.minProgress}%</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div
                                        style={{
                                            position: 'relative',
                                            zIndex: 1,
                                            marginTop: '40px',
                                            paddingTop: previewLayout?.footer?.padding?.split(' ')[0] || '24px',
                                            borderTop: `${previewLayout?.footer?.borderTop?.width || '2px'} ${previewLayout?.footer?.borderTop?.style || 'solid'} ${previewLayout?.footer?.borderTop?.color || previewLayout?.border?.color || '#D1D5DB'}`,
                                        }}
                                    >
                                        <div className="grid grid-cols-2 gap-6">
                                            {previewLayout?.footer?.signature?.enabled !== false && (
                                                <div className="text-center">
                                                    <div className="mb-2">
                                                        <div
                                                            className="h-10 mx-auto"
                                                            style={{
                                                                width: previewLayout?.footer?.signature?.lineWidth || '128px',
                                                                borderBottom: `2px solid ${previewLayout?.footer?.signature?.lineColor || previewLayout?.border?.color || '#1F2937'}`
                                                            }}
                                                        ></div>
                                                    </div>
                                                    <p
                                                        className="font-semibold"
                                                        style={{
                                                            fontSize: `${previewLayout?.footer?.signature?.fontSize || 14}px`,
                                                            fontWeight: previewLayout?.footer?.signature?.fontWeight || 'semibold',
                                                            color: '#111827',
                                                        }}
                                                    >
                                                        {formData.issuerName || 'Issuer Name'}
                                                    </p>
                                                    <p className="text-xs" style={{ color: '#6B7280' }}>
                                                        {formData.issuerTitle || 'Title'}
                                                    </p>
                                                </div>
                                            )}
                                            <div className="text-center">
                                                <div className="mb-2">
                                                    <div
                                                        className="h-10 mx-auto"
                                                        style={{
                                                            width: previewLayout?.footer?.signature?.lineWidth || '128px',
                                                            borderBottom: `2px solid ${previewLayout?.footer?.signature?.lineColor || previewLayout?.border?.color || '#1F2937'}`
                                                        }}
                                                    ></div>
                                                </div>
                                                <p className="font-semibold text-sm" style={{ color: '#111827' }}>Date</p>
                                                <p
                                                    className="text-xs"
                                                    style={{
                                                        fontSize: `${previewLayout?.footer?.issueDate?.fontSize || 12}px`,
                                                        color: previewLayout?.footer?.issueDate?.color || '#6B7280',
                                                    }}
                                                >
                                                    [Issue Date]
                                                </p>
                                            </div>
                                        </div>

                                        {/* QR Code Placeholder */}
                                        {previewLayout?.footer?.qrCode?.enabled && (
                                            <div className="mt-6 text-center">
                                                <div
                                                    className="inline-block p-2 rounded"
                                                    style={{
                                                        border: `${previewLayout?.footer?.qrCode?.borderWidth || '2px'} solid ${previewLayout?.footer?.qrCode?.borderColor || previewLayout?.border?.color || '#D1D5DB'}`
                                                    }}
                                                >
                                                    <div
                                                        className="bg-gray-100 flex items-center justify-center"
                                                        style={{
                                                            width: `${previewLayout?.footer?.qrCode?.size || 80}px`,
                                                            height: `${previewLayout?.footer?.qrCode?.size || 80}px`,
                                                        }}
                                                    >
                                                        <span className="text-xs text-gray-500">QR</span>
                                                    </div>
                                                </div>
                                                <p className="text-xs mt-2" style={{ color: '#6B7280' }}>Verification Code</p>
                                            </div>
                                        )}

                                        {/* Status Badge */}
                                        <div className="mt-4 text-center">
                                            <span
                                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${formData.isActive
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                    }`}
                                            >
                                                {formData.isActive ? '✓ Active Template' : '✗ Inactive Template'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateCertificateTemplatePage;
