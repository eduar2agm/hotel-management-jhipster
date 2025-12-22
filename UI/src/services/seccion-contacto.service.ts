import { apiClient } from '../api/axios-instance';
import type { SeccionContactoDTO, NewSeccionContactoDTO } from '../types/api/SeccionContacto';

const base = '/seccion-contactos';

export const SeccionContactoService = {
    getSeccionContactos: (params?: Record<string, any>) => apiClient.get<SeccionContactoDTO[]>(base, { params }),
    getSeccionContacto: (id: number) => apiClient.get<SeccionContactoDTO>(`${base}/${id}`),
    createSeccionContacto: (dto: NewSeccionContactoDTO) => apiClient.post<SeccionContactoDTO>(base, dto),
    updateSeccionContacto: (id: number, dto: SeccionContactoDTO) => apiClient.put<SeccionContactoDTO>(`${base}/${id}`, dto),
    partialUpdateSeccionContacto: (id: number, dto: Partial<SeccionContactoDTO>) => apiClient.patch<SeccionContactoDTO>(`${base}/${id}`, dto),
    deleteSeccionContacto: (id: number) => apiClient.delete<void>(`${base}/${id}`),
};
