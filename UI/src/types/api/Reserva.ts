export interface ReservaDTO {
    id?: number;
    fechaReserva?: string | null;
    fechaInicio?: string | null;
    fechaFin?: string | null;
    estado?: string | null; // Should ideally use EstadoReserva enum, but keeping string for compatibility with existing code until full refactor
    totalCalculado?: number | null;
    activo?: boolean | null;
    cliente?: { id: number; nombre?: string; apellido?: string } | null;
    habitacion?: { id: number; numero?: string } | null;
    // Helper fields if needed, but backend expects objects
    clienteId?: number | null;
    habitacionId?: number | null;
}

export type NewReservaDTO = Omit<ReservaDTO, 'id'> & { id?: null };
