import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield } from 'lucide-react';

export default function ProtectedRoute({ children, requiredPermission, requiredRole }) {
    const { user, hasPermission, hasRole } = useAuth();

    if (!user) {
        return <Navigate to="/" replace />;
    }

    const isAllowed =
        (requiredPermission && hasPermission(requiredPermission)) ||
        (requiredRole && hasRole(requiredRole)) ||
        (!requiredPermission && !requiredRole);

    if (!isAllowed) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8">
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                    <Shield size={32} className="text-red-500" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
                <p className="text-gray-400 mb-6 max-w-md">
                    You do not have permission to view this page. Please contact your administrator if you believe this is an error.
                </p>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-500">
                    Expected: {requiredRole || requiredPermission} <br />
                    Current Role: {user.role}
                </div>
            </div>
        );
    }

    return children;
}
