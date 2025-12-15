import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { 
    Pencil, 
    Plus, 
    Calendar, 
    User, 
    Key, 
    Loader2, 
    Briefcase,
    CalendarDays
} from 'lucide-react';

// --- UI COMPONENTS ---
import { Navbar } from '../../components/ui/Navbar';
import { Footer } from '../../components/ui/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { ReservaService, ClienteService, HabitacionService } from '../../services';
import type { ReservaDTO, NewReservaDTO, ClienteDTO, HabitacionDTO } from '../../types/api';

export const EmployeeReservas = () => {
    // --- ESTADOS (Lógica Original) ---
    const [reservas, setReservas] = useState<ReservaDTO[]>([]);
    const [clientes, setClientes] = useState<ClienteDTO[]>([]);
    const [habitaciones, setHabitaciones] = useState<HabitacionDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentReserva, setCurrentReserva] = useState<Partial<ReservaDTO>>({});
    const [isEditing, setIsEditing] = useState(false);

    // --- CARGA DE DATOS ---
    const loadData = async () => {
        try {
            setIsLoading(true);
            const [reservasRes, clientesRes, habitacionesRes] = await Promise.all([
                ReservaService.getReservas({ size: 1000 }), // Traemos más registros
                ClienteService.getClientes({ page: 0, size: 1000 }),
                HabitacionService.getHabitacions()
            ]);
            // Ordenar por ID descendente (más recientes primero)
            const sortedReservas = reservasRes.data.sort((a, b) => (b.id || 0) - (a.id || 0));
            setReservas(sortedReservas);
            setClientes(clientesRes.data);
            setHabitaciones(habitacionesRes.data);
        } catch (error) {
            console.error('Error al cargar datos:', error);
            toast.error('No se pudieron cargar los datos del sistema');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // --- HELPERS ---
    const getClienteName = (id?: number | null) => {
        if (!id) return 'Desconocido';
        const cliente = clientes.find(c => c.id === id);
        return cliente ? `${cliente.nombre} ${cliente.apellido}` : 'Desconocido';
    };

    const getHabitacionInfo = (id?: number | null) => {
        if (!id) return 'N/A';
        const h = habitaciones.find(h => h.id === id);
        return h ? `Hab ${h.numero} - ${h.categoriaHabitacion?.nombre || 'General'}` : 'N/A';
    };

    const getStatusBadge = (status?: string | null) => {
        switch (status) {
            case 'CONFIRMADA': return 'bg-green-100 text-green-700 border-green-200';
            case 'PENDIENTE': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'CANCELADA': return 'bg-red-50 text-red-700 border-red-100';
            case 'CHECK_IN': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'CHECK_OUT': return 'bg-gray-100 text-gray-700 border-gray-200';
            default: return 'bg-gray-50 text-gray-600';
        }
    };

    // --- MANEJADORES DEL FORMULARIO ---
    const handleCreate = () => {
        setCurrentReserva({
            fechaInicio: '',
            fechaFin: '',
            estado: 'PENDIENTE',
            activo: true
        });
        setIsEditing(false);
        setIsDialogOpen(true);
    };

    const handleEdit = (reserva: ReservaDTO) => {
        setCurrentReserva({ ...reserva });
        setIsEditing(true);
        setIsDialogOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (!currentReserva.clienteId || !currentReserva.habitacionId || !currentReserva.fechaInicio || !currentReserva.fechaFin) {
                toast.warning('Por favor complete todos los campos requeridos');
                return;
            }

            const reservaToSave = {
                ...currentReserva,
                fechaReserva: currentReserva.fechaReserva || new Date().toISOString().split('T')[0]
            };

            if (isEditing && currentReserva.id) {
                await ReservaService.updateReserva(currentReserva.id, reservaToSave as ReservaDTO);
                toast.success('Reserva actualizada correctamente');
            } else {
                await ReservaService.createReserva(reservaToSave as NewReservaDTO);
                toast.success('Nueva reserva creada exitosamente');
            }

            setIsDialogOpen(false);
            loadData();
        } catch (error) {
            console.error('Error al guardar:', error);
            toast.error('Ocurrió un error al guardar la reserva');
        }
    };

    // --- RENDER ---
    return (
        <div className="bg-gray-50 min-h-screen font-sans">
            <Navbar />

            {/* --- HERO SECTION --- */}
            <div className="bg-gray-900 pt-32 pb-20 px-6 relative">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end gap-6 relative z-10">
                    <div>
                        <div className="flex items-center gap-2 mb-2 text-blue-400">
                            <Briefcase size={16} />
                            <span className="text-xs font-bold uppercase tracking-widest">Administración</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-wider">
                            Gestión de Reservas
                        </h1>
                        <p className="text-gray-400 mt-2 max-w-xl">
                            Control centralizado de todas las reservas, modificaciones y asignaciones de habitaciones.
                        </p>
                    </div>
                    
                    <Button 
                        onClick={handleCreate} 
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase tracking-widest px-6 py-6 shadow-lg shadow-blue-900/20"
                    >
                        <Plus className="mr-2 h-5 w-5" /> Nueva Reserva
                    </Button>
                </div>
            </div>

            {/* --- CONTENIDO PRINCIPAL --- */}
            <div className="max-w-7xl mx-auto px-6 -mt-8 pb-20 relative z-20">
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                    <Table>
                        <TableHeader className="bg-gray-50">
                            <TableRow>
                                <TableHead className="w-[80px] font-bold text-gray-500 uppercase tracking-wider text-xs py-5 pl-6">ID</TableHead>
                                <TableHead className="font-bold text-gray-500 uppercase tracking-wider text-xs">Cliente</TableHead>
                                <TableHead className="font-bold text-gray-500 uppercase tracking-wider text-xs">Habitación</TableHead>
                                <TableHead className="font-bold text-gray-500 uppercase tracking-wider text-xs">Fechas Estancia</TableHead>
                                <TableHead className="font-bold text-gray-500 uppercase tracking-wider text-xs">Estado</TableHead>
                                <TableHead className="text-right font-bold text-gray-500 uppercase tracking-wider text-xs pr-6">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-64 text-center">
                                        <div className="flex flex-col items-center justify-center text-gray-400 gap-3">
                                            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                                            <p>Cargando registros...</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : reservas.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-64 text-center">
                                        <div className="flex flex-col items-center justify-center text-gray-400 gap-2">
                                            <CalendarDays className="h-10 w-10 opacity-20" />
                                            <p>No hay reservas registradas en el sistema.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                reservas.map((reserva) => (
                                    <TableRow key={reserva.id} className="hover:bg-blue-50/30 transition-colors group">
                                        
                                        {/* ID */}
                                        <TableCell className="pl-6 font-mono text-xs font-bold text-gray-400">
                                            #{reserva.id}
                                        </TableCell>

                                        {/* Cliente */}
                                        <TableCell>
                                            <div className="flex items-center gap-2 font-medium text-gray-900">
                                                <User className="h-4 w-4 text-gray-400" />
                                                {getClienteName(reserva.clienteId)}
                                            </div>
                                        </TableCell>

                                        {/* Habitación */}
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 bg-gray-100 rounded text-gray-500">
                                                    <Key className="h-3 w-3" />
                                                </div>
                                                <span className="text-sm text-gray-700">{getHabitacionInfo(reserva.habitacionId)}</span>
                                            </div>
                                        </TableCell>

                                        {/* Fechas */}
                                        <TableCell>
                                            <div className="space-y-1 text-xs">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-gray-500 w-8">DESDE</span>
                                                    <span className="font-mono text-gray-700">{reserva.fechaInicio}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-gray-500 w-8">HASTA</span>
                                                    <span className="font-mono text-gray-700">{reserva.fechaFin}</span>
                                                </div>
                                            </div>
                                        </TableCell>

                                        {/* Estado */}
                                        <TableCell>
                                            <Badge variant="outline" className={`${getStatusBadge(reserva.estado)} uppercase text-[10px] tracking-widest px-2 py-1`}>
                                                {reserva.estado || 'PENDIENTE'}
                                            </Badge>
                                        </TableCell>

                                        {/* Acciones */}
                                        <TableCell className="text-right pr-6">
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                onClick={() => handleEdit(reserva)}
                                                className="hover:bg-blue-100 hover:text-blue-700"
                                            >
                                                <Pencil className="h-4 w-4" />
                                                <span className="sr-only">Editar</span>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* --- MODAL (DIALOG) --- */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[600px] bg-white p-0 overflow-hidden gap-0 rounded-xl">
                    <DialogHeader className="bg-gray-50 p-6 border-b border-gray-100">
                        <DialogTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
                            {isEditing ? <Pencil className="h-5 w-5 text-blue-600"/> : <Plus className="h-5 w-5 text-blue-600"/>}
                            {isEditing ? 'Modificar Reserva Existente' : 'Crear Nueva Reserva'}
                        </DialogTitle>
                    </DialogHeader>
                    
                    <form onSubmit={handleSave} className="p-6 grid gap-6">
                        
                        {/* Fila 1: Cliente y Habitación */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="cliente" className="text-xs font-bold uppercase text-gray-500">Cliente</Label>
                                <Select
                                    value={currentReserva.clienteId?.toString()}
                                    onValueChange={(val) => setCurrentReserva({ ...currentReserva, clienteId: Number(val) })}
                                >
                                    <SelectTrigger className="bg-gray-50 border-gray-200 py-5">
                                        <SelectValue placeholder="Seleccione cliente" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {clientes.map(cliente => (
                                            <SelectItem key={cliente.id} value={cliente.id?.toString() || ''}>
                                                {cliente.nombre} {cliente.apellido}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="habitacion" className="text-xs font-bold uppercase text-gray-500">Habitación</Label>
                                <Select
                                    value={currentReserva.habitacionId?.toString()}
                                    onValueChange={(val) => setCurrentReserva({ ...currentReserva, habitacionId: Number(val) })}
                                >
                                    <SelectTrigger className="bg-gray-50 border-gray-200 py-5">
                                        <SelectValue placeholder="Seleccione habitación" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {habitaciones.map(hab => (
                                            <SelectItem key={hab.id} value={hab.id?.toString() || ''}>
                                                Hab {hab.numero} - {hab.categoriaHabitacion?.nombre || 'General'}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Fila 2: Fechas */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="fechaInicio" className="text-xs font-bold uppercase text-gray-500">Fecha Entrada</Label>
                                <div className="relative">
                                    <Input
                                        id="fechaInicio"
                                        type="date"
                                        className="bg-gray-50 border-gray-200 py-5 pl-10 block"
                                        value={currentReserva.fechaInicio || ''}
                                        onChange={(e) => setCurrentReserva({ ...currentReserva, fechaInicio: e.target.value })}
                                    />
                                    <Calendar className="absolute left-3 top-3 text-gray-400 h-4 w-4"/>
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="fechaFin" className="text-xs font-bold uppercase text-gray-500">Fecha Salida</Label>
                                <div className="relative">
                                    <Input
                                        id="fechaFin"
                                        type="date"
                                        className="bg-gray-50 border-gray-200 py-5 pl-10 block"
                                        value={currentReserva.fechaFin || ''}
                                        onChange={(e) => setCurrentReserva({ ...currentReserva, fechaFin: e.target.value })}
                                    />
                                    <Calendar className="absolute left-3 top-3 text-gray-400 h-4 w-4"/>
                                </div>
                            </div>
                        </div>

                        {/* Fila 3: Estado */}
                        <div className="grid gap-2">
                            <Label htmlFor="estado" className="text-xs font-bold uppercase text-gray-500">Estado de la Reserva</Label>
                            <Select
                                value={currentReserva.estado || 'PENDIENTE'}
                                onValueChange={(val) => setCurrentReserva({ ...currentReserva, estado: val })}
                            >
                                <SelectTrigger className="bg-gray-50 border-gray-200 py-5">
                                    <SelectValue placeholder="Seleccione estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PENDIENTE">PENDIENTE (Por confirmar)</SelectItem>
                                    <SelectItem value="CONFIRMADA">CONFIRMADA (Lista para llegada)</SelectItem>
                                    <SelectItem value="CHECK_IN">CHECK_IN (Huésped en casa)</SelectItem>
                                    <SelectItem value="CHECK_OUT">CHECK_OUT (Finalizada)</SelectItem>
                                    <SelectItem value="CANCELADA">CANCELADA</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <DialogFooter className="pt-4 border-t border-gray-100">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="py-5">
                                Cancelar Operación
                            </Button>
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 py-5 px-8 font-bold uppercase tracking-wider text-xs">
                                {isEditing ? 'Guardar Cambios' : 'Registrar Reserva'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Footer />
        </div>
    );
};