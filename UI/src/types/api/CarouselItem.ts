import type { ImagenDTO } from './Imagen';
import type { ConfiguracionSistemaDTO } from './ConfiguracionSistema';

export interface CarouselItemDTO {
    id?: number;
    titulo?: string | null;
    descripcion?: string | null;
    orden: number;
    activo: boolean;
    imagen?: ImagenDTO | null;
    configuracion?: ConfiguracionSistemaDTO | null;
}

export type NewCarouselItemDTO = Omit<CarouselItemDTO, 'id'> & { id?: null };
