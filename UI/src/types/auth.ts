export type UserRole = 'ROLE_ADMIN' | 'ROLE_EMPLOYEE' | 'ROLE_CLIENT';

export interface AuthUser {
    id: string;
    username: string;
    email: string;
    roles: UserRole[];
    firstName?: string;
    lastName?: string;
}
