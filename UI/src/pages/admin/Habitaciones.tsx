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
import { PriceRangeFilter } from '@/components/common/PriceRangeFilter';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Filter } from 'lucide-react';

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
    const [minPrecio, setMinPrecio] = useState('');
    const [maxPrecio, setMaxPrecio] = useState('');
    const [appliedMin, setAppliedMin] = useState('');
    const [appliedMax, setAppliedMax] = useState('');
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
        // Text Search
        const searchLower = searchFilter.toLowerCase();
        const matchesText = !searchFilter || (
            h.numero?.toLowerCase().includes(searchLower) ||
            h.categoriaHabitacion?.nombre?.toLowerCase().includes(searchLower) ||
            h.estadoHabitacion?.nombre?.toLowerCase().includes(searchLower) ||
            h.categoriaHabitacion?.precioBase?.toString().includes(searchLower)
        );

        // Price Range
        const price = h.categoriaHabitacion?.precioBase || 0;
        const matchesMin = !appliedMin || price >= Number(appliedMin);
        const matchesMax = !appliedMax || price <= Number(appliedMax);

        return matchesText && matchesMin && matchesMax;
    });

    return (
        <div className="font-sans text-foreground bg-background min-h-screen flex flex-col">

            <PageHeader
                title="Gestión de Habitaciones"
                subtitle="Configure y administre el inventario de habitaciones, categorías y estados."
                category="ADMINISTRACIÓN"
                icon={Hotel}
            >
                <div className="flex flex-col md:flex-row gap-4">
                    <Button
                        onClick={handleCreate}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white border-0 shadow-lg hover:shadow-yellow-600/20 transition-all rounded-sm px-6 py-4 md:py-6 text-xs md:text-sm uppercase tracking-widest font-bold"
                    >
                        <Plus className="mr-2 h-4 w-4 md:h-5 md:w-5" /> <span className="hidden md:inline">Nueva Habitación</span><span className="md:hidden">Nueva</span>
                    </Button>
                </div>
            </PageHeader>

            <main className="flex-grow py-5 px-4 md:px-8 lg:px-20 -mt-10 relative z-10 w-full">
                <div className="max-w-7xl mx-auto">
                    {/* --- MAIN CONTENT --- */}
                    <Card className="border-t-4 border-gray-600 shadow-xl bg-card">
                        <CardHeader className="border-b bg-muted/30 pb-6 px-6 md:px-10">
                            <div className="flex flex-col xl:flex-row justify-between xl:items-center gap-6">
                                <div>
                                    <CardTitle className="text-xl font-bold text-foreground">Inventario de Habitaciones</CardTitle>
                                    <CardDescription>Visualizando {filteredHabitaciones.length} de {totalItems} unidades</CardDescription>
                                </div>

                                <div className="flex flex-col md:flex-row items-center gap-4">
                                    {/* Búsqueda rápida */}
                                    <div className="relative group w-full md:w-64">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-yellow-600 transition-colors" />
                                        <Input
                                            placeholder="Búsqueda rápida..."
                                            value={searchFilter}
                                            onChange={(e) => setSearchFilter(e.target.value)}
                                            className="pl-10 border-input focus:border-yellow-600 focus:ring-yellow-600/20 h-10 transition-all bg-background"
                                        />
                                    </div>

                                    {/* Estado Filter */}
                                    <div className="flex items-center gap-2 bg-background border border-border p-1 rounded-md h-10">
                                        <ActiveFilter
                                            showInactive={showInactive}
                                            onChange={(val) => { setShowInactive(val); setCurrentPage(0); }}
                                        />
                                    </div>

                                    {/* Price Filter Popover */}
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="h-10 gap-2 border-border hover:bg-muted text-foreground">
                                                <Filter className="h-4 w-4" />
                                                <span>Filtro</span>
                                                {(appliedMin || appliedMax) && (
                                                    <span className="flex h-2 w-2 rounded-full bg-yellow-600" />
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-80 p-0" align="end">
                                            <PriceRangeFilter
                                                minPrice={minPrecio}
                                                maxPrice={maxPrecio}
                                                onMinChange={setMinPrecio}
                                                onMaxChange={setMaxPrecio}
                                                onSearch={() => {
                                                    setAppliedMin(minPrecio);
                                                    setAppliedMax(maxPrecio);
                                                }}
                                                className="border-0 shadow-none"
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 md:p-10">
                            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-3 gap-8">
                                {loading ? (
                                    <div className="col-span-full h-32 flex flex-col items-center justify-center text-muted-foreground">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mb-2"></div>
                                        <span>Cargando inventario...</span>
                                    </div>
                                ) : filteredHabitaciones.length === 0 ? (
                                    <div className="col-span-full h-32 flex items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-lg">
                                        No se encontraron habitaciones para los filtros seleccionados
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
                </div>

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

