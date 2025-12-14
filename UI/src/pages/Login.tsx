import { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';

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

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Conectando con servidor seguro...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
            <Card className="w-full max-w-md shadow-xl">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold tracking-tight">Hotel Management</CardTitle>
                    <CardDescription>
                        Sistema integral de gestión hotelera
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    {error && (
                        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                            Error de conexión: {error.message}
                        </div>
                    )}
                    <div className="text-center text-sm text-muted-foreground mb-4">
                        Inicia sesión para acceder a tu panel correspondiente.
                    </div>
                    <Button className="w-full" size="lg" onClick={() => void login()}>
                        <LogIn className="mr-2 h-4 w-4" /> Iniciar Sesión con SSO
                    </Button>
                </CardContent>
                <CardFooter className="flex flex-col space-y-2 text-center text-xs text-muted-foreground">
                    <div>
                        Protegido por Keycloak OAuth2
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
};
