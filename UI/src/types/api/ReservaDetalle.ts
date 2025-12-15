import type { ReservaDTO } from './Reserva';
import type { HabitacionDTO } from './Habitacion';

export interface ReservaDetalleDTO {
    id?: number;
    nota?: string | null;
    precioUnitario?: number | null;
    activo: boolean;
    reserva?: ReservaDTO | null;
    habitacion?: HabitacionDTO | null;
}

export type NewReservaDetalleDTO = Omit<ReservaDetalleDTO, 'id'> & { id?: null };
