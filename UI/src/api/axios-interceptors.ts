import { apiClient } from './axios-instance';
import { toast } from 'sonner';
import { User } from 'oidc-client-ts';

// Request Interceptor to ensure Token is attached
apiClient.interceptors.request.use(
    (config) => {
        // Only attach if not already present
        if (!config.headers['Authorization']) {
            // Find the OIDC User in localStorage (default configured in oidc-config.ts)
            // or sessionStorage as fallback

            // Check localStorage first
            let oidcKey = Object.keys(localStorage).find(key => key.startsWith('oidc.user:'));
            let storageToUse = localStorage;

            // Followed by sessionStorage
            if (!oidcKey) {
                oidcKey = Object.keys(sessionStorage).find(key => key.startsWith('oidc.user:'));
                storageToUse = sessionStorage;
            }

            if (oidcKey) {
                const userString = storageToUse.getItem(oidcKey);

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
            // Avoid redirecting loop if we are on the public home page
            const isHomePage = window.location.pathname === '/' || window.location.pathname === '/HomePage';

            if (!config._retry && config.url !== '/api/refresh' && !isHomePage) {
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
