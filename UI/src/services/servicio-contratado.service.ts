import { apiClient } from '../api/axios-instance';
import type { ServicioContratadoDTO, NewServicioContratadoDTO } from '../types/api/ServicioContratado';

const base = '/servicio-contratados';

export const ServicioContratadoService = {
    getAll: (params?: Record<string, any>) => apiClient.get<ServicioContratadoDTO[]>(base, { params }),
    getById: (id: number) => apiClient.get<ServicioContratadoDTO>(`${base}/${id}`),
    getByReservaId: (reservaId: number) => apiClient.get<ServicioContratadoDTO[]>(`${base}/reserva/${reservaId}`),
    getByClienteServicioAndFechas: (
        clienteId: number,
        servicioId: number,
        fechaInicio: string,
        fechaFin: string
    ) => apiClient.get<ServicioContratadoDTO[]>(
        `${base}/cliente/${clienteId}/servicio/${servicioId}/fechas`,
        { params: { fechaInicio, fechaFin } }
    ),

    create: (dto: NewServicioContratadoDTO) => apiClient.post<ServicioContratadoDTO>(base, dto),
    update: (id: number, dto: ServicioContratadoDTO) => apiClient.put<ServicioContratadoDTO>(`${base}/${id}`, dto),
    partialUpdate: (id: number, dto: Partial<ServicioContratadoDTO>) => apiClient.patch<ServicioContratadoDTO>(`${base}/${id}`, dto),
    delete: (id: number) => apiClient.delete<void>(`${base}/${id}`),

    // Actions
    confirmar: (id: number) => apiClient.put<void>(`${base}/${id}/confirmar`),
    completar: (id: number) => apiClient.put<void>(`${base}/${id}/completar`),
    cancelar: (id: number) => apiClient.put<void>(`${base}/${id}/cancelar`),
};
