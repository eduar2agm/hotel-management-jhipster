export interface IUbicacion {
  id?: number;
  latitud: number;
  longitud: number;
  nombre: string;
  direccion?: string;
  googleMapsUrl?: string;
  activo?: boolean;
}