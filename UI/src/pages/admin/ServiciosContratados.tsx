import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ServicioContratadoService } from '../../services/servicio-contratado.service';
import type { ServicioContratadoDTO } from '../../types/api/ServicioContratado';
import { EstadoServicioContratado } from '../../types/api/ServicioContratado';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PageHeader } from '@/components/common/PageHeader';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, MoreVertical, CheckCircle, XCircle, PlayCircle, Briefcase, Plus } from 'lucide-react';
import { toast } from 'sonner';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { format } from 'date-fns';
import { PaginationControl } from '@/components/common/PaginationControl';

import { PaymentModal } from '@/components/modals/PaymentModal';
import { CreditCard } from 'lucide-react';

export const AdminServiciosContratados = ({ basePath = '/admin' }: { basePath?: string }) => {
    const navigate = useNavigate();
    const [items, setItems] = useState<ServicioContratadoDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const itemsPerPage = 10;
    const [searchFilter, setSearchFilter] = useState('');

    // Payment Modal State
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedServiceForPayment, setSelectedServiceForPayment] = useState<ServicioContratadoDTO | null>(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const response = await ServicioContratadoService.getAll({ page: currentPage, size: itemsPerPage, sort: 'id,desc', eagerload: true });
            setItems(response.data);
            const total = parseInt(response.headers['x-total-count'] || '0', 10);
            setTotalItems(total);
        } catch (error) {
            toast.error('Error al cargar servicios contratados');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, [currentPage]);

    const handleAction = async (id: number, action: 'confirmar' | 'completar' | 'cancelar') => {
        try {
            if (action === 'confirmar') await ServicioContratadoService.confirmar(id);
            if (action === 'completar') await ServicioContratadoService.completar(id);
            if (action === 'cancelar') await ServicioContratadoService.cancelar(id);

            toast.success(`Servicio ${action} exitosamente`);
            loadData();
        } catch (error) {
            toast.error(`Error al ${action} servicio`);
        }
    };

    const handlePaymentClick = (service: ServicioContratadoDTO) => {
        setSelectedServiceForPayment(service);
        setIsPaymentModalOpen(true);
    };

    const handlePaymentSuccess = async () => {
        if (selectedServiceForPayment && selectedServiceForPayment.id) {
            try {
                // After payment (cash or stripe), we confirm the service
                await ServicioContratadoService.confirmar(selectedServiceForPayment.id);
                toast.success("Servicio pagado y confirmado exitosamente");
                loadData();
            } catch (e) {
                console.error(e);
                toast.error("Pago registrado, pero hubo un error al confirmar el servicio.");
            }
        }
    };

    const getStatusBadgeVariant = (estado: EstadoServicioContratado): "default" | "secondary" | "destructive" | "outline" | null | undefined => {
        switch (estado) {
            case EstadoServicioContratado.CONFIRMADO: return "default";
            case EstadoServicioContratado.PENDIENTE: return "secondary";
            case EstadoServicioContratado.COMPLETADO: return "outline";
            case EstadoServicioContratado.CANCELADO: return "destructive";
            default: return "secondary";
        }
    };

    const filteredItems = items.filter(i => {
        if (!searchFilter) return true;
        const searchLower = searchFilter.toLowerCase();
        return (
            i.cliente?.nombre?.toLowerCase().includes(searchLower) ||
            i.servicio?.nombre?.toLowerCase().includes(searchLower) ||
            i.reserva?.id?.toString().includes(searchLower)
        );
    });

    return (
        <div className="font-sans text-foreground bg-background min-h-screen flex flex-col">
            {/* HERO SECTION */}
            <PageHeader
                title="Gestión de Reservas"
                icon={Briefcase}
                subtitle="Controle y planifique las estancias. Asigne habitaciones y gestione fechas."
                category="Administración"
                className="bg-[#0F172A]"
            >
                <Button
                    onClick={() => navigate(`${basePath}/servicios/contratar`)}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white rounded-none px-6 py-6 shadow-lg transition-all border border-yellow-600/30 text-lg"
                >
                    <Plus className="mr-2 h-5 w-5" /> Nuevo contrato
                </Button>
            </PageHeader>

            <main className="flex-grow py-5 px-4 md:px-8 lg:px-20 -mt-10 relative z-10 transition-all">
                <Card className="max-w-7xl mx-auto border-t-4 border-gray-600 shadow-xl bg-card">
                    <CardHeader className="border-b bg-muted/30 pb-6">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <div>
                                <CardTitle className="text-xl font-bold text-foreground">Listado de Solicitudes</CardTitle>
                                <CardDescription>Mostrando {filteredItems.length} registros</CardDescription>
                            </div>
                            <div className="relative w-full md:w-96 group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-yellow-600 transition-colors" />
                                <Input
                                    placeholder="Buscar por cliente, servicio o reserva..."
                                    value={searchFilter}
                                    onChange={(e) => setSearchFilter(e.target.value)}
                                    className="pl-10 border-input bg-background focus:border-yellow-600 focus:ring-yellow-600/20 h-11 transition-all"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-10">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50 hover:bg-muted/50 border-b border-border">
                                        <TableHead className="font-bold text-muted-foreground w-[60px]">ID</TableHead>
                                        <TableHead className="font-bold text-muted-foreground">Fecha</TableHead>
                                        <TableHead className="font-bold text-muted-foreground">Reserva</TableHead>
                                        <TableHead className="font-bold text-muted-foreground">Cliente</TableHead>
                                        <TableHead className="font-bold text-muted-foreground">Servicio</TableHead>
                                        <TableHead className="font-bold text-muted-foreground text-right w-[80px]">Cant.</TableHead>
                                        <TableHead className="font-bold text-muted-foreground text-right">Total</TableHead>
                                        <TableHead className="font-bold text-muted-foreground text-center">Estado</TableHead>
                                        <TableHead className="font-bold text-muted-foreground text-right p-4">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                                                <div className="flex flex-col items-center justify-center gap-2">
                                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-600"></div>
                                                    <span>Cargando...</span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredItems.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">No hay registros encontrados</TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredItems.map((item) => (
                                            <TableRow key={item.id} className="hover:bg-muted/50 transition-colors border-border">
                                                <TableCell className="font-medium text-muted-foreground">#{item.id}</TableCell>
                                                <TableCell className="text-foreground">{item.fechaContratacion ? format(new Date(item.fechaContratacion), 'dd/MM/yyyy HH:mm') : '-'}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="font-mono bg-background border-border text-foreground">
                                                        #{item.reserva?.id}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-foreground">{item.cliente?.nombre} {item.cliente?.apellido}</span>
                                                        <span className="text-xs text-muted-foreground">{item.cliente?.correo}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-medium text-blue-600 dark:text-blue-400">{item.servicio?.nombre}</TableCell>
                                                <TableCell className="text-right text-foreground">{item.cantidad}</TableCell>
                                                <TableCell className="text-right font-bold text-green-600 dark:text-green-400">
                                                    ${(Number(item.precioUnitario) * item.cantidad).toFixed(2)}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant={getStatusBadgeVariant(item.estado)} className="shadow-sm">
                                                        {item.estado}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right p-4">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:bg-muted hover:text-foreground">
                                                                <span className="sr-only">Abrir menú</span>
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem onClick={() => handlePaymentClick(item)} disabled={item.estado !== EstadoServicioContratado.PENDIENTE}>
                                                                <CreditCard className="mr-2 h-4 w-4 text-yellow-600" /> Pagar
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleAction(item.id, 'confirmar')} disabled={item.estado !== EstadoServicioContratado.PENDIENTE}>
                                                                <CheckCircle className="mr-2 h-4 w-4 text-green-600" /> Confirmar (Sin pago)
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleAction(item.id, 'completar')} disabled={item.estado !== EstadoServicioContratado.CONFIRMADO}>
                                                                <PlayCircle className="mr-2 h-4 w-4 text-blue-600" /> Completar
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleAction(item.id, 'cancelar')} disabled={item.estado === EstadoServicioContratado.CANCELADO || item.estado === EstadoServicioContratado.COMPLETADO}>
                                                                <XCircle className="mr-2 h-4 w-4 text-red-600" /> Cancelar
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* PAGINATION */}
                        <div className="p-4 border-t border-border">
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
            </main>

            <PaymentModal
                open={isPaymentModalOpen}
                onOpenChange={setIsPaymentModalOpen}
                reserva={selectedServiceForPayment?.reserva || null}
                total={selectedServiceForPayment ? Number(selectedServiceForPayment.precioUnitario) * selectedServiceForPayment.cantidad : 0}
                servicioContratadoId={selectedServiceForPayment?.id}
                onSuccess={handlePaymentSuccess}
            />
        </div>
    );
};
