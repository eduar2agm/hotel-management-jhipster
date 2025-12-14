import { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '../../hooks/useAuth';
import { ClienteService } from '../../services';
import type { ClienteDTO, NewClienteDTO } from '../../types/api';
import { toast } from 'sonner';
import { Save, User } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const Perfil = () => {
    const { user } = useAuth();
    const [cliente, setCliente] = useState<Partial<ClienteDTO>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [exists, setExists] = useState(false);

    useEffect(() => {
        const loadProfile = async () => {
            if (!user?.email) return;

            try {
                // Ideally backend should provide /api/clientes/me or filter by email
                // Simulating filtering client-side
                const res = await ClienteService.getClientes({ size: 1000 });
                const found = res.data.find(c => c.correo === user.email);

                if (found) {
                    setCliente(found);
                    setExists(true);
                } else {
                    setCliente({
                        nombre: user.firstName || '',
                        apellido: user.lastName || '',
                        correo: user.email,
                        telefono: '',
                        direccion: '',
                        tipoIdentificacion: 'DNI',
                        numeroIdentificacion: ''
                    });
                    setExists(false);
                }
            } catch (error) {
                console.error(error);
                toast.error('Error al cargar perfil');
            } finally {
                setIsLoading(false);
            }
        };

        loadProfile();
    }, [user]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            if (exists && cliente.id) {
                await ClienteService.updateCliente(cliente.id, cliente as ClienteDTO);
                toast.success('Perfil actualizado correctamente');
            } else {
                const newCliente = await ClienteService.createCliente({ ...cliente, activo: true } as NewClienteDTO);
                setCliente(newCliente.data);
                setExists(true);
                toast.success('Perfil creado correctamente');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error al guardar perfil');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <DashboardLayout role="Cliente" title="Perfil user"><div>Cargando...</div></DashboardLayout>;

    return (
        <DashboardLayout title="Mi Perfil" role="Cliente">
            <div className="max-w-2xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-6 w-6" /> Completar Información Personal
                        </CardTitle>
                    </CardHeader>
                    <form onSubmit={handleSave}>
                        <CardContent className="grid gap-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Nombre</Label>
                                    <Input
                                        value={cliente.nombre || ''}
                                        onChange={e => setCliente({ ...cliente, nombre: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Apellido</Label>
                                    <Input
                                        value={cliente.apellido || ''}
                                        onChange={e => setCliente({ ...cliente, apellido: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label>Correo Electrónico</Label>
                                <Input
                                    value={cliente.correo || ''}
                                    disabled={true}
                                    className="bg-muted"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Teléfono</Label>
                                    <Input
                                        value={cliente.telefono || ''}
                                        onChange={e => setCliente({ ...cliente, telefono: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Dirección</Label>
                                    <Input
                                        value={cliente.direccion || ''}
                                        onChange={e => setCliente({ ...cliente, direccion: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Tipo ID</Label>
                                    <Select
                                        value={cliente.tipoIdentificacion || 'DNI'}
                                        onValueChange={(val) => setCliente({ ...cliente, tipoIdentificacion: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="DNI">DNI</SelectItem>
                                            <SelectItem value="PASAPORTE">Pasaporte</SelectItem>
                                            <SelectItem value="CEDULA">Cédula</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Número ID</Label>
                                    <Input
                                        value={cliente.numeroIdentificacion || ''}
                                        onChange={e => setCliente({ ...cliente, numeroIdentificacion: e.target.value })}
                                    />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end">
                            <Button type="submit" disabled={isSaving}>
                                <Save className="mr-2 h-4 w-4" />
                                {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </DashboardLayout>
    );
};
