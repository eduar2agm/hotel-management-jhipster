import { apiClient } from '../api/axios-instance';
import type { CheckInCheckOutDTO, NewCheckInCheckOutDTO } from '../types/api';

const base = '/api/check-in-check-outs';

export const CheckInCheckOutService = {
    getAll: (params?: Record<string, any>) => apiClient.get<CheckInCheckOutDTO[]>(base, { params }),
    getOne: (id: number) => apiClient.get<CheckInCheckOutDTO>(`${base}/${id}`),
    create: (dto: NewCheckInCheckOutDTO) => apiClient.post<CheckInCheckOutDTO>(base, dto),
    update: (id: number, dto: CheckInCheckOutDTO) => apiClient.put<CheckInCheckOutDTO>(`${base}/${id}`, dto),
    partialUpdate: (id: number, dto: Partial<CheckInCheckOutDTO>) => apiClient.patch<CheckInCheckOutDTO>(`${base}/${id}`, dto),
    deleteOne: (id: number) => apiClient.delete<void>(`${base}/${id}`),
};
