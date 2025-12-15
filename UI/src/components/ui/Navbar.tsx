import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth'; 
import logo from '../../assets/logoN.png';
import { User } from 'lucide-react';

export const Navbar = () => {
  const { isAuthenticated, login, logout, user, isAdmin, isEmployee, isClient } = useAuth();

  return (
    <nav className="absolute top-0 left-0 w-full z-50 flex bg-black/50 backdrop-blur-sm justify-between items-center px-10 py-6 text-white">
      
      <div className="text-xl font-bold tracking-wide flex items-center gap-3">
        <img src={logo} alt="Logo" title="Hotel Management" className="w-10 h-10" /> 
        <span>Hotel Management</span>
      </div>

      {/* Menú Central */}
      <div className="hidden md:flex space-x-6 text-sm font-sm uppercase tracking-wider">
        
        {isAuthenticated && isClient() && (
          <>
            <Link to="/client/home" className="hover:text-yellow-400 transition-colors">Home</Link>
            <Link to="/habitaciones" className="hover:text-yellow-400 transition-colors">Habitaciones</Link>
            <Link to="/servicios" className="hover:text-yellow-400 transition-colors">Servicios</Link>
            <Link to="/client/reservas" className="hover:text-yellow-400 transition-colors">Mis Reservas</Link>
            <Link to="/client/perfil" className="hover:text-yellow-400 transition-colors">Mi Perfil</Link>
          </>
        )}
         {isAuthenticated && isEmployee() && (
          <>
            <Link to="/employee/dashboard" className="hover:text-yellow-400 transition-colors">Dashboard</Link>
            <Link to="/employee/checkin" className="hover:text-yellow-400 transition-colors">Check-in/Out</Link>
            <Link to="/employee/reservas" className="hover:text-yellow-400 transition-colors">Reservas</Link>
          </>
         )}
         {isAuthenticated && isAdmin() && (
          <>
            <Link to="/admin/dashboard" className="hover:text-yellow-400 transition-colors">Dashboard</Link>
            <Link to="/admin/habitaciones" className="hover:text-yellow-400 transition-colors">Habitaciones</Link>
            <Link to="/admin/clientes" className="hover:text-yellow-400 transition-colors">clientes</Link>
            <Link to="/admin/reservas" className="hover:text-yellow-400 transition-colors">Reservas</Link>
            <Link to="/admin/reportes" className="hover:text-yellow-400 transition-colors">Reportes</Link>
            <Link to="/admin/configuracion" className="hover:text-yellow-400 transition-colors">Configuración</Link>
          </>
         )}
      </div>

      {/* Botón Login / Logout */}
      <div>
        {isAuthenticated ? (
          <div className="flex items-center gap-4">
             
             <span className="hidden lg:flex items-center gap-2 text-sm text-gray-300 font-medium">
                <User className="h-4 w-4" />Hola, {user?.firstName || 'Usuario'}
             </span>
             
             <button 
               onClick={() => logout()} 
               className="border border-blue-500 text-red-100 bg-blue-500/20 px-6 py-2 text-sm uppercase font-bold hover:bg-blue-600 hover:text-white transition-all"
             >
               Logout
             </button>
          </div>
        ) : (
  
          <button 
            onClick={() => login()} 
            className="border border-white px-6 py-2 text-sm uppercase font-bold hover:bg-white hover:text-black transition-all"
          >
            Login
          </button>
        )}
      </div>
    </nav>
  );
};