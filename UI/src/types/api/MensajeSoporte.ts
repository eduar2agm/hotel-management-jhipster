import type { ReservaDTO } from './Reserva';

export interface MensajeSoporteDTO {
    id?: number;
    mensaje: string;
    fechaMensaje: string;
    userId: string;
    userName?: string;
    destinatarioId?: string;
    destinatarioName?: string;
    remitente?: string;
    leido?: boolean;
    activo?: boolean;
    reserva?: ReservaDTO | null;
}

export type NewMensajeSoporteDTO = Omit<MensajeSoporteDTO, 'id'> & { id?: null };
