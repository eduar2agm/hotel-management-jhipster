import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { 
    Mail, 
    Phone, 
    Plus, 
    Search, 
    Pencil, 
    Trash2, 
    Users, 
    Loader2,
    Contact,
    MapPin,
    CreditCard
} from 'lucide-react';

// --- UI COMPONENTS ---
import { Navbar } from '../../components/ui/Navbar';
import { Footer } from '../../components/ui/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
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

// --- SERVICES & TYPES ---
import { ClienteService } from '../../services';
import type { ClienteDTO, NewClienteDTO } from '../../types/api';

export const AdminClientes = () => {
    // --- ESTADOS (Lógica Original) ---
    const [clientes, setClientes] = useState<ClienteDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentCliente, setCurrentCliente] = useState<Partial<ClienteDTO>>({});
    const [isEditing, setIsEditing] = useState(false);

    // --- CARGA DE DATOS ---
    const loadClientes = async () => {
        setLoading(true);
        try {
            const res = await ClienteService.getClientes({ page: 0, size: 50 });
            // Ordenar alfabéticamente por apellido
            const sorted = res.data.sort((a, b) => (a.apellido || '').localeCompare(b.apellido || ''));
            setClientes(sorted);
        } catch (error) {
            toast.error('Error al cargar la base de datos de clientes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadClientes();
    }, []);

    // --- ACCIONES ---
    const handleDelete = async (id: number) => {
        if (!confirm('¿Está seguro de eliminar este cliente? Esta acción es irreversible.')) return;
        try {
            await ClienteService.deleteCliente(id);
            toast.success('Cliente eliminado correctamente');
            loadClientes();
        } catch (error) {
            console.error(error);
            toast.error('No se puede eliminar (verifique reservas activas)');
        }
    };

    const handleCreate = () => {
        setCurrentCliente({
            nombre: '',
            apellido: '',
            correo: '',
            telefono: '',
            tipoIdentificacion: 'DNI',
            activo: true
        });
        setIsEditing(false);
        setIsDialogOpen(true);
    };

    const handleEdit = (cliente: ClienteDTO) => {
        setCurrentCliente({ ...cliente });
        setIsEditing(true);
        setIsDialogOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (!currentCliente.nombre || !currentCliente.apellido || !currentCliente.correo) {
                toast.warning('Los campos Nombre, Apellido y Correo son obligatorios');
                return;
            }

            if (isEditing && currentCliente.id) {
                await ClienteService.updateCliente(currentCliente.id, currentCliente as ClienteDTO);
                toast.success('Ficha de cliente actualizada');
            } else {
                await ClienteService.createCliente(currentCliente as NewClienteDTO);
                toast.success('Nuevo cliente registrado');
            }
            setIsDialogOpen(false);
            loadClientes();
        } catch (error) {
            toast.error('Error al guardar la información');
        }
    };

    // --- FILTRADO ---
    const filteredClientes = clientes.filter(c =>
        c.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.correo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.numeroIdentificacion?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // --- RENDER ---
    return (
        <div className="bg-gray-50 min-h-screen font-sans">
            <Navbar />

            {/* --- HERO SECTION --- */}
            <div className="bg-slate-900 pt-32 pb-24 px-6 relative">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end gap-6 relative z-10">
                    <div>
                        <div className="flex items-center gap-2 mb-2 text-slate-400">
                            <Users size={16} />
                            <span className="text-xs font-bold uppercase tracking-widest">Base de Datos</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-wider">
                            Gestión de Clientes
                        </h1>
                        <p className="text-slate-400 mt-2 max-w-xl">
                            Administra la información de contacto y documentos de los huéspedes registrados.
                        </p>
                    </div>
                    
                    <Button 
                        onClick={handleCreate} 
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase tracking-widest px-6 py-6 shadow-lg shadow-blue-900/20"
                    >
                        <Plus className="mr-2 h-5 w-5" /> Nuevo Cliente
                    </Button>
                </div>
            </div>

            {/* --- BARRA DE BÚSQUEDA FLOTANTE --- */}
            <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-20">
                <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-3.5 text-gray-400 h-5 w-5" />
                        <Input
                            placeholder="Buscar por nombre, correo o documento de identidad..."
                            className="pl-10 py-6 text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 bg-gray-50"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="text-sm text-gray-500 px-4 whitespace-nowrap">
                        <strong>{filteredClientes.length}</strong> Registros encontrados
                    </div>
                </div>
            </div>

            {/* --- TABLA --- */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                <Card className="border-none shadow-sm bg-white overflow-hidden rounded-xl">
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-gray-50">
                                <TableRow>
                                    <TableHead className="w-[80px] font-bold text-gray-500 uppercase tracking-wider text-xs py-5 pl-6">ID</TableHead>
                                    <TableHead className="font-bold text-gray-500 uppercase tracking-wider text-xs">Cliente</TableHead>
                                    <TableHead className="font-bold text-gray-500 uppercase tracking-wider text-xs">Contacto</TableHead>
                                    <TableHead className="font-bold text-gray-500 uppercase tracking-wider text-xs">Identificación</TableHead>
                                    <TableHead className="text-right font-bold text-gray-500 uppercase tracking-wider text-xs pr-6">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-64 text-center">
                                            <div className="flex flex-col items-center justify-center text-gray-400 gap-3">
                                                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                                                <p>Cargando directorio...</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredClientes.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-64 text-center text-gray-400">
                                            No se encontraron clientes con ese criterio.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredClientes.map((c) => {
                                        // Iniciales para Avatar
                                        const avatar = `${c.nombre?.charAt(0)}${c.apellido?.charAt(0)}`.toUpperCase();
                                        
                                        return (
                                            <TableRow key={c.id} className="hover:bg-slate-50 transition-colors group">
                                                
                                                {/* ID */}
                                                <TableCell className="pl-6 font-mono text-xs font-bold text-gray-400">
                                                    #{c.id}
                                                </TableCell>

                                                {/* Nombre + Avatar */}
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs border border-slate-200">
                                                            {avatar}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-900 text-sm">{c.nombre} {c.apellido}</p>
                                                            {c.direccion && (
                                                                <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                                                                    <MapPin className="h-3 w-3" /> {c.direccion}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                {/* Contacto */}
                                                <TableCell>
                                                    <div className="flex flex-col gap-1 text-sm">
                                                        <div className="flex items-center gap-2 text-gray-700">
                                                            <Mail className="h-3 w-3 text-gray-400" /> 
                                                            {c.correo}
                                                        </div>
                                                        {c.telefono && (
                                                            <div className="flex items-center gap-2 text-gray-500 text-xs">
                                                                <Phone className="h-3 w-3 text-gray-400" /> 
                                                                {c.telefono}
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>

                                                {/* Identificación */}
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline" className="text-[10px] uppercase text-gray-500 border-gray-200">
                                                            {c.tipoIdentificacion || 'ID'}
                                                        </Badge>
                                                        <span className="font-mono text-xs text-gray-700 font-medium">
                                                            {c.numeroIdentificacion || '---'}
                                                        </span>
                                                    </div>
                                                </TableCell>

                                                {/* Acciones */}
                                                <TableCell className="text-right pr-6">
                                                    <div className="flex justify-end gap-1">
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            onClick={() => handleEdit(c)}
                                                            className="hover:bg-blue-50 hover:text-blue-600"
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            className="text-gray-400 hover:text-red-600 hover:bg-red-50" 
                                                            onClick={() => handleDelete(c.id!)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {/* --- MODAL (DIALOG) --- */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[600px] bg-white p-0 overflow-hidden gap-0 rounded-xl">
                    <DialogHeader className="bg-gray-50 p-6 border-b border-gray-100">
                        <DialogTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
                            {isEditing ? <Contact className="h-5 w-5 text-blue-600"/> : <Plus className="h-5 w-5 text-blue-600"/>}
                            {isEditing ? 'Editar Ficha de Cliente' : 'Registrar Nuevo Cliente'}
                        </DialogTitle>
                    </DialogHeader>
                    
                    <form onSubmit={handleSave} className="p-6 grid gap-6">
                        
                        {/* Nombre y Apellido */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label className="text-xs font-bold uppercase text-gray-500">Nombre</Label>
                                <Input 
                                    value={currentCliente.nombre || ''} 
                                    onChange={e => setCurrentCliente({ ...currentCliente, nombre: e.target.value })} 
                                    required 
                                    className="bg-gray-50 border-gray-200 focus:border-blue-500 py-5"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label className="text-xs font-bold uppercase text-gray-500">Apellido</Label>
                                <Input 
                                    value={currentCliente.apellido || ''} 
                                    onChange={e => setCurrentCliente({ ...currentCliente, apellido: e.target.value })} 
                                    required 
                                    className="bg-gray-50 border-gray-200 focus:border-blue-500 py-5"
                                />
                            </div>
                        </div>

                        {/* Contacto */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label className="text-xs font-bold uppercase text-gray-500">Correo Electrónico</Label>
                                <div className="relative">
                                    <Input 
                                        type="email" 
                                        value={currentCliente.correo || ''} 
                                        onChange={e => setCurrentCliente({ ...currentCliente, correo: e.target.value })} 
                                        required 
                                        className="bg-gray-50 border-gray-200 focus:border-blue-500 py-5 pl-10"
                                    />
                                    <Mail className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label className="text-xs font-bold uppercase text-gray-500">Teléfono</Label>
                                <div className="relative">
                                    <Input 
                                        value={currentCliente.telefono || ''} 
                                        onChange={e => setCurrentCliente({ ...currentCliente, telefono: e.target.value })} 
                                        className="bg-gray-50 border-gray-200 focus:border-blue-500 py-5 pl-10"
                                    />
                                    <Phone className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
                                </div>
                            </div>
                        </div>

                        {/* Documentación */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label className="text-xs font-bold uppercase text-gray-500">Tipo Documento</Label>
                                <Select
                                    value={currentCliente.tipoIdentificacion || 'DNI'}
                                    onValueChange={(val) => setCurrentCliente({ ...currentCliente, tipoIdentificacion: val })}
                                >
                                    <SelectTrigger className="bg-gray-50 border-gray-200 py-5">
                                        <SelectValue placeholder="Seleccione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="DNI">DNI / Cédula</SelectItem>
                                        <SelectItem value="PASAPORTE">Pasaporte</SelectItem>
                                        <SelectItem value="LICENCIA">Licencia</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label className="text-xs font-bold uppercase text-gray-500">Número Documento</Label>
                                <div className="relative">
                                    <Input 
                                        value={currentCliente.numeroIdentificacion || ''} 
                                        onChange={e => setCurrentCliente({ ...currentCliente, numeroIdentificacion: e.target.value })} 
                                        className="bg-gray-50 border-gray-200 focus:border-blue-500 py-5 pl-10"
                                    />
                                    <CreditCard className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
                                </div>
                            </div>
                        </div>

                        {/* Dirección */}
                        <div className="grid gap-2">
                            <Label className="text-xs font-bold uppercase text-gray-500">Dirección Física</Label>
                            <div className="relative">
                                <Input 
                                    value={currentCliente.direccion || ''} 
                                    onChange={e => setCurrentCliente({ ...currentCliente, direccion: e.target.value })} 
                                    className="bg-gray-50 border-gray-200 focus:border-blue-500 py-5 pl-10"
                                />
                                <MapPin className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
                            </div>
                        </div>

                        <DialogFooter className="pt-4 border-t border-gray-100">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="py-5">
                                Cancelar
                            </Button>
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 py-5 px-8 font-bold uppercase tracking-wider text-xs">
                                {isEditing ? 'Actualizar Ficha' : 'Guardar Cliente'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Footer />
        </div>
    );
};