import { apiClient } from '../api/axios-instance';
import type { ImagenDTO, NewImagenDTO } from '../types/api/Imagen';

const base = '/imagens';

export const ImagenService = {
    getImagens: (params?: Record<string, any>) => apiClient.get<ImagenDTO[]>(base, { params }),
    getImagen: (id: number) => apiClient.get<ImagenDTO>(`${base}/${id}`),
    createImagen: (dto: NewImagenDTO) => apiClient.post<ImagenDTO>(base, dto),
    updateImagen: (id: number, dto: ImagenDTO) => apiClient.put<ImagenDTO>(`${base}/${id}`, dto),
    partialUpdateImagen: (id: number, dto: Partial<ImagenDTO>) => apiClient.patch<ImagenDTO>(`${base}/${id}`, dto),
    deleteImagen: (id: number) => apiClient.delete<void>(`${base}/${id}`),
};
