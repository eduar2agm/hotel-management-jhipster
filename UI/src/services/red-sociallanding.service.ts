import { apiClient } from '../api/axios-instance';
import type { RedSociallandingDTO, NewRedSociallandingDTO } from '../types/api/RedSociallanding';

const base = '/red-sociallanding';

export const RedSociallandingService = {
    getRedSociallandings: (params?: Record<string, any>) => apiClient.get<RedSociallandingDTO[]>(base, { params }),
    getRedSociallanding: (id: number) => apiClient.get<RedSociallandingDTO>(`${base}/${id}`),
    createRedSociallanding: (dto: NewRedSociallandingDTO) => apiClient.post<RedSociallandingDTO>(base, dto),
    updateRedSociallanding: (id: number, dto: RedSociallandingDTO) => apiClient.put<RedSociallandingDTO>(`${base}/${id}`, dto),
    partialUpdateRedSociallanding: (id: number, dto: Partial<RedSociallandingDTO>) => apiClient.patch<RedSociallandingDTO>(`${base}/${id}`, dto),
    deleteRedSociallanding: (id: number) => apiClient.delete<void>(`${base}/${id}`),
};
