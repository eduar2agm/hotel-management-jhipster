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
import {
    IDENTIFICATION_TYPES,
    validateIdentification,
    formatIdentification,
    IDENTIFICATION_PLACEHOLDERS,
    TipoIdentificacion
} from '../../utils/identification';

export const Perfil = () => {
    const { user } = useAuth();
    const [cliente, setCliente] = useState<Partial<ClienteDTO>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [exists, setExists] = useState(false);
    const [idError, setIdError] = useState<string | null>(null);

    useEffect(() => {
        const loadProfile = async () => {
            if (!user?.email) return;

            try {
                // Ideally backend should provide /api/clientes/me or filter by email
                // Simulating filtering client-side
                const res = await ClienteService.getClientes({ size: 1000 });
                const found = res.data.find(c => c.correo === user.email);

                if (found) {
                    // Check if this profile needs to be linked to the current Keycloak user
                    if ((!found.keycloakId || found.keycloakId === 'not-linked') && user.id) {
                        try {
                            // Link the profile
                            const updated = { ...found, keycloakId: user.id };
                            await ClienteService.updateCliente(found.id!, updated as ClienteDTO);
                            setCliente(updated);
                            setExists(true);
                            toast.success('Perfil vinculado exitosamente a su cuenta');
                        } catch (err) {
                            console.error('Failed to link profile', err);
                            toast.error('Error al vincular perfil existente');
                        }
                    } else {
                        setCliente(found);
                        setExists(true);
                    }
                } else {
                    setCliente({
                        nombre: user.firstName || '',
                        apellido: user.lastName || '',
                        correo: user.email,
                        telefono: '',
                        direccion: '',
                        tipoIdentificacion: 'CEDULA',
                        numeroIdentificacion: '',
                        keycloakId: user.id
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

        // Validate Identification
        if (cliente.tipoIdentificacion && cliente.numeroIdentificacion) {
            const error = validateIdentification(cliente.tipoIdentificacion, cliente.numeroIdentificacion);
            if (error) {
                setIdError(error);
                toast.error(`Error en Identificación: ${error}`);
                return;
            }
        }

        setIsSaving(true);
        try {
            if (exists && cliente.id) {
                await ClienteService.updateCliente(cliente.id, cliente as ClienteDTO);
                toast.success('Perfil actualizado correctamente');
            } else {
                const payload = {
                    ...cliente,
                    activo: true,
                    // Ensure keycloakId is present
                    keycloakId: cliente.keycloakId || user?.id
                } as NewClienteDTO;

                const newCliente = await ClienteService.createCliente(payload);
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

    const handleIdChange = (val: string) => {
        // Apply auto-formatting
        const formatted = formatIdentification(cliente.tipoIdentificacion || 'DNI', val);

        setCliente({ ...cliente, numeroIdentificacion: formatted });

        // Validate with formatted value
        if (cliente.tipoIdentificacion) {
            const error = validateIdentification(cliente.tipoIdentificacion, formatted);
            setIdError(error);
        }
    };

    const handleTypeChange = (val: string) => {
        setCliente({
            ...cliente,
            tipoIdentificacion: val as any,
            // Clear ID when type changes to avoid invalid format confusion
            numeroIdentificacion: ''
        });
        setIdError(null);
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
                                        required
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
                                        value={cliente.tipoIdentificacion || 'CEDULA'}
                                        onValueChange={handleTypeChange}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {IDENTIFICATION_TYPES.map((type) => (
                                                <SelectItem key={type.value} value={type.value}>
                                                    {type.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Número ID</Label>
                                    <div className="relative">
                                        <Input
                                            value={cliente.numeroIdentificacion || ''}
                                            onChange={e => handleIdChange(e.target.value)}
                                            required
                                            className={idError ? "border-red-500" : ""}
                                            placeholder={IDENTIFICATION_PLACEHOLDERS[cliente.tipoIdentificacion as TipoIdentificacion] || ''}
                                        />
                                        {idError && <span className="absolute text-xs text-red-500 -bottom-5 left-0">{idError}</span>}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end mt-4">
                            <Button type="submit" disabled={isSaving || !!idError}>
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
