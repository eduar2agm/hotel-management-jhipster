import type { ClienteDTO } from './Cliente';

export interface ReservaDTO {
    id?: number;
    fechaReserva?: string | null;
    fechaInicio?: string | null;
    fechaFin?: string | null;
    estado?: string | null; // Should ideally use EstadoReserva enum, but keeping string for compatibility with existing code until full refactor
    totalCalculado?: number | null;
    total?: number | null; // Added to support frontend usage
    activo?: boolean | null;
    cliente?: ClienteDTO | { id: number; nombre?: string; apellido?: string; numeroIdentificacion?: string } | null;
    habitacion?: { id: number; numero?: string } | null;
    // Helper fields if needed, but backend expects objects
    clienteId?: number | null;
    habitacionId?: number | null;
}

export type NewReservaDTO = Omit<ReservaDTO, 'id'> & { id?: null };
