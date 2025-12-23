import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ReservaService } from '../../../services/reserva.service';
import { ReservaDetalleService } from '../../../services/reserva-detalle.service';
import { ClienteService } from '../../../services/cliente.service';
import { HabitacionService } from '../../../services/habitacion.service';
import type { ReservaDTO } from '../../../types/api/Reserva';
import type { HabitacionDTO } from '../../../types/api/Habitacion';
import type { ClienteDTO } from '../../../types/api/Cliente';
import { toast } from 'sonner';

interface ReservaDetailsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    reserva: ReservaDTO | null;
    isAdmin?: boolean;
    onStatusUpdate?: () => void;
}

export const ReservaDetailsDialog = ({
    open,
    onOpenChange,
    reserva,
    isAdmin = false,
    onStatusUpdate
}: ReservaDetailsDialogProps) => {
    const [rooms, setRooms] = useState<HabitacionDTO[]>([]);
    const [client, setClient] = useState<ClienteDTO | null>(null);
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (open && reserva) {
            loadDetails();
        } else {
            setRooms([]);
            setClient(null);
        }
    }, [open, reserva]);

    const loadDetails = async () => {
        if (!reserva) return;
        setLoading(true);

        try {
            // Parallel Fetch: Details + Client
            const detailsPromise = ReservaDetalleService.getReservaDetalles({ 'reservaId.equals': reserva.id });

            let clientPromise: Promise<{ data: ClienteDTO }> | null = null;
            const cId = reserva.clienteId || reserva.cliente?.id;

            if (cId) {
                clientPromise = ClienteService.getCliente(cId);
            }

            const [detailsRes, clientRes] = await Promise.all([
                detailsPromise,
                clientPromise ? clientPromise : Promise.resolve(null)
            ]);

            if (clientRes) {
                setClient(clientRes.data);
            } else if (reserva.cliente) {
                setClient(reserva.cliente as ClienteDTO); // Fallback to embedded
            }

            // Extract unique room IDs
            const roomIds = detailsRes.data
                .map(d => d.habitacion?.id)
                .filter((id): id is number => id !== undefined);

            const uniqueRoomIds = Array.from(new Set(roomIds));

            // Resolve Rooms with full data (capacity, price)
            const resolvedRooms = await Promise.all(uniqueRoomIds.map(async (id) => {
                let candidate: HabitacionDTO | undefined;

                try {
                    const roomRes = await HabitacionService.getHabitacion(id);
                    candidate = roomRes.data;
                } catch (e) {
                    // console.error('Error fetching room', id, e);
                }

                // Fallback sources
                const detailWithRoom = detailsRes.data.find(d => d.habitacion?.id === id)?.habitacion;

                // Merge logic (Candidate > Detail)
                const base = candidate || detailWithRoom;
                if (!base) return undefined;

                const result: HabitacionDTO = { ...base };
                return result;
            }));

            const validRooms = resolvedRooms.filter((h): h is HabitacionDTO => !!h);
            setRooms(validRooms);

        } catch (error) {
            console.error('Error fetching details', error);
            toast.error('Error al cargar detalles');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        if (!reserva?.id) return;

        // Validation for FINALIZADA
        if (newStatus === 'FINALIZADA') {
            if (reserva.estado !== 'CHECK_IN') {
                if (!isAdmin) {
                    toast.error('Solo se puede finalizar si está en Check-In.');
                    return;
                }
                // Double confirmation for Admin
                if (!confirm('⚠️ ADVERTENCIA: La reserva NO está en Check-In.\n\n¿Está seguro que desea finalizarla manualmente?')) {
                    return;
                }
                if (!confirm('CONFIRMACIÓN FINAL: Esta acción finalizará la reserva inmediatamente.\n\n¿Proceder?')) {
                    return;
                }
            }
        }

        try {
            setProcessing(true);
            await ReservaService.partialUpdateReserva(reserva.id, { id: reserva.id, estado: newStatus });
            toast.success(`Reserva actualizada a ${newStatus}`);
            if (onStatusUpdate) onStatusUpdate();
            onOpenChange(false);
        } catch (error: any) {
            console.error('Error updating status', error);
            const msg = error.response?.data?.title || 'Error al actualizar estado';
            toast.error(msg);
        } finally {
            setProcessing(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden border-0 shadow-2xl">
                <DialogHeader className="bg-[#0F172A] text-white p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                                <span className="text-yellow-500">#{reserva?.id}</span>
                                <span>Detalles de Reserva</span>
                            </DialogTitle>
                            <DialogDescription className="text-slate-400 mt-1">
                                Información completa de la reserva y habitaciones.
                            </DialogDescription>
                        </div>
                        <Badge className={cn(
                            "text-sm px-3 py-1",
                            reserva?.estado === 'CONFIRMADA' ? "bg-green-500 text-white" :
                                reserva?.estado === 'CANCELADA' ? "bg-red-500 text-white" :
                                    reserva?.estado === 'FINALIZADA' ? "bg-blue-500 text-white" :
                                        reserva?.estado === 'CHECK_IN' ? "bg-purple-500 text-white" :
                                            "bg-yellow-500 text-black"
                        )}>
                            {reserva?.estado}
                        </Badge>
                    </div>
                </DialogHeader>

                {reserva && (
                    <div className="p-6 bg-white space-y-8 max-h-[70vh] overflow-y-auto">
                        {/* TOP META ROW */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b pb-6">
                            <div>
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Fecha de Reserva</span>
                                <span className="text-gray-900 font-medium">
                                    {reserva.fechaReserva ?
                                        new Date(reserva.fechaReserva).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' })
                                        : <span className="text-gray-400 italic">No registrada</span>
                                    }
                                </span>
                            </div>
                            <div className="md:text-left">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Estado</span>
                                <Badge className={cn(
                                    "px-3 py-1 text-sm",
                                    reserva.estado === 'CONFIRMADA' ? "bg-green-100 text-green-700" :
                                        reserva.estado === 'CANCELADA' ? "bg-red-100 text-red-700" :
                                            reserva.estado === 'FINALIZADA' ? "bg-blue-100 text-blue-700" :
                                                reserva.estado === 'CHECK_IN' ? "bg-purple-100 text-purple-700" :
                                                    "bg-yellow-100 text-yellow-700"
                                )}>
                                    {reserva.estado || 'PENDIENTE'}
                                </Badge>
                            </div>
                        </div>

                        {/* CLIENT SECTION */}
                        <div className="flex items-start gap-5">
                            <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-2xl shadow-sm border border-slate-200">
                                {(client?.nombre || reserva.cliente?.nombre)?.charAt(0) || <User />}
                            </div>
                            <div className="space-y-1 w-full">
                                <h3 className="text-xl font-bold text-gray-900 border-b border-dashed border-gray-200 pb-1 mb-2">
                                    {client?.nombre || reserva.cliente?.nombre || 'Cliente'} {client?.apellido || reserva.cliente?.apellido || ''}
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-gray-400/80 w-20">Email:</span>
                                        <span className="text-gray-900">{client?.correo || <span className="text-gray-300">-</span>}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-gray-400/80 w-20">Teléfono:</span>
                                        <span className="text-gray-900">{client?.telefono || <span className="text-gray-300">-</span>}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-gray-400/80 w-20">Doc:</span>
                                        <span className="text-gray-900 uppercase font-mono">{client?.numeroIdentificacion || <span className="text-gray-300">-</span>}</span>
                                    </div>
                                    <div className="flex items-center gap-2 sm:col-span-2">
                                        <span className="font-semibold text-gray-400/80 w-20">Dirección:</span>
                                        <span className="text-gray-900 truncate max-w-[400px]" title={client?.direccion || ''}>{client?.direccion || <span className="text-gray-300">-</span>}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8 border-t border-b border-gray-100 py-6 bg-slate-50/50 px-4 rounded-lg">
                            <div>
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Entrada</span>
                                <span className="text-xl font-bold text-gray-800">
                                    {new Date(reserva.fechaInicio!).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </span>
                            </div>
                            <div className="text-right">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Salida</span>
                                <span className="text-xl font-bold text-gray-800">
                                    {new Date(reserva.fechaFin!).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </span>
                            </div>
                        </div>

                        {/* ROOMS SECTION */}
                        <div>
                            <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2 uppercase tracking-wider">
                                <span className="bg-yellow-100 p-1 rounded text-yellow-700"><Check className="h-3 w-3" /></span>
                                Habitaciones Reservadas ({rooms.length})
                            </h4>
                            {rooms.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {rooms.map((room, index) => (
                                        <div key={room.id || index} className="flex flex-col gap-2 p-4 rounded-lg border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                                                <span className="font-mono font-bold text-lg text-yellow-600">Hab {room.numero}</span>
                                                <span className="text-xs bg-yellow-50 text-yellow-700 border border-yellow-200 px-2 py-1 rounded-full font-medium">
                                                    {room.categoriaHabitacion?.nombre || 'Estándar'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-end text-sm">
                                                <div className="text-gray-500">
                                                    <p>Capacidad: <span className="font-medium text-gray-800">{room.capacidad ?? '?'} pax</span></p>
                                                </div>
                                                <div className="font-bold text-gray-900">
                                                    ${room.categoriaHabitacion?.precioBase ? Number(room.categoriaHabitacion.precioBase).toLocaleString() : '0'} <span className="text-xs font-normal text-gray-400">/noche</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-sm text-gray-400 italic flex items-center gap-2 p-4 bg-gray-50 rounded-lg justify-center border border-dashed">
                                    {loading ? (
                                        <>
                                            <div className="animate-spin h-3 w-3 border-b-2 border-gray-400 rounded-full"></div>
                                            Cargando habitaciones...
                                        </>
                                    ) : (
                                        <span>No se encontraron habitaciones asociadas.</span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <DialogFooter className="bg-gray-50 p-4 border-t flex justify-end gap-2">
                    <Button onClick={() => onOpenChange(false)} variant="outline" disabled={processing}>Cerrar</Button>

                    {reserva?.estado === 'CONFIRMADA' && (
                        <Button
                            onClick={() => handleStatusChange('CHECK_IN')}
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                            disabled={processing}
                        >
                            {processing ? 'Procesando...' : 'Realizar Check-In'}
                        </Button>
                    )}

                    {(reserva?.estado === 'CHECK_IN' || (isAdmin && reserva?.estado !== 'FINALIZADA' && reserva?.estado !== 'CANCELADA')) && (
                        <Button
                            onClick={() => handleStatusChange('FINALIZADA')}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            disabled={processing}
                        >
                            {processing ? 'Finalizar' : 'Finalizar Estancia'}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
