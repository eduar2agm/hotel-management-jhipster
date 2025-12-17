
import type { HabitacionDTO } from '../../types/api/Habitacion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { BedDouble, Image as ImageIcon, Info, Wifi, Tv, Coffee } from 'lucide-react';
import { useState } from 'react';

interface CardRoomProps {
    habitacion: HabitacionDTO;
}

export const CardRoom = ({ habitacion: h }: CardRoomProps) => {
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    const precioBase = Number(h.categoriaHabitacion?.precioBase || 0).toFixed(2);
    const nombreCategoria = h.categoriaHabitacion?.nombre || 'Estándar';
    const estado = h.estadoHabitacion?.nombre || 'DESCONOCIDO';
    const isDisponible = estado === 'DISPONIBLE';

    return (
        <>
            <Card className="group overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full">
                {/* Image Section */}
                <div className="relative h-64 w-full overflow-hidden bg-gray-100">
                    {h.imagen ? (
                        <img 
                            src={h.imagen} 
                            alt={`Habitación ${h.numero}`} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                    ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center bg-gray-50 text-gray-400">
                            <ImageIcon className="h-12 w-12 opacity-20" />
                            <span className="mt-2 text-xs font-medium uppercase tracking-wider">No Imagen</span>
                        </div>
                    )}
                    
                    {/* Badges Overlay */}
                    <div className="absolute top-4 left-4 flex gap-2">
                         <Badge className={cn(
                            "px-3 py-1 text-xs font-bold uppercase tracking-wider shadow-sm backdrop-blur-md",
                            isDisponible 
                                ? "bg-green-500/90 hover:bg-green-600 text-white" 
                                : "bg-gray-800/90 text-white"
                        )}>
                            {estado}
                        </Badge>
                    </div>

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
                            <div className="flex items-center gap-1 text-gray-500">
                                <BedDouble className="h-4 w-4" />
                                <span className="text-sm font-medium">{h.capacidad} pax</span>
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 group-hover:text-yellow-600 transition-colors">
                            {nombreCategoria}
                        </h3>
                    </div>

                    <div className="mb-6 flex-1">
                         <p className="text-sm leading-relaxed text-gray-500 line-clamp-3">
                            {h.descripcion || "Disfruta de una experiencia única con todas las comodidades que necesitas para tu descanso."}
                        </p>
                    </div>

                    <div className="mt-auto space-y-4">
                         {/* Price */}
                         <div className="flex items-end gap-1 border-t border-gray-100 pt-4">
                            <span className="text-2xl font-black text-gray-900">${precioBase}</span>
                            <span className="mb-1 text-sm font-medium text-gray-400">/ noche</span>
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
                            <Button 
                                className={cn(
                                    "w-full text-white shadow-md transition-all hover:shadow-lg focus:ring-2 focus:ring-offset-2",
                                    isDisponible 
                                        ? "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500" 
                                        : "bg-gray-800 hover:bg-gray-900 cursor-not-allowed opacity-80"
                                )}
                                disabled={!isDisponible}
                            >
                                {isDisponible ? "Reservar" : "Ocupada"}
                            </Button>
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
                                <img src={h.imagen} alt={h.numero} className="h-full w-full object-cover" />
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
                        <div className="p-6 md:p-8 bg-white overflow-y-auto max-h-[80vh]">
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
                                </div>

                                <div className="pt-6 mt-6 border-t border-gray-100">
                                    <Button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white h-12 text-lg font-semibold shadow-lg shadow-yellow-200">
                                        Reservar Ahora
                                    </Button>
                                </div>
                            </div>
                        </div>
                     </div>
                </DialogContent>
            </Dialog>
        </>
    );
};
