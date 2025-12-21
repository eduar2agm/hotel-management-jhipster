import { useEffect, useState, useCallback } from 'react';
import { HabitacionService } from '../../services/habitacion.service';
import { CategoriaHabitacionService } from '../../services/categoria-habitacion.service';
import { EstadoHabitacionService } from '../../services/estado-habitacion.service';
import type { HabitacionDTO, CategoriaHabitacionDTO, EstadoHabitacionDTO } from '../../types/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Hotel } from 'lucide-react';
import { toast } from 'sonner';
import { RoomCard } from '@/components/ui/RoomCard';
import { ActiveFilter } from '@/components/ui/ActiveFilter';
import { PageHeader } from '../../components/common/PageHeader';
import { HabitacionFormDialog } from '../../components/admin/habitaciones/HabitacionFormDialog';
import { PaginationControl } from '@/components/common/PaginationControl';

export const AdminHabitaciones = () => {
    const [habitaciones, setHabitaciones] = useState<HabitacionDTO[]>([]);
    const [categorias, setCategorias] = useState<CategoriaHabitacionDTO[]>([]);
    const [estados, setEstados] = useState<EstadoHabitacionDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const itemsPerPage = 10;

    // State for Dialog
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentHabitacion, setCurrentHabitacion] = useState<HabitacionDTO | null>(null);

    const [searchFilter, setSearchFilter] = useState('');
    const [showInactive, setShowInactive] = useState(false);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [habsRes, catsRes, estRes] = await Promise.all([
                showInactive
                    ? HabitacionService.getHabitacionesInactivas({ page: currentPage, size: itemsPerPage, sort: 'id,asc' })
                    : HabitacionService.getHabitacions({ page: currentPage, size: itemsPerPage, sort: 'id,asc' }),
                CategoriaHabitacionService.getCategorias({ size: 100 }),
                EstadoHabitacionService.getEstados({ size: 100 })
            ]);
            setHabitaciones(habsRes.data);
            const total = parseInt(habsRes.headers['x-total-count'] || '0', 10);
            setTotalItems(total);

            setCategorias(catsRes.data);
            setEstados(estRes.data);
        } catch (error) {
            console.error('Error al cargar datos', error);
            toast.error('Error al cargar datos');
        } finally {
            setLoading(false);
        }
    }, [currentPage, showInactive]);

    useEffect(() => { loadData(); }, [loadData]);

    const errorMessages: Record<string, string> = {
        'error.habitacionOcupada': 'No se puede desactivar la habitación porque hay un cliente hospedado actualmente',
        'error.habitacionOcupadaEliminar': 'No se puede eliminar la habitación porque hay un cliente hospedado actualmente',
        'error.habitacionConReservas': 'No se puede eliminar la habitación porque tiene reservas asociadas',
        'error.inactive': 'La entidad está inactiva',
    };

    const handleToggleActivo = async (id: number, currentStatus: boolean | undefined) => {
        try {
            if (currentStatus) {
                await HabitacionService.desactivarHabitacion(id);
                toast.success('Habitación desactivada');
            } else {
                await HabitacionService.activarHabitacion(id);
                toast.success('Habitación activada');
            }
            loadData();
        } catch (error: any) {
            const data = error?.response?.data;
            const errorKey = data?.message;
            const backendMessage = errorMessages[errorKey]
                || data?.detail
                || 'Error al cambiar estado';
            toast.error(backendMessage);
            console.error(error);
        }
    };

    const handleEdit = (item: HabitacionDTO) => {
        if (!item.activo) {
            toast.warning('No se puede editar una habitación inactiva');
            return;
        }
        setCurrentHabitacion(item);
        setIsDialogOpen(true);
    };

    const handleCreate = () => {
        setCurrentHabitacion(null);
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Estás seguro de eliminar esta habitación?')) return;
        try {
            await HabitacionService.deleteHabitacion(id);
            toast.success('Habitación eliminada');
            loadData();
        } catch (error: any) {
            const data = error?.response?.data;
            const errorKey = data?.message;
            const backendMessage = errorMessages[errorKey]
                || data?.detail
                || 'Error al eliminar';
            toast.error(backendMessage);
            console.error(error);
        }
    };

    const filteredHabitaciones = habitaciones.filter(h => {
        if (!searchFilter) return true;
        const searchLower = searchFilter.toLowerCase();
        return (
            h.numero?.toLowerCase().includes(searchLower) ||
            h.categoriaHabitacion?.nombre?.toLowerCase().includes(searchLower) ||
            h.estadoHabitacion?.nombre?.toLowerCase().includes(searchLower)
        );
    });

    return (
        <div className="font-sans text-gray-900 bg-gray-50 min-h-screen flex flex-col">
            
            <PageHeader
                title="Gestión de Habitaciones"
                subtitle="Configure y administre el inventario de habitaciones, categorías y estados."
                category="ADMINISTRACIÓN"
                icon={Hotel}
            >
                <Button
                    onClick={handleCreate}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white border-0 shadow-lg hover:shadow-yellow-600/20 transition-all rounded-sm px-6 py-4 md:py-6 text-xs md:text-sm uppercase tracking-widest font-bold"
                >
                    <Plus className="mr-2 h-4 w-4 md:h-5 md:w-5" /> <span className="hidden md:inline">Nueva Habitación</span><span className="md:hidden">Nueva</span>
                </Button>
            </PageHeader>

            <main className="flex-grow py-5 px-4 md:px-8 lg:px-20 -mt-10 relative z-10 w-full">
                <Card className="max-w-7xl mx-auto border-t-4 border-yellow-600 shadow-xl bg-white">
                    <CardHeader className="border-b bg-gray-50/50 pb-6">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <div>
                                <CardTitle className="text-xl font-bold text-gray-800">Inventario de Habitaciones</CardTitle>
                                <CardDescription>Total de unidades: {totalItems}</CardDescription>
                            </div>
                            <div className="flex flex-col md:flex-row gap-4 items-center w-full md:w-auto">
                                <ActiveFilter showInactive={showInactive} onChange={(val) => { setShowInactive(val); setCurrentPage(0); }} />
                                <div className="relative w-full md:w-96 group">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-yellow-600 transition-colors" />
                                    <Input
                                        placeholder="Buscar por número, categoría..."
                                        value={searchFilter}
                                        onChange={(e) => setSearchFilter(e.target.value)}
                                        className="pl-10 border-gray-200 focus:border-yellow-600 focus:ring-yellow-600/20 h-11 transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 md:p-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {loading ? (
                                <div className="col-span-full h-32 flex flex-col items-center justify-center text-gray-500">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mb-2"></div>
                                    <span>Cargando inventario...</span>
                                </div>
                            ) : filteredHabitaciones.length === 0 ? (
                                <div className="col-span-full h-32 flex items-center justify-center text-gray-500 border-2 border-dashed rounded-lg">
                                    No se encontraron habitaciones
                                </div>
                            ) : (
                                filteredHabitaciones.map((h) => (
                                    <RoomCard
                                        key={h.id}
                                        habitacion={h}
                                        onEdit={handleEdit}
                                        onDelete={(id) => handleDelete(id)}
                                        onToggleActive={handleToggleActivo}
                                    />
                                ))
                            )}
                        </div>

                        <div className="mt-8">
                            <PaginationControl
                                currentPage={currentPage}
                                totalItems={totalItems}
                                itemsPerPage={itemsPerPage}
                                onPageChange={setCurrentPage}
                                isLoading={loading}
                            />
                        </div>
                    </CardContent>
                </Card>

                <HabitacionFormDialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    habitacion={currentHabitacion}
                    categorias={categorias}
                    estados={estados}
                    onSuccess={() => loadData()}
                />
            </main>
        </div>
    );
};

