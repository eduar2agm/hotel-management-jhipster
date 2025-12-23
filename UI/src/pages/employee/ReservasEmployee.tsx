import { useEffect, useState } from 'react';
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
import { ClienteService } from '../../services/cliente.service';
import { HabitacionService } from '../../services/habitacion.service';
import { ReservaDetalleService } from '../../services/reserva-detalle.service';
import { type ReservaDTO } from '../../types/api/Reserva';
import { type ClienteDTO } from '../../types/api/Cliente';
import { type HabitacionDTO } from '../../types/api/Habitacion';
import { toast } from 'sonner';
import { Pencil, Plus, CalendarCheck, User, BedDouble, Eye, Search, CreditCard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ActiveFilter } from '@/components/ui/ActiveFilter';
import { PaginationControl } from '@/components/common/PaginationControl';
import { PageHeader } from '../../components/common/PageHeader';
import { ReservaDetailsDialog } from '../../components/admin/reservas/ReservaDetailsDialog';
import { ReservaFormDialog, type ReservaFormValues } from '@/components/employee/reservas/ReservaFormDialog';
import { PaymentModal } from '../../components/modals/PaymentModal';

export const EmployeeReservas = () => {
    const [reservas, setReservas] = useState<ReservaDTO[]>([]);
    const [clientes, setClientes] = useState<ClienteDTO[]>([]);
    const [mapReservaHabitaciones, setMapReservaHabitaciones] = useState<Record<number, string>>({});

    // Pagination State
    const [currentPage, setCurrentPage] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const itemsPerPage = 10;

    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [reservaToEdit, setReservaToEdit] = useState<ReservaDTO | null>(null);

    // Details View State
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [selectedReserva, setSelectedReserva] = useState<ReservaDTO | null>(null);

    // Payment State
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [paymentReserva, setPaymentReserva] = useState<ReservaDTO | null>(null);
    const [paymentTotal, setPaymentTotal] = useState(0);

    // Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [showInactive, setShowInactive] = useState(false);

    const handleViewDetails = (reserva: ReservaDTO) => {
        setSelectedReserva(reserva);
        setIsDetailsOpen(true);
    };

    const loadData = async (page: number) => {
        try {
            setIsLoading(true);
            const reservasPromise = showInactive
                ? ReservaService.getReservasInactivas({
                    page,
                    size: itemsPerPage,
                    sort: 'id,desc'
                })
                : ReservaService.getReservas({
                    page,
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
                const detailsRes = await ReservaDetalleService.getReservaDetalles({ 'reservaId.in': ids });

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
    };

    useEffect(() => {
        loadData(currentPage);
    }, [currentPage, showInactive]);

    const getClienteName = (id?: number | null) => {
        if (!id) return 'Desconocido';
        const cliente = clientes.find(c => c.id === id);
        return cliente ? `${cliente.nombre} ${cliente.apellido}` : 'Desconocido';
    };

    const handleCreate = () => {
        setReservaToEdit(null);
        setIsEditing(false);
        setIsDialogOpen(true);
    };

    const handleEdit = (reserva: ReservaDTO) => {
        setReservaToEdit(reserva);
        setIsEditing(true);
        setIsDialogOpen(true);
    };

    // Main Submit Handler
    const handleSaveReserva = async (data: ReservaFormValues, availableRooms: HabitacionDTO[]) => {
        try {
            // Fix timezone issue: create dates at local midnight to preserve the selected date
            const [yearInicio, monthInicio, dayInicio] = data.fechaInicio.split('-').map(Number);
            const [yearFin, monthFin, dayFin] = data.fechaFin.split('-').map(Number);

            // FIX: Using 15:00 and 11:00 to avoid date jumping to next day in UTC-6
            const fechaInicio = new Date(yearInicio, monthInicio - 1, dayInicio, 15, 0, 0);
            const fechaFin = new Date(yearFin, monthFin - 1, dayFin, 11, 0, 0);

            const reservaToSave = {
                id: data.id,
                fechaInicio: fechaInicio.toISOString(),
                fechaFin: fechaFin.toISOString(),
                estado: data.estado,
                activo: data.activo,
                cliente: { id: data.clienteId },
                fechaReserva: new Date().toISOString()
            };

            let savedReserva: ReservaDTO;

            if (isEditing && data.id) {
                const res = await ReservaService.updateReserva(data.id, reservaToSave as any);
                savedReserva = res.data;

                const currentStatus = await ReservaDetalleService.getReservaDetalles({ 'reservaId.equals': savedReserva.id });
                const currentDetails = currentStatus.data;
                const currentRoomIds = currentDetails.map(d => d.habitacion?.id).filter((id): id is number => id !== undefined);

                const toAdd = data.roomIds.filter(id => !currentRoomIds.includes(id));
                const toRemove = currentDetails.filter(d => d.habitacion?.id && !data.roomIds.includes(d.habitacion.id));

                for (const roomId of toAdd) {
                    let fullRoom = availableRooms.find(h => h.id === roomId);

                    if (!fullRoom) {
                        try {
                            const r = await HabitacionService.getHabitacion(roomId);
                            fullRoom = r.data;
                        } catch (e) {
                            console.error("Error fetching room", e);
                            fullRoom = { id: roomId } as HabitacionDTO;
                        }
                    }

                    await ReservaDetalleService.createReservaDetalle({
                        reserva: { id: savedReserva.id },
                        habitacion: fullRoom,
                        precioUnitario: fullRoom?.categoriaHabitacion?.precioBase ? Number(fullRoom.categoriaHabitacion.precioBase) : 0,
                        activo: true,
                        nota: 'Editado Empleado'
                    });
                }
                for (const det of toRemove) {
                    if (det.id) await ReservaDetalleService.deleteReservaDetalle(det.id);
                }
                toast.success('Reserva Actualizada');

            } else {
                const res = await ReservaService.createReserva(reservaToSave as any);
                savedReserva = res.data;

                for (const roomId of data.roomIds) {
                    let fullRoom = availableRooms.find(h => h.id === roomId);

                    if (!fullRoom) {
                        try {
                            const r = await HabitacionService.getHabitacion(roomId);
                            fullRoom = r.data;
                        } catch (e) {
                            console.error("Error fetching room", e);
                            fullRoom = { id: roomId } as HabitacionDTO;
                        }
                    }

                    await ReservaDetalleService.createReservaDetalle({
                        reserva: { id: savedReserva.id },
                        habitacion: fullRoom,
                        precioUnitario: fullRoom?.categoriaHabitacion?.precioBase ? Number(fullRoom.categoriaHabitacion.precioBase) : 0,
                        activo: true,
                        nota: 'Reserva Empleado'
                    });
                }
                toast.success('Reserva Creada - Iniciando Pago');

                // --- TRIGGER PAYMENT FLOW ---
                setIsDialogOpen(false);
                loadData(currentPage);

                const fullClient = clientes.find(c => c.id === data.clienteId);
                if (fullClient) {
                    savedReserva.cliente = fullClient as any;
                }

                await handleOpenPayment(savedReserva);
                return; // Exit here to avoid double loadData/close call
            }

            setIsDialogOpen(false);
            loadData(currentPage);

        } catch (error) {
            console.error(error);
            toast.error('Error al guardar reserva');
        }
    }

    const filteredReservas = reservas.filter(r => {
        if (!searchTerm) return true;
        const lowerTerm = searchTerm.toLowerCase();
        const clientName = r.cliente ? `${r.cliente.nombre} ${r.cliente.apellido}`.toLowerCase() : '';
        const status = r.estado?.toLowerCase() || '';
        const id = r.id?.toString() || '';
        return clientName.includes(lowerTerm) || status.includes(lowerTerm) || id.includes(lowerTerm);
    });

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
        // This assumes PaymentModal calls this on success
        if (paymentReserva && paymentReserva.estado !== 'CONFIRMADA') {
            try {
                await ReservaService.partialUpdateReserva(paymentReserva.id!, { id: paymentReserva.id, estado: 'CONFIRMADA' });
            } catch (e) {
                console.error("Error confirming reservation after payment", e);
            }
        }
        loadData(currentPage);
    };

    return (
        <div className="font-sans text-foreground bg-background min-h-screen flex flex-col">

            {/* --- HERO SECTION --- */}
            <PageHeader
                title="Gestión de Reservas"
                icon={CalendarCheck}
                subtitle="Controle y planifique las estancias. Asigne habitaciones y gestione fechas."
                category="Administración"
                className="bg-[#0F172A]"
            >
                <Button
                    onClick={handleCreate}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white rounded-none px-6 py-6 shadow-lg transition-all border border-yellow-600/30 text-lg"
                >
                    <Plus className="mr-2 h-5 w-5" /> Nueva Reserva
                </Button>
            </PageHeader>

            <main className="flex-grow py-12 px-4 md:px-8 lg:px-20 relative z-10">
                <div className="max-w-6xl mx-auto -mt-16">
                    <div className="bg-card rounded-sm shadow-xl overflow-hidden border border-border">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-10 pb-6">
                            <div>
                                <h3 className="text-xl font-bold text-card-foreground">Listado de Reservas</h3>
                                <p className="text-sm text-muted-foreground">Total Registros: {reservas.length}</p>
                            </div>
                            <div className="relative w-full md:w-96 group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-yellow-600 transition-colors" />
                                <Input
                                    placeholder="Buscar por cliente, ID o estado..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 border-input bg-background focus:border-yellow-600 focus:ring-yellow-600/20 h-11 transition-all text-foreground"
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
                        <div className="overflow-x-auto px-10 pb-10">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="font-bold text-muted-foreground uppercase tracking-wider text-xs py-4">ID</TableHead>
                                        <TableHead className="font-bold text-muted-foreground uppercase tracking-wider text-xs">Cliente</TableHead>
                                        <TableHead className="font-bold text-muted-foreground uppercase tracking-wider text-xs">Habitación(es)</TableHead>
                                        <TableHead className="font-bold text-muted-foreground uppercase tracking-wider text-xs">Fechas</TableHead>
                                        <TableHead className="font-bold text-muted-foreground uppercase tracking-wider text-xs">Estado</TableHead>
                                        <TableHead className="text-right font-bold text-muted-foreground uppercase tracking-wider text-xs">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-20 text-muted-foreground">
                                                <div className="flex justify-center items-center gap-2">
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                                                    Cargando reservas...
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredReservas.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-20 text-muted-foreground font-light text-lg">
                                                No hay reservas que coincidan con la búsqueda.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredReservas.map((reserva) => (
                                            <TableRow key={reserva.id} className="hover:bg-muted/50 transition-colors cursor-pointer group border-b border-border">
                                                <TableCell className="font-mono text-muted-foreground text-xs">
                                                    #{reserva.id}
                                                </TableCell>
                                                <TableCell className="font-bold text-foreground">
                                                    <div className="flex items-center gap-2">
                                                        <div className="bg-blue-50 dark:bg-blue-500/10 p-1.5 rounded-full text-blue-600 dark:text-blue-400">
                                                            <User className="w-4 h-4" />
                                                        </div>
                                                        {reserva.cliente
                                                            ? `${reserva.cliente.nombre || ''} ${reserva.cliente.apellido || ''}`.trim() || 'Desconocido'
                                                            : getClienteName(reserva.clienteId)
                                                        }
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <BedDouble className="w-4 h-4 text-muted-foreground" />
                                                        <div className="max-w-[200px] truncate" title={mapReservaHabitaciones[reserva.id!]}>
                                                            {mapReservaHabitaciones[reserva.id!] || <span className="text-red-400 italic text-xs">Sin asignar</span>}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col text-xs space-y-1">
                                                        <span className="flex items-center gap-1.5 text-foreground font-medium">
                                                            <CalendarCheck className="h-3 w-3 text-emerald-600 dark:text-emerald-500" />
                                                            {new Date(reserva.fechaInicio!).toLocaleDateString()}
                                                        </span>
                                                        <span className="flex items-center gap-1.5 text-muted-foreground pl-4">
                                                            hasta {new Date(reserva.fechaFin!).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        className={`
                                                        ${reserva.estado === 'CONFIRMADA' ? 'bg-green-100 text-green-700 hover:bg-green-100 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' : ''}
                                                        ${reserva.estado === 'PENDIENTE' ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-50 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800' : ''}
                                                        ${reserva.estado === 'CANCELADA' ? 'bg-red-50 text-red-700 hover:bg-red-50 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800' : ''}
                                                        ${reserva.estado === 'FINALIZADA' ? 'bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800' : ''}
                                                     `}
                                                        variant="secondary"
                                                    >
                                                        {reserva.estado || 'PENDIENTE'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={(e) => { e.stopPropagation(); handleOpenPayment(reserva); }}
                                                            className="hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 hover:border-green-200 border border-transparent rounded-full transition-all text-muted-foreground"
                                                            title="Gestionar Pago"
                                                        >
                                                            <CreditCard className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={(e) => { e.stopPropagation(); handleViewDetails(reserva); }}
                                                            className="hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 hover:border-blue-200 border border-transparent rounded-full transition-all text-muted-foreground"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={(e) => { e.stopPropagation(); handleEdit(reserva); }}
                                                            className="hover:bg-yellow-50 dark:hover:bg-yellow-900/20 hover:text-yellow-600 hover:border-yellow-200 border border-transparent rounded-full transition-all text-muted-foreground"
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>


                        {/* PAGINATION */}
                        <div className="px-10 pb-10">
                            <PaginationControl
                                currentPage={currentPage}
                                totalItems={totalItems}
                                itemsPerPage={itemsPerPage}
                                onPageChange={setCurrentPage}
                                isLoading={isLoading}
                            />
                        </div>
                    </div>
                </div>
            </main >

            <ReservaFormDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                isEditing={isEditing}
                reservaToEdit={reservaToEdit}
                clients={clientes}
                onSave={handleSaveReserva}
            />

            {/* DETAILS DIALOG */}
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

        </div >
    );
};

