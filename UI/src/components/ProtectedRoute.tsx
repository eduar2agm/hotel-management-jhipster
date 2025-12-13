import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { type UserRole } from '../types/auth';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRoles?: UserRole[];
}

export const ProtectedRoute = ({ children, requiredRoles }: ProtectedRouteProps) => {
    const { isAuthenticated, isLoading, hasAnyRole, login } = useAuth();

    if (isLoading) {
        return <div>Cargando...</div>;
    }

    if (!isAuthenticated) {
        // Optional: automatically trigger login instead of redirecting
        // login(); 
        // or return redirect
        return <Navigate to="/login" replace />;
    }

    if (requiredRoles && requiredRoles.length > 0) {
        if (!hasAnyRole(...requiredRoles)) {
            return <Navigate to="/unauthorized" replace />;
        }
    }

    return <>{children}</>;
};
