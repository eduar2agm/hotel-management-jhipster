import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription
} from '@/components/ui/form';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ReservaService } from '../../../services/reserva.service';
import { HabitacionService } from '../../../services/habitacion.service';
import { ReservaDetalleService } from '../../../services/reserva-detalle.service';
import { MensajeSoporteService } from '../../../services/mensaje-soporte.service';
import { ConfiguracionSistemaService } from '../../../services/configuracion-sistema.service';
import { Remitente } from '../../../types/enums';
import type { ReservaDTO } from '../../../types/api/Reserva';
import type { ClienteDTO } from '../../../types/api/Cliente';
import type { HabitacionDTO } from '../../../types/api/Habitacion';
import { toast } from 'sonner';
import { Pencil, Plus, User, Calendar, Check, ChevronsUpDown, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

const reservaSchema = z.object({
    id: z.number().optional(),
    clienteId: z.coerce.number().min(1, 'Cliente requerido'),
    roomIds: z.array(z.number()).min(1, 'Seleccione al menos una habitación'),
    fechaInicio: z.string().min(1, 'Fecha inicio requerida'),
    fechaFin: z.string().min(1, 'Fecha fin requerida'),
    estado: z.string(),
    activo: z.boolean().default(true)
}).refine(data => new Date(data.fechaInicio) < new Date(data.fechaFin), {
    message: "Fecha fin debe ser posterior a inicio",
    path: ["fechaFin"]
});

type ReservaFormValues = z.infer<typeof reservaSchema>;

interface ReservaFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    reserva?: ReservaDTO | null; // null represents create mode
    clientes: ClienteDTO[];
    onSuccess: (newReserva?: ReservaDTO) => void; // Optional return of new reservation for payment flow
}

