import { UserResponse } from '@/interface/user.interface';
import React from 'react';

interface TeacherProfileViewProps {
    teacher: UserResponse;
}

const TeacherProfileView: React.FC<TeacherProfileViewProps> = ({ teacher }) => {
    const renderDetail = (label: string, value: any) => (
        <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
            <dt className="text-sm font-medium text-gray-500">{label}</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-medium">{value || 'N/A'}</dd>
        </div>
    );

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex items-center gap-4">
                <img
                    src={teacher.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(teacher.displayName || 'Teacher')}&background=3b82f6&color=fff&size=96`}
                    alt={teacher.displayName || 'Teacher'}
                    className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-sm"
                    onError={(e) => {
                        e.currentTarget.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(teacher.displayName || 'Teacher') + '&background=3b82f6&color=fff&size=96';
                    }}
                />
                <div>
                    <h3 className="text-lg leading-6 font-bold text-gray-900">Thông tin giáo viên</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">Chi tiết cá nhân và thông tin liên hệ.</p>
                </div>
            </div>
            <dl>
                {renderDetail('Họ và tên', `${teacher.firstName} ${teacher.lastName}`)}
                {renderDetail('Tên hiển thị', teacher.displayName)}
                {renderDetail('Email', teacher.email)}
                {renderDetail('Số điện thoại', teacher.phone)}
                {renderDetail('Giới tính', teacher.gender)}
                {renderDetail('Ngày tạo', new Date(teacher.createdAt).toLocaleString())}
                {renderDetail('Cập nhật lần cuối', new Date(teacher.updatedAt).toLocaleString())}
            </dl>
        </div>
    );
};

export default TeacherProfileView;
