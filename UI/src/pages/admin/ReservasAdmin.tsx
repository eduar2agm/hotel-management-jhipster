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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ReservaService } from '../../services/reserva.service';
import { ClienteService } from '../../services/cliente.service';
import { HabitacionService } from '../../services/habitacion.service';
import { type ReservaDTO, type NewReservaDTO } from '../../types/api/Reserva';
import { type ClienteDTO } from '../../types/api/Cliente';
import { type HabitacionDTO } from '../../types/api/Habitacion';
import { toast } from 'sonner';
import { Pencil, Trash2, Plus, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const AdminReservas = () => {
    const [reservas, setReservas] = useState<ReservaDTO[]>([]);
    const [clientes, setClientes] = useState<ClienteDTO[]>([]);
    const [habitaciones, setHabitaciones] = useState<HabitacionDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentReserva, setCurrentReserva] = useState<Partial<ReservaDTO>>({});
    const [isEditing, setIsEditing] = useState(false);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const [reservasRes, clientesRes, habitacionesRes] = await Promise.all([
                ReservaService.getReservas(),
                ClienteService.getClientes(), // Assuming pagination might be an issue later, but fetching all for now for mapping
                HabitacionService.getHabitacions()
            ]);
            setReservas(reservasRes.data);
            setClientes(clientesRes.data);
            setHabitaciones(habitacionesRes.data);
        } catch (error) {
            console.error('Error al cargar datos:', error);
            toast.error('No se pudieron cargar los datos');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const getClienteName = (id?: number | null) => {
        if (!id) return 'Desconocido';
        const cliente = clientes.find(c => c.id === id);
        return cliente ? `${cliente.nombre} ${cliente.apellido}` : 'Desconocido';
    };

    const getHabitacionInfo = (id?: number | null) => {
        if (!id) return 'N/A';
        const habitacion = habitaciones.find(h => h.id === id);
        return habitacion ? `Hab: ${habitacion.numero} (${habitacion.categoriaHabitacion?.nombre || 'General'})` : 'N/A';
    };

    const handleCreate = () => {
        setCurrentReserva({
            fechaInicio: '',
            fechaFin: '',
            estado: 'PENDIENTE',
            activo: true
        });
        setIsEditing(false);
        setIsDialogOpen(true);
    };

    const handleEdit = (reserva: ReservaDTO) => {
        setCurrentReserva({ ...reserva });
        setIsEditing(true);
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('¿Está seguro de eliminar esta reserva?')) return;

        try {
            await ReservaService.deleteReserva(id);
            toast.success('Reserva eliminada correctamente');
            loadData();
        } catch (error) {
            console.error('Error al eliminar:', error);
            toast.error('Error al eliminar la reserva');
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            // Validaciones básicas
            if (!currentReserva.clienteId || !currentReserva.habitacionId || !currentReserva.fechaInicio || !currentReserva.fechaFin) {
                toast.error('Por favor complete todos los campos requeridos');
                return;
            }

            // Preparar DTO
            const reservaToSave = {
                ...currentReserva,
                fechaReserva: currentReserva.fechaReserva || new Date().toISOString().split('T')[0]
            };

            if (isEditing && currentReserva.id) {
                await ReservaService.updateReserva(currentReserva.id, reservaToSave as ReservaDTO);
                toast.success('Reserva actualizada');
            } else {
                await ReservaService.createReserva(reservaToSave as NewReservaDTO);
                toast.success('Reserva creada');
            }

            setIsDialogOpen(false);
            loadData();
        } catch (error) {
            console.error('Error al guardar:', error);
            toast.error('Error al guardar la reserva');
        }
    };

    return (
        <DashboardLayout title="Gestión de Reservas" role="Administrador">
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Reservas</h2>
                    <p className="text-muted-foreground">Administra las reservas del hotel</p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" /> Nueva Reserva
                </Button>
            </div>

            <div className="bg-white rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Habitación</TableHead>
                            <TableHead>Fechas</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-10">
                                    Cargando reservas...
                                </TableCell>
                            </TableRow>
                        ) : reservas.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-10">
                                    No hay reservas registradas
                                </TableCell>
                            </TableRow>
                        ) : (
                            reservas.map((reserva) => (
                                <TableRow key={reserva.id}>
                                    <TableCell>{reserva.id}</TableCell>
                                    <TableCell>{getClienteName(reserva.clienteId)}</TableCell>
                                    <TableCell>{getHabitacionInfo(reserva.habitacionId)}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col text-sm">
                                            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {reserva.fechaInicio}</span>
                                            <span className="text-muted-foreground">a {reserva.fechaFin}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={reserva.estado === 'CONFIRMADA' ? 'default' : 'secondary'}>
                                            {reserva.estado || 'PENDIENTE'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(reserva)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(reserva.id!)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{isEditing ? 'Editar Reserva' : 'Nueva Reserva'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSave} className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="cliente">Cliente</Label>
                            <Select
                                value={currentReserva.clienteId?.toString()}
                                onValueChange={(val) => setCurrentReserva({ ...currentReserva, clienteId: Number(val) })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccione un cliente" />
                                </SelectTrigger>
                                <SelectContent>
                                    {clientes.map(cliente => (
                                        <SelectItem key={cliente.id} value={cliente.id?.toString() || ''}>
                                            {cliente.nombre} {cliente.apellido}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="habitacion">Habitación</Label>
                            <Select
                                value={currentReserva.habitacionId?.toString()}
                                onValueChange={(val) => setCurrentReserva({ ...currentReserva, habitacionId: Number(val) })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccione una habitación" />
                                </SelectTrigger>
                                <SelectContent>
                                    {habitaciones.map(hab => (
                                        <SelectItem key={hab.id} value={hab.id?.toString() || ''}>
                                            Hab {hab.numero} - {hab.categoriaHabitacion?.nombre || 'General'}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="fechaInicio">Fecha Inicio</Label>
                                <Input
                                    id="fechaInicio"
                                    type="date"
                                    value={currentReserva.fechaInicio || ''}
                                    onChange={(e) => setCurrentReserva({ ...currentReserva, fechaInicio: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="fechaFin">Fecha Fin</Label>
                                <Input
                                    id="fechaFin"
                                    type="date"
                                    value={currentReserva.fechaFin || ''}
                                    onChange={(e) => setCurrentReserva({ ...currentReserva, fechaFin: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="estado">Estado</Label>
                            <Select
                                value={currentReserva.estado || 'PENDIENTE'}
                                onValueChange={(val) => setCurrentReserva({ ...currentReserva, estado: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccione estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PENDIENTE">PENDIENTE</SelectItem>
                                    <SelectItem value="CONFIRMADA">CONFIRMADA</SelectItem>
                                    <SelectItem value="CANCELADA">CANCELADA</SelectItem>
                                    <SelectItem value="CHECK_IN">CHECK_IN</SelectItem>
                                    <SelectItem value="CHECK_OUT">CHECK_OUT</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit">Guardar</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
};
