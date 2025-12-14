import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Sidebar } from './Sidebar';
import { User } from 'lucide-react';

interface DashboardLayoutProps {
    title: string;
    role?: string;
    children?: React.ReactNode;
}

export const DashboardLayout = ({ title, children }: DashboardLayoutProps) => {
    const { user } = useAuth();

    return (
        <div className="flex h-screen bg-background">
            <Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
                <header className="flex h-16 items-center justify-between border-b bg-card px-6">
                    <h2 className="text-xl font-semibold">{title}</h2>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 rounded-full border px-3 py-1 bg-accent/50">
                            <User size={16} />
                            <span className="text-sm font-medium">{user?.firstName || user?.username}</span>
                        </div>
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
};
