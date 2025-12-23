import { NavLink } from 'react-router-dom';
import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useUnreadSupport } from '../../hooks/useUnreadSupport';
import logo from '../../assets/logoN.png';

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

  const NavItem = ({ to, children, end }: { to: string; children: React.ReactNode; end?: boolean }) => (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `hover:text-yellow-400 transition-colors border-b-2 ${isActive ? 'border-yellow-400' : 'border-transparent'
        }`
      }
    >
      {children}
    </NavLink>
  );

  return (
    <nav className="absolute top-0 left-0 w-full z-[1000] flex bg-black/50 backdrop-blur-sm justify-between items-center px-10 py-6 text-white">

      <div className="text-xl font-bold tracking-wide flex items-center gap-3">
        <img src={logo} alt="Logo" title="Hotel Management" className="w-10 h-10" />
        <span>Hotel Management</span>
      </div>

      {/* Menú Central */}
      <div className="hidden md:flex space-x-4 text-xs font-bold uppercase tracking-widest">

        {isAuthenticated && isClient() && (
          <>
            <NavItem to="/client/" end>Home</NavItem>
            <NavItem to="/client/reservas">Reservas</NavItem>
            <NavItem to="/client/perfil">Mi perfil</NavItem>
            <div className="relative inline-block">
              <NavItem to="/client/soporte">Soporte</NavItem>
              <Badge count={unreadCount} />
            </div>
            <NavItem to="/client/servicios">Servicios</NavItem>
            <NavItem to="/client/mis-servicios">Mis Servicios</NavItem>
            <NavItem to="/contacto">Contacto</NavItem>
          </>
        )}
        {isAuthenticated && isEmployee() && (
          <>
            <NavItem to="/" end>Home</NavItem>
            <NavItem to="/employee/dashboard">Dashboard</NavItem>
            <NavItem to="/employee/clientes">Clientes</NavItem>
            <NavItem to="/employee/checkin">Check-in</NavItem>
            <NavItem to="/employee/reservas">Reservas</NavItem>
            <NavItem to="/employee/servicios-contratados">Servicios</NavItem>
            <div className="relative inline-block">
              <NavItem to="/employee/soporte">Soporte</NavItem>
              <Badge count={unreadCount} />
            </div>
            <NavItem to="/contacto">Contacto</NavItem>
          </>
        )}
        {isAuthenticated && isAdmin() && (
          <>
            <NavItem to="/" end>Home</NavItem>
            <NavItem to="/admin/dashboard">Dashboard</NavItem>
            <NavItem to="/admin/habitaciones">Habitaciones</NavItem>
            <NavItem to="/admin/clientes">Clientes</NavItem>
            <NavItem to="/admin/reservas">Reservas</NavItem>
            <NavItem to="/admin/servicios">Servicios</NavItem>
            <NavItem to="/admin/servicios-contratados">Solicitudes</NavItem>
            <NavItem to="/admin/imagenes">Imágenes</NavItem>
            <div className="relative inline-block">
              <NavItem to="/admin/soporte">Soporte</NavItem>
              <Badge count={unreadCount} />
            </div>
            <NavItem to="/admin/configuracion">Config</NavItem>
            <NavItem to="/contacto">Contacto</NavItem>
          </>
        )}
      </div>

      {/* Botón Login / Logout */}
      <div>
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