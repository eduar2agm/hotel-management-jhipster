import { useAuth as useOidcAuth } from 'react-oidc-context';
import { useMemo, useCallback } from 'react';
import { type AuthUser, type UserRole } from '../types/auth';

const parseJwt = (token: string) => {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return {};
    }
};

export const useAuth = () => {
    const auth = useOidcAuth();

    const user: AuthUser | null = useMemo(() => {
        if (!auth.user) return null;

        const profile = auth.user.profile;
        const accessToken = auth.user.access_token;
        const decodedAccess = accessToken ? parseJwt(accessToken) : {};

        // Helper to safely extract roles from a token object
        const extractRoles = (tokenData: any) => {
            const realmRoles = tokenData.realm_access?.roles || [];
            const clientRoles = tokenData.resource_access?.[import.meta.env.VITE_KEYCLOAK_CLIENT_ID]?.roles || [];
            const jhipsterRoles = tokenData['https://www.jhipster.tech/roles'] || [];
            const directRoles = tokenData.roles || tokenData.groups || [];

            return [...realmRoles, ...clientRoles, ...jhipsterRoles, ...directRoles];
        };

        // Combine roles from ID Token (profile) and Access Token
        const allRoles = new Set([
            ...extractRoles(profile),
            ...extractRoles(decodedAccess)
        ]);

        return {
            id: profile.sub || '',
            username: profile.preferred_username || '',
            email: profile.email || '',
            roles: Array.from(allRoles) as UserRole[],
            firstName: profile.given_name,
            lastName: profile.family_name,
        };
    }, [auth.user]);

    const hasRole = useCallback((role: UserRole): boolean => {
        return user?.roles.includes(role) || false;
    }, [user]);

    const hasAnyRole = useCallback((...roles: UserRole[]): boolean => {
        return roles.some(role => hasRole(role));
    }, [hasRole]);

    const isAdmin = useCallback((): boolean => hasRole('ROLE_ADMIN'), [hasRole]);
    const isEmployee = useCallback((): boolean => hasRole('ROLE_EMPLOYEE'), [hasRole]);
    const isClient = useCallback((): boolean => hasRole('ROLE_CLIENT'), [hasRole]);

    const login = useCallback(() => auth.signinRedirect(), [auth]);
    const logout = useCallback(() => auth.signoutRedirect(), [auth]);
    const getAccessToken = useCallback(() => auth.user?.access_token, [auth.user]);

    return {
        user,
        isAuthenticated: auth.isAuthenticated,
        isLoading: auth.isLoading,
        error: auth.error,
        login,
        logout,
        hasRole,
        hasAnyRole,
        isAdmin,
        isEmployee,
        isClient,
        getAccessToken,
    };
};
