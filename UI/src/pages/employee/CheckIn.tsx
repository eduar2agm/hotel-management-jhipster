import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { LogIn, LogOut, Search, User, Key, Calendar, Loader2, Filter } from 'lucide-react';

import { Navbar } from '../../components/ui/Navbar';
import { Footer } from '../../components/ui/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';

// --- LOGIC & SERVICES ---
import { ReservaService, ClienteService, HabitacionService } from '../../services';
import type { ReservaDTO, ClienteDTO, HabitacionDTO } from '../../types/api';

export const CheckIn = () => {
    // --- ESTADOS Y LÓGICA (Mantenida intacta) ---
    const [reservas, setReservas] = useState<ReservaDTO[]>([]);
    const [clientes, setClientes] = useState<ClienteDTO[]>([]);
    const [habitaciones, setHabitaciones] = useState<HabitacionDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const loadData = async () => {
        try {
            setIsLoading(true);
            const [reservasRes, clientesRes, habitacionesRes] = await Promise.all([
                ReservaService.getReservas({ size: 1000 }), // Traemos todas para filtrar localmente
                ClienteService.getClientes({ page: 0, size: 1000 }),
                HabitacionService.getHabitacions({ size: 1000 })
            ]);
            setReservas(reservasRes.data);
            setClientes(clientesRes.data);
            setHabitaciones(habitacionesRes.data);
        } catch (error) {
            console.error(error);
            toast.error('Error al cargar datos del sistema');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // --- HELPERS ---
    const getClienteObj = (id?: number | null) => clientes.find(client => client.id === id);
    
    const getClienteName = (id?: number | null) => {
        const c = getClienteObj(id);
        return c ? `${c.nombre} ${c.apellido}` : 'Huésped Desconocido';
    };

    const getHabitacionInfo = (id?: number | null) => {
        const h = habitaciones.find(hab => hab.id === id);
        return h ? h.numero : 'N/A';
    };

    // --- ACCIONES ---
    const handleCheckIn = async (reserva: ReservaDTO) => {
        if (!confirm(`¿Confirmar entrada para ${getClienteName(reserva.clienteId)}?`)) return;
        try {
            const updated = { ...reserva, estado: 'CHECK_IN' };
            await ReservaService.updateReserva(reserva.id!, updated);
            toast.success(`Check-In exitoso. Bienvenido/a ${getClienteName(reserva.clienteId)}`);
            loadData();
        } catch (error) {
            toast.error('No se pudo procesar el Check-In');
        }
    };

    const handleCheckOut = async (reserva: ReservaDTO) => {
        if (!confirm(`¿Confirmar salida y cierre de cuenta para ${getClienteName(reserva.clienteId)}?`)) return;
        try {
            const updated = { ...reserva, estado: 'CHECK_OUT' };
            await ReservaService.updateReserva(reserva.id!, updated);
            toast.success('Check-Out procesado. Habitación liberada.');
            loadData();
        } catch (error) {
            toast.error('No se pudo procesar el Check-Out');
        }
    };

    // --- FILTRADO ---
    const filteredReservas = reservas.filter(r => {
        const clienteName = getClienteName(r.clienteId).toLowerCase();
        const matchesSearch = clienteName.includes(searchTerm.toLowerCase()) || r.id?.toString().includes(searchTerm);
        // Solo mostramos lo que requiere acción operativa (Llegadas o Huéspedes en casa)
        const isActionable = r.estado === 'CONFIRMADA' || r.estado === 'CHECK_IN' || r.estado === 'PENDIENTE';
        return matchesSearch && isActionable;
    });

    // Ordenar: Primero los que están CHECK_IN (en casa), luego los que van a llegar (PENDIENTE/CONFIRMADA)
    filteredReservas.sort((a, b) => {
        if (a.estado === 'CHECK_IN' && b.estado !== 'CHECK_IN') return -1;
        if (a.estado !== 'CHECK_IN' && b.estado === 'CHECK_IN') return 1;
        return 0;
    });

    return (
        <div className="bg-gray-50 min-h-screen font-sans">
            <Navbar />

            {/* --- HERO SECTION --- */}
            <div className="bg-gray-900 pt-32 pb-24 px-6 relative">
                <div className="max-w-7xl mx-auto relative z-10">
                    <h1 className="text-3xl font-black text-white uppercase tracking-wider mb-2">
                        Recepción & Conserjería
                    </h1>
                    <p className="text-gray-400 max-w-2xl">
                        Gestiona el flujo de huéspedes. Realiza entradas y salidas de manera eficiente.
                    </p>
                </div>
            </div>

            {/* --- BARRA DE BÚSQUEDA FLOTANTE --- */}
            <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-20">
                <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-3.5 text-gray-400 h-5 w-5" />
                        <Input
                            placeholder="Buscar por nombre de huésped, apellido o ID de reserva..."
                            className="pl-10 py-6 text-base border-gray-200 focus:border-yellow-500 focus:ring-yellow-500/20 bg-gray-50"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 px-4">
                        <Filter className="h-4 w-4" />
                        <span>Mostrando: <strong>{filteredReservas.length}</strong> activos</span>
                    </div>
                </div>
            </div>

            {/* --- TABLA DE DATOS --- */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                <Card className="border-none shadow-sm bg-white overflow-hidden rounded-xl">
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-gray-50">
                                <TableRow>
                                    <TableHead className="w-[100px] font-bold text-gray-500 uppercase tracking-wider text-xs py-5">Reserva</TableHead>
                                    <TableHead className="font-bold text-gray-500 uppercase tracking-wider text-xs">Huésped</TableHead>
                                    <TableHead className="font-bold text-gray-500 uppercase tracking-wider text-xs">Habitación</TableHead>
                                    <TableHead className="font-bold text-gray-500 uppercase tracking-wider text-xs">Fechas</TableHead>
                                    <TableHead className="font-bold text-gray-500 uppercase tracking-wider text-xs">Estado</TableHead>
                                    <TableHead className="text-right font-bold text-gray-500 uppercase tracking-wider text-xs">Acción Requerida</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-64 text-center">
                                            <div className="flex flex-col items-center justify-center text-gray-400 gap-3">
                                                <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
                                                <p>Sincronizando con el sistema...</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredReservas.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-64 text-center">
                                            <div className="flex flex-col items-center justify-center text-gray-400 gap-2">
                                                <Search className="h-10 w-10 opacity-20" />
                                                <p>No se encontraron huéspedes con ese criterio.</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredReservas.map(r => {
                                        const cliente = getClienteObj(r.clienteId);
                                        // Generar iniciales para el avatar
                                        const iniciales = cliente 
                                            ? `${cliente.nombre?.charAt(0)}${cliente.apellido?.charAt(0)}`.toUpperCase() 
                                            : "??";

                                        return (
                                            <TableRow key={r.id} className="hover:bg-gray-50/50 transition-colors group">
                                                
                                                {/* ID Reserva */}
                                                <TableCell className="font-mono text-xs font-bold text-gray-400">
                                                    #{r.id}
                                                </TableCell>

                                                {/* Huésped con Avatar */}
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-xs border border-gray-200">
                                                            {iniciales}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-900">{getClienteName(r.clienteId)}</p>
                                                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                                                <User className="h-3 w-3" /> Cliente Registrado
                                                            </p>
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                {/* Habitación */}
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <div className="p-2 bg-yellow-50 rounded-lg text-yellow-600">
                                                            <Key className="h-4 w-4" />
                                                        </div>
                                                        <span className="font-bold text-gray-800 text-lg">
                                                            {getHabitacionInfo(r.habitacionId)}
                                                        </span>
                                                    </div>
                                                </TableCell>

                                                {/* Fechas */}
                                                <TableCell>
                                                    <div className="space-y-1 text-sm">
                                                        <div className="flex items-center gap-2 text-green-700 font-regular">
                                                            <span className="text-[10px]  text-gray-400 w-8">In</span>
                                                            <Calendar className="h-3 w-3" />
                                                            {r.fechaInicio}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-red-700 font-regular">
                                                            <span className="text-[10px]  text-gray-400 w-8">Out</span>
                                                            <Calendar className="h-3 w-3" />
                                                            {r.fechaFin}
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                {/* Estado */}
                                                <TableCell>
                                                    {r.estado === 'CHECK_IN' ? (
                                                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200 shadow-none uppercase text-[10px] tracking-widest px-3 py-1">
                                                            En Casa
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 uppercase text-[10px] tracking-widest px-3 py-1">
                                                            Por Llegar
                                                        </Badge>
                                                    )}
                                                </TableCell>

                                                {/* Acciones */}
                                                <TableCell className="text-right">
                                                    {(r.estado === 'PENDIENTE' || r.estado === 'CONFIRMADA') && (
                                                        <Button 
                                                            size="sm" 
                                                            onClick={() => handleCheckIn(r)} 
                                                            className="bg-green-600 hover:bg-green-700 text-white font-bold uppercase text-[10px] tracking-widest shadow-md"
                                                        >
                                                            <LogIn className="mr-2 h-3 w-3" /> Check-In
                                                        </Button>
                                                    )}
                                                    
                                                    {r.estado === 'CHECK_IN' && (
                                                        <Button 
                                                            size="sm" 
                                                            onClick={() => handleCheckOut(r)} 
                                                            className="bg-white border border-red-200 text-red-600 hover:bg-red-50 font-bold uppercase text-[10px] tracking-widest"
                                                        >
                                                            <LogOut className="mr-2 h-3 w-3" /> Check-Out
                                                        </Button>
                                                    )}
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

            <Footer />
        </div>
    );
};