import axiosInstance from '@/config/axiosConfig';
import {
    CreateCertificateTemplateDto,
    GetAllCertificatesParams,
    GetAllCertificatesResponse,
    GetAllTemplatesParams,
    GetCertificatesByCourseParams,
    GetCertificatesByCourseResponse,
    IssueCertificateDto,
    RevokeCertificateDto,
    UpdateCertificateTemplateDto,
} from '../types/certificate-admin.type';
import {
    CertificateTemplate,
    IssuedCertificate,
} from '../types/certificate.type';

const API_PREFIX = '';

// ==================== CERTIFICATE TEMPLATES ====================

export const certificateTemplateApi = {
    /**
     * Create certificate template
     */
    create: async (dto: CreateCertificateTemplateDto): Promise<CertificateTemplate> => {
        const response = await axiosInstance.post(
            `${API_PREFIX}/private/v1/certificate-templates`,
            dto
        );
        // Backend returns { statusCode, message, data } format
        return response.data.data || response.data;
    },

    /**
     * Create default certificate template for course
     */
    createDefault: async (courseId: string): Promise<CertificateTemplate> => {
        const response = await axiosInstance.post(
            `${API_PREFIX}/private/v1/certificate-templates/courses/${courseId}/default`
        );
        // Backend returns { statusCode, message, data } format
        return response.data.data || response.data;
    },

    /**
     * Get certificate template by ID
     */
    getById: async (id: string): Promise<CertificateTemplate> => {
        const response = await axiosInstance.get(
            `${API_PREFIX}/private/v1/certificate-templates/${id}`
        );
        // Backend returns { statusCode, message, data } format
        return response.data.data || response.data;
    },

    /**
     * Get certificate template by course ID
     */
    getByCourseId: async (courseId: string): Promise<CertificateTemplate> => {
        const response = await axiosInstance.get(
            `${API_PREFIX}/private/v1/certificate-templates/courses/${courseId}`
        );
        // Backend returns { statusCode, message, data } format
        return response.data.data || response.data;
    },

    /**
     * Update certificate template
     */
    update: async (
        id: string,
        dto: UpdateCertificateTemplateDto
    ): Promise<CertificateTemplate> => {
        const response = await axiosInstance.patch(
            `${API_PREFIX}/private/v1/certificate-templates/${id}`,
            dto
        );
        // Backend returns { statusCode, message, data } format
        return response.data.data || response.data;
    },

    /**
     * Delete certificate template
     */
    delete: async (id: string): Promise<{ message: string }> => {
        const response = await axiosInstance.delete(
            `${API_PREFIX}/private/v1/certificate-templates/${id}`
        );
        return response.data;
    },

    /**
     * Get all certificate templates
     */
    getAll: async (params?: GetAllTemplatesParams) => {
        const queryParams = new URLSearchParams();
        if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
        if (params?.take !== undefined) queryParams.append('take', params.take.toString());
        if (params?.isActive !== undefined)
            queryParams.append('isActive', params.isActive.toString());

        const response = await axiosInstance.get(
            `${API_PREFIX}/private/v1/certificate-templates?${queryParams.toString()}`
        );
        // Backend returns { statusCode, message, data: { data, total } }
        // Extract the nested data
        return response.data.data;
    },
};

// ==================== CERTIFICATES ====================

export const certificateApi = {
    /**
     * Issue certificate to a student (Admin/Teacher)
     */
    issue: async (dto: IssueCertificateDto): Promise<IssuedCertificate> => {
        const response = await axiosInstance.post(
            `${API_PREFIX}/private/v1/certificates/issue`,
            dto
        );
        return response.data;
    },

    /**
     * Get all certificates (Admin)
     */
    getAll: async (
        params?: GetAllCertificatesParams
    ): Promise<GetAllCertificatesResponse> => {
        const queryParams = new URLSearchParams();
        if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
        if (params?.take !== undefined) queryParams.append('take', params.take.toString());
        if (params?.includeRevoked !== undefined)
            queryParams.append('includeRevoked', params.includeRevoked.toString());
        if (params?.studentId) queryParams.append('studentId', params.studentId);
        if (params?.courseId) queryParams.append('courseId', params.courseId);

        const response = await axiosInstance.get(
            `${API_PREFIX}/private/v1/certificates/admin/all?${queryParams.toString()}`
        );
        // Backend returns { statusCode, message, data: { data, total } }
        // Extract the nested data
        return response.data.data;
    },

    /**
     * Get certificates by course
     */
    getByCourse: async (
        courseId: string,
        params?: GetCertificatesByCourseParams
    ): Promise<GetCertificatesByCourseResponse> => {
        const queryParams = new URLSearchParams();
        if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
        if (params?.take !== undefined) queryParams.append('take', params.take.toString());
        if (params?.includeRevoked !== undefined)
            queryParams.append('includeRevoked', params.includeRevoked.toString());

        const response = await axiosInstance.get(
            `${API_PREFIX}/private/v1/certificates/courses/${courseId}?${queryParams.toString()}`
        );
        // Backend returns { statusCode, message, data: { data, total } }
        // Extract the nested data
        return response.data.data;
    },

    /**
     * Get certificate by ID
     */
    getById: async (id: string): Promise<IssuedCertificate> => {
        const response = await axiosInstance.get(
            `${API_PREFIX}/private/v1/certificates/${id}`
        );
        return response.data;
    },

    /**
     * Revoke certificate (Admin only)
     */
    revoke: async (id: string, dto: RevokeCertificateDto): Promise<IssuedCertificate> => {
        const response = await axiosInstance.post(
            `${API_PREFIX}/private/v1/certificates/${id}/revoke`,
            dto
        );
        return response.data;
    },

    /**
     * Verify certificate by verification code (Public)
     */
    verifyByCode: async (verificationCode: string): Promise<IssuedCertificate> => {
        const response = await axiosInstance.get(
            `${API_PREFIX}/public/v1/certificates/verify/code/${verificationCode}`
        );
        return response.data;
    },

    /**
     * Verify certificate by certificate number (Public)
     */
    verifyByNumber: async (certificateNumber: string): Promise<IssuedCertificate> => {
        const response = await axiosInstance.get(
            `${API_PREFIX}/public/v1/certificates/verify/number/${certificateNumber}`
        );
        return response.data;
    },

    /**
     * Download certificate as PDF (TODO: implement when PDF generation is ready)
     */
    downloadCertificate: async (certificateId: string): Promise<Blob> => {
        const response = await axiosInstance.get(
            `${API_PREFIX}/private/v1/certificates/${certificateId}/download`,
            {
                responseType: 'blob',
            }
        );
        return response.data;
    },
};

export default { certificateTemplateApi, certificateApi };

