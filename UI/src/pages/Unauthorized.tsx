import { useAuth } from '../hooks/useAuth';

export const Unauthorized = () => {
    const { logout } = useAuth();

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>Acceso No Autorizado</h1>
            <p>No tienes permisos para acceder a esta página.</p>
            <button
                onClick={() => logout()}
                style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer' }}
            >
                Cerrar Sesión
            </button>
        </div>
    );
};
