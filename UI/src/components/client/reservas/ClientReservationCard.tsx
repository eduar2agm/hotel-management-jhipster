import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, DollarSign, XCircle, MapPin, Info } from 'lucide-react';
import type { ReservaDTO, ReservaDetalleDTO } from '@/types/api';

interface ClientReservationCardProps {
    reserva: ReservaDTO;
    details: ReservaDetalleDTO[];
    isActive: boolean;
    total: number;
    onPayClick: (reserva: ReservaDTO, total: number) => void;
    onCancelClick: (reservaId: number) => void;
}

export const ClientReservationCard = ({
    reserva,
    details,
    isActive,
    total,
    onPayClick,
    onCancelClick
}: ClientReservationCardProps) => {

    const isPending = reserva.estado === 'PENDIENTE';
    const isConfirmed = reserva.estado === 'CONFIRMADA';

    const getStatusColor = (status?: string | null) => {
        switch (status) {
            case 'CONFIRMADA': return 'bg-emerald-600 border-emerald-500 text-white';
            case 'PENDIENTE': return 'bg-yellow-500 border-yellow-400 text-white';
            case 'CANCELADA': return 'bg-red-500 border-red-400 text-white';
            case 'CHECK_IN': return 'bg-blue-600 border-blue-500 text-white';
            case 'CHECK_OUT': return 'bg-gray-500 border-gray-400 text-white';
            case 'FINALIZADA': return 'bg-blue-700 border-blue-600 text-white';
            default: return 'bg-gray-900 border-gray-800 text-white';
        }
    };

    return (
        <div
            className={`bg-white group transition-all duration-300 border overflow-hidden rounded-xl
                ${isActive ? 'border-yellow-500 shadow-xl ring-2 ring-yellow-500 ring-offset-2' : 'border-gray-200 hover:shadow-lg'}
            `}
        >
            {/* Header */}
            <div className="bg-gray-50/50 px-6 py-4 flex flex-wrap justify-between items-center border-b border-gray-100">
                <div className="flex items-center gap-4">
                    <Badge variant="outline" className={`${getStatusColor(reserva.estado)} px-3 py-1 font-bold shadow-sm uppercase tracking-wide`}>
                        {reserva.estado}
                    </Badge>
                    <span className="text-xs text-gray-400 font-medium uppercase tracking-wider hidden sm:flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {reserva.fechaReserva ? new Date(reserva.fechaReserva).toLocaleDateString() : '-'}
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-gray-400 text-sm">ID: #{reserva.id}</span>

                    {isPending && (
                        <Button
                            onClick={() => onPayClick(reserva, total)}
                            className="ml-4 bg-yellow-600 hover:bg-yellow-700 text-white text-xs font-bold uppercase tracking-wider py-1 h-8 shadow-md shadow-yellow-200 transition-all hover:-translate-y-0.5"
                        >
                            <DollarSign className="w-3 h-3 mr-1" />
                            Pagar Ahora
                        </Button>
                    )}

                    {isConfirmed && (
                        <Button
                            onClick={() => onCancelClick(reserva.id!)}
                            className="ml-4 bg-red-400 hover:bg-red-700 text-white text-xs font-bold  tracking-wider py-1 h-8 shadow-md shadow-red-200 transition-all hover:-translate-y-0.5"
                        >
                            <XCircle className="w-3 h-3 mr-1" />
                            Solicitar Cancelación
                        </Button>
                    )}
                </div>
            </div>

            <div className="p-6">
                {/* Dates & Location */}
                <div className="flex flex-col sm:flex-row gap-8 mb-8 pb-8 border-b border-dashed border-gray-200">
                    <div className="flex-1 grid grid-cols-2 gap-6">
                        <div>
                            <span className="text-xs text-gray-400 font-bold uppercase block mb-2 tracking-wider">Check-in</span>
                            <span className="text-xl font-serif font-bold text-gray-900 flex items-center gap-2">
                                <div className="w-1 h-8 bg-green-500 rounded-full"></div>
                                {reserva.fechaInicio ? new Date(reserva.fechaInicio).toLocaleDateString() : ''}
                            </span>
                        </div>
                        <div>
                            <span className="text-xs text-gray-400 font-bold uppercase block mb-2 tracking-wider">Check-out</span>
                            <span className="text-xl font-serif font-bold text-gray-900 flex items-center gap-2">
                                <div className="w-1 h-8 bg-red-500 rounded-full"></div>
                                {reserva.fechaFin ? new Date(reserva.fechaFin).toLocaleDateString() : ''}
                            </span>
                        </div>
                    </div>
                    <div className="sm:text-right">
                        <span className="text-xs text-gray-400 font-bold uppercase block mb-2 tracking-wider">Total Estancia</span>
                        <span className="text-3xl font-black text-gray-900 tracking-tight">
                            ${total.toFixed(2)}
                        </span>
                        <div className="text-xs text-green-600 font-medium mt-1 flex items-center justify-end gap-1">
                            <MapPin className="w-3 h-3" /> Hotel Principal & Resort
                        </div>
                    </div>
                </div>

                {/* Room Details List */}
                <div className="space-y-4">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Habitaciones Reservadas ({details.length})</h4>
                    {details.map((detalle, idx) => (
                        <div key={detalle.id || idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-yellow-200 transition-colors">
                            {/* Image Thumbnail */}
                            <div className="h-16 w-24 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                                {detalle.habitacion?.imagen ? (
                                    <img src={detalle.habitacion.imagen} alt="Room" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <Info className="w-6 h-6 opacity-30" />
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-grow">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h5 className="font-bold text-gray-900 text-sm">
                                            {detalle.habitacion?.categoriaHabitacion?.nombre || 'Habitación Standard'}
                                        </h5>
                                        <span className="text-xs text-gray-500 font-medium bg-white px-2 py-0.5 rounded border border-gray-200 inline-block mt-1">
                                            Puerta #{detalle.habitacion?.numero}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className="block font-bold text-gray-900">
                                            ${(detalle.precioUnitario || detalle.habitacion?.categoriaHabitacion?.precioBase || 0).toFixed(2)}
                                        </span>
                                        <span className="text-[10px] text-gray-400 uppercase tracking-wide">/ noche</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
