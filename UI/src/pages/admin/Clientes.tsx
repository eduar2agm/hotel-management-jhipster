
import { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { ClienteService } from '../../services';
import type { ClienteDTO, NewClienteDTO } from '../../types/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Mail, Phone, Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

import {
    IDENTIFICATION_TYPES,
    validateIdentification,
    formatIdentification,
    IDENTIFICATION_PLACEHOLDERS,
    TipoIdentificacion
} from '../../utils/identification';

export const AdminClientes = () => {
    const [clientes, setClientes] = useState<ClienteDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentCliente, setCurrentCliente] = useState<Partial<ClienteDTO>>({});
    const [isEditing, setIsEditing] = useState(false);
    const [idError, setIdError] = useState<string | null>(null);

    const loadClientes = async () => {
        setLoading(true);
        try {
            const res = await ClienteService.getClientes({ page: 0, size: 50 });
            setClientes(res.data);
        } catch (error) {
            toast.error('Error al cargar clientes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadClientes();
    }, []);

    const handleDelete = async (id: number) => {
        if (!confirm('¿Está seguro de eliminar este cliente? Esta acción no se puede deshacer.')) return;
        try {
            await ClienteService.deleteCliente(id);
            toast.success('Cliente eliminado correctamente');
            loadClientes();
        } catch (error) {
            console.error(error);
            toast.error('Error al eliminar (verifique si tiene reservas activas)');
        }
    };

    const handleCreate = () => {
        setCurrentCliente({
            nombre: '',
            apellido: '',
            correo: '',
            telefono: '',
            tipoIdentificacion: 'CEDULA',
            activo: true,
            keycloakId: 'not-linked'
        });
        setIdError(null);
        setIsEditing(false);
        setIsDialogOpen(true);
    };

    const handleEdit = (cliente: ClienteDTO) => {
        setCurrentCliente({ ...cliente });
        setIdError(null);
        setIsEditing(true);
        setIsDialogOpen(true);
    };

    const handleIdChange = (val: string) => {
        const formatted = formatIdentification(currentCliente.tipoIdentificacion || 'DNI', val);

        setCurrentCliente({ ...currentCliente, numeroIdentificacion: formatted });

        if (currentCliente.tipoIdentificacion) {
            const error = validateIdentification(currentCliente.tipoIdentificacion, formatted);
            setIdError(error);
        }
    };

    const handleTypeChange = (val: string) => {
        setCurrentCliente({
            ...currentCliente,
            tipoIdentificacion: val as any,
            numeroIdentificacion: ''
        });
        setIdError(null);
    };

    const toggleActivo = async (cliente: ClienteDTO) => {
        if (!cliente.id) return;
        try {
            const updated = { ...cliente, activo: !cliente.activo };
            await ClienteService.updateCliente(cliente.id, updated);
            toast.success(`Cliente ${updated.activo ? 'activado' : 'desactivado'}`);

            // Optimistic update
            setClientes(clientes.map(c => c.id === cliente.id ? updated : c));
        } catch (error) {
            toast.error('Error al actualizar estado');
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        if (currentCliente.tipoIdentificacion && currentCliente.numeroIdentificacion) {
            const error = validateIdentification(currentCliente.tipoIdentificacion, currentCliente.numeroIdentificacion);
            if (error) {
                setIdError(error);
                toast.error(`Error en Identificación: ${error}`);
                return;
            }
        }

        try {
            if (!currentCliente.nombre || !currentCliente.apellido || !currentCliente.correo) {
                toast.error('Nombre, apellido y correo son obligatorios');
                return;
            }

            if (isEditing && currentCliente.id) {
                await ClienteService.updateCliente(currentCliente.id, currentCliente as ClienteDTO);
                toast.success('Cliente actualizado');
            } else {
                await ClienteService.createCliente(currentCliente as NewClienteDTO);
                toast.success('Cliente creado');
            }
            setIsDialogOpen(false);
            loadClientes();
        } catch (error) {
            toast.error('Error al guardar cliente');
        }
    };

    const filteredClientes = clientes.filter(c =>
        c.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.correo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.numeroIdentificacion?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <DashboardLayout title="Gestión de Clientes" role="Administrador">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Base de Datos de Clientes</CardTitle>
                    <div className="flex gap-2">
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar cliente..."
                                className="pl-8 w-[250px]"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button onClick={handleCreate}>
                            <Plus className="mr-2 h-4 w-4" /> Nuevo Cliente
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Nombre Completo</TableHead>
                                <TableHead>Contacto</TableHead>
                                <TableHead>Identificación</TableHead>
                                <TableHead>Activo</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={6} className="text-center">Cargando...</TableCell></TableRow>
                            ) : filteredClientes.length === 0 ? (
                                <TableRow><TableCell colSpan={6} className="text-center">No se encontraron clientes.</TableCell></TableRow>
                            ) : (
                                filteredClientes.map((c) => (
                                    <TableRow key={c.id}>
                                        <TableCell>{c.id}</TableCell>
                                        <TableCell className="font-medium">{c.nombre} {c.apellido}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {c.correo}</span>
                                                <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {c.telefono}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {c.tipoIdentificacion}: {c.numeroIdentificacion}
                                        </TableCell>
                                        <TableCell>
                                            <Switch
                                                checked={c.activo}
                                                onCheckedChange={() => toggleActivo(c)}
                                            />
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => handleEdit(c)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(c.id!)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSave} className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Nombre</Label>
                                <Input value={currentCliente.nombre || ''} onChange={e => setCurrentCliente({ ...currentCliente, nombre: e.target.value })} required />
                            </div>
                            <div className="grid gap-2">
                                <Label>Apellido</Label>
                                <Input value={currentCliente.apellido || ''} onChange={e => setCurrentCliente({ ...currentCliente, apellido: e.target.value })} required />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Correo</Label>
                                <Input type="email" value={currentCliente.correo || ''} onChange={e => setCurrentCliente({ ...currentCliente, correo: e.target.value })} required />
                            </div>
                            <div className="grid gap-2">
                                <Label>Teléfono</Label>
                                <Input value={currentCliente.telefono || ''} onChange={e => setCurrentCliente({ ...currentCliente, telefono: e.target.value })} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Tipo Identificación</Label>
                                <Select
                                    value={currentCliente.tipoIdentificacion || 'CEDULA'}
                                    onValueChange={handleTypeChange}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Tipo" />
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
                                <Label>No. Identificación</Label>
                                <div className="relative">
                                    <Input
                                        value={currentCliente.numeroIdentificacion || ''}
                                        onChange={e => handleIdChange(e.target.value)}
                                        className={idError ? "border-red-500" : ""}
                                        placeholder={IDENTIFICATION_PLACEHOLDERS[currentCliente.tipoIdentificacion as TipoIdentificacion] || ''}
                                    />
                                    {idError && <span className="absolute text-xs text-red-500 -bottom-5 left-0">{idError}</span>}
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label>Dirección</Label>
                            <Input value={currentCliente.direccion || ''} onChange={e => setCurrentCliente({ ...currentCliente, direccion: e.target.value })} />
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch id="active-mode" checked={currentCliente.activo} onCheckedChange={checked => setCurrentCliente({ ...currentCliente, activo: checked })} />
                            <Label htmlFor="active-mode">Cliente Activo</Label>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                            <Button type="submit">Guardar</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
};
