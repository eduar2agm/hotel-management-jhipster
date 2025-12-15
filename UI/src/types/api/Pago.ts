import type { ReservaDTO } from './Reserva';

export interface PagoDTO {
    id?: number;
    fechaPago: string;
    monto: string; // BigDecimal -> string
    metodoPago?: string; // enum MetodoPago
    estado?: string; // enum EstadoPago
    plataformaPagoId?: string | null;
    activo?: boolean;
    reserva?: ReservaDTO | null;
}

export type NewPagoDTO = Omit<PagoDTO, 'id'> & { id?: null };
