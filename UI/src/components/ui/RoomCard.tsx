import type { HabitacionDTO } from '../../types/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { BedDouble, DollarSign, Image as ImageIcon, Pencil, Trash2, Eye, Info, CheckCircle2, XCircle } from 'lucide-react';
import { useState } from 'react';

import { getImageUrl } from '../../utils/imageUtils';

interface RoomCardProps {
    habitacion: HabitacionDTO;
    onEdit?: (h: HabitacionDTO) => void;
    onDelete?: (id: number) => void;
    onToggleActive?: (id: number, currentStatus: boolean | undefined) => void;
}

export const RoomCard = ({ habitacion: h, onEdit, onDelete, onToggleActive }: RoomCardProps) => {
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    return (
        <>
            <Card className="overflow-hidden hover:shadow-xl hover:border-primary/50 transition-all group border-border bg-card dark:bg-card/50">
                <div className="relative h-48 w-full bg-gray-200 overflow-hidden">
                    {h.imagen ? (
                        <img
                            src={getImageUrl(h.imagen)}
                            alt={`Habitación ${h.numero}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground bg-muted">
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
                        <Badge variant="secondary" className="bg-background/90 text-foreground shadow-sm backdrop-blur-sm">
                            #{h.numero}
                        </Badge>
                    </div>
                </div>

                <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <h3 className="font-bold text-lg text-card-foreground">{h.categoriaHabitacion?.nombre}</h3>
                            <p className="text-sm text-yellow-600 dark:text-yellow-500 font-bold flex items-center gap-1">
                                <DollarSign className="h-3.5 w-3.5" />
                                {h.categoriaHabitacion?.precioBase} / noche
                            </p>
                        </div>
                        <div className="flex items-center text-muted-foreground text-xs font-medium bg-muted px-2 py-1 rounded">
                            <BedDouble className="h-3.5 w-3.5 mr-1" />
                            {h.capacidad} pax
                        </div>
                    </div>

                    <p className="text-muted-foreground text-sm line-clamp-2 mb-4 h-10">
                        {h.descripcion || 'Sin descripción detallada disponible.'}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-border">
                        <div className="flex items-center gap-2">
                            <div className={`h-2.5 w-2.5 rounded-full ${h.activo ? 'bg-green-500' : 'bg-muted-foreground'}`}></div>
                            <span className="text-xs font-medium text-muted-foreground">{h.activo ? 'Habilitada' : 'Deshabilitada'}</span>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsDetailsOpen(true)}
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                title="Ver Detalles"
                            >
                                <Eye className="h-4 w-4" />
                            </Button>
                            {onEdit && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onEdit(h)}
                                    className="h-8 w-8 p-0 text-muted-foreground hover:text-yellow-600 dark:hover:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                                    title="Editar"
                                >
                                    <Pencil className="h-4 w-4" />
                                </Button>
                            )}
                            {onToggleActive && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => h.id && onToggleActive(h.id, h.activo)}
                                    className="h-8 w-8 p-0 text-muted-foreground hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                                    title={h.activo ? "Desactivar" : "Activar"}
                                >
                                    {h.activo ? <XCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-500" />}
                                </Button>
                            )}
                            {onDelete && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => h.id && onDelete(h.id)}
                                    className="h-8 w-8 p-0 text-muted-foreground hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                    title="Eliminar"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
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
                        <div className="relative h-56 w-full rounded-lg overflow-hidden bg-muted">
                            {h.imagen ? (
                                <img src={getImageUrl(h.imagen)} alt={`Full ${h.numero}`} className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex items-center justify-center h-full text-muted-foreground">
                                    <ImageIcon className="h-12 w-12" />
                                </div>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="font-semibold text-muted-foreground block">Categoría</span>
                                <span className="text-foreground">{h.categoriaHabitacion?.nombre}</span>
                            </div>
                            <div>
                                <span className="font-semibold text-muted-foreground block">Precio Base</span>
                                <span className="text-foreground font-bold">${h.categoriaHabitacion?.precioBase}</span>
                            </div>
                            <div>
                                <span className="font-semibold text-muted-foreground block">Capacidad</span>
                                <span className="text-foreground">{h.capacidad} Personas</span>
                            </div>
                            <div>
                                <span className="font-semibold text-muted-foreground block">Estado Actual</span>
                                <Badge variant="outline" className={cn(
                                    h.estadoHabitacion?.nombre === 'DISPONIBLE' ? 'text-green-600 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/30' : 
                                    'text-red-600 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30'
                                )}>
                                    {h.estadoHabitacion?.nombre}
                                </Badge>
                            </div>
                        </div>
                        <div>
                            <span className="font-semibold text-muted-foreground block text-sm mb-1">Descripción</span>
                            <p className="text-sm text-foreground bg-muted/50 p-3 rounded-md border border-border">
                                {h.descripcion || 'No hay descripción disponible para esta habitación.'}
                            </p>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};