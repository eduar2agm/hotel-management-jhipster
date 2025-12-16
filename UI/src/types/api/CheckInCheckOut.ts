import type { ReservaDetalleDTO } from './ReservaDetalle';

export interface CheckInCheckOutDTO {
    id?: number;
    fechaHoraCheckIn: string;
    fechaHoraCheckOut?: string | null;
    estado?: string; // enum
    activo?: boolean;
    reservaDetalle?: ReservaDetalleDTO | null;
}

export type NewCheckInCheckOutDTO = Omit<CheckInCheckOutDTO, 'id'> & { id?: null };
