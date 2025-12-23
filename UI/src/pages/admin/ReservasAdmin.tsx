import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { ReservaService } from '../../services/reserva.service';
import { ReservaDetalleService } from '../../services/reserva-detalle.service';
import { type ReservaDTO } from '../../types/api/Reserva';
import { toast } from 'sonner';
import { 
    Pencil, 
    Plus, 
    User, 
    Check, 
    CheckCircle2, 
    XCircle, 
    Trash2, 
    RefreshCcw, 
    AlertCircle, 
    CreditCard, 
    Eye, 
    Search, 
    Calendar
} from 'lucide-react';
import { PaymentModal } from '../../components/modals/PaymentModal';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ActiveFilter } from '@/components/ui/ActiveFilter';
import { PageHeader } from '@/components/common/PageHeader';
import { ReservaFormDialog } from '@/components/admin/reservas/ReservaFormDialog';
import { ReservaDetailsDialog } from '@/components/admin/reservas/ReservaDetailsDialog';
import { ClienteService } from '../../services/cliente.service';
import { type ClienteDTO } from '@/types/api/Cliente';
import { PaginationControl } from '@/components/common/PaginationControl';

export const AdminReservas = () => {
    const [reservas, setReservas] = useState<ReservaDTO[]>([]);
    const [clientes, setClientes] = useState<ClienteDTO[]>([]);
    const [mapReservaHabitaciones, setMapReservaHabitaciones] = useState<Record<number, string>>({});

    const [currentPage, setCurrentPage] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const itemsPerPage = 10;

    const [isLoading, setIsLoading] = useState(true);
    
    // Dialog States
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);

    const [selectedReserva, setSelectedReserva] = useState<ReservaDTO | null>(null); // For Details & Edit
    
    // Payment State
    const [paymentReserva, setPaymentReserva] = useState<ReservaDTO | null>(null);
    const [paymentTotal, setPaymentTotal] = useState(0);

    // Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [showInactive, setShowInactive] = useState(false);

    const loadData = useCallback(async () => {
        try {
            setIsLoading(true);
            const reservasPromise = showInactive
                ? ReservaService.getReservasInactivas({
                    page: currentPage,
                    size: itemsPerPage,
                    sort: 'id,desc'
                })
                : ReservaService.getReservas({
                    page: currentPage,
                    size: itemsPerPage,
                    sort: 'id,desc'
                });

            const [reservasRes, clientesRes] = await Promise.all([
                reservasPromise,
                ClienteService.getClientes({ size: 100 })
            ]);

            const loadedReservas = reservasRes.data;
            setReservas(loadedReservas);
            const total = parseInt(reservasRes.headers['x-total-count'] || '0', 10);
            setTotalItems(total);
            setClientes(clientesRes.data);

            if (loadedReservas.length > 0) {
                const ids = loadedReservas.map(r => r.id).join(',');
                const detailsRes = await ReservaDetalleService.getReservaDetalles({ 'reservaId.in': ids, size: 100 });

                const mapping: Record<number, string> = {};
                detailsRes.data.forEach(det => {
                    const rId = det.reserva?.id;
                    if (rId && det.habitacion) {
                        const hInfo = `Hab ${det.habitacion.numero}`;
                        mapping[rId] = mapping[rId] ? `${mapping[rId]}, ${hInfo}` : hInfo;
                    }
                });
                setMapReservaHabitaciones(mapping);
            }
        } catch (error) {
            console.error('Error al cargar datos:', error);
            toast.error('No se pudieron cargar los datos');
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, showInactive]); // Dependencies for loadData

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleCreate = () => {
        setSelectedReserva(null);
        setIsDialogOpen(true);
    };

    const handleEdit = (reserva: ReservaDTO) => {
         if (!reserva.activo) {
            toast.warning('No se puede editar una reserva inactiva', {
                description: 'Debe reactivarla primero.'
            });
            return;
        }
        setSelectedReserva(reserva);
        setIsDialogOpen(true);
    };

    const handleViewDetails = (reserva: ReservaDTO) => {
        setSelectedReserva(reserva);
        setIsDetailsOpen(true);
    };
    
    const handleFormSuccess = (newReserva?: ReservaDTO) => {
        loadData();
        if (newReserva) {
            // New reservation created, trigger payment
            // Need to enrich client data if possible
             if (newReserva.cliente && !newReserva.cliente.nombre) {
                const c = clientes.find(cl => cl.id === newReserva.cliente?.id || cl.id === newReserva.clienteId);
                if (c && c.id) {
                    newReserva.cliente = {
                        id: c.id,
                        nombre: c.nombre,
                        apellido: c.apellido
                    };
                }
            }
            
            handleOpenPayment(newReserva);
        }
    };

    // --- PAYMENT HANDLERS ---
    const handleOpenPayment = async (reserva: ReservaDTO) => {
        try {
            setIsLoading(true);
            const detailsRes = await ReservaDetalleService.getReservaDetalles({ 'reservaId.equals': reserva.id });
            const details = detailsRes.data;

            let calculatedTotal = 0;
            if (reserva.fechaInicio && reserva.fechaFin) {
                const start = new Date(reserva.fechaInicio);
                const end = new Date(reserva.fechaFin);
                const diffTime = Math.abs(end.getTime() - start.getTime());
                const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                const nights = days === 0 ? 1 : days;

                details.forEach(det => {
                    const price = det.precioUnitario || det.habitacion?.categoriaHabitacion?.precioBase || 0;
                    calculatedTotal += price * nights;
                });
            }

            setPaymentReserva(reserva);
            setPaymentTotal(calculatedTotal);
            setIsPaymentOpen(true);
        } catch (error) {
            console.error(error);
            toast.error('Error al preparar pago');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePaymentSuccess = async () => {
        if (paymentReserva && paymentReserva.estado !== 'CONFIRMADA') {
            try {
               await ReservaService.partialUpdateReserva(paymentReserva.id!, { id: paymentReserva.id, estado: 'CONFIRMADA' });
            } catch (e) {
                console.error("Error confirming reservation after payment", e);
            }
       }
       loadData();
    };

    // Actions
    const handleActivarReserva = async (id: number) => {
        try {
            await ReservaService.activarReserva(id);
            toast.success('Reserva activada. Detalles sincronizados.');
            loadData();
        } catch (error) {
            console.error('Error activation', error); // Log it so it's not unused
            toast.error('Error al activar reserva');
        }
    };

    const handleDesactivarReserva = async (id: number) => {
        if (!confirm('¿Desactivar esta reserva? Se desactivarán todos sus detalles.')) return;
        try {
            await ReservaService.desactivarReserva(id);
            toast.success('Reserva desactivada');
            loadData();
        } catch (error: any) {
             console.error(error); // Log to use
             toast.error('Error al desactivar reserva');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('¿Está seguro de eliminar esta reserva?')) return;
        try {
            await ReservaService.deleteReserva(id);
            toast.success('Reserva eliminada correctamente');
            loadData();
        } catch (error: any) {
            console.error('Error al eliminar:', error);
            toast.error('Error al eliminar reserva');
        }
    };

    const filteredReservas = reservas.filter(r => {
        if (!searchTerm) return true;
        const lowerTerm = searchTerm.toLowerCase();
        const clientName = r.cliente ? `${r.cliente.nombre} ${r.cliente.apellido}`.toLowerCase() : '';
        const status = r.estado?.toLowerCase() || '';
        const id = r.id?.toString() || '';
        return clientName.includes(lowerTerm) || status.includes(lowerTerm) || id.includes(lowerTerm);
    });

    const getClienteName = (id?: number | null) => {
        if (!id) return 'Desconocido';
        const cliente = clientes.find(c => c.id === id);
        return cliente ? `${cliente.nombre} ${cliente.apellido}` : 'Desconocido';
    };

    return (
        <div className="font-sans text-foreground bg-background min-h-screen flex flex-col">

            <PageHeader 
                title="Gestión de Reservas" 
                icon={Calendar} 
                subtitle="Supervise y administre todas las reservas activas, pasadas y futuras." 
                category="ADMINISTRACIÓN"
                className="-mt-10"
            >
                 <Button
                    onClick={handleCreate}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white border-0 shadow-lg hover:shadow-yellow-600/20 transition-all rounded-sm px-6 py-6 text-sm uppercase tracking-widest font-bold"
                >
                    <Plus className="mr-2 h-5 w-5" /> Nueva Reserva
                </Button>
            </PageHeader>

            <main className="flex-grow py-5 px-4 md:px-8 lg:px-20 -mt-10 relative z-10">
                <Card className="max-w-7xl mx-auto border-t-4 border-gray-600 shadow-xl bg-card">
                    <CardHeader className="border-b bg-muted/30 pb-6">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <div>
                                <CardTitle className="text-xl font-bold text-foreground">Listado de Reservas</CardTitle>
                                <CardDescription>Total Registros: {totalItems}</CardDescription>
                            </div>
                            <div className="relative w-full md:w-96 group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-yellow-600 transition-colors" />
                                <Input
                                    placeholder="Buscar por cliente, ID o estado..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 border-input focus:border-yellow-600 focus:ring-yellow-600/20 h-11 transition-all bg-background"
                                />
                            </div>
                            <ActiveFilter
                                showInactive={showInactive}
                                onChange={(val) => {
                                    setShowInactive(val);
                                    setCurrentPage(0);
                                }}
                            />
                        </div>
                    </CardHeader>
                    <div className="overflow-x-auto p-10">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50 hover:bg-muted/50 border-b border-border">
                                    <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground w-[80px]">ID</TableHead>
                                    <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Cliente</TableHead>
                                    <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Habitaciones</TableHead>
                                    <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Fechas</TableHead>
                                    <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Estado</TableHead>
                                    <TableHead className="text-right text-xs font-bold uppercase tracking-wider text-muted-foreground p-4">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-32 text-center text-gray-500">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-600"></div>
                                                <span>Cargando reservas...</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredReservas.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-32 text-center text-gray-500">
                                            No hay reservas que coincidan con la búsqueda.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredReservas.map((reserva) => (
                                        <TableRow key={reserva.id} className="hover:bg-muted/50 transition-colors group border-border">
                                            <TableCell className="font-mono text-xs font-bold text-muted-foreground">
                                                #{reserva.id}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                     <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-bold text-xs ring-2 ring-background shadow-sm">
                                                        {reserva.cliente?.nombre ? reserva.cliente.nombre.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-semibold text-foreground">
                                                            {reserva.cliente
                                                                ? `${reserva.cliente.nombre || ''} ${reserva.cliente.apellido || ''}`.trim() || 'Desconocido'
                                                                : getClienteName(reserva.clienteId)
                                                            }
                                                        </span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm text-foreground flex items-center gap-1.5 max-w-[200px] truncate" title={mapReservaHabitaciones[reserva.id!]}>
                                                    <div className="h-1.5 w-1.5 rounded-full bg-yellow-500 flex-shrink-0"></div>
                                                    {mapReservaHabitaciones[reserva.id!] || <span className="text-muted-foreground italic">Sin asignar</span>}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col text-sm">
                                                    <span className="font-medium text-foreground flex items-center gap-1.5">
                                                        {new Date(reserva.fechaInicio!).toLocaleDateString()}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground pl-4 border-l-2 border-border ml-1">
                                                        {new Date(reserva.fechaFin!).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={cn(
                                                    "shadow-sm border-0 px-2 py-0.5",
                                                    reserva.estado === 'CONFIRMADA' ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200" :
                                                        reserva.estado === 'CANCELADA' ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200" :
                                                            reserva.estado === 'FINALIZADA' ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-200" :
                                                                "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-200"
                                                )}>
                                                    {reserva.estado === 'CONFIRMADA' && <Check className="h-3 w-3 mr-1" />}
                                                    {reserva.estado === 'CANCELADA' && <AlertCircle className="h-3 w-3 mr-1" />}
                                                    {reserva.estado === 'FINALIZADA' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                                                    {reserva.estado === 'PENDIENTE' && <RefreshCcw className="h-3 w-3 mr-1" />}
                                                    {reserva.estado || 'PENDIENTE'}
                                                </Badge>
                                                {!reserva.activo && (
                                                    <Badge variant="outline" className="bg-gray-100 text-gray-600 text-[10px] mt-1 w-fit">
                                                        Inactiva
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right p-4">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleOpenPayment(reserva)}
                                                        disabled={!reserva.activo}
                                                        className="h-8 w-8 p-0 text-muted-foreground rounded-full transition-colors hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600"
                                                        title="Gestionar Pago"
                                                    >
                                                        <CreditCard className="h-4 w-4" />
                                                    </Button>

                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleViewDetails(reserva)}
                                                        disabled={!reserva.activo}
                                                        className={cn(
                                                            "h-8 w-8 p-0 rounded-full transition-colors",
                                                            !reserva.activo ? "text-muted-foreground/50 cursor-not-allowed" : "text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                                        )}
                                                        title="Ver detalles"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEdit(reserva)}
                                                        disabled={!reserva.activo}
                                                        className={cn(
                                                            "h-8 w-8 p-0 rounded-full transition-colors",
                                                            !reserva.activo ? "text-muted-foreground/50 cursor-not-allowed" : "text-muted-foreground hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                                                        )}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => reserva.id && handleDelete(reserva.id)}
                                                        className="h-8 w-8 p-0 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                    {reserva.activo ? (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => reserva.id && handleDesactivarReserva(reserva.id)}
                                                            className="h-8 w-8 p-0 text-muted-foreground hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-full transition-colors"
                                                            title="Desactivar"
                                                        >
                                                            <XCircle className="h-4 w-4" />
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => reserva.id && handleActivarReserva(reserva.id)}
                                                            className="h-8 w-8 p-0 text-muted-foreground hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-full transition-colors"
                                                            title="Reactivar"
                                                        >
                                                            <CheckCircle2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* PAGINATION */}
                    {/* PAGINATION */}
                    <PaginationControl
                        currentPage={currentPage}
                        totalItems={totalItems}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                        isLoading={isLoading}
                    />
                </Card>
            </main>

            <ReservaFormDialog 
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                reserva={selectedReserva}
                clientes={clientes}
                onSuccess={handleFormSuccess}
            />

            <ReservaDetailsDialog 
                open={isDetailsOpen}
                onOpenChange={setIsDetailsOpen}
                reserva={selectedReserva}
            />

            <PaymentModal 
                open={isPaymentOpen}
                onOpenChange={setIsPaymentOpen}
                reserva={paymentReserva}
                total={paymentTotal}
                onSuccess={handlePaymentSuccess}
            />

        </div>
    );
};
