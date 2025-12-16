import { apiClient } from './axios-instance';
import { toast } from 'sonner';
import { User } from 'oidc-client-ts';

// Request Interceptor to ensure Token is attached
apiClient.interceptors.request.use(
    (config) => {
        // Only attach if not already present
        if (!config.headers['Authorization']) {
            // Find the OIDC User in sessionStorage (oidc-client-ts default storage)
            const oidcKey = Object.keys(sessionStorage).find(key => key.startsWith('oidc.user:'));
            if (oidcKey) {
                const userString = sessionStorage.getItem(oidcKey);
                if (userString) {
                    try {
                        const user = User.fromStorageString(userString);
                        if (user && user.access_token) {
                            config.headers['Authorization'] = `Bearer ${user.access_token}`;
                        }
                    } catch (error) {
                        console.error('Error parsing OIDC user from storage', error);
                    }
                }
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const { response, config } = error;

        // 401 Unauthorized - Token expirado o inválido
        if (response?.status === 401) {
            if (!config._retry && config.url !== '/api/refresh') {
                config._retry = true;
                // La librería react-oidc-context generalmente maneja la renovación automática.
                // Si llegamos aquí, es probable que el refresh token también haya fallado.
                // Hacemos logout forzado.
                window.location.href = '/login';
            }
        }

        // 403 Forbidden - Usuario autenticado pero sin permisos
        if (response?.status === 403) {
            // Redirigir a página de no autorizado
            window.location.href = '/unauthorized';
        }

        // 500 Internal Server Error
        if (response?.status === 500) {
            toast.error('Error del servidor. Por favor intente más tarde.');
        }

        // Network Error
        if (!response) {
            toast.error('No se puede conectar al servidor. Verifique su conexión.');
        }

        return Promise.reject(error);
    }
);
