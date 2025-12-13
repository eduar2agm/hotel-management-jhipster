import { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export const Login = () => {
    const { login, isAuthenticated, isAdmin, isEmployee, isLoading, error, user } = useAuth();
    const navigate = useNavigate();

    console.log("Login Debug:", {
        isAuthenticated,
        isLoading,
        error,
        user,
        roles: user?.roles,
        env: {
            url: import.meta.env.VITE_KEYCLOAK_URL,
            realm: import.meta.env.VITE_KEYCLOAK_REALM,
            client: import.meta.env.VITE_KEYCLOAK_CLIENT_ID
        }
    });

    useEffect(() => {
        if (isAuthenticated) {
            if (isAdmin()) {
                navigate('/admin/dashboard');
            } else if (isEmployee()) {
                navigate('/employee/dashboard');
            } else {
                navigate('/client/reservas');
            }
        }
        // Auto-login DISABLED for debugging
        // else if (!isLoading && !error) {
        //     void login();
        // }
    }, [isAuthenticated, isAdmin, isEmployee, navigate, isLoading, error]);

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <h1>Cargando...</h1>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'red' }}>
                <h1>Error de Autenticación</h1>
                <pre>{JSON.stringify(error, null, 2)}</pre>
                <button onClick={() => window.location.reload()} style={{ padding: '10px 20px', marginTop: '20px' }}>
                    Recargar Página
                </button>
                <div style={{ marginTop: '20px', textAlign: 'left', background: '#f0f0f0', padding: '10px' }}>
                    <p>Debug Info:</p>
                    <p>Url: {import.meta.env.VITE_KEYCLOAK_URL}</p>
                    <p>Realm: {import.meta.env.VITE_KEYCLOAK_REALM}</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <h1>Sistema de Gestión Hotelera</h1>
            <p>Por favor inicia sesión para continuar</p>
            <button
                onClick={() => void login()}
                style={{
                    padding: '12px 24px',
                    fontSize: '1.2rem',
                    cursor: 'pointer',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    marginTop: '20px'
                }}
            >
                Iniciar Sesión con Keycloak
            </button>
            <div style={{ marginTop: '30px', fontSize: '0.8rem', color: '#666' }}>
                Estado actual: {isAuthenticated ? 'Autenticado' : 'No autenticado'}
                <br />
                API Check: {import.meta.env.VITE_KEYCLOAK_URL ? 'Variables OK' : 'Variables FALTANTES'}
            </div>
        </div>
    );
};
