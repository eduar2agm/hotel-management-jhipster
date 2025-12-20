import { apiClient } from '../api/axios-instance';
import type { CarouselItemDTO, NewCarouselItemDTO } from '../types/api/CarouselItem';

const base = '/carousel-items';

export const CarouselItemService = {
    getCarouselItems: (params?: Record<string, any>) => apiClient.get<CarouselItemDTO[]>(base, { params }),
    getCarouselItem: (id: number) => apiClient.get<CarouselItemDTO>(`${base}/${id}`),
    createCarouselItem: (dto: NewCarouselItemDTO) => apiClient.post<CarouselItemDTO>(base, dto),
    updateCarouselItem: (id: number, dto: CarouselItemDTO) => apiClient.put<CarouselItemDTO>(`${base}/${id}`, dto),
    partialUpdateCarouselItem: (id: number, dto: Partial<CarouselItemDTO>) => apiClient.patch<CarouselItemDTO>(`${base}/${id}`, dto),
    deleteCarouselItem: (id: number) => apiClient.delete<void>(`${base}/${id}`),
};
