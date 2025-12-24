import type { ServicioDTO } from '../../types/api/Servicio';
import { TipoServicio } from '../../types/api/Servicio';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Pencil, Trash2, Image as ImageIcon, Clock, Eye } from 'lucide-react';
import { getImageUrl } from '../../utils/imageUtils';

interface ServiceCardProps {
    servicio: ServicioDTO;
    onEdit?: (servicio: ServicioDTO) => void;
    onDelete?: (id: number) => void;
    onToggleActive?: (id: number, currentStatus: boolean | undefined) => void;
    onManageAvailability?: (servicio: ServicioDTO) => void;
    onViewDetails?: (servicio: ServicioDTO) => void;
    readOnly?: boolean;
}

export const ServiceCard = ({ servicio, onEdit, onDelete, onToggleActive, onManageAvailability, onViewDetails, readOnly = false }: ServiceCardProps) => {
    return (
        <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group border-border">
            <div className="relative h-48 bg-muted overflow-hidden">
                {servicio.urlImage ? (
                    <img
                        src={getImageUrl(servicio.urlImage)}
                        alt={servicio.nombre}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                        <ImageIcon className="w-12 h-12" />
                    </div>
                )}
                <div className="absolute top-2 right-2 flex gap-2">
                    <Badge variant={servicio.tipo === TipoServicio.GRATUITO ? "secondary" : "default"} className="font-bold shadow-sm">
                        {servicio.tipo}
                    </Badge>
                </div>
                <div className="absolute top-2 left-2">
                    <Badge variant={servicio.disponible ? "default" : "destructive"} className={servicio.disponible ? "bg-green-600 hover:bg-green-700 shadow-sm" : "shadow-sm"}>
                        {servicio.disponible ? 'Disponible' : 'No disponible'}
                    </Badge>
                </div>
            </div>

            <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-lg text-card-foreground line-clamp-1" title={servicio.nombre}>
                        {servicio.nombre}
                    </h3>
                </div>
                <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-yellow-600">
                        ${servicio.precio}
                    </span>
                    {servicio.tipo === TipoServicio.PAGO && <span className="text-sm text-muted-foreground">/ unidad</span>}
                </div>
            </CardHeader>

            <CardContent className="p-4 pt-0 flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-2 h-10">
                    {servicio.descripcion || 'Sin descripción disponible.'}
                </p>
            </CardContent>

            {/* Render footer if not readOnly OR if viewDetails is available */}
            {(!readOnly || onViewDetails) && (
                <CardFooter className="p-4 bg-muted/30 border-t border-border gap-2 flex justify-end">
                    {onToggleActive && !readOnly && (
                        <div className="mr-auto flex items-center gap-2">
                            <Switch
                                checked={servicio.disponible}
                                onCheckedChange={() => onToggleActive(servicio.id, !servicio.disponible)}
                                className="scale-90"
                            />
                            <span className="text-xs text-muted-foreground font-medium">
                                {servicio.disponible ? 'Activo' : 'Inactivo'}
                            </span>
                        </div>
                    )}

                    {onViewDetails && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                            onClick={() => onViewDetails(servicio)}
                            title="Ver Detalles"
                        >
                            <Eye className="h-4 w-4" />
                        </Button>
                    )}

                    {!readOnly && (
                        <>
                            {onEdit && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-500/10"
                                    onClick={() => onEdit(servicio)}
                                >
                                    <Pencil className="h-4 w-4" />
                                </Button>
                            )}
                            {onManageAvailability && servicio.tipo === TipoServicio.PAGO && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-500/10"
                                    onClick={() => onManageAvailability(servicio)}
                                    title="Gestionar Disponibilidad"
                                >
                                    <div className="relative">
                                        <Pencil className="h-3 w-3 absolute -top-1 -right-1 opacity-50" />
                                        <Clock className="h-4 w-4" />
                                    </div>
                                </Button>
                            )}
                            {onDelete && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-500/10"
                                    onClick={() => onDelete(servicio.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </>
                    )}
                </CardFooter>
            )}
        </Card>
    );
};
