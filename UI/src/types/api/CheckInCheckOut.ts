import type { ReservaDetalleDTO } from './ReservaDetalle';

export interface CheckInCheckOutDTO {
    id?: number;
    fechaHoraCheckIn: string;
    fechaHoraCheckOut?: string | null;
    estado?: string; // enum EstadoCheckInCheckOut
    comentarios?: string | null;
    activo?: boolean;
    reservaDetalle?: ReservaDetalleDTO | null;
}

export type NewCheckInCheckOutDTO = Omit<CheckInCheckOutDTO, 'id'> & { id?: null };
