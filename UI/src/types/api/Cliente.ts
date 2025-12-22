export interface ClienteDTO {
    id?: number;
    nombre: string;
    apellido: string;
    correo: string;
    telefono: string;
    direccion?: string | null;
    tipoIdentificacion?: string | null; // enum
    numeroIdentificacion?: string | null;
    keycloakId?: string | null;
    activo?: boolean;
    fechaNacimiento?: string;
}

export type NewClienteDTO = Omit<ClienteDTO, 'id'> & { id?: null };
