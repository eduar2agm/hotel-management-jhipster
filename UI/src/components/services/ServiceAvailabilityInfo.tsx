import { Clock, CalendarDays, Users, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { ServicioDisponibilidadDTO } from '../../types/api/ServicioDisponibilidad';
import { DiaSemana } from '../../types/enums';

interface ServiceAvailabilityInfoProps {
    disponibilidades: ServicioDisponibilidadDTO[];
}

const daysMap: Record<string, string> = {
    [DiaSemana.LUNES]: 'Lun',
    [DiaSemana.MARTES]: 'Mar',
    [DiaSemana.MIERCOLES]: 'Mié',
    [DiaSemana.JUEVES]: 'Jue',
    [DiaSemana.VIERNES]: 'Vie',
    [DiaSemana.SABADO]: 'Sáb',
    [DiaSemana.DOMINGO]: 'Dom',
};

const daysFullMap: Record<string, string> = {
    [DiaSemana.LUNES]: 'Lunes',
    [DiaSemana.MARTES]: 'Martes',
    [DiaSemana.MIERCOLES]: 'Miércoles',
    [DiaSemana.JUEVES]: 'Jueves',
    [DiaSemana.VIERNES]: 'Viernes',
    [DiaSemana.SABADO]: 'Sábado',
    [DiaSemana.DOMINGO]: 'Domingo',
};

/**
 * Componente que muestra información de disponibilidad de un servicio
 */
export const ServiceAvailabilityInfo = ({ disponibilidades }: ServiceAvailabilityInfoProps) => {
    if (!disponibilidades || disponibilidades.length === 0) {
        return (
            <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Info size={16} />
                <span>No hay disponibilidad configurada</span>
            </div>
        );
    }

    // Agrupar por día de la semana
    const disponibilidadesPorDia = disponibilidades.reduce((acc, disp) => {
        const dia = disp.diaSemana;
        if (!acc[dia]) acc[dia] = [];
        acc[dia].push(disp);
        return acc;
    }, {} as Record<string, ServicioDisponibilidadDTO[]>);

    return (
        <div className="space-y-4">
            {/* Días disponibles - Badges */}
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <CalendarDays size={16} className="text-gray-600" />
                    <span className="text-sm font-semibold text-gray-700">Días disponibles</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {Object.keys(disponibilidadesPorDia).map((dia) => (
                        <Badge
                            key={dia}
                            variant="outline"
                            className="bg-green-50 text-green-700 border-green-200"
                        >
                            {daysMap[dia] || dia}
                        </Badge>
                    ))}
                </div>
            </div>

            {/* Horarios detallados */}
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <Clock size={16} className="text-gray-600" />
                    <span className="text-sm font-semibold text-gray-700">Horarios</span>
                </div>
                <div className="space-y-2">
                    {Object.entries(disponibilidadesPorDia).map(([dia, disps]) => (
                        <Card key={dia} className="bg-gray-50 border-gray-200">
                            <CardContent className="p-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="font-medium text-sm text-gray-900 mb-1">
                                            {daysFullMap[dia] || dia}
                                        </div>
                                        <div className="space-y-1">
                                            {disps.map((disp, idx) => (
                                                <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Clock size={14} className="text-gray-400" />
                                                    <span>
                                                        {disp.horaFija
                                                            ? `Hora fija: ${disp.horaInicio}`
                                                            : `${disp.horaInicio} - ${disp.horaFin || ''}`}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                        <Users size={14} />
                                        <span>
                                            {disps[0].cupoMaximo} {disps[0].cupoMaximo === 1 ? 'cupo' : 'cupos'}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
};
