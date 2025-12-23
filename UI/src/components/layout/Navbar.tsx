import { Link } from 'react-router-dom';
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
            <Link to="/client/" className="hover:text-yellow-400 transition-colors">Home</Link>
            <Link to="/client/reservas" className="hover:text-yellow-400 transition-colors">Reservas</Link>
            <Link to="/client/perfil" className="hover:text-yellow-400 transition-colors">Mi perfil</Link>
            <div className="relative inline-block">
              <Link to="/client/soporte" className="hover:text-yellow-400 transition-colors">Soporte</Link>
              <Badge count={unreadCount} />
            </div>
            <Link to="/client/servicios" className="hover:text-yellow-400 transition-colors">Servicios</Link>
            <Link to="/client/mis-servicios" className="hover:text-yellow-400 transition-colors">Mis Servicios</Link>
            <Link to="/contacto" className="hover:text-yellow-400 transition-colors">Contacto</Link>
          </>
        )}
        {isAuthenticated && isEmployee() && (
          <>
            <Link to="/" className="hover:text-yellow-400 transition-colors">Home</Link>
            <Link to="/employee/dashboard" className="hover:text-yellow-400 transition-colors">Dashboard</Link>
            <Link to="/employee/clientes" className="hover:text-yellow-400 transition-colors">Clientes</Link>
            <Link to="/employee/checkin" className="hover:text-yellow-400 transition-colors">Check-in</Link>
            <Link to="/employee/reservas" className="hover:text-yellow-400 transition-colors">Reservas</Link>
            <Link to="/employee/servicios-contratados" className="hover:text-yellow-400 transition-colors">Servicios</Link>
            <div className="relative inline-block">
              <Link to="/employee/soporte" className="hover:text-yellow-400 transition-colors">Soporte</Link>
              <Badge count={unreadCount} />
            </div>
            <Link to="/contacto" className="hover:text-yellow-400 transition-colors">Contacto</Link>
          </>
        )}
        {isAuthenticated && isAdmin() && (
          <>
            <Link to="/" className="hover:text-yellow-400 transition-colors">Home</Link>
            <Link to="/admin/dashboard" className="hover:text-yellow-400 transition-colors">Dashboard</Link>
            <Link to="/admin/habitaciones" className="hover:text-yellow-400 transition-colors">Habitaciones</Link>
            <Link to="/admin/clientes" className="hover:text-yellow-400 transition-colors">Clientes</Link>
            <Link to="/admin/reservas" className="hover:text-yellow-400 transition-colors">Reservas</Link>
            <Link to="/admin/servicios" className="hover:text-yellow-400 transition-colors">Servicios</Link>
            <Link to="/admin/servicios-contratados" className="hover:text-yellow-400 transition-colors">Solicitudes</Link>
            <Link to="/admin/imagenes" className="hover:text-yellow-400 transition-colors">Imágenes</Link>
            <div className="relative inline-block">
              <Link to="/admin/soporte" className="hover:text-yellow-400 transition-colors">Soporte</Link>
              <Badge count={unreadCount} />
            </div>
            <Link to="/admin/configuracion" className="hover:text-yellow-400 transition-colors">Config</Link>
            <Link to="/contacto" className="hover:text-yellow-400 transition-colors">Contacto</Link>
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
            <Link
              to="/contacto"
              className="text-xs font-bold uppercase tracking-widest hover:text-yellow-400 transition-colors cursor-pointer"
            >
              Contacto
            </Link>
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