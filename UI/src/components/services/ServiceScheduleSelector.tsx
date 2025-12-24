import { useState, useEffect } from 'react';
import { Calendar, Clock, Users, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { useServiceAvailability } from '../../hooks/useServiceAvailability';
import type { ReservaDTO } from '../../types/api/Reserva';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface ServiceScheduleSelectorProps {
    servicioId: number;
    reserva?: ReservaDTO | null;
    clienteId?: number | null; // Para validar reservas existentes del cliente
    onSelect: (fechas: string[], hora: string) => void;
    selectedFechas?: string[];
    selectedHora?: string;
    onQuotaAvailable?: (quota: number) => void;
}

/**
 * Componente de selección inteligente de horarios para servicios
 * - Muestra solo días disponibles según la reserva del cliente
 * - Verifica cupos disponibles
 * - Valida que el cliente no tenga ya el servicio reservado en el mismo horario
 * - Permite seleccionar día y hora
 */
export const ServiceScheduleSelector = ({
    servicioId,
    reserva,
    clienteId,
    onSelect,
    selectedFechas = [],
    selectedHora,
    onQuotaAvailable,
}: ServiceScheduleSelectorProps) => {
    const {
        loading,
        error,
        availableDates,
        getSlotsForDate,
        isDayAvailable,
        dateRange,
    } = useServiceAvailability({ servicioId, reserva, clienteId });

    const [localSelectedDates, setLocalSelectedDates] = useState<string[]>(selectedFechas);
    const [localSelectedTime, setLocalSelectedTime] = useState<string>(selectedHora || '');

    // Sincronizar con props
    useEffect(() => {
        if (selectedFechas.length > 0) setLocalSelectedDates(selectedFechas);
        if (selectedHora) setLocalSelectedTime(selectedHora);
    }, [selectedFechas, selectedHora]);

    // Notificar cambios
    useEffect(() => {
        if (localSelectedDates.length > 0 && localSelectedTime) {
            onSelect(localSelectedDates, localSelectedTime);

            // Calculate minimum quota across all selected dates for the selected time
            if (onQuotaAvailable) {
                const quotas = localSelectedDates.map(date => {
                    const slots = getSlotsForDate(date);
                    const slot = slots.find(s => s.horaInicio === localSelectedTime);
                    return slot ? slot.cuposDisponibles : 0;
                });

                // If any date has 0 quota or no slot found, max is 0
                const minQuota = quotas.length > 0 ? Math.min(...quotas) : 0;
                onQuotaAvailable(minQuota);
            }
        } else {
            onSelect([], '');
            if (onQuotaAvailable) onQuotaAvailable(0);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [localSelectedDates, localSelectedTime]); // onSelect and onQuotaAvailable omitted intentionally

    // Obtener slots para todos los días seleccionados
    const allSelectedSlots = localSelectedDates.flatMap(date => getSlotsForDate(date)).filter(s => s.isAvailable);
    // Para mostrar horarios, usar el primer día seleccionado o cualquier día si no hay selección
    const displayDate = localSelectedDates[0] || availableDates[0] || '';
    const displaySlots = displayDate ? getSlotsForDate(displayDate).filter(s => s.isAvailable) : [];

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }

    if (availableDates.length === 0) {
        return (
            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    No hay disponibilidad para este servicio en las fechas de su reserva.
                    {reserva && (
                        <div className="mt-2 text-sm">
                            Reserva: {format(parseISO(reserva.fechaInicio!), 'dd/MM/yyyy', { locale: es })}
                            {' - '}
                            {format(parseISO(reserva.fechaFin!), 'dd/MM/yyyy', { locale: es })}
                        </div>
                    )}
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="space-y-4">
            {/* Información de la reserva */}
            {reserva && (
                <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
                    <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <AlertDescription className="text-blue-900 dark:text-blue-300">
                        <div className="font-medium mb-1">Servicio disponible durante su estadía</div>
                        <div className="text-sm">
                            Del {format(parseISO(reserva.fechaInicio!), 'dd/MM/yyyy', { locale: es })}
                            {' al '}
                            {format(parseISO(reserva.fechaFin!), 'dd/MM/yyyy', { locale: es })}
                        </div>
                    </AlertDescription>
                </Alert>
            )}

            {/* Selector de Fechas (Múltiple) */}
            <div className="space-y-2">
                <Label className="flex items-center gap-2">
                    <Calendar size={16} />
                    Seleccionar Días {localSelectedDates.length > 0 && `(${localSelectedDates.length} seleccionados)`}
                </Label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1">
                    {availableDates.map(date => {
                        const dateObj = parseISO(date);
                        const isSelected = localSelectedDates.includes(date);
                        const slots = getSlotsForDate(date);
                        const availableCount = slots.filter(s => s.isAvailable).length;
                        const totalCupos = slots.reduce((sum, s) => sum + (s.cuposDisponibles || 0), 0);

                        return (
                            <Button
                                key={date}
                                type="button"
                                variant={isSelected ? 'default' : 'outline'}
                                className={`flex flex-col h-auto py-2 px-3 relative ${isSelected
                                    ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 bg-card text-card-foreground'
                                    }`}
                                onClick={() => {
                                    setLocalSelectedDates(prev =>
                                        isSelected
                                            ? prev.filter(d => d !== date)
                                            : [...prev, date]
                                    );
                                    // No resetear hora cuando se selecciona/deselecciona
                                }}
                            >
                                {isSelected && (
                                    <div className="absolute top-1 right-1">
                                        <CheckCircle2 size={14} />
                                    </div>
                                )}
                                <div className="text-xs font-medium">
                                    {format(dateObj, 'EEE', { locale: es })}
                                </div>
                                <div className="text-lg font-bold">
                                    {format(dateObj, 'dd', { locale: es })}
                                </div>
                                <div className="text-xs opacity-80">
                                    {format(dateObj, 'MMM', { locale: es })}
                                </div>
                                {totalCupos <= 3 && totalCupos > 0 && (
                                    <Badge
                                        variant="secondary"
                                        className="text-xs mt-1 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
                                    >
                                        {totalCupos} cupos
                                    </Badge>
                                )}
                            </Button>
                        );
                    })}
                </div>
            </div>

            {/* Selector de Hora */}
            {localSelectedDates.length > 0 && displaySlots.length > 0 && (
                <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                        <Clock size={16} />
                        Seleccionar Horario
                    </Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {displaySlots.map((slot, idx) => {
                            const isSelected = localSelectedTime === slot.horaInicio;
                            const cuposColor =
                                slot.cuposDisponibles > 5 ? 'text-green-600' :
                                    slot.cuposDisponibles > 2 ? 'text-orange-600' :
                                        'text-red-600';

                            return (
                                <Card
                                    key={idx}
                                    className={`cursor-pointer transition-all  ${isSelected
                                        ? 'border-green-600 bg-yellow-50 dark:bg-green-900/20 shadow-md'
                                        : 'border-gray-200 dark:border-gray-700 bg-card hover:border-yellow-400 dark:hover:border-green-500 hover:shadow'
                                        }`}
                                    onClick={() => setLocalSelectedTime(slot.horaInicio)}
                                >
                                    <CardContent className="p-3">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-1">
                                                <Clock size={14} className="text-gray-500" />
                                                <span className="font-medium text-sm">
                                                    {slot.horaInicio}
                                                </span>
                                            </div>
                                            {isSelected && (
                                                <CheckCircle2 size={16} className="text-green-600" />
                                            )}
                                        </div>
                                        {!slot.horaFija && slot.horaFin && (
                                            <div className="text-xs text-gray-500 mb-1">
                                                hasta {slot.horaFin}
                                            </div>
                                        )}
                                        <div className={`flex items-center gap-1 text-xs ${cuposColor} dark:text-gray-300`}>
                                            <Users size={12} />
                                            <span className="font-semibold">
                                                {slot.cuposDisponibles} disponibles
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* No hay horarios disponibles */}
            {localSelectedDates.length > 0 && displaySlots.length === 0 && (
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        No hay horarios disponibles para esta fecha. Por favor seleccione otro día.
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
};
