import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/interface/enum.interface';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Component wrapper để redirect user đến dashboard phù hợp với role
 */
const RoleBasedDashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            // Nếu là teacher, redirect sang teacher-dashboard
            if (user.role === UserRole.TEACHER) {
                navigate('/teacher-dashboard', { replace: true });
            }
            // Nếu là admin hoặc role khác, giữ nguyên ở dashboard admin
            else {
                navigate('/dashboard', { replace: true });
            }
        }
    }, [user, navigate]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Đang chuyển hướng...</p>
            </div>
        </div>
    );
};

export default RoleBasedDashboard;