export const ReservaFormDialog = ({
    open,
    onOpenChange,
    reserva,
    clientes,
    onSuccess
}: ReservaFormDialogProps) => {
    const isEditing = !!reserva;
    const isReadOnly = reserva?.estado === 'CANCELADA' || reserva?.estado === 'FINALIZADA';
    const [habitaciones, setHabitaciones] = useState<HabitacionDTO[]>([]);
    const [openClientCombo, setOpenClientCombo] = useState(false);

    const form = useForm<ReservaFormValues>({
        resolver: zodResolver(reservaSchema) as any,
        defaultValues: {
            roomIds: [],
            fechaInicio: '',
            fechaFin: '',
            estado: 'PENDIENTE',
            activo: true,
            clienteId: 0
        }
    });

    // Reset Form on Open
    useEffect(() => {
        if (open) {
            // Load base list of rooms (all or just available will be filtered by date watcher)
            HabitacionService.getHabitacions({ size: 100 }).then(res => setHabitaciones(res.data));

            if (reserva) {
                // Edit Mode: Load Details
                ReservaDetalleService.getReservaDetalles({ 'reservaId.equals': reserva.id })
                    .then(res => {
                        const roomIds = res.data.map(d => d.habitacion?.id).filter(id => id !== undefined) as number[];
                        form.reset({
                            id: reserva.id,
                            clienteId: reserva.clienteId || reserva.cliente?.id || 0,
                            roomIds: roomIds,
                            fechaInicio: reserva.fechaInicio ? new Date(reserva.fechaInicio).toISOString().split('T')[0] : '',
                            fechaFin: reserva.fechaFin ? new Date(reserva.fechaFin).toISOString().split('T')[0] : '',
                            estado: reserva.estado || 'PENDIENTE',
                            activo: reserva.activo ?? true
                        });
                    })
                    .catch(() => toast.error('Error cargando detalles de reserva'));
            } else {
                // Create Mode
                form.reset({
                    roomIds: [],
                    fechaInicio: '',
                    fechaFin: '',
                    estado: 'PENDIENTE',
                    activo: true,
                    clienteId: 0
                });
            }
        }
    }, [open, reserva, form]);

    // --- DATE WATCHER FOR AVAILABILITY ---
    const watchedFechaInicio = form.watch('fechaInicio');
    const watchedFechaFin = form.watch('fechaFin');

    useEffect(() => {
        const fetchAvailability = async () => {
            if (!watchedFechaInicio || !watchedFechaFin) {
                // If invalid dates, show all (fallback)
                if (open && !isEditing) {
                    // If creating, maybe reset to empty or all? Defaulting to all for now so they see options
                    // But arguably we should clear availability if no date selected.
                }
                return;
            }

            const start = new Date(watchedFechaInicio);
            const end = new Date(watchedFechaFin);

            if (start >= end) return;

            try {
                const startStr = `${watchedFechaInicio}T00:00:00Z`;
                const endStr = `${watchedFechaFin}T00:00:00Z`;

                // If editing, we want to see ALL rooms (or at least the ones we already have selected + available ones)
                // The backend endpoint 'getAvailableHabitaciones' likely excludes currently booked ones *except* maybe effectively this reservation?
                // Actually, if editing, the current room IS booked by THIS reservation, so it won't show up in "Available" if the query is strict.
                // This is a common complexity.
                // Simple logic: If editing, show all rooms so we can uncheck/check. 
                // OR: fetch available excluding THIS reservation ID (if backend supports it).
                // Current backend probably doesn't support "exclude reservationId".
                // So for Edit, we might just show ALL rooms and let backend validation fail if double booked?
                // Or: merge available + currently selected.

                if (isEditing) {
                    const allRes = await HabitacionService.getHabitacions({ size: 100 });
                    setHabitaciones(allRes.data);
                } else {
                    const res = await HabitacionService.getAvailableHabitaciones(startStr, endStr, { size: 100 });
                    setHabitaciones(res.data);
                }
            } catch (error) {
                console.error("Error fetching available rooms", error);
            }
        };

        const timer = setTimeout(() => {
            fetchAvailability();
        }, 500);

        return () => clearTimeout(timer);

    }, [watchedFechaInicio, watchedFechaFin, open, isEditing]);

    const onSubmit = async (data: ReservaFormValues) => {
        if (isReadOnly) return;
        try {
            const [yearInicio, monthInicio, dayInicio] = data.fechaInicio.split('-').map(Number);
            const [yearFin, monthFin, dayFin] = data.fechaFin.split('-').map(Number);
            const fechaInicio = new Date(yearInicio, monthInicio - 1, dayInicio, 0, 0, 0);
            const fechaFin = new Date(yearFin, monthFin - 1, dayFin, 23, 59, 59);

            const reservaToSave = {
                id: data.id,
                fechaInicio: fechaInicio.toISOString(),
                fechaFin: fechaFin.toISOString(),
                estado: data.estado,
                activo: data.activo,
                cliente: { id: data.clienteId },
                fechaReserva: reserva?.fechaReserva || new Date().toISOString()
            };

            let savedReserva;

            if (isEditing && data.id) {
                const res = await ReservaService.updateReserva(data.id, reservaToSave as any);
                savedReserva = res.data;

                // Sync Rooms
                const currentStatus = await ReservaDetalleService.getReservaDetalles({ 'reservaId.equals': savedReserva.id });
                const currentDetails = currentStatus.data;
                const currentRoomIds = currentDetails.map(d => d.habitacion?.id);

                const toAdd = data.roomIds.filter(id => !currentRoomIds.includes(id));
                const toRemove = currentDetails.filter(d => d.habitacion?.id && !data.roomIds.includes(d.habitacion.id));

                for (const roomId of toAdd) {
                    const roomFn = habitaciones.find(h => h.id === roomId);
                    await ReservaDetalleService.createReservaDetalle({
                        reserva: { id: savedReserva.id },
                        habitacion: roomFn as any,
                        precioUnitario: roomFn?.categoriaHabitacion?.precioBase ? Number(roomFn.categoriaHabitacion.precioBase) : 0,
                        activo: true,
                        nota: 'Editado Admin'
                    });
                }
                for (const det of toRemove) {
                    if (det.id) await ReservaDetalleService.deleteReservaDetalle(det.id);
                }

                // Check for Cancellation notification
                if (data.estado === 'CANCELADA' && reserva?.estado !== 'CANCELADA') {
                    const client = clientes.find(c => c.id === data.clienteId);
                    if (client && client.keycloakId) {
                        try {
                            // Try to fetch custom message template
                            let msgText = `Estimado(a) ${client.nombre || 'Cliente'},\n\nLe informamos que su reserva #${savedReserva.id} ha sido CANCELADA por la administración.\nSi tiene dudas, por favor contáctenos.\n\nAtentamente,\nAdministración del Hotel.`;

                            try {
                                const configRes = await ConfiguracionSistemaService.getConfiguracionByClave('MSG_ADMIN_CANCEL');
                                if (configRes.data && configRes.data.valor) {
                                    msgText = configRes.data.valor
                                        .replace('{clienteNombre}', client.nombre || 'Cliente')
                                        .replace('{reservaId}', savedReserva.id?.toString() || '')
                                        .replace('{fechaInicio}', new Date(savedReserva.fechaInicio!).toLocaleDateString())
                                        .replace('{fechaFin}', new Date(savedReserva.fechaFin!).toLocaleDateString());
                                }
                            } catch (configError) {
                                // Use default message if config not found
                                console.log('Using default cancellation message');
                            }

                            await MensajeSoporteService.createMensaje({
                                userId: client.keycloakId,
                                mensaje: msgText,
                                remitente: Remitente.ADMINISTRATIVO,
                                leido: false,
                                activo: true,
                                fechaMensaje: new Date().toISOString()
                            } as any);
                            toast.info("Notificación de cancelación enviada al cliente.");
                        } catch (e) {
                            console.error("Error sending cancellation message", e);
                        }
                    }
                }

                toast.success('Reserva Actualizada');
                onSuccess(undefined);
            } else {
                // CREATE
                const res = await ReservaService.createReserva(reservaToSave as any);
                savedReserva = res.data;

                // Since we might have filtered habitaciones (available only), we might not find the room object if logic changes
                // But `habitaciones` state should have the available ones we selected from.
                for (const roomId of data.roomIds) {
                    const roomFn = habitaciones.find(h => h.id === roomId);
                    // Fallback fetch if not in list? Unlikely if UI worked.
                    let roomEntity = roomFn;
                    if (!roomEntity) {
                        const r = await HabitacionService.getHabitacion(roomId);
                        roomEntity = r.data;
                    }

                    await ReservaDetalleService.createReservaDetalle({
                        reserva: { id: savedReserva.id },
                        habitacion: roomEntity as any,
                        precioUnitario: roomEntity?.categoriaHabitacion?.precioBase ? Number(roomEntity.categoriaHabitacion.precioBase) : 0,
                        activo: true,
                        nota: 'Reserva Admin'
                    });
                }
                toast.success('Reserva Creada');
                // Return savedReserva so parent can prompt payment
                onSuccess(savedReserva);
            }
            onOpenChange(false);
        } catch (error) {
            console.error(error);
            toast.error('Error al guardar reserva');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-0 gap-0">
                <DialogHeader className="p-6 border-b">
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        {isEditing ? <Pencil className="h-5 w-5 text-green-600" /> : <Plus className="h-5 w-5 text-green-600" />}
                        {isEditing ? 'Editar Reserva' : 'Nueva Reserva'}
                        {isReadOnly && <span className="text-sm font-normal text-red-500 bg-red-50 border border-red-200 px-2 py-0.5 rounded ml-auto flex items-center"><AlertTriangle className="w-3 h-3 mr-1" /> Solo Lectura (Finalizada/Cancelada)</span>}
                    </DialogTitle>
                </DialogHeader>

                <div className="p-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            {/* --- CLIENT SELECTOR --- */}
                            <FormField
                                control={form.control}
                                name="clienteId"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            <User className="h-4 w-4" />
                                            Cliente
                                        </FormLabel>
                                        <Popover open={openClientCombo} onOpenChange={setOpenClientCombo}>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        aria-expanded={openClientCombo}
                                                        className={cn(
                                                            "w-full justify-between h-11 bg-white border-gray-300",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                        disabled={isReadOnly}
                                                    >
                                                        {field.value
                                                            ? (() => {
                                                                const c = clientes.find((cliente) => cliente.id === field.value);
                                                                return c ? `${c.nombre} ${c.apellido}` : "Seleccione cliente";
                                                            })()
                                                            : "Buscar cliente..."}
                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[550px] p-0">
                                                <Command>
                                                    <CommandInput placeholder="Buscar por nombre o DNI..." />
                                                    <CommandList>
                                                        <CommandEmpty>No se encontró cliente.</CommandEmpty>
                                                        <CommandGroup>
                                                            {clientes.map((cliente) => (
                                                                <CommandItem
                                                                    key={cliente.id}
                                                                    value={`${cliente.nombre} ${cliente.apellido} ${cliente.numeroIdentificacion || ''}`}
                                                                    onSelect={() => {
                                                                        form.setValue("clienteId", cliente.id!);
                                                                        setOpenClientCombo(false);
                                                                    }}
                                                                >
                                                                    <Check
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            cliente.id === field.value ? "opacity-100" : "opacity-0"
                                                                        )}
                                                                    />
                                                                    <div className="flex flex-col">
                                                                        <span className="font-medium">{cliente.nombre} {cliente.apellido}</span>
                                                                        {cliente.numeroIdentificacion && (
                                                                            <span className="text-xs text-gray-500">ID: {cliente.numeroIdentificacion}</span>
                                                                        )}
                                                                    </div>
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* --- DATES --- */}
                            <div className="bg-gray-50 p-4 rounded-lg border">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="fechaInicio"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-semibold text-gray-600 uppercase">Fecha Entrada</FormLabel>
                                                <FormControl>
                                                    <Input type="date" className="h-11" {...field} disabled={isReadOnly} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="fechaFin"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-semibold text-gray-600 uppercase">Fecha Salida</FormLabel>
                                                <FormControl>
                                                    <Input type="date" className="h-11" {...field} disabled={isReadOnly} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* --- ROOMS --- */}
                            <FormField
                                control={form.control}
                                name="roomIds"
                                render={() => (
                                    <FormItem>
                                        <div className="mb-3">
                                            <FormLabel className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                <Calendar className="h-4 w-4" />
                                                Habitaciones {isEditing ? '(Mostrando todas)' : '(Disponibles)'}
                                            </FormLabel>
                                            <FormDescription className="text-xs text-gray-500 mt-1">
                                                Seleccione una o más habitaciones para esta reserva.
                                            </FormDescription>
                                        </div>
                                        <div className="border rounded-lg p-4 max-h-64 overflow-y-auto bg-gray-50">
                                            <div className="grid grid-cols-2 gap-3">
                                                {habitaciones.map((hab) => (
                                                    <FormField
                                                        key={hab.id}
                                                        control={form.control}
                                                        name="roomIds"
                                                        render={({ field }) => {
                                                            const isChecked = field.value?.includes(hab.id!);
                                                            return (
                                                                <FormItem
                                                                    key={hab.id}
                                                                    className={cn(
                                                                        "flex flex-row items-start space-x-3 space-y-0 p-3 rounded-md border-2 transition-all cursor-pointer",
                                                                        isChecked
                                                                            ? "bg-white border-green-500 shadow-sm"
                                                                            : "bg-white border-gray-200 hover:border-gray-300",
                                                                        isReadOnly && "opacity-60 cursor-not-allowed"
                                                                    )}
                                                                >
                                                                    <FormControl>
                                                                        <Checkbox
                                                                            checked={isChecked}
                                                                            onCheckedChange={(checked) => {
                                                                                return checked
                                                                                    ? field.onChange([...field.value, hab.id])
                                                                                    : field.onChange(
                                                                                        field.value?.filter(
                                                                                            (value: number) => value !== hab.id
                                                                                        )
                                                                                    )
                                                                            }}
                                                                            className="mt-0.5"
                                                                            disabled={isReadOnly}
                                                                        />
                                                                    </FormControl>
                                                                    <div className="flex-1 space-y-1">
                                                                        <FormLabel className="font-semibold text-sm cursor-pointer text-gray-900">
                                                                            Habitación {hab.numero}
                                                                        </FormLabel>
                                                                        <div className="text-xs text-gray-600 space-y-0.5">
                                                                            <div>{hab.categoriaHabitacion?.nombre || 'Sin categoría'}</div>
                                                                            <div className="font-medium text-gray-900">
                                                                                ${hab.categoriaHabitacion?.precioBase || '0'}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </FormItem>
                                                            )
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* --- STATUS --- */}
                            <FormField
                                control={form.control}
                                name="estado"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-semibold text-gray-700">Estado de Reserva</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            value={field.value}
                                            disabled={isReadOnly}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="h-11">
                                                    <SelectValue placeholder="Seleccione estado" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="PENDIENTE">PENDIENTE</SelectItem>
                                                <SelectItem value="CONFIRMADA">CONFIRMADA</SelectItem>
                                                <SelectItem value="CANCELADA">CANCELADA</SelectItem>
                                                <SelectItem value="FINALIZADA">FINALIZADA</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* --- FOOTER BUTTONS --- */}
                            <div className="flex justify-end gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => onOpenChange(false)}
                                    className="h-11 px-6"
                                >
                                    {isReadOnly ? 'Cerrar' : 'Cancelar'}
                                </Button>
                                {!isReadOnly && (
                                    <Button
                                        type="submit"
                                        className="bg-slate-900 hover:bg-slate-800 text-white h-11 px-8"
                                    >
                                        {isEditing ? 'Guardar' : 'Crear y Pagar'}
                                    </Button>
                                )}
                            </div>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
};
