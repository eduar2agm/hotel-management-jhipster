import { useEffect, useState, useCallback } from 'react';
import { useApiClient } from './useApiClient';
import type { HabitacionDTO } from '../types/api';
import { HabitacionService } from '../services';

export const useHabitaciones = () => {
    const api = useApiClient(); // Asegura que el token esté listo si fuera necesario
    const [habitaciones, setHabitaciones] = useState<HabitacionDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchHabitaciones = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Pedimos las habitaciones. 
            // 'eagerload': true es un truco común en JHipster para que traiga las relaciones (Categoría)
            // Si tu backend soporta filtrado por 'activo', lo enviamos aquí.
            const res = await HabitacionService.getHabitacions({ 
                page: 0, 
                size: 20,
                sort: 'id,asc',
                // 'activo.equals': true // Descomentar si tu backend soporta Criteria filtering
            });
            setHabitaciones(res.data || []);
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e));
        } finally {
            setLoading(false);
        }
    }, [api]);

    // Cargar datos al montar el componente
    useEffect(() => {
        void fetchHabitaciones();
    }, [fetchHabitaciones]);

    return {
        habitaciones,
        loading,
        error,
        refresh: fetchHabitaciones
    };
};