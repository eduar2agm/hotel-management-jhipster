import { useState } from 'react';
import { ReservaService, ReservaDetalleService, CheckInCheckOutService, EstadoHabitacionService, HabitacionService } from '../../services';
import type { ReservaDTO, ReservaDetalleDTO, CheckInCheckOutDTO } from '../../types/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Search, LogIn, LogOut, CheckCircle, Clock, User, Calendar, BedDouble, ArrowRight, XCircle, AlertCircle, Check } from 'lucide-react';
import { toast } from 'sonner';
import { EstadoCheckInCheckOut } from '../../types/enums';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { PageHeader } from '../../components/common/PageHeader';

export const CheckIn = () => {
    // --- STATE ---
    const [searchTerm, setSearchTerm] = useState('');
    const [reservas, setReservas] = useState<ReservaDTO[]>([]);
    const [selectedReserva, setSelectedReserva] = useState<ReservaDTO | null>(null);
    const [detalles, setDetalles] = useState<ReservaDetalleDTO[]>([]);
    const [checkIns, setCheckIns] = useState<CheckInCheckOutDTO[]>([]);
    const [loading, setLoading] = useState(false);

    const [hasSearched, setHasSearched] = useState(false);

    // Dialog State
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [actionType, setActionType] = useState<'CHECK_IN' | 'CHECK_OUT' | null>(null);
    const [selectedDetalle, setSelectedDetalle] = useState<ReservaDetalleDTO | null>(null);
    const [comentarios, setComentarios] = useState('');

    // --- LOGIC ---
    const handleSearch = async () => {
        if (!searchTerm) return;
        setLoading(true);
        setHasSearched(true);
        setSelectedReserva(null);
        setDetalles([]);
        setCheckIns([]);
        try {
            // Try searching by ID first
            let res;
            if (!isNaN(Number(searchTerm))) {
                try {
                    const r = await ReservaService.getReserva(Number(searchTerm));
                    res = { data: [r.data] };
                } catch {
                    res = { data: [] };
                }
            } else {
                // Client-side filtering as fallback
                const all = await ReservaService.getReservas({ size: 100 });
                const filtered = all.data.filter(r =>
                    r.cliente?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    String(r.id) === searchTerm
                );
                res = { data: filtered };
            }

            setReservas(res.data);
            if (res.data.length === 1) {
                handleSelectReserva(res.data[0]);
            }
        } catch (error) {
            toast.error('Error al buscar reserva');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectReserva = async (reserva: ReservaDTO) => {
        setSelectedReserva(reserva);
        setLoading(true);
        try {
            // Fetch Details
            const detailsRes = await ReservaDetalleService.getReservaDetalles({ 'reservaId.equals': reserva.id });
            setDetalles(detailsRes.data);

            // Fetch existing CheckIns for these details
            if (detailsRes.data.length > 0) {
                const ids = detailsRes.data.map(d => d.id).join(',');
                const checkInsRes = await CheckInCheckOutService.getAll({ 'reservaDetalleId.in': ids });
                setCheckIns(checkInsRes.data);
            } else {
                setCheckIns([]);
            }
        } catch (error) {
            toast.error('Error al cargar detalles de la reserva');
        } finally {
            setLoading(false);
        }
    };

    const initiateAction = (type: 'CHECK_IN' | 'CHECK_OUT', detalle: ReservaDetalleDTO) => {
        setActionType(type);
        setSelectedDetalle(detalle);
        setComentarios('');
        setIsDialogOpen(true);
    };

    const executeAction = async () => {
        if (!selectedDetalle || !actionType || !selectedDetalle.habitacion?.id) return;

        try {
            const estadosRes = await EstadoHabitacionService.getEstados();
            const estados = estadosRes.data;
            const estadoOcupada = estados.find(e => e.nombre === 'OCUPADA');
            const estadoLimpieza = estados.find(e => e.nombre === 'LIMPIEZA') ?? estados.find(e => e.nombre === 'DISPONIBLE');

            if (actionType === 'CHECK_IN') {
                await CheckInCheckOutService.create({
                    fechaHoraCheckIn: new Date().toISOString(),
                    estado: EstadoCheckInCheckOut.REALIZADO,
                    comentarios: comentarios,
                    activo: true,
                    reservaDetalle: selectedDetalle
                });

                if (estadoOcupada && selectedDetalle.habitacion.id) {
                    await HabitacionService.partialUpdateHabitacion(selectedDetalle.habitacion.id, {
                        id: selectedDetalle.habitacion.id,
                        estadoHabitacion: estadoOcupada
                    });
                }
                toast.success('Check-In Realizado con éxito');

            } else {
                const existing = checkIns.find(c => c.reservaDetalle?.id === selectedDetalle.id);
                if (existing && existing.id) {
                    await CheckInCheckOutService.partialUpdate(existing.id, {
                        id: existing.id,
                        fechaHoraCheckOut: new Date().toISOString(),
                        estado: EstadoCheckInCheckOut.REALIZADO,
                        comentarios: existing.comentarios + (comentarios ? ` | Out: ${comentarios}` : '')
                    });

                    if (estadoLimpieza && selectedDetalle.habitacion.id) {
                        await HabitacionService.partialUpdateHabitacion(selectedDetalle.habitacion.id, {
                            id: selectedDetalle.habitacion.id,
                            estadoHabitacion: estadoLimpieza
                        });
                    }
                    toast.success('Check-Out Realizado con éxito');
                }
            }
            setIsDialogOpen(false);
            handleSelectReserva(selectedReserva!);
        } catch (error) {
            console.error(error);
            toast.error('Error al procesar acción');
        }
    };

    // Bulk Check-In for all rooms
    const executeCheckInAll = async () => {
        if (!selectedReserva || !canCheckIn) {
            toast.error('No se puede realizar check-in masivo en este momento');
            return;
        }

        const pendingDetails = detalles.filter(det => {
            const status = det.id ? getStatusForDetalle(det.id) : 'UNKNOWN';
            return status === 'PENDIENTE';
        });

        if (pendingDetails.length === 0) {
            toast.info('No hay habitaciones pendientes de check-in');
            return;
        }

        try {
            const estadosRes = await EstadoHabitacionService.getEstados();
            const estados = estadosRes.data;
            const estadoOcupada = estados.find(e => e.nombre === 'OCUPADA');

            for (const det of pendingDetails) {
                await CheckInCheckOutService.create({
                    fechaHoraCheckIn: new Date().toISOString(),
                    estado: EstadoCheckInCheckOut.REALIZADO,
                    comentarios: 'Check-in masivo',
                    activo: true,
                    reservaDetalle: det
                });

                if (estadoOcupada && det.habitacion?.id) {
                    await HabitacionService.partialUpdateHabitacion(det.habitacion.id, {
                        id: det.habitacion.id,
                        estadoHabitacion: estadoOcupada
                    });
                }
            }

            toast.success(`Check-In realizado en ${pendingDetails.length} habitaciones`);
            handleSelectReserva(selectedReserva);
        } catch (error) {
            console.error(error);
            toast.error('Error al realizar check-in masivo');
        }
    };

    // Bulk Check-Out for all rooms
    const executeCheckOutAll = async () => {
        if (!selectedReserva) {
            toast.error('No se puede realizar check-out masivo');
            return;
        }

        const checkedInDetails = detalles.filter(det => {
            const status = det.id ? getStatusForDetalle(det.id) : 'UNKNOWN';
            return status === 'CHECKED_IN';
        });

        if (checkedInDetails.length === 0) {
            toast.info('No hay habitaciones activas para check-out');
            return;
        }

        try {
            const estadosRes = await EstadoHabitacionService.getEstados();
            const estados = estadosRes.data;
            const estadoLimpieza = estados.find(e => e.nombre === 'LIMPIEZA') ?? estados.find(e => e.nombre === 'DISPONIBLE');

            for (const det of checkedInDetails) {
                const existing = checkIns.find(c => c.reservaDetalle?.id === det.id);
                if (existing && existing.id) {
                    await CheckInCheckOutService.partialUpdate(existing.id, {
                        id: existing.id,
                        fechaHoraCheckOut: new Date().toISOString(),
                        estado: EstadoCheckInCheckOut.REALIZADO,
                        comentarios: existing.comentarios + ' | Checkout masivo'
                    });

                    if (estadoLimpieza && det.habitacion?.id) {
                        await HabitacionService.partialUpdateHabitacion(det.habitacion.id, {
                            id: det.habitacion.id,
                            estadoHabitacion: estadoLimpieza
                        });
                    }
                }
            }

            toast.success(`Check-Out realizado en ${checkedInDetails.length} habitaciones`);
            handleSelectReserva(selectedReserva);
        } catch (error) {
            console.error(error);
            toast.error('Error al realizar check-out masivo');
        }
    };

    const getStatusForDetalle = (detalleId: number) => {
        const checkIn = checkIns.find(c => c.reservaDetalle?.id === detalleId);
        if (!checkIn) return 'PENDIENTE';
        if (checkIn.fechaHoraCheckIn && !checkIn.fechaHoraCheckOut) return 'CHECKED_IN';
        if (checkIn.fechaHoraCheckOut) return 'CHECKED_OUT';
        return 'UNKNOWN';
    };

    const isSameDay = (d1: Date, d2: Date) => {
        return d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate();
    };

    const canCheckInDate = selectedReserva?.fechaInicio ? isSameDay(new Date(), new Date(selectedReserva.fechaInicio)) : false;
    const isConfirmed = selectedReserva?.estado === 'CONFIRMADA';
    const canCheckIn = canCheckInDate && isConfirmed;

    return (
        <div className="font-sans text-foreground bg-background min-h-screen flex flex-col">

            {/* --- HERO SECTION --- */}
            <PageHeader
                title="Recepción y Check-In"
                icon={Check}
                subtitle="Administre la entrada y salida de huéspedes. Verifique identidades y asigne llaves."
                category="Gestión de Huéspedes"
                className="bg-[#0F172A]"
            />

            <main className="flex-grow py-12 px-4 md:px-8 lg:px-20 relative z-10">
                <div className="max-w-4xl mx-auto -mt-16 space-y-8">

                    {/* --- SEARCH CARD --- */}
                    <Card className="border-none shadow-xl rounded-sm overflow-hidden bg-card">
                        <CardHeader className="bg-muted/30 border-b border-border pb-6 pt-6">
                            <CardTitle className="text-xl font-bold text-card-foreground flex items-center gap-2">
                                <Search className="w-5 h-5 text-yellow-600" /> Buscar Reserva
                            </CardTitle>
                            <CardDescription className="text-muted-foreground">
                                Ingrese el número de reserva o el nombre del titular para comenzar el proceso.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 bg-card">
                            <div className="flex flex-col md:flex-row gap-4 items-end">
                                <div className="grid w-full gap-2">
                                    <Label htmlFor="search" className="font-semibold text-foreground">ID Reserva / Nombre Cliente</Label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="search"
                                            className="pl-9 h-12 bg-background border-input focus:border-yellow-500 focus:ring-yellow-500/20 text-foreground"
                                            placeholder="Ej. 1045 o Juan Pérez..."
                                            value={searchTerm}
                                            onChange={(e) => {
                                                setSearchTerm(e.target.value);
                                                setHasSearched(false);
                                            }}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        />
                                    </div>
                                </div>
                                <Button
                                    onClick={handleSearch}
                                    disabled={loading}
                                    className="h-12 px-8 bg-yellow-600 hover:bg-yellow-700 text-white font-bold tracking-wide transition-all shadow-md"
                                >
                                    {loading ? <span className="animate-pulse">Buscando...</span> : 'BUSCAR'}
                                </Button>
                            </div>

                            {/* --- SEARCH RESULTS --- */}
                            {reservas.length > 0 && !selectedReserva && (
                                <div className="mt-8 animate-in fade-in slide-in-from-top-4 duration-500">
                                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">Resultados Encontrados ({reservas.length})</h3>
                                    <div className="grid gap-3">
                                        {reservas.map(r => (
                                            <div
                                                key={r.id}
                                                onClick={() => handleSelectReserva(r)}
                                                className="group p-4 rounded-lg border border-border bg-card hover:border-yellow-400 hover:shadow-md cursor-pointer transition-all flex items-center justify-between"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="bg-blue-50 dark:bg-blue-500/10 p-3 rounded-full group-hover:bg-yellow-50 dark:group-hover:bg-yellow-500/10 transition-colors">
                                                        <User className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:text-yellow-600 dark:group-hover:text-yellow-400" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-card-foreground text-lg">
                                                            {r.cliente?.nombre} {r.cliente?.apellido}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                                                            <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">ID: #{r.id}</span>
                                                            <span>•</span>
                                                            <Calendar className="w-3 h-3" /> {new Date(r.fechaInicio!).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-yellow-500 group-hover:translate-x-1 transition-all" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {reservas.length === 0 && searchTerm && hasSearched && !loading && (
                                <div className="mt-8 p-8 text-center bg-muted/30 rounded-lg border border-dashed border-border">
                                    <XCircle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                                    <p className="text-muted-foreground font-medium">No se encontraron reservas con ese criterio.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* --- DETAILS & ACTIONS SECTION --- */}
                    {selectedReserva && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                            <div className="bg-slate-900 text-white p-6 rounded-t-sm shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <Badge variant="outline" className="text-yellow-400 border-yellow-400/30 bg-yellow-400/10">
                                            Reserva #{selectedReserva.id}
                                        </Badge>
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${selectedReserva.estado === 'CONFIRMADA' ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-300'}`}>
                                            {selectedReserva.estado}
                                        </span>
                                    </div>
                                    <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
                                        {selectedReserva.cliente?.nombre} <span className="font-light text-slate-400">/ Estancia</span>
                                    </h2>
                                </div>
                                <div className="text-right flex gap-6 text-sm text-slate-300">
                                    <div>
                                        <p className="text-slate-500 uppercase text-[10px] tracking-widest font-bold">Entrada</p>
                                        <p className="font-mono text-white">{new Date(selectedReserva.fechaInicio!).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500 uppercase text-[10px] tracking-widest font-bold">Salida</p>
                                        <p className="font-mono text-white">{new Date(selectedReserva.fechaFin!).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>

                            <Card className="rounded-t-none rounded-b-sm border-t-0 shadow-xl">
                                <CardContent className="p-0">
                                    <div className="bg-muted/30 px-6 py-4 border-b border-border">
                                        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                            <BedDouble className="w-4 h-4" /> Habitaciones Asignadas
                                        </h3>
                                    </div>

                                    {/* Bulk Action Buttons - Only show when multiple rooms */}
                                    {detalles.length > 1 && (
                                        <div className="bg-blue-50 dark:bg-blue-950/20 px-6 py-4 border-b border-border flex flex-col sm:flex-row gap-3 items-center justify-between">
                                            <div className="flex items-center gap-2 text-sm text-blue-800 dark:text-blue-300">
                                                <AlertCircle className="w-4 h-4" />
                                                <span className="font-medium">Esta reserva tiene {detalles.length} habitaciones</span>
                                            </div>
                                            <div className="flex gap-2">
                                                {detalles.some(d => {
                                                    const status = d.id ? getStatusForDetalle(d.id) : 'UNKNOWN';
                                                    return status === 'PENDIENTE';
                                                }) && (
                                                        <Button
                                                            onClick={executeCheckInAll}
                                                            disabled={!canCheckIn}
                                                            size="sm"
                                                            className="bg-green-600 hover:bg-green-700 text-white font-bold shadow-md disabled:bg-gray-300 disabled:text-gray-500"
                                                        >
                                                            <LogIn className="mr-2 h-4 w-4" />
                                                            Check-In en Todas
                                                        </Button>
                                                    )}
                                                {detalles.some(d => {
                                                    const status = d.id ? getStatusForDetalle(d.id) : 'UNKNOWN';
                                                    return status === 'CHECKED_IN';
                                                }) && (
                                                        <Button
                                                            onClick={executeCheckOutAll}
                                                            size="sm"
                                                            variant="destructive"
                                                            className="font-bold shadow-md"
                                                        >
                                                            <LogOut className="mr-2 h-4 w-4" />
                                                            Check-Out en Todas
                                                        </Button>
                                                    )}
                                            </div>
                                        </div>
                                    )}
                                    <div className="divide-y divide-border">
                                        {detalles.map(det => {
                                            const status = det.id ? getStatusForDetalle(det.id) : 'UNKNOWN';
                                            return (
                                                <div key={det.id} className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:bg-muted/50 transition-colors group">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-12 w-12 bg-card border border-border shadow-sm rounded flex items-center justify-center font-black text-xl text-foreground group-hover:border-yellow-400 group-hover:text-yellow-600 transition-colors">
                                                            {det.habitacion?.numero}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-foreground">{det.habitacion?.categoriaHabitacion?.nombre || 'Habitación Suite'}</p>
                                                            <p className="text-sm text-muted-foreground">Capacidad para {det.habitacion?.capacidad || 2} personas</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-6">
                                                        {status === 'PENDIENTE' && (
                                                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 px-3 py-1">
                                                                <Clock className="w-3 h-3 mr-2" /> Pendiente Check-In
                                                            </Badge>
                                                        )}
                                                        {status === 'CHECKED_IN' && (
                                                            <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1 hover:bg-emerald-100">
                                                                <CheckCircle className="w-3 h-3 mr-2" /> En Casa
                                                            </Badge>
                                                        )}
                                                        {status === 'CHECKED_OUT' && (
                                                            <Badge variant="secondary" className="bg-gray-100 text-gray-500 border border-gray-200 px-3 py-1">
                                                                <LogOut className="w-3 h-3 mr-2" /> Finalizado
                                                            </Badge>
                                                        )}

                                                        <div className="flex gap-2">
                                                            {status === 'PENDIENTE' && (
                                                                <div className="flex flex-col items-end gap-1">
                                                                    <Button
                                                                        onClick={() => initiateAction('CHECK_IN', det)}
                                                                        disabled={!canCheckIn}
                                                                        className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold shadow-md disabled:bg-gray-300 disabled:text-gray-500 disabled:shadow-none"
                                                                    >
                                                                        <LogIn className="mr-2 h-4 w-4" /> REALIZAR CHECK-IN
                                                                    </Button>
                                                                    {!canCheckIn && (
                                                                        <p className="text-[10px] text-red-600 font-bold flex items-center gap-1 animate-pulse">
                                                                            <AlertCircle className="w-3 h-3" />
                                                                            {!isConfirmed ? 'Reserva no confirmada (Pendiente Pago)' : 'Solo permitido en fecha de entrada'}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            )}
                                                            {status === 'CHECKED_IN' && (
                                                                <Button
                                                                    variant="destructive"
                                                                    onClick={() => initiateAction('CHECK_OUT', det)}
                                                                    className="font-bold shadow-md"
                                                                >
                                                                    <LogOut className="mr-2 h-4 w-4" /> REALIZAR CHECK-OUT
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {detalles.length === 0 && (
                                            <div className="p-12 text-center">
                                                <AlertCircle className="w-12 h-12 text-red-200 mx-auto mb-3" />
                                                <p className="text-gray-500">Error: No hay habitaciones vinculadas a esta reserva.</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </main>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl font-bold text-foreground">
                            {actionType === 'CHECK_IN' ? <LogIn className="text-yellow-600" /> : <LogOut className="text-red-600" />}
                            Confirmar {actionType === 'CHECK_IN' ? 'Check-In' : 'Check-Out'}
                        </DialogTitle>
                        <div className="text-sm text-gray-500 mt-2">
                            {actionType === 'CHECK_IN'
                                ? 'Está a punto de registrar la entrada del huésped. Asegúrese de haber verificado su identidad.'
                                : 'Está a punto de registrar la salida. Verifique que la habitación se encuentre en buen estado.'
                            }
                        </div>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="comments" className="font-semibold text-gray-700">Comentarios / Notas (Opcional)</Label>
                            <Textarea
                                id="comments"
                                value={comentarios}
                                rows={4}
                                onChange={e => setComentarios(e.target.value)}
                                placeholder={actionType === 'CHECK_IN' ? "Notas sobre entrega de llaves, depósitos..." : "Notas sobre consumo minibar, daños..."}
                                className="resize-none focus:border-yellow-500 focus:ring-yellow-500"
                            />
                        </div>
                    </div>
                    <DialogFooter className="flex gap-2 sm:justify-end">
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-gray-300">Cancelar</Button>
                        <Button
                            onClick={executeAction}
                            className={`${actionType === 'CHECK_IN' ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-red-600 hover:bg-red-700'} text-white font-bold`}
                        >
                            Confirmar Acción
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
