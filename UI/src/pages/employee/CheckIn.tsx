import { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReservaService } from '../../services/reserva.service';
import { ClienteService } from '../../services/cliente.service';
import { type ReservaDTO } from '../../types/api/Reserva';
import { type ClienteDTO } from '../../types/api/Cliente';
import { toast } from 'sonner';
import { LogIn, LogOut, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { HabitacionService } from '../../services';
import { type HabitacionDTO } from '../../types/api';

export const CheckIn = () => {
    const [reservas, setReservas] = useState<ReservaDTO[]>([]);
    const [clientes, setClientes] = useState<ClienteDTO[]>([]);
    const [habitaciones, setHabitaciones] = useState<HabitacionDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const loadData = async () => {
        try {
            setIsLoading(true);
            const [reservasRes, clientesRes, habitacionesRes] = await Promise.all([
                ReservaService.getReservas(),
                ClienteService.getClientes({ page: 0, size: 100 }),
                HabitacionService.getHabitacions()
            ]);
            setReservas(reservasRes.data);
            setClientes(clientesRes.data);
            setHabitaciones(habitacionesRes.data);
        } catch (error) {
            toast.error('Error al cargar datos');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const getClienteName = (id?: number | null) => {
        const c = clientes.find(client => client.id === id);
        return c ? `${c.nombre} ${c.apellido}` : 'Desconocido';
    };

    const getHabitacionInfo = (id?: number | null) => {
        const h = habitaciones.find(hab => hab.id === id);
        return h ? `Hab ${h.numero}` : 'N/A';
    };

    const handleCheckIn = async (reserva: ReservaDTO) => {
        if (!confirm(`¿Realizar Check-In para la reserva #${reserva.id}?`)) return;
        try {
            const updated = { ...reserva, estado: 'CHECK_IN' };
            await ReservaService.updateReserva(reserva.id!, updated);
            toast.success('Check-In realizado con éxito');
            loadData();
        } catch (error) {
            toast.error('Error al realizar Check-In');
        }
    };

    const handleCheckOut = async (reserva: ReservaDTO) => {
        if (!confirm(`¿Realizar Check-Out para la reserva #${reserva.id}?`)) return;
        try {
            const updated = { ...reserva, estado: 'CHECK_OUT' };
            await ReservaService.updateReserva(reserva.id!, updated);
            toast.success('Check-Out realizado con éxito');
            loadData();
        } catch (error) {
            toast.error('Error al realizar Check-Out');
        }
    };

    const filteredReservas = reservas.filter(r => {
        const clienteName = getClienteName(r.clienteId).toLowerCase();
        const matchesSearch = clienteName.includes(searchTerm.toLowerCase()) || r.id?.toString().includes(searchTerm);
        const isActionable = r.estado === 'CONFIRMADA' || r.estado === 'CHECK_IN' || r.estado === 'PENDIENTE';
        return matchesSearch && isActionable;
    });

    return (
        <DashboardLayout title="Check-in / Check-out" role="Empleado">
            <Card>
                <CardHeader>
                    <CardTitle>Operaciones Diarias</CardTitle>
                    <div className="relative mt-2">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por cliente o ID de reserva..."
                            className="pl-8 max-w-sm"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Reserva #</TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Habitación</TableHead>
                                <TableHead>Fechas</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Acción</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow><TableCell colSpan={6} className="text-center">Cargando...</TableCell></TableRow>
                            ) : filteredReservas.length === 0 ? (
                                <TableRow><TableCell colSpan={6} className="text-center">No hay reservas pendientes de acción</TableCell></TableRow>
                            ) : (
                                filteredReservas.map(r => (
                                    <TableRow key={r.id}>
                                        <TableCell className="font-medium">{r.id}</TableCell>
                                        <TableCell>{getClienteName(r.clienteId)}</TableCell>
                                        <TableCell>{getHabitacionInfo(r.habitacionId)}</TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                <span className="text-green-600">IN: {r.fechaInicio}</span><br />
                                                <span className="text-red-600">OUT: {r.fechaFin}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={r.estado === 'CHECK_IN' ? 'default' : 'outline'}>
                                                {r.estado}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {(r.estado === 'PENDIENTE' || r.estado === 'CONFIRMADA') && (
                                                <Button size="sm" onClick={() => handleCheckIn(r)} className="bg-green-600 hover:bg-green-700">
                                                    <LogIn className="mr-2 h-4 w-4" /> Check-In
                                                </Button>
                                            )}
                                            {r.estado === 'CHECK_IN' && (
                                                <Button size="sm" onClick={() => handleCheckOut(r)} className="bg-red-600 hover:bg-red-700">
                                                    <LogOut className="mr-2 h-4 w-4" /> Check-Out
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </DashboardLayout>
    );
};
