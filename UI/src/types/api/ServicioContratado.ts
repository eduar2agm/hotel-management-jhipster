import type { ServicioDTO } from './Servicio';
import type { ReservaDTO } from './Reserva';
import type { ClienteDTO } from './Cliente';
import type { PagoDTO } from './Pago';

export enum EstadoServicioContratado {
    PENDIENTE = 'PENDIENTE',
    CONFIRMADO = 'CONFIRMADO',
    CANCELADO = 'CANCELADO',
    COMPLETADO = 'COMPLETADO',
}

export interface ServicioContratadoDTO {
    id: number;
    fechaContratacion: string;
    cantidad: number;
    precioUnitario: string | number;
    estado: EstadoServicioContratado;
    observaciones?: string | null;
    servicio?: ServicioDTO | null;
    reserva?: ReservaDTO | null;
    cliente?: ClienteDTO | null;
    pago?: PagoDTO | null;
}

export type NewServicioContratadoDTO = Omit<ServicioContratadoDTO, 'id'> | { id?: null };
