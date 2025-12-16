import { useAuth } from '../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldAlert, LogOut } from 'lucide-react';

export const Unauthorized = () => {
    const { logout } = useAuth();

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
            <Card className="w-full max-w-md shadow-lg border-destructive/50">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-destructive/10 p-3 rounded-full w-fit mb-2">
                        <ShieldAlert className="h-10 w-10 text-destructive" />
                    </div>
                    <CardTitle className="text-xl text-destructive">Acceso Restringido</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground">
                    <p>No tienes los permisos necesarios para visualizar esta página.</p>
                    <p className="text-sm mt-2">Si crees que esto es un error, contacta al administrador.</p>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <Button variant="outline" onClick={() => logout()}>
                        <LogOut className="mr-2 h-4 w-4" /> Cerrar Sesión e Intentar con Otra Cuenta
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};
