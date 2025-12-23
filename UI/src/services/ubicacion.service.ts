import { apiClient } from '../api/axios-instance';
import { type IUbicacion } from '../types/api/Ubicacion';

const API_URL = '/ubicacions';

// 1. OBTENER LA UBICACIÓN PRINCIPAL
export const getUbicacionPrincipal = async (): Promise<IUbicacion | null> => {
  try {
    const response = await apiClient.get<IUbicacion[]>(`${API_URL}?page=0&size=1&sort=id,desc`);
    if (response.data && response.data.length > 0) {
      // Ensure lat/lng are numbers
      const loc = response.data[0];
      return {
        ...loc,
        latitud: Number(loc.latitud),
        longitud: Number(loc.longitud)
      };
    }
    return null;
  } catch (error) {
    console.error('Error cargando ubicación:', error);
    return null;
  }
};

// 2. GUARDAR O ACTUALIZAR
export const saveUbicacion = async (ubicacion: IUbicacion): Promise<IUbicacion> => {
  if (ubicacion.id) {
    const response = await apiClient.put<IUbicacion>(`${API_URL}/${ubicacion.id}`, ubicacion);
    return response.data;
  } else {
    const response = await apiClient.post<IUbicacion>(API_URL, ubicacion);
    return response.data;
  }
};