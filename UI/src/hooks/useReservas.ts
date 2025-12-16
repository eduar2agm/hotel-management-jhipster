import { useEffect, useState, useCallback } from 'react';
import { useApiClient } from './useApiClient';
import type { ReservaDTO, NewReservaDTO } from '../types/api';
import { ReservaService } from '../services';

export const useReservas = () => {
    const api = useApiClient();
    const [reservas, setReservas] = useState<ReservaDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetch = useCallback(async (params?: Record<string, any>) => {
        setLoading(true);
        setError(null);
        try {
            // Use the service which uses apiClient configured with token
            const res = await ReservaService.getReservas(params);
            setReservas(res.data ?? []);
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e));
        } finally {
            setLoading(false);
        }
    }, [api]);

    useEffect(() => {
        void fetch({ sort: 'id,desc' });
    }, [fetch]);

    const createReserva = useCallback(async (dto: NewReservaDTO) => {
        setLoading(true);
        try {
            const res = await ReservaService.createReserva(dto);
            setReservas(prev => [res.data, ...prev]);
            return res.data;
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e));
            throw e;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateReserva = useCallback(async (id: number, dto: Partial<ReservaDTO>) => {
        setLoading(true);
        try {
            const res = await ReservaService.partialUpdateReserva(id, dto);
            setReservas(prev => prev.map(r => (r.id === res.data.id ? res.data : r)));
            return res.data;
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e));
            throw e;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteReserva = useCallback(async (id: number) => {
        setLoading(true);
        try {
            await ReservaService.deleteReserva(id);
            setReservas(prev => prev.filter(r => r.id !== id));
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e));
            throw e;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        reservas,
        loading,
        error,
        refresh: fetch,
        createReserva,
        updateReserva,
        deleteReserva,
    };
};

export default useReservas;
