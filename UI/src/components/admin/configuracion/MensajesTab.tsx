
import { useEffect, useState } from 'react';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { ConfiguracionSistemaService } from '../../../services/configuracion-sistema.service';
import { type ConfiguracionSistemaDTO, type NewConfiguracionSistemaDTO } from '../../../types/api/ConfiguracionSistema';

const PREDEFINED_KEYS = [
    { key: 'MSG_CANCEL_REQUEST', label: 'Solicitud Cancelación (Cliente)', description: 'Mensaje del cliente al solicitar cancelación. Variables: {reservaId}, {details}' },
    { key: 'MSG_ADMIN_CANCEL', label: 'Notificación Cancelación (Admin)', description: 'Mensaje del admin al cliente cuando cancela reserva. Variables: {clienteNombre}, {reservaId}, {fechaInicio}, {fechaFin}' },
    { key: 'MSG_ADMIN_FINALIZE', label: 'Notificación Finalización (Admin)', description: 'Mensaje del admin al cliente cuando finaliza reserva. Variables: {clienteNombre}, {reservaId}, {fechaInicio}, {fechaFin}' },
    { key: 'MSG_WELCOME_CHAT', label: 'Bienvenida Chat', description: 'Mensaje inicial al abrir el chat (Opcional)' },
];

export const MensajesTab = () => {
    const [configuraciones, setConfiguraciones] = useState<ConfiguracionSistemaDTO[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentMsg, setCurrentMsg] = useState<Partial<ConfiguracionSistemaDTO>>({});

    const loadMensajes = async () => {
        setIsLoading(true);
        try {
            // Fetch all and filter client-side for now as we don't have a specific backend filter for prefix
            // Optimization: If list is huge, we'd need a backend filter.
            const res = await ConfiguracionSistemaService.getConfiguraciones({
                page: 0,
                size: 1000,
                sort: 'id,asc'
            });
            // Filter only keys starting with MSG_
            const msgs = res.data.filter(c => c.clave?.startsWith('MSG_'));
            setConfiguraciones(msgs);
        } catch (error) {
            toast.error('Error al cargar mensajes');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadMensajes();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (currentMsg.id) {
                await ConfiguracionSistemaService.updateConfiguracion(currentMsg.id, currentMsg as ConfiguracionSistemaDTO);
                toast.success('Mensaje actualizado');
            } else {
                await ConfiguracionSistemaService.createConfiguracion({ ...currentMsg, tipo: 'TEXT', activo: true } as NewConfiguracionSistemaDTO);
                toast.success('Mensaje creado');
            }
            setIsDialogOpen(false);
            loadMensajes();
        } catch (error) {
            toast.error('Error al guardar mensaje');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Eliminar mensaje?')) return;
        try {
            await ConfiguracionSistemaService.deleteConfiguracion(id);
            toast.success('Mensaje eliminado');
            loadMensajes();
        } catch (error) {
            toast.error('Error al eliminar');
        }
    };

    const getLabel = (clave: string) => {
        const pre = PREDEFINED_KEYS.find(p => p.key === clave);
        return pre ? pre.label : clave.replace('MSG_', '');
    };

    return (
        <>
            <Card className="bg-white border-0 shadow-xl overflow-hidden rounded-2xl">
                <CardHeader className="border-b border-gray-100 bg-white p-6">
                    <CardTitle className="text-2xl font-bold text-gray-800">Plantillas de Mensajes</CardTitle>
                    <p className="text-gray-500 text-sm mt-1">Configure los textos automáticos del sistema. Estas plantillas están predefinidas y pueden ser editadas.</p>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-gray-50">
                            <TableRow>
                                <TableHead className="font-bold text-gray-600 py-5 pl-8">TIPO / CLAVE</TableHead>
                                <TableHead className="font-bold text-gray-600 py-5">CONTENIDO</TableHead>
                                <TableHead className="font-bold text-gray-600 py-5 text-right pr-8">ACCIONES</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow><TableCell colSpan={3} className="h-32 text-center text-gray-500">Cargando datos...</TableCell></TableRow>
                            ) : configuraciones.length === 0 ? (
                                <TableRow><TableCell colSpan={3} className="h-32 text-center text-gray-500">No hay mensajes configurados.</TableCell></TableRow>
                            ) : (
                                configuraciones.map(msg => (
                                    <TableRow key={msg.id} className="hover:bg-gray-50/80 transition-colors border-b border-gray-100">
                                        <TableCell className="py-5 pl-8 align-top">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-800">{getLabel(msg.clave || '')}</span>
                                                <code className="text-xs text-slate-400 mt-1">{msg.clave}</code>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-5 align-top">
                                            <p className="whitespace-pre-wrap text-sm text-gray-600 max-w-xl max-h-32 overflow-y-auto">{msg.valor}</p>
                                        </TableCell>
                                        <TableCell className="py-5 text-right pr-8 align-top">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-indigo-50" onClick={() => { setCurrentMsg(msg); setIsDialogOpen(true); }}>
                                                    <Pencil className="h-5 w-5" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-10 w-10 text-gray-400" onClick={() => Number(msg.id) && handleDelete(Number(msg.id))}>
                                                    <Trash2 className="h-5 w-5" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">{currentMsg.id ? 'Editar' : 'Crear'} Plantilla</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSave} className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>Identificador (Clave)</Label>
                            {/* Combobox or Input with suggestions could be nice, for now simplified */}
                            <Input
                                list="keys-suggestions"
                                value={currentMsg.clave || ''}
                                onChange={e => setCurrentMsg({ ...currentMsg, clave: e.target.value })}
                                placeholder="MSG_NUEVO_MENSAJE"
                                required
                            />
                            <datalist id="keys-suggestions">
                                {PREDEFINED_KEYS.map(k => (
                                    <option key={k.key} value={k.key}>{k.label}</option>
                                ))}
                            </datalist>
                            <p className="text-xs text-gray-400">Debe comenzar con MSG_</p>
                        </div>

                        <div className="grid gap-2">
                            <Label>Contenido del Mensaje</Label>
                            <Textarea
                                value={currentMsg.valor || ''}
                                onChange={e => setCurrentMsg({ ...currentMsg, valor: e.target.value })}
                                placeholder="Escriba el contenido..."
                                className="min-h-[150px]"
                                required
                            />
                            {(() => {
                                const hint = PREDEFINED_KEYS.find(k => k.key === currentMsg.clave);
                                if (hint && hint.description.includes('Variables:')) {
                                    const variables = hint.description.split('Variables:')[1].trim();
                                    return (
                                        <p className="text-xs text-blue-500 bg-blue-50 p-2 rounded">
                                            Variables disponibles: {variables}
                                        </p>
                                    );
                                }
                                return null;
                            })()}
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">Guardar</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
};
