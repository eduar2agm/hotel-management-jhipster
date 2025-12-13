import React from 'react';
import { useAuth } from '../hooks/useAuth';

interface DashboardLayoutProps {
    title: string;
    role: string;
    children?: React.ReactNode;
}

export const DashboardLayout = ({ title, role, children }: DashboardLayoutProps) => {
    const { logout, user } = useAuth();

    return (
        <div className="dashboard-container" style={{ padding: '2rem', textAlign: 'center' }}>
            <h1>{title}</h1>
            <p>Bienvenido, {user?.firstName || role}.</p>
            {children}
            <button
                onClick={() => logout()}
                style={{
                    marginTop: '20px',
                    padding: '10px 20px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                }}
            >
                Cerrar Sesión
            </button>
        </div>
    );
};
