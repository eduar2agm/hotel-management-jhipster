
import type { HabitacionDTO, ServicioDTO } from '../../types/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { BedDouble, Image as ImageIcon, Info, Wifi, Tv, Coffee, Check, X } from 'lucide-react';
import { useState } from 'react';
import { getImageUrl } from '../../utils/imageUtils';

interface CardRoomProps {
    habitacion: HabitacionDTO;
    variant?: 'display' | 'selection';
    isSelected?: boolean;
    onAction?: (habitacion: HabitacionDTO) => void;
    actionLabel?: string;
    services?: ServicioDTO[];
}

export const CardRoom = ({
    habitacion: h,
    variant = 'display',
    isSelected = false,
    onAction,
    actionLabel,
    services = []
}: CardRoomProps) => {
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    const precioBase = Number(h.categoriaHabitacion?.precioBase || 0).toFixed(2);
    const nombreCategoria = h.categoriaHabitacion?.nombre || 'Estándar';
    const estado = h.estadoHabitacion?.nombre || 'DESCONOCIDO';
    const isDisponible = estado === 'DISPONIBLE';

    return (
        <>
            <Card className={cn(
                "group overflow-hidden rounded-xl border bg-card shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full",
                isSelected
                    ? "border-gray-500 ring-2 ring-gray-500 ring-offset-2"
                    : "border-border"
            )}>
                {/* Image Section */}
                <div className="relative h-64 w-full overflow-hidden bg-gray-100">
                    {h.imagen ? (
                        <img
                            src={getImageUrl(h.imagen)}
                            alt={`Habitación ${h.numero}`}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                    ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center bg-muted text-muted-foreground">
                            <ImageIcon className="h-12 w-12 opacity-20" />
                            <span className="mt-2 text-xs font-medium uppercase tracking-wider">No Imagen</span>
                        </div>
                    )}

                    {/* Selection Overlay */}
                    {isSelected && (
                        <div className="absolute inset-0 bg-yellow-900/40 flex items-center justify-center backdrop-blur-[2px] animate-in fade-in">
                            <div className="bg-white text-yellow-700 px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2">
                                <Check className="w-5 h-5" /> Seleccionada
                            </div>
                        </div>
                    )}



                    <div className="absolute top-4 right-4">
                        <Badge variant="secondary" className="bg-white/90 text-gray-900 font-bold shadow-sm backdrop-blur-sm">
                            #{h.numero}
                        </Badge>
                    </div>
                </div>

                {/* Content Section */}
                <CardContent className="flex flex-1 flex-col p-6">
                    <div className="mb-4 flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-widest text-yellow-600">
                                {nombreCategoria}
                            </span>
                            <div className="flex items-center gap-1 text-muted-foreground">
                                <BedDouble className="h-4 w-4" />
                                <span className="text-sm font-medium">{h.capacidad} pax</span>
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-foreground group-hover:text-yellow-600 transition-colors">
                            {nombreCategoria}
                        </h3>
                    </div>

                    <div className="mb-6 flex-1">
                        <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3">
                            {h.descripcion || "Disfruta de una experiencia única con todas las comodidades que necesitas para tu descanso."}
                        </p>
                    </div>

                    <div className="mt-auto space-y-4">
                        {/* Price */}
                        <div className="flex items-end gap-1 border-t border-border pt-4">
                            <span className="text-2xl font-black text-foreground">${precioBase}</span>
                            <span className="mb-1 text-sm font-medium text-muted-foreground">/ noche</span>
                        </div>

                        {/* Actions */}
                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                variant="outline"
                                className="w-full border-gray-200 hover:bg-gray-50 hover:text-gray-900"
                                onClick={() => setIsDetailsOpen(true)}
                            >
                                <Info className="mr-2 h-4 w-4" />
                                Detalles
                            </Button>

                            {variant === 'display' ? (
                                <Button
                                    className={cn(
                                        "w-full text-white shadow-md transition-all hover:shadow-lg focus:ring-2 focus:ring-offset-2",
                                        isDisponible
                                            ? "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500"
                                            : "bg-gray-800 hover:bg-gray-900 cursor-not-allowed opacity-80"
                                    )}
                                    disabled={!isDisponible}
                                /* Logic here typically handled by parent via routing or another handler, but kept as is for display */
                                >
                                    {isDisponible ? "Reservar" : "Ocupada"}
                                </Button>
                            ) : (
                                <Button
                                    className={cn(
                                        "w-full text-white shadow-md transition-all hover:shadow-lg",
                                        isSelected
                                            ? "bg-gray-200 text-gray-700 hover:bg-red-100 hover:text-red-700"
                                            : "bg-yellow-600 hover:bg-yellow-700"
                                    )}
                                    onClick={() => onAction && onAction(h)}
                                >
                                    {isSelected ? (
                                        <span className="flex items-center gap-2">
                                            <X className="h-4 w-4" /> Quitar
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <Check className="h-4 w-4" /> Agregar
                                        </span>
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Details Dialog */}
            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className="max-w-2xl overflow-hidden p-0 gap-0 border-0 rounded-2xl">
                    <div className="grid md:grid-cols-2">
                        {/* Image Side */}
                        <div className="relative h-64 md:h-full bg-gray-100">
                            {h.imagen ? (
                                <img src={getImageUrl(h.imagen)} alt={h.numero} className="h-full w-full object-cover" />
                            ) : (
                                <div className="flex h-full items-center justify-center">
                                    <ImageIcon className="h-16 w-16 text-gray-300" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6 md:hidden">
                                <h2 className="text-white text-2xl font-bold">{nombreCategoria}</h2>
                            </div>
                        </div>

                        {/* Info Side */}
                        <div className="p-6 md:p-8 bg-card overflow-y-auto max-h-[80vh]">
                            <DialogHeader className="mb-6 text-left">
                                <Badge variant="outline" className="w-fit mb-2 border-yellow-500 text-yellow-600 bg-yellow-50">
                                    {h.categoriaHabitacion?.nombre}
                                </Badge>
                                <DialogTitle className="text-3xl font-bold text-gray-900 hidden md:block">
                                    Habitación {h.numero}
                                </DialogTitle>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-2xl font-bold text-gray-900">${precioBase}</span>
                                    <span className="text-gray-500 text-sm">/ noche</span>
                                </div>
                            </DialogHeader>

                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-2">Descripción</h4>
                                    <p className="text-gray-600 leading-relaxed text-sm">
                                        {h.descripcion || "Sin descripción detallada."}
                                    </p>
                                </div>

                                <div>
                                    <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3">Comodidades</h4>
                                    {services.length > 0 ? (
                                        <div className="grid grid-cols-2 gap-3">
                                            {services.map(s => (
                                                <div key={s.id} className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Check className="h-4 w-4 text-yellow-600" /> {s.nombre}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Wifi className="h-4 w-4 text-yellow-600" /> Wifi High-Speed
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Tv className="h-4 w-4 text-yellow-600" /> Smart TV 55"
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Coffee className="h-4 w-4 text-yellow-600" /> Coffee Maker
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <BedDouble className="h-4 w-4 text-yellow-600" /> Capacidad {h.capacidad}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-6 mt-6 border-t border-gray-100">
                                    {variant === 'selection' ? (
                                        <Button
                                            className={cn(
                                                "w-full h-12 text-lg font-semibold shadow-lg",
                                                isSelected
                                                    ? "bg-gray-200 text-gray-800 hover:bg-red-100 hover:text-red-700"
                                                    : "bg-yellow-600 hover:bg-yellow-700 text-white shadow-yellow-200"
                                            )}
                                            onClick={() => {
                                                if (onAction) onAction(h);
                                                setIsDetailsOpen(false);
                                            }}
                                        >
                                            {actionLabel || (isSelected ? 'Quitar de la Selección' : 'Agregar a Reserva')}
                                        </Button>
                                    ) : (
                                        <Button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white h-12 text-lg font-semibold shadow-lg shadow-yellow-200">
                                            {actionLabel || "Reservar Ahora"}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};
