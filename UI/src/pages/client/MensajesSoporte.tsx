import { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { MensajeSoporteService } from '../../services';
import type { MensajeSoporteDTO } from '../../types/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '../../hooks/useAuth';

export const ClientMensajesSoporte = () => {
    const { user } = useAuth();
    const [mensajes, setMensajes] = useState<MensajeSoporteDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const [currentItem, setCurrentItem] = useState<Partial<MensajeSoporteDTO>>({});

    const loadData = async () => {
        setLoading(true);
        try {
            const msgsRes = await MensajeSoporteService.getMyMensajes({ page: 0, size: 50, sort: 'fechaMensaje,desc' });
            setMensajes(msgsRes.data);
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
            remitente: 'CLIENT',
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
                userId: user?.id || 'client',
                userName: user?.username || 'Client',
                fechaMensaje: new Date().toISOString()
            };
            await MensajeSoporteService.createMensaje(payload as any);
            toast.success('Mensaje enviado al soporte');
            setIsDialogOpen(false);
            loadData();
        } catch (error) {
            toast.error('Error al enviar mensaje');
        }
    };

    const filteredMensajes = mensajes.filter(m =>
        m.mensaje?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <DashboardLayout title="Soporte" role="Cliente">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Mis Mensajes de Soporte</CardTitle>
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
                                    <Plus className="mr-2 h-4 w-4" /> Contactar Soporte
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Contactar Soporte</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="mensaje">¿En qué podemos ayudarte?</Label>
                                        <Textarea
                                            id="mensaje"
                                            rows={5}
                                            placeholder="Describe tu consulta o problema..."
                                            value={currentItem.mensaje || ''}
                                            onChange={e => setCurrentItem({ ...currentItem, mensaje: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit">Enviar Mensaje</Button>
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
                                <TableHead>Dirección</TableHead>
                                <TableHead>Mensaje</TableHead>
                                <TableHead>Estado</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={4} className="text-center">Cargando...</TableCell></TableRow>
                            ) : filteredMensajes.length === 0 ? (
                                <TableRow><TableCell colSpan={4} className="text-center">No has enviado mensajes aún.</TableCell></TableRow>
                            ) : (
                                filteredMensajes.map((msg) => {
                                    const isSent = msg.userId === user?.id;

                                    return (
                                        <TableRow key={msg.id} className={!msg.leido && !isSent ? 'bg-muted/50 font-medium' : ''}>
                                            <TableCell className="w-[180px]">
                                                {new Date(msg.fechaMensaje).toLocaleDateString()} {new Date(msg.fechaMensaje).toLocaleTimeString()}
                                            </TableCell>
                                            <TableCell>
                                                {isSent ? (
                                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                        Enviado a Soporte
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                        Respuesta de Soporte
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="max-w-[500px]" title={msg.mensaje}>
                                                {msg.mensaje}
                                            </TableCell>
                                            <TableCell>
                                                {msg.leido ? (
                                                    <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Leído por soporte</Badge>
                                                ) : (
                                                    <Badge variant="secondary">Enviado</Badge>
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
