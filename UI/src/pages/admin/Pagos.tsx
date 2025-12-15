
import { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { PagoService, ReservaService } from '../../services';
import type { PagoDTO, ReservaDTO } from '../../types/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { MetodoPago, EstadoPago } from '../../types/enums';
import { Badge } from '@/components/ui/badge';

export const AdminPagos = () => {
    const [pagos, setPagos] = useState<PagoDTO[]>([]);
    const [reservas, setReservas] = useState<ReservaDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const [currentItem, setCurrentItem] = useState<Partial<PagoDTO>>({});
    const [isEditing, setIsEditing] = useState(false);

    const loadData = async () => {
        setLoading(true);
        try {
            const [pagosRes, reservasRes] = await Promise.all([
                PagoService.getPagos({ page: 0, size: 50, sort: 'id,desc' }),
                ReservaService.getReservas()
            ]);
            setPagos(pagosRes.data);
            setReservas(reservasRes.data);
        } catch (error) {
            toast.error('Error al cargar datos');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...currentItem,
                fechaPago: currentItem.fechaPago ? new Date(currentItem.fechaPago).toISOString() : new Date().toISOString()
            };

            if (isEditing && currentItem.id) {
                await PagoService.updatePago(currentItem.id, payload as PagoDTO);
                toast.success('Pago actualizado');
            } else {
                await PagoService.createPago(payload as any);
                toast.success('Pago registrado');
            }
            setIsDialogOpen(false);
            loadData();
        } catch (error) {
            toast.error('Error al guardar pago');
        }
    };

    const handleEdit = (item: PagoDTO) => {
        setCurrentItem({
            ...item,
            fechaPago: item.fechaPago ? item.fechaPago.substring(0, 16) : '' // format for datetime-local
        });
        setIsEditing(true);
        setIsDialogOpen(true);
    };

    const handleCreate = () => {
        setCurrentItem({
            fechaPago: new Date().toISOString().substring(0, 16),
            monto: '0',
            metodoPago: MetodoPago.TARJETA,
            estado: EstadoPago.PENDIENTE,
            activo: true
        });
        setIsEditing(false);
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Estás seguro de eliminar este pago?')) return;
        try {
            await PagoService.deletePago(id);
            toast.success('Pago eliminado');
            loadData();
        } catch (error) {
            toast.error('Error al eliminar');
        }
    };

    const filteredPagos = pagos.filter(p =>
        p.id?.toString().includes(searchTerm) ||
        p.reserva?.id?.toString().includes(searchTerm) ||
        p.plataformaPagoId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <DashboardLayout title="Gestión de Pagos" role="Administrador">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Historial de Pagos</CardTitle>
                    <div className="flex gap-2">
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar ID pago o reserva..."
                                className="pl-8 w-[250px]"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button onClick={handleCreate}>
                                    <Plus className="mr-2 h-4 w-4" /> Registrar Pago
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                                <DialogHeader>
                                    <DialogTitle>{isEditing ? 'Editar Pago' : 'Nuevo Pago'}</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="reserva">Reserva Asociada</Label>
                                        <Select
                                            value={currentItem.reserva?.id ? String(currentItem.reserva.id) : undefined}
                                            onValueChange={(val) => {
                                                const res = reservas.find(r => String(r.id) === val);
                                                setCurrentItem({ ...currentItem, reserva: res });
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar reserva" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {reservas.map(r => (
                                                    <SelectItem key={r.id} value={String(r.id)}>
                                                        Reserva #{r.id} - {r.cliente?.nombre || 'Cliente'} ({r.estado})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="fecha">Fecha y Hora</Label>
                                            <Input
                                                id="fecha"
                                                type="datetime-local"
                                                value={currentItem.fechaPago || ''}
                                                onChange={e => setCurrentItem({ ...currentItem, fechaPago: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="monto">Monto</Label>
                                            <Input
                                                id="monto"
                                                type="number"
                                                step="0.01"
                                                value={currentItem.monto || ''}
                                                onChange={e => setCurrentItem({ ...currentItem, monto: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="metodo">Método</Label>
                                            <Select
                                                value={currentItem.metodoPago}
                                                onValueChange={(val) => setCurrentItem({ ...currentItem, metodoPago: val })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Método" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.values(MetodoPago).map(m => (
                                                        <SelectItem key={m} value={m}>{m}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="estado">Estado</Label>
                                            <Select
                                                value={currentItem.estado}
                                                onValueChange={(val) => setCurrentItem({ ...currentItem, estado: val })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Estado" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.values(EstadoPago).map(e => (
                                                        <SelectItem key={e} value={e}>{e}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="plataformaId">ID Transacción / Plataforma</Label>
                                        <Input
                                            id="plataformaId"
                                            value={currentItem.plataformaPagoId || ''}
                                            onChange={e => setCurrentItem({ ...currentItem, plataformaPagoId: e.target.value })}
                                            placeholder="Ej. stripe_charge_123"
                                        />
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit">{isEditing ? 'Guardar Cambios' : 'Registrar Pago'}</Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Reserva</TableHead>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Monto</TableHead>
                                <TableHead>Método</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>Ref.</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={8} className="text-center">Cargando...</TableCell></TableRow>
                            ) : filteredPagos.length === 0 ? (
                                <TableRow><TableCell colSpan={8} className="text-center">No hay pagos registrados</TableCell></TableRow>
                            ) : (
                                filteredPagos.map((p) => (
                                    <TableRow key={p.id}>
                                        <TableCell>{p.id}</TableCell>
                                        <TableCell>#{p.reserva?.id}</TableCell>
                                        <TableCell>{new Date(p.fechaPago).toLocaleDateString()} {new Date(p.fechaPago).toLocaleTimeString()}</TableCell>
                                        <TableCell className="font-bold">${p.monto}</TableCell>
                                        <TableCell>{p.metodoPago}</TableCell>
                                        <TableCell>
                                            <Badge variant={p.estado === EstadoPago.COMPLETADO ? 'default' : p.estado === EstadoPago.PENDIENTE ? 'outline' : 'destructive'}>
                                                {p.estado}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">{p.plataformaPagoId || '-'}</TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(p)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => p.id && handleDelete(p.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
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
