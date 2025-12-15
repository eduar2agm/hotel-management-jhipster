
import { useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { ReservaService, ReservaDetalleService, CheckInCheckOutService, EstadoHabitacionService, HabitacionService } from '../../services';
import type { ReservaDTO, ReservaDetalleDTO, CheckInCheckOutDTO } from '../../types/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Search, LogIn, LogOut, CheckCircle, Clock } from 'lucide-react';
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

export const CheckIn = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [reservas, setReservas] = useState<ReservaDTO[]>([]);
    const [selectedReserva, setSelectedReserva] = useState<ReservaDTO | null>(null);
    const [detalles, setDetalles] = useState<ReservaDetalleDTO[]>([]);
    const [checkIns, setCheckIns] = useState<CheckInCheckOutDTO[]>([]);
    const [loading, setLoading] = useState(false);

    // Dialog State
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [actionType, setActionType] = useState<'CHECK_IN' | 'CHECK_OUT' | null>(null);
    const [selectedDetalle, setSelectedDetalle] = useState<ReservaDetalleDTO | null>(null);
    const [comentarios, setComentarios] = useState('');

    const handleSearch = async () => {
        if (!searchTerm) return;
        setLoading(true);
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
                    // Fallback if 404
                    res = { data: [] };
                }
            } else {
                // Search by client name logic would go here if backend supported filtering by client name on reservation resource
                // For now, we fetch all active reservations and filter client side (not efficient but functional for demo)
                // Ideally: ReservaService.getReservas({ 'clienteId.specified': true ... })
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
                // Determine IDs
                const ids = detailsRes.data.map(d => d.id).join(',');
                // JHipster default filtering support '.in'
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
            // Fetch Statuses
            const estadosRes = await EstadoHabitacionService.getEstados();
            const estados = estadosRes.data;
            const estadoOcupada = estados.find(e => e.nombre === 'OCUPADA');
            const estadoLimpieza = estados.find(e => e.nombre === 'LIMPIEZA') ?? estados.find(e => e.nombre === 'DISPONIBLE');

            if (actionType === 'CHECK_IN') {
                // Create CheckIn Record
                await CheckInCheckOutService.create({
                    fechaHoraCheckIn: new Date().toISOString(),
                    estado: EstadoCheckInCheckOut.REALIZADO,
                    comentarios: comentarios,
                    activo: true,
                    reservaDetalle: selectedDetalle
                });

                // Update Room Status to OCUPADA
                if (estadoOcupada && selectedDetalle.habitacion.id) {
                    await HabitacionService.partialUpdateHabitacion(selectedDetalle.habitacion.id, {
                        id: selectedDetalle.habitacion.id,
                        estadoHabitacion: estadoOcupada
                    });
                }
                toast.success('Check-In Realizado con éxito');

            } else {
                // CHECK_OUT
                // Find the existing checkin record
                const existing = checkIns.find(c => c.reservaDetalle?.id === selectedDetalle.id);
                if (existing && existing.id) {
                    await CheckInCheckOutService.partialUpdate(existing.id, {
                        id: existing.id,
                        fechaHoraCheckOut: new Date().toISOString(),
                        estado: EstadoCheckInCheckOut.REALIZADO, // Ensure matches enum
                        comentarios: existing.comentarios + (comentarios ? ` | Out: ${comentarios}` : '')
                    });

                    // Update Room Status to LIMPIEZA
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
            // Reload
            handleSelectReserva(selectedReserva!);
        } catch (error) {
            console.error(error);
            toast.error('Error al procesar acción');
        }
    };

    const getStatusForDetalle = (detalleId: number) => {
        const checkIn = checkIns.find(c => c.reservaDetalle?.id === detalleId);
        if (!checkIn) return 'PENDIENTE';
        if (checkIn.fechaHoraCheckIn && !checkIn.fechaHoraCheckOut) return 'CHECKED_IN';
        if (checkIn.fechaHoraCheckOut) return 'CHECKED_OUT';
        return 'UNKNOWN';
    };

    return (
        <DashboardLayout title="Recepción: Check-In / Check-Out" role="Empleado">
            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Búsqueda de Reservas</CardTitle>
                        <CardDescription>Ingrese ID de reserva o nombre del cliente</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2">
                            <Input
                                placeholder="ID Reserva o Nombre Cliente..."
                                value={searchTerm}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                                onKeyDown={(e: React.KeyboardEvent) => e.key === 'Enter' && handleSearch()}
                            />
                            <Button onClick={handleSearch} disabled={loading}>
                                <Search className="mr-2 h-4 w-4" /> Buscar
                            </Button>
                        </div>

                        {reservas.length > 0 && !selectedReserva && (
                            <div className="mt-4 grid gap-2">
                                <Label>Resultados ({reservas.length}) - Seleccione una reserva:</Label>
                                {reservas.map(r => (
                                    <Button key={r.id} variant="outline" className="justify-start" onClick={() => handleSelectReserva(r)}>
                                        Reserva #{r.id} - {r.cliente?.nombre} ({new Date(r.fechaInicio!).toLocaleDateString()})
                                    </Button>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {selectedReserva && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Gestión de Habitaciones - Reserva #{selectedReserva.id}</CardTitle>
                            <CardDescription>
                                Cliente: {selectedReserva.cliente?.nombre} |
                                Entrada: {new Date(selectedReserva.fechaInicio!).toLocaleDateString()} |
                                Salida: {new Date(selectedReserva.fechaFin!).toLocaleDateString()}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {detalles.map(det => {
                                    const status = det.id ? getStatusForDetalle(det.id) : 'UNKNOWN';
                                    return (
                                        <div key={det.id} className="flex items-center justify-between p-4 border rounded-lg bg-card">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-lg">Habitación {det.habitacion?.numero}</span>
                                                <span className="text-sm text-muted-foreground">{det.habitacion?.categoriaHabitacion?.nombre}</span>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                {status === 'PENDIENTE' && (
                                                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                                        Pendiente Check-In
                                                    </Badge>
                                                )}
                                                {status === 'CHECKED_IN' && (
                                                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">
                                                        <CheckCircle className="w-3 h-3 mr-1" /> En Estadía
                                                    </Badge>
                                                )}
                                                {status === 'CHECKED_OUT' && (
                                                    <Badge variant="secondary">
                                                        <Clock className="w-3 h-3 mr-1" /> Finalizado
                                                    </Badge>
                                                )}

                                                <div className="flex gap-2">
                                                    {status === 'PENDIENTE' && (
                                                        <Button size="sm" onClick={() => initiateAction('CHECK_IN', det)}>
                                                            <LogIn className="mr-2 h-4 w-4" /> Check-In
                                                        </Button>
                                                    )}
                                                    {status === 'CHECKED_IN' && (
                                                        <Button size="sm" variant="destructive" onClick={() => initiateAction('CHECK_OUT', det)}>
                                                            <LogOut className="mr-2 h-4 w-4" /> Check-Out
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                {detalles.length === 0 && (
                                    <div className="text-center text-muted-foreground py-8">
                                        No se encontraron detalles de habitaciones para esta reserva. Error de integridad de datos.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmar {actionType === 'CHECK_IN' ? 'Check-In' : 'Check-Out'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>Comentarios / Notas</Label>
                            <Textarea
                                value={comentarios}
                                onChange={e => setComentarios(e.target.value)}
                                placeholder={actionType === 'CHECK_IN' ? "Condición de entrada, entrega de llaves..." : "Estado de la habitación, minibar..."}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={executeAction}>Confirmar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
};
