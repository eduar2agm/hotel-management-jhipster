import { NavLink } from 'react-router-dom';
import React from 'react';
import {
  Home,
  LayoutDashboard,
  BedDouble,
  Users,
  CalendarCheck,
  HandPlatter,
  ClipboardList,
  Image as ImageIcon,
  Headset,
  Settings,
  Mail,
  User,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useUnreadSupport } from '../../hooks/useUnreadSupport';
import logo from '../../assets/logoN.png';
import { ModeToggle } from '../mode-toggle';
import { NotificationPanel } from './NotificationPanel';

export const Navbar = () => {
  const { isAuthenticated, login, logout, user, isClient, isEmployee, isAdmin } = useAuth();
  const { unreadCount } = useUnreadSupport();

  const Badge = ({ count }: { count: number }) => {
    if (count === 0) return null;
    return (
      <span className="absolute -top-2 -right-3 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white transform bg-red-600 rounded-full">
        {count > 99 ? '99+' : count}
      </span>
    );
  };

  const NavItem = ({ to, children, icon: Icon, end }: { to: string; children: React.ReactNode; icon?: React.ElementType; end?: boolean }) => (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `group flex items-center gap-2 hover:text-yellow-400 transition-all duration-300 border-b-2 py-1
         ${isActive ? 'border-yellow-400 text-yellow-400' : 'border-transparent'}
        `
      }
    >
      {Icon && <Icon className="w-5 h-5" />}
      <span className={`${Icon ? 'hidden group-hover:block animate-in fade-in slide-in-from-left-1 duration-200' : 'block'}`}>
        {children}
      </span>
    </NavLink>
  );

  return (
    <nav className="absolute top-0 left-0 w-full z-[1000] flex bg-black/50 backdrop-blur-sm justify-between items-center px-10 py-6 text-white">
      <div className="text-xl font-bold tracking-wide flex items-center gap-3">
      <NavLink to="/"><img src={logo} alt="Logo" title="Hotel" className="w-10 h-10" /></NavLink>
        <span>Hotel</span>
      </div>

      {/* Menú Central */}
      <div className="hidden md:flex space-x-8 text-xs font-bold uppercase tracking-widest">

        {isAuthenticated && isClient() && (
          <>
            <NavItem to="/client/" end icon={Home}>Home</NavItem>
            <NavItem to="/client/reservas" icon={CalendarCheck}>Reservas</NavItem>
            <NavItem to="/client/perfil" icon={User}>Mi perfil</NavItem>
            <div className="relative inline-block">
              <NavItem to="/client/soporte" icon={Headset}>Soporte</NavItem>
              <Badge count={unreadCount} />
            </div>
            <NavItem to="/client/servicios" icon={HandPlatter}>Servicios</NavItem>
            <NavItem to="/client/mis-servicios" icon={ClipboardList}>Mis Servicios</NavItem>
            <NavItem to="/contacto" icon={Mail}>Contacto</NavItem>
          </>
        )}
        {isAuthenticated && isEmployee() && (
          <>
            <NavItem to="/" end icon={Home}>Home</NavItem>
            <NavItem to="/employee/dashboard" icon={LayoutDashboard}>Dashboard</NavItem>
            <NavItem to="/employee/habitaciones" icon={BedDouble}>Habitaciones</NavItem>
            <NavItem to="/employee/clientes" icon={Users}>Clientes</NavItem>
            <NavItem to="/employee/checkin" icon={KeyRound}>Check-in</NavItem>
            <NavItem to="/employee/reservas" icon={CalendarCheck}>Reservas</NavItem>
            <NavItem to="/employee/servicios" icon={HandPlatter}>Catálogo</NavItem>
            <NavItem to="/employee/servicios-contratados" icon={ClipboardList}>Solicitudes</NavItem>
            <div className="relative inline-block">
              <NavItem to="/employee/soporte" icon={Headset}>Soporte</NavItem>
              <Badge count={unreadCount} />
            </div>
            <NavItem to="/contacto" icon={Mail}>Contacto</NavItem>
          </>
        )}
        {isAuthenticated && isAdmin() && (
          <>
            <NavItem to="/" end icon={Home}>Home</NavItem>
            <NavItem to="/admin/dashboard" icon={LayoutDashboard}>Dashboard</NavItem>
            <NavItem to="/admin/habitaciones" icon={BedDouble}>Habitaciones</NavItem>
            <NavItem to="/admin/clientes" icon={Users}>Clientes</NavItem>
            <NavItem to="/admin/checkin" icon={KeyRound}>Check-in</NavItem>
            <NavItem to="/admin/reservas" icon={CalendarCheck}>Reservas</NavItem>
            <NavItem to="/admin/servicios" icon={HandPlatter}>Servicios</NavItem>
            <NavItem to="/admin/servicios-contratados" icon={ClipboardList}>Solicitudes</NavItem>
            <NavItem to="/admin/imagenes" icon={ImageIcon}>Imágenes</NavItem>
            <div className="relative inline-block">
              <NavItem to="/admin/soporte" icon={Headset}>Soporte</NavItem>
              <Badge count={unreadCount} />
            </div>
            <NavItem to="/admin/configuracion" icon={Settings}>Config</NavItem>
            <NavItem to="/contacto" icon={Mail}>Contacto</NavItem>
          </>
        )}
      </div>

      {/* Botón Login / Logout + Dark Mode */}
      <div className="flex items-center gap-4">
        {isAuthenticated && <NotificationPanel />}
        <ModeToggle />
        {isAuthenticated ? (
          <div className="flex items-center gap-4">

            <span className="hidden lg:block text-xs text-gray-300 font-medium">
              Hola, {user?.firstName || 'Usuario'}
            </span>

            <button
              onClick={() => logout()}
              className="border border-red-500 text-red-100 bg-red-500/20 px-4 py-2 text-xs uppercase font-bold hover:bg-red-600 hover:text-white transition-all"
            >
              Logout
            </button>
          </div>
        ) : (

          <div className="flex items-center gap-6">
            <NavLink
              to="/contacto"
              className={({ isActive }) =>
                `text-xs font-bold uppercase tracking-widest hover:text-yellow-400 transition-colors cursor-pointer border-b-2 ${isActive ? 'border-yellow-400' : 'border-transparent'
                }`
              }
            >
              Contacto
            </NavLink>
            <button
              onClick={() => login()}
              className="border border-white px-6 py-2 text-sm uppercase font-bold hover:bg-white hover:text-black transition-all"
            >
              Login
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};