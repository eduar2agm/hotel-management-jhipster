import { useEffect, useState } from 'react';
import { ClienteService } from '../../services';
import type { ClienteDTO, NewClienteDTO } from '../../types/api';
import { useAuth } from '../../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Mail, Phone, Plus, Search, Pencil, Trash2, User, UserCircle, MapPin, ShieldCheck, CheckCircle2, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '../../components/ui/Navbar';
import { Footer } from '../../components/ui/Footer';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
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
import { ActiveFilter } from '@/components/ui/ActiveFilter';
import { cn } from '@/lib/utils';

export const AdminClientes = () => {
    const { isAdmin } = useAuth();
    const [clientes, setClientes] = useState<ClienteDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const itemsPerPage = 10;
    const [searchTerm, setSearchTerm] = useState('');
    const [showInactive, setShowInactive] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentCliente, setCurrentCliente] = useState<Partial<ClienteDTO>>({});
    const [isEditing, setIsEditing] = useState(false);
    const [idError, setIdError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);



    const loadClientes = async () => {
        setLoading(true);
        try {
            const res = showInactive
                ? await ClienteService.getClientesInactivos({
                    page: currentPage,
                    size: itemsPerPage
                })
                : await ClienteService.getClientes({
                    page: currentPage,
                    size: itemsPerPage
                });
            setClientes(res.data);
            const total = parseInt(res.headers['x-total-count'] || '0', 10);
            setTotalItems(total);
        } catch (error) {
            toast.error('Error al cargar clientes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadClientes();
    }, [currentPage, showInactive]);

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
            if (cliente.activo) {
                await ClienteService.desactivarCliente(cliente.id);
                toast.success('Cliente desactivado');
            } else {
                await ClienteService.activarCliente(cliente.id);
                toast.success('Cliente activado');
            }
            loadClientes();
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

            setSaving(true);
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
        } finally {
            setSaving(false);
        }
    };

    const filteredClientes = clientes.filter(c =>
        c.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.correo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.numeroIdentificacion?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getInitials = (firstName?: string, lastName?: string) => {
        return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
    };

    return (
        <div className="font-sans text-gray-900 bg-gray-50 min-h-screen flex flex-col">
            <Navbar />

            {/* HERO SECTION */}
            <div className="bg-[#0F172A] pt-32 pb-16 px-4 md:px-8 lg:px-20 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 pointer-events-none">
                    <UserCircle className="w-96 h-96 text-white" />
                </div>
                <div className="relative max-w-7xl mx-auto z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <span className="text-yellow-500 font-bold tracking-[0.2em] uppercase text-xs mb-2 block">Administración</span>
                        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-2">
                            Gestión de Clientes
                        </h1>
                        <p className="text-slate-400 text-lg max-w-2xl">
                            Administre la base de datos de huéspedes, perfiles y estados de cuenta.
                        </p>
                    </div>
                    <div>
                        <Button
                            onClick={handleCreate}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white border-0 shadow-lg hover:shadow-yellow-600/20 transition-all rounded-sm px-6 py-6 text-sm uppercase tracking-widest font-bold"
                        >
                            <Plus className="mr-2 h-5 w-5" /> Nuevo Cliente
                        </Button>
                    </div>
                </div>
            </div>

            <main className="flex-grow py-10 px-4 md:px-8 lg:px-20 -mt-10 relative z-10">
                <Card className="max-w-7xl mx-auto border-t-4 border-yellow-600 shadow-xl bg-white">
                    <CardHeader className="border-b bg-gray-50/50 pb-6">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <div>
                                <CardTitle className="text-xl font-bold text-gray-800">Directorio de Huéspedes</CardTitle>
                                <CardDescription>Total de clientes: {totalItems}</CardDescription>
                            </div>
                            <div className="flex flex-col md:flex-row gap-4 items-center w-full md:w-auto">
                                <ActiveFilter
                                    showInactive={showInactive}
                                    onChange={(val) => {
                                        setShowInactive(val);
                                        setCurrentPage(0);
                                    }}
                                />
                                <div className="relative w-full md:w-96 group">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-yellow-600 transition-colors" />
                                    <Input
                                        placeholder="Buscar por nombre, correo o ID..."
                                        className="pl-10 border-gray-200 focus:border-yellow-600 focus:ring-yellow-600/20 h-11 transition-all"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                    </CardHeader>
                    <CardContent className="p-10">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50 hover:bg-gray-50 border-b border-gray-100">
                                        <TableHead className="w-[80px] text-xs font-bold uppercase tracking-wider text-gray-500">ID</TableHead>
                                        <TableHead className="text-xs font-bold uppercase tracking-wider text-gray-500">Cliente</TableHead>
                                        <TableHead className="text-xs font-bold uppercase tracking-wider text-gray-500">Contacto</TableHead>
                                        <TableHead className="text-xs font-bold uppercase tracking-wider text-gray-500">Identificación</TableHead>
                                        <TableHead className="text-xs font-bold uppercase tracking-wider text-gray-500">Estado</TableHead>
                                        <TableHead className="text-right text-xs font-bold uppercase tracking-wider text-gray-500 p-4">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-32 text-center text-gray-500">
                                                <div className="flex flex-col items-center justify-center gap-2">
                                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-600"></div>
                                                    <span>Cargando directorio...</span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredClientes.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-32 text-center text-gray-500">
                                                No se encontraron resultados para "{searchTerm}"
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredClientes.map((c) => (
                                            <TableRow key={c.id} className="hover:bg-slate-50/80 transition-colors group">
                                                <TableCell className="font-mono text-xs text-gray-400">#{c.id}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold border-2 border-white shadow-sm group-hover:border-yellow-100 transition-colors">
                                                            {getInitials(c.nombre, c.apellido)}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-900 group-hover:text-yellow-700 transition-colors">{c.nombre} {c.apellido}</p>
                                                            <div className="flex items-center gap-1 text-xs text-gray-400">
                                                                <User className="h-3 w-3" />
                                                                {c.keycloakId && c.keycloakId !== 'not-linked' ? 'Cuenta Vinculada' : 'Sin Cuenta'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-1 text-sm text-gray-600">
                                                        <span className="flex items-center gap-2">
                                                            <Mail className="h-3.5 w-3.5 text-gray-400" /> {c.correo}
                                                        </span>
                                                        <span className="flex items-center gap-2">
                                                            <Phone className="h-3.5 w-3.5 text-gray-400" /> {c.telefono || '-'}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <ShieldCheck className="h-4 w-4 text-green-600" />
                                                        <span className="font-medium text-gray-700">{c.tipoIdentificacion}</span>
                                                        <span className="text-gray-500 font-mono tracking-wide">{c.numeroIdentificacion}</span>
                                                    </div>
                                                    {c.direccion && (
                                                        <div className="flex items-center gap-1 mt-1 text-xs text-gray-400 truncate max-w-[200px]">
                                                            <MapPin className="h-3 w-3" /> {c.direccion}
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <Switch
                                                            checked={c.activo}
                                                            onCheckedChange={() => toggleActivo(c)}
                                                            className="scale-90"
                                                        />
                                                        {c.activo ? (
                                                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1 pl-1 pr-2">
                                                                <CheckCircle2 className="h-3 w-3" /> Activo
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 gap-1 pl-1 pr-2">
                                                                <XCircle className="h-3 w-3" /> Inactivo
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right p-4">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            disabled={!c.activo}
                                                            className={cn(
                                                                "h-8 border-gray-200",
                                                                c.activo
                                                                    ? "hover:border-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                                                                    : "opacity-50 cursor-not-allowed"
                                                            )}
                                                            onClick={() => handleEdit(c)}
                                                        >
                                                            <Pencil className="h-3.5 w-3.5 mr-1" /> Editar
                                                        </Button>
                                                        {isAdmin() && (
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 border-gray-200"
                                                                onClick={() => handleDelete(c.id!)}
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* PAGINATION */}
                <div className="mt-4 flex items-center justify-end gap-4 max-w-7xl mx-auto px-10">
                    <span className="text-sm text-gray-500">
                        Página {currentPage + 1} de {Math.max(1, Math.ceil(totalItems / itemsPerPage))}
                    </span>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                            disabled={currentPage === 0 || loading}
                            className="bg-white border-gray-200"
                        >
                            <ChevronLeft className="h-4 w-4" /> Anterior
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(p => p + 1)}
                            disabled={(currentPage + 1) * itemsPerPage >= totalItems || loading}
                            className="bg-white border-gray-200"
                        >
                            Siguiente <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="max-w-md p-0 overflow-hidden border-0 shadow-2xl">
                        <DialogHeader className="bg-[#0F172A] text-white p-6">
                            <DialogTitle className="text-xl font-bold flex items-center gap-2">
                                {isEditing ? <Pencil className="h-5 w-5 text-yellow-500" /> : <Plus className="h-5 w-5 text-yellow-500" />}
                                {isEditing ? 'Editar Perfil' : 'Nuevo Cliente'}
                            </DialogTitle>
                            <DialogDescription className="text-slate-400">
                                Información de registro.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSave} className="p-6 bg-white overflow-y-auto max-h-[80vh]">
                            <div className="space-y-4 mb-6">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b pb-2">Datos Personales</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label className="text-xs font-semibold">Nombre</Label>
                                        <Input
                                            value={currentCliente.nombre || ''}
                                            onChange={e => setCurrentCliente({ ...currentCliente, nombre: e.target.value })}
                                            required
                                            className="h-9"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label className="text-xs font-semibold">Apellido</Label>
                                        <Input
                                            value={currentCliente.apellido || ''}
                                            onChange={e => setCurrentCliente({ ...currentCliente, apellido: e.target.value })}
                                            required
                                            className="h-9"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label className="text-xs font-semibold">Tipo ID</Label>
                                        <Select
                                            value={currentCliente.tipoIdentificacion || 'CEDULA'}
                                            onValueChange={handleTypeChange}
                                        >
                                            <SelectTrigger className="h-9">
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
                                        <Label className="text-xs font-semibold">Número ID</Label>
                                        <div className="relative">
                                            <Input
                                                value={currentCliente.numeroIdentificacion || ''}
                                                onChange={e => handleIdChange(e.target.value)}
                                                className={`h-9 ${idError ? "border-red-500" : ""}`}
                                                placeholder={IDENTIFICATION_PLACEHOLDERS[currentCliente.tipoIdentificacion as TipoIdentificacion] || ''}
                                            />
                                            {idError && <span className="absolute text-[10px] text-red-500 -bottom-4 left-0">{idError}</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 mb-6">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b pb-2">Contacto</h4>
                                <div className="grid gap-2">
                                    <Label className="text-xs font-semibold">Correo Electrónico</Label>
                                    <Input
                                        type="email"
                                        value={currentCliente.correo || ''}
                                        onChange={e => setCurrentCliente({ ...currentCliente, correo: e.target.value })}
                                        required
                                        className="h-9"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label className="text-xs font-semibold">Teléfono</Label>
                                        <Input
                                            value={currentCliente.telefono || ''}
                                            onChange={e => setCurrentCliente({ ...currentCliente, telefono: e.target.value })}
                                            className="h-9"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label className="text-xs font-semibold">Dirección</Label>
                                        <Input
                                            value={currentCliente.direccion || ''}
                                            onChange={e => setCurrentCliente({ ...currentCliente, direccion: e.target.value })}
                                            className="h-9"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded-md">
                                <Switch id="active-mode" checked={currentCliente.activo} onCheckedChange={checked => setCurrentCliente({ ...currentCliente, activo: checked })} />
                                <Label htmlFor="active-mode" className="cursor-pointer font-medium">Cuenta Activa</Label>
                            </div>

                            <DialogFooter className="pt-6 mt-4 border-t">
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="h-10">Cancelar</Button>
                                <Button type="submit" className="bg-yellow-600 hover:bg-yellow-700 text-white h-10 px-8">
                                    {saving ? 'Guardando...' : 'Guardar Cliente'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </main>

            <Footer />
        </div >
    );
};
