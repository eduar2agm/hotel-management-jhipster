export enum TipoServicio {
    GRATUITO = 'GRATUITO',
    PAGO = 'PAGO',
}

export interface ServicioDTO {
    id: number;
    nombre: string;
    descripcion?: string | null;
    tipo: TipoServicio;
    precio: string | number;
    disponible: boolean;
    urlImage?: string | null;
}

export type NewServicioDTO = Omit<ServicioDTO, 'id'> | { id?: null };
