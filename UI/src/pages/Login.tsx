import { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogIn, Hotel, ShieldCheck, Loader2 } from 'lucide-react';

export const Login = () => {
    const { login, user, isAuthenticated, isLoading, error } = useAuth();
    const navigate = useNavigate();

    const roles = user?.roles || [];
    const rolesString = JSON.stringify(roles);

    useEffect(() => {
        if (isAuthenticated && !isLoading && roles.length > 0) {
            if (roles.includes('ROLE_ADMIN')) {
                navigate('/admin/dashboard', { replace: true });
            } else if (roles.includes('ROLE_EMPLOYEE')) {
                navigate('/employee/dashboard', { replace: true });
            } else if (roles.includes('ROLE_CLIENT')) {
                navigate('/client/reservas', { replace: true });
            }
        }
    }, [isAuthenticated, isLoading, rolesString, navigate]);

    // --- PANTALLA DE CARGA ---
    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-slate-950">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="absolute inset-0 bg-yellow-500 blur-xl opacity-20 rounded-full"></div>
                        <Loader2 className="h-12 w-12 animate-spin text-yellow-500 relative z-10" />
                    </div>
                    <p className="text-slate-400 text-sm tracking-widest uppercase animate-pulse">
                        Accediendo al Portal Seguro...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen flex font-sans">
            
            {/* --- COLUMNA IZQUIERDA (IMAGEN & BRANDING) --- */}
            <div className="hidden lg:flex w-1/2 relative bg-slate-900 items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img 
                        src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070&auto=format&fit=crop" 
                        alt="Luxury Hotel Lobby" 
                        className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/50 to-transparent"></div>
                </div>
                
                <div className="relative z-10 text-center px-12 max-w-xl">
                    <div className="mb-8 flex justify-center">
                        <div className="p-4 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                            <Hotel className="h-10 w-10 text-yellow-500" />
                        </div>
                    </div>
                    <h2 className="text-4xl font-black text-white mb-6 tracking-tight leading-tight">
                        Experiencia y Confort <br/> 
                        <span className="text-yellow-500">Redefinidos.</span>
                    </h2>
                    <p className="text-slate-300 text-lg leading-relaxed">
                        Gestiona tus reservas, servicios y preferencias en una plataforma diseñada para la excelencia operativa y la satisfacción del huésped.
                    </p>
                </div>
                
                <div className="absolute bottom-8 text-slate-500 text-xs tracking-wider">
                    © {new Date().getFullYear()} Hotel Management System. All rights reserved.
                </div>
            </div>

            {/* --- COLUMNA DERECHA (FORMULARIO) --- */}
            <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-8 relative">
                {/* Decoración de fondo sutil */}
                <div className="absolute top-0 right-0 p-12 opacity-5">
                    <Hotel size={200} />
                </div>

                <div className="max-w-md w-full space-y-8 relative z-10">
                    <div className="text-center lg:text-left">
                        <span className="text-yellow-600 font-bold tracking-widest uppercase text-xs">Bienvenido</span>
                        <h1 className="text-3xl font-bold text-slate-900 mt-2">Portal de Acceso</h1>
                        <p className="text-slate-500 mt-2">
                            Inicia sesión para acceder a tu panel de control personalizado.
                        </p>
                    </div>

                    {/* Mensaje de Error */}
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r shadow-sm">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <ShieldCheck className="h-5 w-5 text-red-400" aria-hidden="true" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-red-700">
                                        Error de conexión: {error.message}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-6 pt-4">
                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 text-center space-y-4">
                            <p className="text-sm text-slate-600 font-medium">
                                Utilizamos autenticación centralizada para garantizar la seguridad de tus datos.
                            </p>
                            
                            <Button 
                                className="w-full h-12 bg-slate-900 hover:bg-yellow-500 hover:text-white text-white font-bold tracking-wide transition-all shadow-lg shadow-slate-900/20 hover:shadow-yellow-500/30 text-base"
                                onClick={() => void login()}
                            >
                                <LogIn className="mr-2 h-5 w-5" /> Ingresar con SSO
                            </Button>
                        </div>

                        <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                            <ShieldCheck className="h-3 w-3" />
                            <span>Conexión cifrada y protegida por Keycloak OAuth2</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};