import type { ReservaDTO } from './Reserva';

export interface PagoDTO {
    id?: number;
    fechaPago: string;
    monto: string; // BigDecimal -> string
    metodoPago?: string; // enum
    estado?: string; // enum
    activo?: boolean;
    reserva?: ReservaDTO | null;
}

export type NewPagoDTO = Omit<PagoDTO, 'id'> & { id?: null };
