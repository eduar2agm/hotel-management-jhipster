import type { HabitacionDTO } from '../../types/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { BedDouble, DollarSign, Image as ImageIcon, Pencil, Trash2, Eye, Info } from 'lucide-react';
import { useState } from 'react';

interface RoomCardProps {
    habitacion: HabitacionDTO;
    onEdit: (h: HabitacionDTO) => void;
    onDelete: (id: number) => void;
}

export const RoomCard = ({ habitacion: h, onEdit, onDelete }: RoomCardProps) => {
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    return (
        <>
            <Card className="overflow-hidden hover:shadow-xl transition-all group border-gray-200">
                <div className="relative h-48 w-full bg-gray-200 overflow-hidden">
                    {h.imagen ? (
                        <img 
                            src={h.imagen} 
                            alt={`Habitación ${h.numero}`} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-100">
                            <ImageIcon className="h-12 w-12 mb-2 opacity-50" />
                            <span className="text-xs font-semibold">Sin Imagen</span>
                        </div>
                    )}
                    <div className="absolute top-3 left-3 flex gap-2">
                        <Badge className={cn(
                            "shadow-sm",
                            h.estadoHabitacion?.nombre === 'DISPONIBLE' ? "bg-green-500 hover:bg-green-600" :
                            h.estadoHabitacion?.nombre === 'OCUPADA' ? "bg-rose-500 hover:bg-rose-600" :
                            "bg-gray-500"
                        )}>
                            {h.estadoHabitacion?.nombre}
                        </Badge>
                    </div>
                    <div className="absolute top-3 right-3">
                            <Badge variant="secondary" className="bg-white/90 text-gray-800 shadow-sm backdrop-blur-sm">
                            #{h.numero}
                        </Badge>
                    </div>
                </div>
                
                <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <h3 className="font-bold text-lg text-gray-900">{h.categoriaHabitacion?.nombre}</h3>
                            <p className="text-sm text-yellow-600 font-bold flex items-center gap-1">
                                <DollarSign className="h-3.5 w-3.5" />
                                {h.categoriaHabitacion?.precioBase} / noche
                            </p>
                        </div>
                        <div className="flex items-center text-gray-500 text-xs font-medium bg-gray-100 px-2 py-1 rounded">
                                <BedDouble className="h-3.5 w-3.5 mr-1" />
                                {h.capacidad} pax
                        </div>
                    </div>
                    
                    <p className="text-gray-500 text-sm line-clamp-2 mb-4 h-10">
                        {h.descripcion || 'Sin descripción detallada disponible.'}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                            <div className={`h-2.5 w-2.5 rounded-full ${h.activo ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            <span className="text-xs font-medium text-gray-600">{h.activo ? 'Habilitada' : 'Deshabilitada'}</span>
                        </div>
                        <div className="flex gap-2">
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => setIsDetailsOpen(true)}
                                className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                                title="Ver Detalles"
                            >
                                <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => onEdit(h)}
                                className="h-8 w-8 p-0 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50"
                                title="Editar"
                            >
                                <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => h.id && onDelete(h.id)}
                                className="h-8 w-8 p-0 text-gray-500 hover:text-red-600 hover:bg-red-50"
                                title="Eliminar"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <Info className="h-5 w-5 text-blue-500" />
                            Detalles de la Habitación #{h.numero}
                        </DialogTitle>
                        <DialogDescription>
                            Información completa de la unidad.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="relative h-56 w-full rounded-lg overflow-hidden bg-gray-100">
                             {h.imagen ? (
                                <img src={h.imagen} alt={`Full ${h.numero}`} className="w-full h-full object-cover" />
                             ) : (
                                <div className="flex items-center justify-center h-full text-gray-400">
                                    <ImageIcon className="h-12 w-12" />
                                </div>
                             )}
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="font-semibold text-gray-500 block">Categoría</span>
                                <span className="text-gray-900">{h.categoriaHabitacion?.nombre}</span>
                            </div>
                            <div>
                                <span className="font-semibold text-gray-500 block">Precio Base</span>
                                <span className="text-gray-900 font-bold">${h.categoriaHabitacion?.precioBase}</span>
                            </div>
                            <div>
                                <span className="font-semibold text-gray-500 block">Capacidad</span>
                                <span className="text-gray-900">{h.capacidad} Personas</span>
                            </div>
                            <div>
                                <span className="font-semibold text-gray-500 block">Estado Actual</span>
                                <Badge variant="outline" className={h.estadoHabitacion?.nombre === 'DISPONIBLE' ? 'text-green-600 border-green-200 bg-green-50' : 'text-red-600 border-red-200 bg-red-50'}>
                                    {h.estadoHabitacion?.nombre}
                                </Badge>
                            </div>
                        </div>
                        <div>
                            <span className="font-semibold text-gray-500 block text-sm mb-1">Descripción</span>
                            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md border border-gray-100">
                                {h.descripcion || 'No hay descripción disponible para esta habitación.'}
                            </p>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};