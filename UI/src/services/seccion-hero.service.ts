import { apiClient } from '../api/axios-instance';
import type { SeccionHeroDTO, NewSeccionHeroDTO } from '../types/api/SeccionHero';

const base = '/seccion-heroes';

export const SeccionHeroService = {
  getSeccionHeroes: (params?: any) => apiClient.get<SeccionHeroDTO[]>(base, { params }),
  getSeccionHero: (id: number) => apiClient.get<SeccionHeroDTO>(`${base}/${id}`),
  createSeccionHero: (dto: NewSeccionHeroDTO) => apiClient.post<SeccionHeroDTO>(base, dto),
  updateSeccionHero: (id: number, dto: SeccionHeroDTO) => apiClient.put<SeccionHeroDTO>(`${base}/${id}`, dto),
  partialUpdateSeccionHero: (id: number, dto: Partial<SeccionHeroDTO>) => apiClient.patch<SeccionHeroDTO>(`${base}/${id}`, dto),
  deleteSeccionHero: (id: number) => apiClient.delete<void>(`${base}/${id}`),
  
  // Custom upload endpoint
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post<string>(`${base}/upload-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
};
