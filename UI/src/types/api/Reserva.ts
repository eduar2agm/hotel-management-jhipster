export interface ReservaDTO {
    id?: number;
    fechaReserva?: string | null;
    fechaInicio?: string | null;
    fechaFin?: string | null;
    estado?: string | null;
    activo?: boolean | null;
    // Aquí puedes añadir campos relacionados con relaciones, por ejemplo clienteId, habitacionId, etc.
    clienteId?: number | null;
    habitacionId?: number | null;
}

export type NewReservaDTO = Omit<ReservaDTO, 'id'> & { id?: null };
