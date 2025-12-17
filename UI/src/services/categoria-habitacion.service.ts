import { apiClient } from '../api/axios-instance';
import type { CategoriaHabitacionDTO, NewCategoriaHabitacionDTO } from '../types/api';

const base = '/categoria-habitacions';

export const CategoriaHabitacionService = {
    getCategorias: (params?: Record<string, any>) => apiClient.get<CategoriaHabitacionDTO[]>(base, { params }),
    getCategoria: (id: number) => apiClient.get<CategoriaHabitacionDTO>(`${base}/${id}`),
    getCategoriasInactivas: (params?: Record<string, any>) => apiClient.get<CategoriaHabitacionDTO[]>(`${base}/inactive`, { params }),
    activarCategoria: (id: number) => apiClient.put<void>(`${base}/${id}/activate`),
    desactivarCategoria: (id: number) => apiClient.put<void>(`${base}/${id}/deactivate`),
    createCategoria: (dto: NewCategoriaHabitacionDTO) => apiClient.post<CategoriaHabitacionDTO>(base, dto),
    updateCategoria: (id: number, dto: CategoriaHabitacionDTO) => apiClient.put<CategoriaHabitacionDTO>(`${base}/${id}`, dto),
    partialUpdateCategoria: (id: number, dto: Partial<CategoriaHabitacionDTO>) => apiClient.patch<CategoriaHabitacionDTO>(`${base}/${id}`, dto),
    deleteCategoria: (id: number) => apiClient.delete<void>(`${base}/${id}`),
};
