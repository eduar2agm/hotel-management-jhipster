import type { ReservaDTO } from './Reserva';

export interface MensajeSoporteDTO {
    id?: number;
    mensaje: string;
    fechaMensaje: string;
    userId: string;
    userName?: string | null;
    leido?: boolean;
    activo?: boolean;
    reserva?: ReservaDTO | null;
}

export type NewMensajeSoporteDTO = Omit<MensajeSoporteDTO, 'id'> & { id?: null };
