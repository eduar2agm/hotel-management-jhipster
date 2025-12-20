import type { ImagenDTO } from './Imagen';

export enum TipoConfiguracion {
    TEXT = 'TEXT',
    NUMBER = 'NUMBER',
    BOOLEAN = 'BOOLEAN',
    IMAGE = 'IMAGE',
}

export interface ConfiguracionSistemaDTO {
    id?: number;
    clave: string;
    valor?: string | null;
    tipo: TipoConfiguracion;
    categoria?: string | null;
    descripcion?: string | null;
    activo: boolean;
    fechaModificacion?: string | null;
    imagen?: ImagenDTO | null;
}

export type NewConfiguracionSistemaDTO = Omit<ConfiguracionSistemaDTO, 'id'> & { id?: null };
