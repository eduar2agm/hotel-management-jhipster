import { useState, useEffect, useMemo } from 'react';
import { ServicioDisponibilidadService } from '../services/servicio-disponibilidad.service';
import { ServicioContratadoService } from '../services/servicio-contratado.service';
import type { ServicioDisponibilidadConCuposDTO } from '../types/api/ServicioDisponibilidadConCupos';
import type { ServicioContratadoDTO } from '../types/api/ServicioContratado';
import type { ReservaDTO } from '../types/api/Reserva';
import { format, parseISO, startOfDay } from 'date-fns';

interface UseServiceAvailabilityProps {
    servicioId: number;
    reserva?: ReservaDTO | null;
    clienteId?: number | null; // Para validar reservas existentes del cliente
}

interface AvailabilitySlot extends ServicioDisponibilidadConCuposDTO {
    isAvailable: boolean;
    reason?: string;
    isAlreadyBooked?: boolean; // Nueva propiedad para indicar si ya está reservado por el cliente
}

/**
 * Hook personalizado para manejar la disponibilidad de servicios
 * Calcula slots disponibles basándose en:
 * - Configuración de disponibilidad del servicio
 * - Fechas de la reserva del cliente
 * - Cupos disponibles
 * - Servicios ya contratados por el cliente (evita duplicados)
 */
export const useServiceAvailability = ({ servicioId, reserva, clienteId }: UseServiceAvailabilityProps) => {
    const [loading, setLoading] = useState(false);
    const [disponibilidades, setDisponibilidades] = useState<ServicioDisponibilidadConCuposDTO[]>([]);
    const [serviciosContratados, setServiciosContratados] = useState<ServicioContratadoDTO[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Calcular rango de fechas basado en la reserva
    const dateRange = useMemo(() => {
        if (!reserva?.fechaInicio || !reserva?.fechaFin) {
            // Si no hay reserva, usar los próximos 30 días
            const now = new Date();
            const end = new Date();
            end.setDate(end.getDate() + 30);
            return {
                start: format(now, 'yyyy-MM-dd'),
                end: format(end, 'yyyy-MM-dd'),
            };
        }

        // Usar parseISO para fechas UTC y formatear correctamente
        const startDate = startOfDay(parseISO(reserva.fechaInicio));
        const endDate = startOfDay(parseISO(reserva.fechaFin));

        return {
            start: format(startDate, 'yyyy-MM-dd'),
            end: format(endDate, 'yyyy-MM-dd'),
        };
    }, [reserva]);

    // Cargar disponibilidades con cupos
    useEffect(() => {
        const fetchDisponibilidades = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await ServicioDisponibilidadService.getDisponibilidadConCupos(
                    servicioId,
                    dateRange.start,
                    dateRange.end
                );
                setDisponibilidades(response.data);
            } catch (err) {
                console.error('Error loading service availability:', err);
                setError('No se pudo cargar la disponibilidad del servicio');
            } finally {
                setLoading(false);
            }
        };

        if (servicioId) {
            fetchDisponibilidades();
        }
    }, [servicioId, dateRange.start, dateRange.end]);

    // Cargar servicios ya contratados por el cliente para evitar duplicados
    useEffect(() => {
        const fetchClienteServicios = async () => {
            if (!clienteId || !servicioId) {
                setServiciosContratados([]);
                return;
            }

            try {
                const response = await ServicioContratadoService.getByClienteServicioAndFechas(
                    clienteId,
                    servicioId,
                    dateRange.start + 'T00:00:00Z',
                    dateRange.end + 'T23:59:59Z'
                );
                setServiciosContratados(response.data);
            } catch (err) {
                console.error('Error loading client services:', err);
                // No mostramos error al usuario, solo no marcamos como reservado
                setServiciosContratados([]);
            }
        };

        fetchClienteServicios();
    }, [clienteId, servicioId, dateRange.start, dateRange.end]);

    // Calcular slots disponibles con lógica de negocio
    const availableSlots = useMemo<AvailabilitySlot[]>(() => {
        return disponibilidades.map(disp => {
            let isAvailable = true;
            let reason: string | undefined;
            let isAlreadyBooked = false;

            // Verificar si el cliente ya tiene este servicio reservado en esta fecha/hora
            if (disp.fecha && disp.horaInicio) {
                const isBooked = serviciosContratados.some(sc => {
                    if (!sc.fechaServicio) return false;

                    const scDate = new Date(sc.fechaServicio);
                    const scDateStr = format(scDate, 'yyyy-MM-dd');
                    const scHour = scDate.getHours();
                    const scMinute = scDate.getMinutes();

                    // Comparar fecha
                    if (scDateStr !== disp.fecha) return false;

                    // Parsear horaInicio (formato 'HH:mm:ss' o 'HH:mm')
                    const [dispHourStr, dispMinuteStr] = disp.horaInicio.split(':');
                    const dispHour = parseInt(dispHourStr, 10);
                    const dispMinute = parseInt(dispMinuteStr, 10);

                    return dispHour === scHour && dispMinute === scMinute;
                });

                if (isBooked) {
                    isAlreadyBooked = true;
                    isAvailable = false;
                    reason = 'Ya tienes este servicio reservado en este horario';
                }
            }

            // Verificar si hay cupos disponibles (solo si no está ya reservado)
            if (!isAlreadyBooked && disp.cuposDisponibles <= 0) {
                isAvailable = false;
                reason = 'Sin cupos disponibles';
            }

            // Verificar si la fecha está en el pasado
            if (!isAlreadyBooked && disp.fecha) {
                const dispDate = new Date(disp.fecha);
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                if (dispDate < today) {
                    isAvailable = false;
                    reason = 'Fecha pasada';
                }
            }

            return {
                ...disp,
                isAvailable,
                isAlreadyBooked,
                reason,
            };
        });
    }, [disponibilidades, serviciosContratados]);

    // Agrupar slots por fecha
    const slotsByDate = useMemo(() => {
        const grouped: Record<string, AvailabilitySlot[]> = {};

        availableSlots.forEach(slot => {
            if (slot.fecha) {
                if (!grouped[slot.fecha]) {
                    grouped[slot.fecha] = [];
                }
                grouped[slot.fecha].push(slot);
            }
        });

        return grouped;
    }, [availableSlots]);

    // Obtener fechas disponibles (con al menos un slot disponible)
    const availableDates = useMemo(() => {
        return Object.entries(slotsByDate)
            .filter(([_, slots]) => slots.some(s => s.isAvailable))
            .map(([date]) => date)
            .sort();
    }, [slotsByDate]);

    // Verificar si un día específico tiene disponibilidad
    const isDayAvailable = (date: string): boolean => {
        return availableDates.includes(date);
    };

    // Obtener slots para una fecha específica
    const getSlotsForDate = (date: string): AvailabilitySlot[] => {
        return slotsByDate[date] || [];
    };

    // Obtener el slot con más cupos disponibles para una fecha
    const getBestSlotForDate = (date: string): AvailabilitySlot | null => {
        const slots = getSlotsForDate(date).filter(s => s.isAvailable);
        if (slots.length === 0) return null;

        return slots.reduce((best, current) =>
            current.cuposDisponibles > best.cuposDisponibles ? current : best
        );
    };

    return {
        loading,
        error,
        disponibilidades,
        availableSlots,
        slotsByDate,
        availableDates,
        dateRange,
        isDayAvailable,
        getSlotsForDate,
        getBestSlotForDate,
    };
};
