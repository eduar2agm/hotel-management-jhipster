
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
import { Pencil, Trash2, Info, Code } from 'lucide-react';
import { toast } from 'sonner';
import { ConfiguracionSistemaService } from '../../../services/configuracion-sistema.service';
import { type ConfiguracionSistemaDTO, type NewConfiguracionSistemaDTO } from '../../../types/api/ConfiguracionSistema';

const PREDEFINED_KEYS = [
    { key: 'MSG_CANCEL_REQUEST', label: 'Solicitud Cancelación (Cliente)', description: 'Mensaje del cliente al solicitar cancelación. Variables: {reservaId}, {details}' },
    { key: 'MSG_ADMIN_CANCEL', label: 'Notificación Cancelación (Admin)', description: 'Mensaje del admin al cliente cuando cancela reserva. Variables: {clienteNombre}, {reservaId}, {fechaInicio}, {fechaFin}' },
    { key: 'MSG_ADMIN_FINALIZE', label: 'Notificación Finalización (Admin)', description: 'Mensaje del admin al cliente cuando finaliza reserva. Variables: {clienteNombre}, {reservaId}, {fechaInicio}, {fechaFin}' },
    { key: 'MSG_WELCOME_CHAT', label: 'Bienvenida Chat', description: 'Mensaje inicial al abrir el chat (Opcional)' },

    // Servicios
    { key: 'MSG_SERVICE_CONFIRMADO', label: 'Confirmación Servicio', description: 'Confirmación tras pago. Variables: {servicioNombre}, {fechaServicio}, {total}' },
    { key: 'MSG_SERVICE_PAGO_EXITOSO', label: 'Pago Exitoso Servicio', description: 'Confirmación de pago. Variables: {servicioNombre}' },
    { key: 'MSG_SERVICE_COMPLETADO', label: 'Servicio Completado', description: 'Notificación de servicio finalizado. Variables: {servicioNombre}' },
    { key: 'MSG_SERVICE_CANCELADO', label: 'Cancelación Servicio', description: 'Notificación de cancelación. Variables: {servicioNombre}, {fechaServicio}' },
    { key: 'MSG_SERVICE_SOLICITUD_CANCELACION', label: 'Solicitud Cancelación Servicio', description: 'Confirmación de solicitud de cancelación. Variables: {servicioNombre}' },
    { key: 'MSG_SERVICE_AUTO_CANCEL_RESERVA', label: 'Cancelación Auto por Reserva', description: 'Cancelación automática al cancelar reserva. Variables: {reservaId}' },
    { key: 'MSG_ADMIN_FORCED_FINALIZE', label: 'Admin Forced Finalize', description: 'Notificación cuando admin fuerza finalización. Variables: {reservaId}, {clienteNombre}' },
    { key: 'MSG_SERVICE_AUTO_COMPLETED_CHECKOUT', label: 'Servicio Auto-Completado (Checkout)', description: 'Notificación cuando servicio se completa por checkout. Variables: {servicioNombre}' },
    { key: 'MSG_SERVICE_ADMIN_FORCED_COMPLETION', label: 'Servicio Completado Manual (Admin)', description: 'Notificación cuando admin completa servicio manualmente. Variables: {servicioNombre}' },
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
            <Card className="bg-card border-0 shadow-xl overflow-hidden rounded-2xl">
                <CardHeader className="border-b border-border bg-card p-6">
                    <CardTitle className="text-2xl font-bold text-foreground">Plantillas de Mensajes</CardTitle>
                    <p className="text-muted-foreground text-sm mt-1">Configure los textos automáticos del sistema. Estas plantillas están predefinidas y pueden ser editadas.</p>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow className="border-border">
                                <TableHead className="font-bold text-muted-foreground py-5 pl-8">TIPO / CLAVE</TableHead>
                                <TableHead className="font-bold text-muted-foreground py-5">CONTENIDO</TableHead>
                                <TableHead className="font-bold text-muted-foreground py-5 text-right pr-8">ACCIONES</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow><TableCell colSpan={3} className="h-32 text-center text-muted-foreground">Cargando datos...</TableCell></TableRow>
                            ) : configuraciones.length === 0 ? (
                                <TableRow><TableCell colSpan={3} className="h-32 text-center text-muted-foreground">No hay mensajes configurados.</TableCell></TableRow>
                            ) : (
                                configuraciones.map(msg => (
                                    <TableRow key={msg.id} className="hover:bg-muted/50 transition-colors border-b border-border">
                                        <TableCell className="py-5 pl-8 align-top">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-foreground">{getLabel(msg.clave || '')}</span>
                                                <code className="text-xs text-muted-foreground mt-1">{msg.clave}</code>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-5 align-top">
                                            <p className="whitespace-pre-wrap text-sm text-foreground/80 max-w-xl max-h-32 overflow-y-auto">{msg.valor}</p>
                                        </TableCell>
                                        <TableCell className="py-5 text-right pr-8 align-top">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-indigo-50 dark:hover:bg-indigo-900/30" onClick={() => { setCurrentMsg(msg); setIsDialogOpen(true); }}>
                                                    <Pencil className="h-5 w-5" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:bg-red-50 dark:hover:bg-red-900/30" onClick={() => Number(msg.id) && handleDelete(Number(msg.id))}>
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

            {/* Variables Disponibles */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-900 border border-blue-100 dark:border-slate-800 shadow-lg overflow-hidden rounded-2xl mt-6">
                <CardHeader className="border-b border-blue-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm p-6">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center">
                            <Info className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold text-foreground">Variables Disponibles</CardTitle>
                            <p className="text-muted-foreground text-sm mt-0.5">Utilice estas variables en sus plantillas de mensajes</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {PREDEFINED_KEYS.map((item) => {
                            const variablesMatch = item.description.match(/Variables: (.+)/);
                            const variables = variablesMatch ? variablesMatch[1].split(',').map(v => v.trim()) : [];

                            return (
                                <div key={item.key} className="bg-white dark:bg-slate-950 rounded-xl p-5 border border-blue-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-start gap-3">
                                        <div className="h-8 w-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <Code className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-foreground text-sm mb-1">{item.label}</h4>
                                            <code className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">{item.key}</code>

                                            {variables.length > 0 ? (
                                                <div className="mt-3 space-y-2">
                                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Variables:</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {variables.map((variable) => (
                                                            <span
                                                                key={variable}
                                                                className="inline-flex items-center gap-1 text-xs font-mono bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-2.5 py-1 rounded-md shadow-sm"
                                                            >
                                                                {variable}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-xs text-muted-foreground italic mt-3">Sin variables dinámicas</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 rounded-lg">
                        <div className="flex gap-3">
                            <Info className="h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-semibold text-amber-900 dark:text-amber-200 mb-1">💡 Cómo usar las variables</p>
                                <p className="text-xs text-amber-800 dark:text-amber-300">
                                    Las variables se reemplazan automáticamente con datos reales al enviar el mensaje.
                                    Por ejemplo, <code className="bg-amber-100 dark:bg-amber-900/40 px-1.5 py-0.5 rounded text-amber-900 dark:text-amber-200">{'{clienteNombre}'}</code> se sustituirá por el nombre del cliente.
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-foreground">{currentMsg.id ? 'Editar' : 'Crear'} Plantilla</DialogTitle>
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
                            <p className="text-xs text-muted-foreground">Debe comenzar con MSG_</p>
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
                                        <p className="text-xs text-blue-500 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
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
