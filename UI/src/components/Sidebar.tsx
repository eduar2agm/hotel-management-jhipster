import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { cn } from '@/lib/utils';
import { LayoutDashboard, BedDouble, Users, CalendarDays, FileText, Settings, UserCircle, LogOut, MessageSquare } from 'lucide-react';

export const Sidebar = () => {
    const { isAdmin, isEmployee, isClient, logout } = useAuth();

    const renderLinks = () => {
        if (isAdmin()) {
            return (
                <>
                    <NavItem to="/admin/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" />
                    <NavItem to="/admin/habitaciones" icon={<BedDouble size={20} />} label="Habitaciones" />
                    <NavItem to="/admin/clientes" icon={<Users size={20} />} label="Clientes" />
                    <NavItem to="/admin/reservas" icon={<CalendarDays size={20} />} label="Reservas" />
                    <NavItem to="/admin/reportes" icon={<FileText size={20} />} label="Reportes" />
                    <NavItem to="/admin/soporte" icon={<MessageSquare size={20} />} label="Soporte" />
                    <NavItem to="/admin/configuracion" icon={<Settings size={20} />} label="Configuración" />
                </>
            );
        } else if (isEmployee()) {
            return (
                <>
                    <NavItem to="/employee/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" />
                    <NavItem to="/employee/clientes" icon={<Users size={20} />} label="Clientes" />
                    <NavItem to="/employee/checkin" icon={<UserCircle size={20} />} label="Check-in/Out" />
                    <NavItem to="/employee/reservas" icon={<CalendarDays size={20} />} label="Reservas" />
                    <NavItem to="/employee/soporte" icon={<MessageSquare size={20} />} label="Mensajes" />
                </>
            );
        } else if (isClient()) {
            return (
                <>
                    <NavItem to="/client/reservas" icon={<CalendarDays size={20} />} label="Mis Reservas" />
                    <NavItem to="/client/nueva-reserva" icon={<BedDouble size={20} />} label="Nueva Reserva" />
                    <NavItem to="/client/perfil" icon={<UserCircle size={20} />} label="Mi Perfil" />
                    <NavItem to="/client/soporte" icon={<MessageSquare size={20} />} label="Soporte" />
                </>
            );
        }
    };

    return (
        <div className="flex h-full w-64 flex-col border-r bg-card">
            <div className="p-6 border-b">
                <h1 className="text-2xl font-bold text-primary">Hotel App</h1>
            </div>
            <nav className="flex-1 space-y-2 p-4">
                {renderLinks()}
            </nav>
            <div className="border-t p-4">
                <button
                    onClick={() => logout()}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                >
                    <LogOut size={20} />
                    Cerrar Sesión
                </button>
            </div>
        </div>
    );
};

const NavItem = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
            )
        }
    >
        {icon}
        {label}
    </NavLink>
);
