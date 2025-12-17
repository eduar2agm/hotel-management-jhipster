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

        // Custom Handling for Inactive Entities (400)
        if (response?.status === 400) {
            const data = response.data;
            const errorKey = data?.errorKey || data?.detail || '';
            const title = data?.title || '';

            if (errorKey.includes('inactive') || title.includes('inactive')) {
                // Check if the current user is a CLIENT (and not Admin/Employee)
                try {
                    let oidcKey = Object.keys(localStorage).find(key => key.startsWith('oidc.user:'));
                    let storageToUse = localStorage;
                    if (!oidcKey) {
                        oidcKey = Object.keys(sessionStorage).find(key => key.startsWith('oidc.user:'));
                        storageToUse = sessionStorage;
                    }

                    if (oidcKey) {
                        const userString = storageToUse.getItem(oidcKey);
                        if (userString) {
                            const user = User.fromStorageString(userString);
                            // Helper to parse JWT
                            const parseJwt = (token: string) => {
                                try {
                                    return JSON.parse(atob(token.split('.')[1]));
                                } catch (e) {
                                    return {};
                                }
                            };

                            const profile = user.profile;
                            const accessToken = user.access_token;
                            const decodedAccess = accessToken ? parseJwt(accessToken) : {};

                            // Helper to extract roles (simplified from useAuth)
                            const extractRoles = (tokenData: any) => {
                                const realmRoles = tokenData.realm_access?.roles || [];
                                // Safe access to resource_access
                                const clientRoles = tokenData.resource_access?.[import.meta.env.VITE_KEYCLOAK_CLIENT_ID]?.roles || [];
                                const jhipsterRoles = tokenData['https://www.jhipster.tech/roles'] || [];
                                const directRoles = tokenData.roles || tokenData.groups || [];
                                return [...realmRoles, ...clientRoles, ...jhipsterRoles, ...directRoles];
                            };

                            const allRoles = new Set([
                                ...extractRoles(profile),
                                ...extractRoles(decodedAccess)
                            ]);
                            const roles = Array.from(allRoles);

                            const isClient = roles.includes('ROLE_CLIENT');
                            const isAdmin = roles.includes('ROLE_ADMIN');
                            const isEmployee = roles.includes('ROLE_EMPLOYEE');

                            // Only redirect if it is a pure Client (admins/employees might be editing inactive users)
                            if (isClient && !isAdmin && !isEmployee) {
                                window.location.href = '/account-deactivated';
                                return Promise.reject(error);
                            }
                        }
                    }
                } catch (e) {
                    console.error('Error checking user roles in interceptor', e);
                }

                toast.error('Esta entidad está inactiva', {
                    description: 'No puede ser modificada hasta que sea reactivada por un administrador.',
                    duration: 5000,
                    // className: "bg-orange-50 border-orange-200 text-orange-800" // Optional styling
                });
                return Promise.reject(error);
            }
        }

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
