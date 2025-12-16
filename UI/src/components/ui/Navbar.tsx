import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth'; 
import logo from '../../assets/logoN.png';

export const Navbar = () => {
  const { isAuthenticated, login, logout, user } = useAuth();

  return (
    <nav className="absolute top-0 left-0 w-full z-50 flex bg-black/50 backdrop-blur-sm justify-between items-center px-10 py-6 text-white">
      
      <div className="text-xl font-bold tracking-wide flex items-center gap-3">
        <img src={logo} alt="Logo" title="Hotel Management" className="w-10 h-10" /> 
        <span>Hotel Management</span>
      </div>

      {/* Menú Central */}
      <div className="hidden md:flex space-x-8 text-sm font-medium uppercase tracking-wider">
        <Link to="/HomePage" className="hover:text-yellow-400 transition-colors">Home</Link>
        <Link to="/client/reservas" className="hover:text-yellow-400 transition-colors">Reservas</Link>
        <Link to="/client/perfil" className="hover:text-yellow-400 transition-colors">Mi perfil</Link>
        <Link to="/client/soporte" className="hover:text-yellow-400 transition-colors">Soporte</Link>
        <Link to="/client/servicos" className="hover:text-yellow-400 transition-colors">Servicios</Link>
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
               className="border border-red-500 text-red-100 bg-red-500/20 px-6 py-2 text-sm uppercase font-bold hover:bg-red-600 hover:text-white transition-all"
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