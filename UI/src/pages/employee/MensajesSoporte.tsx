import { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { MensajeSoporteService, ReservaService, ClienteService } from '../../services';
import type { MensajeSoporteDTO, ReservaDTO, ClienteDTO } from '../../types/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '../../hooks/useAuth';
import { Remitente } from '../../types/enums';

export const EmployeeMensajesSoporte = () => {
    const { user } = useAuth();
    const [mensajes, setMensajes] = useState<MensajeSoporteDTO[]>([]);
    const [reservas, setReservas] = useState<ReservaDTO[]>([]);
    const [clientes, setClientes] = useState<ClienteDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const [currentItem, setCurrentItem] = useState<Partial<MensajeSoporteDTO>>({});

    const loadData = async () => {
        setLoading(true);
        try {
            const [msgsRes, reservasRes, clientesRes] = await Promise.all([
                MensajeSoporteService.getMyMensajes({ page: 0, size: 50, sort: 'fechaMensaje,desc' }),
                ReservaService.getReservas(),
                ClienteService.getClientes()
            ]);
            setMensajes(msgsRes.data);
            setReservas(reservasRes.data);
            setClientes(clientesRes.data);
        } catch (error) {
            toast.error('Error al cargar mensajes');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleCreate = () => {
        setCurrentItem({
            fechaMensaje: new Date().toISOString(),
            remitente: Remitente.ADMINISTRATIVO,
            leido: false,
            activo: true
        });
        setIsDialogOpen(true);
    };

    const handleReply = (msg: MensajeSoporteDTO) => {
        setCurrentItem({
            fechaMensaje: new Date().toISOString(),
            remitente: Remitente.ADMINISTRATIVO,
            reserva: msg.reserva,
            destinatarioId: msg.userId,
            destinatarioName: msg.userName,
            leido: false,
            activo: true
        });
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...currentItem,
                userId: user?.id || 'employee',
                userName: user?.username || 'Employee',
                fechaMensaje: new Date().toISOString()
            };
            await MensajeSoporteService.createMensaje(payload as any);
            toast.success('Mensaje enviado');
            setIsDialogOpen(false);
            loadData();
        } catch (error) {
            toast.error('Error al enviar mensaje');
        }
    };

    const filteredMensajes = mensajes.filter(m =>
        m.mensaje?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.reserva?.id?.toString().includes(searchTerm)
    );

    return (
        <DashboardLayout title="Mis Mensajes" role="Empleado">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Bandeja de Entrada</CardTitle>
                    <div className="flex gap-2">
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar en mensajes..."
                                className="pl-8 w-[250px]"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button onClick={handleCreate}>
                                    <Plus className="mr-2 h-4 w-4" /> Nuevo Mensaje
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>
                                        {currentItem.destinatarioId ? 'Responder Mensaje' : 'Enviar Mensaje'}
                                    </DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                                    {currentItem.destinatarioId && (
                                        <div className="grid gap-2 p-3 bg-muted rounded-md">
                                            <Label className="text-sm font-medium">Respondiendo a:</Label>
                                            <div className="text-sm text-muted-foreground">
                                                {currentItem.destinatarioName || currentItem.destinatarioId}
                                            </div>
                                        </div>
                                    )}
                                    {!currentItem.destinatarioId && (
                                        <div className="grid gap-2">
                                            <Label htmlFor="destinatario">Enviar a (Opcional)</Label>
                                            <Select
                                                value={currentItem.destinatarioId || undefined}
                                                onValueChange={(val) => {
                                                    const cliente = clientes.find(c => c.keycloakId === val);
                                                    setCurrentItem({
                                                        ...currentItem,
                                                        destinatarioId: val,
                                                        destinatarioName: cliente ? `${cliente.nombre} ${cliente.apellido}` : undefined
                                                    });
                                                }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Mensaje general o selecciona un cliente" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {clientes.map(c => (
                                                        <SelectItem key={c.id} value={c.keycloakId || String(c.id)}>
                                                            {c.nombre} {c.apellido} ({c.correo})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                    <div className="grid gap-2">
                                        <Label htmlFor="reserva">Reserva # (Opcional)</Label>
                                        {currentItem.destinatarioId && !currentItem.reserva?.id ? (
                                            <div className="p-2 text-sm text-muted-foreground bg-muted rounded-md">
                                                El mensaje original no tiene reserva asociada
                                            </div>
                                        ) : (
                                            <Select
                                                value={currentItem.reserva?.id ? String(currentItem.reserva.id) : undefined}
                                                onValueChange={(val) => {
                                                    const res = reservas.find(r => String(r.id) === val);
                                                    setCurrentItem({ ...currentItem, reserva: res });
                                                }}
                                                disabled={!!currentItem.destinatarioId && !!currentItem.reserva?.id}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccionar reserva asociada" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {reservas.map(r => (
                                                        <SelectItem key={r.id} value={String(r.id)}>
                                                            #{r.id} - {r.cliente?.nombre} ({r.estado})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="mensaje">Mensaje</Label>
                                        <Textarea
                                            id="mensaje"
                                            rows={5}
                                            value={currentItem.mensaje || ''}
                                            onChange={e => setCurrentItem({ ...currentItem, mensaje: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit">Enviar</Button>
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
                                <TableHead>Fecha</TableHead>
                                <TableHead>Reserva</TableHead>
                                <TableHead>Dirección</TableHead>
                                <TableHead>Mensaje</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={6} className="text-center">Cargando...</TableCell></TableRow>
                            ) : filteredMensajes.length === 0 ? (
                                <TableRow><TableCell colSpan={6} className="text-center">No hay mensajes.</TableCell></TableRow>
                            ) : (
                                filteredMensajes.map((msg) => {
                                    const isSent = msg.userId === user?.id;

                                    return (
                                        <TableRow key={msg.id} className={!msg.leido && !isSent ? 'bg-muted/50 font-medium' : ''}>
                                            <TableCell className="w-[180px]">
                                                {new Date(msg.fechaMensaje).toLocaleDateString()} {new Date(msg.fechaMensaje).toLocaleTimeString()}
                                            </TableCell>
                                            <TableCell>#{msg.reserva?.id || 'N/A'}</TableCell>
                                            <TableCell>
                                                {isSent ? (
                                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                        Enviado {msg.destinatarioName && `a ${msg.destinatarioName}`}
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                        Recibido de {msg.userName || 'Usuario'}
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="max-w-[400px]" title={msg.mensaje}>
                                                {msg.mensaje}
                                            </TableCell>
                                            <TableCell>
                                                {msg.leido ? (
                                                    <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Leído</Badge>
                                                ) : (
                                                    <Badge variant="secondary">Enviado</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {!isSent && (
                                                    <Button variant="ghost" size="icon" title="Responder" onClick={() => handleReply(msg)}>
                                                        <MessageSquare className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </DashboardLayout>
    );
};
