import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
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
import { Check, ChevronsUpDown, Edit, Plus, User, BedDouble } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PriceRangeFilter } from '@/components/common/PriceRangeFilter';
import { type ClienteDTO, type HabitacionDTO, type ReservaDTO } from '@/types/api';
import { HabitacionService } from '@/services/habitacion.service';
import { ReservaDetalleService } from '@/services/reserva-detalle.service';
import { toast } from 'sonner';

export const reservaSchema = z.object({
    id: z.number().optional(),
    clienteId: z.number().min(1, 'Cliente requerido'),
    roomIds: z.array(z.number()).min(1, 'Seleccione al menos una habitación'),
    fechaInicio: z.string().min(1, 'Fecha inicio requerida'),
    fechaFin: z.string().min(1, 'Fecha fin requerida'),
    estado: z.string(),
    activo: z.boolean()
}).refine(data => new Date(data.fechaInicio) < new Date(data.fechaFin), {
    message: "Fecha fin debe ser posterior a inicio",
    path: ["fechaFin"]
});

export type ReservaFormValues = z.infer<typeof reservaSchema>;

interface ReservaFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    isEditing: boolean;
    reservaToEdit?: ReservaDTO | null;
    clients: ClienteDTO[];
    onSave: (data: ReservaFormValues, availableRooms: HabitacionDTO[]) => Promise<void>;
}

export const ReservaFormDialog = ({
    open,
    onOpenChange,
    isEditing,
    reservaToEdit,
    clients,
    onSave
}: ReservaFormDialogProps) => {
    const [openClientCombo, setOpenClientCombo] = useState(false);
    const [habitaciones, setHabitaciones] = useState<HabitacionDTO[]>([]);
    const [currentRooms, setCurrentRooms] = useState<HabitacionDTO[]>([]);
    const [minPrecio, setMinPrecio] = useState('');
    const [maxPrecio, setMaxPrecio] = useState('');
    const [appliedMin, setAppliedMin] = useState('');
    const [appliedMax, setAppliedMax] = useState('');

    const form = useForm({
        resolver: zodResolver(reservaSchema),
        defaultValues: {
            roomIds: [],
            fechaInicio: '',
            fechaFin: '',
            estado: 'PENDIENTE',
            activo: true,
            clienteId: 0
        }
    });

    // Reset form when dialog opens/closes or reservaToEdit changes
    useEffect(() => {
        if (open) {
            if (isEditing && reservaToEdit) {
                // Fetch details for roomIds
                const fetchDetails = async () => {
                    try {
                        const detailsRes = await ReservaDetalleService.getReservaDetalles({ 'reservaId.equals': reservaToEdit.id });
                        const details = detailsRes.data;
                        const rooms = details.map(d => d.habitacion).filter((h): h is HabitacionDTO => !!h);
                        const roomIds = rooms.map(h => h.id!).filter(id => id !== undefined);

                        setCurrentRooms(rooms);

                        form.reset({
                            id: reservaToEdit.id,
                            clienteId: reservaToEdit.clienteId || 0,
                            roomIds: roomIds,
                            fechaInicio: reservaToEdit.fechaInicio ? new Date(reservaToEdit.fechaInicio).toISOString().split('T')[0] : '',
                            fechaFin: reservaToEdit.fechaFin ? new Date(reservaToEdit.fechaFin).toISOString().split('T')[0] : '',
                            estado: reservaToEdit.estado || 'PENDIENTE',
                            activo: reservaToEdit.activo ?? true
                        });

                        // Load active rooms generally, but we'll let availability checker handle the specific list
                        // For improved UX, show all active rooms initially combined with current rooms
                        const res = await HabitacionService.getHabitacions({ 'activo.equals': true, size: 100 });

                        // Merge current rooms if not in active list (e.g. if they are somehow inactive now but in reservation)
                        const allRooms = res.data;
                        rooms.forEach(r => {
                            if (!allRooms.find(ar => ar.id === r.id)) {
                                allRooms.push(r);
                            }
                        });

                        setHabitaciones(allRooms);
                    } catch (error) {
                        console.error("Error fetching details for edit", error);
                        toast.error('Error cargando detalles');
                    }
                };
                fetchDetails();
            } else {
                setCurrentRooms([]);
                form.reset({
                    roomIds: [],
                    fechaInicio: '',
                    fechaFin: '',
                    estado: 'PENDIENTE',
                    activo: true,
                    clienteId: 0
                });
                const fetchInitial = async () => {
                    try {
                        const res = await HabitacionService.getHabitacions({ 'activo.equals': true, size: 100 });
                        setHabitaciones(res.data);
                    } catch (e) {
                        console.error("Error fetching initial rooms", e);
                    }
                }
                fetchInitial();
            }
        }
    }, [open, isEditing, reservaToEdit, form]);

    // --- DATE WATCHER FOR AVAILABILITY ---
    const watchedFechaInicio = form.watch('fechaInicio');
    const watchedFechaFin = form.watch('fechaFin');

    useEffect(() => {
        const fetchAvailability = async () => {
            if (!open) return;

            if (!watchedFechaInicio || !watchedFechaFin) {
                return;
            }

            const start = new Date(watchedFechaInicio);
            const end = new Date(watchedFechaFin);

            if (start >= end) return;

            try {
                const startStr = `${watchedFechaInicio}T00:00:00Z`;
                const endStr = `${watchedFechaFin}T00:00:00Z`;

                const res = await HabitacionService.getAvailableHabitaciones(startStr, endStr, { size: 100 });
                const available = res.data;

                // Restore current rooms if we are in editing mode
                if (isEditing && currentRooms.length > 0) {
                    currentRooms.forEach(cr => {
                        if (!available.find(a => a.id === cr.id)) {
                            // Only add if it makes sense? 
                            // For now, always add them so the user sees what they have.
                            // If they uncheck it and save, they lose it.
                            available.push(cr);
                        }
                    });
                }

                setHabitaciones(available);
            } catch (error) {
                console.error("Error fetching available rooms", error);
            }
        };

        const timer = setTimeout(() => {
            fetchAvailability();
        }, 500);

        return () => clearTimeout(timer);

    }, [watchedFechaInicio, watchedFechaFin, open, isEditing, currentRooms]);

    const handleSubmit = async (data: ReservaFormValues) => {
        await onSave(data, habitaciones);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl font-bold text-slate-900 border-b pb-4 mb-4">
                        {isEditing ? <Edit className="w-5 h-5 text-yellow-600" /> : <Plus className="w-5 h-5 text-green-600" />}
                        {isEditing ? 'Editar Reserva' : 'Nueva Reserva'}
                    </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">

                        {/* --- CLIENT SELECTOR (COMBOBOX) --- */}
                        <FormField
                            control={form.control}
                            name="clienteId"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel className="flex items-center gap-2 font-bold text-gray-700">
                                        <User className="w-4 h-4" /> Cliente
                                    </FormLabel>
                                    <Popover open={openClientCombo} onOpenChange={setOpenClientCombo}>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    aria-expanded={openClientCombo}
                                                    className={cn(
                                                        "w-full justify-between bg-gray-50 border-gray-200 h-10",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value
                                                        ? (() => {
                                                            const c = clients.find((cliente) => cliente.id === field.value);
                                                            return c ? `${c.nombre} ${c.apellido}` : "Seleccione cliente";
                                                        })()
                                                        : "Buscar cliente..."}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[400px] p-0">
                                            <Command>
                                                <CommandInput placeholder="Buscar por nombre o DNI..." />
                                                <CommandList>
                                                    <CommandEmpty>No se encontró cliente.</CommandEmpty>
                                                    <CommandGroup>
                                                        {clients.map((cliente) => (
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
                        <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                            <FormField
                                control={form.control}
                                name="fechaInicio"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold uppercase tracking-wide text-gray-500">Fecha Entrada</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} className="bg-white" />
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
                                        <FormLabel className="text-xs font-bold uppercase tracking-wide text-gray-500">Fecha Salida</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} className="bg-white" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* --- ROOMS --- */}
                        <FormField
                            control={form.control}
                            name="roomIds"
                            render={() => (
                                <FormItem>
                                    <div className="mb-3">
                                        <FormLabel className="font-bold text-gray-700 flex items-center gap-2">
                                            <BedDouble className="w-4 h-4" /> Habitaciones (Disponibles)
                                        </FormLabel>
                                        <FormDescription className="text-xs">
                                            Seleccione una o más habitaciones para esta reserva.
                                        </FormDescription>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center block mb-4">Rango de Precio</label>
                                        <PriceRangeFilter
                                            minPrice={minPrecio}
                                            maxPrice={maxPrecio}
                                            onMinChange={setMinPrecio}
                                            onMaxChange={setMaxPrecio}
                                            variant="horizontal"
                                            onSearch={() => {
                                                setAppliedMin(minPrecio);
                                                setAppliedMax(maxPrecio);
                                            }}
                                            className="!p-0 shadow-none border-0 bg-transparent"
                                        />
                                    </div>
                                    <div className="border border-gray-200 rounded-lg p-3 max-h-48 overflow-y-auto bg-gray-50">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                                            {habitaciones
                                                .filter(hab => {
                                                    const price = hab.categoriaHabitacion?.precioBase || 0;
                                                    const matchesMin = !appliedMin || price >= Number(appliedMin);
                                                    const matchesMax = !appliedMax || price <= Number(appliedMax);
                                                    return matchesMin && matchesMax;
                                                })
                                                .map((hab) => (
                                                    <FormField
                                                        key={hab.id}
                                                        control={form.control}
                                                        name="roomIds"
                                                        render={({ field }) => {
                                                            const isChecked = field.value?.includes(hab.id!);
                                                            return (
                                                                <FormItem
                                                                    className={`flex flex-row items-start space-x-3 space-y-0 p-3 rounded hover:bg-white transition-colors cursor-pointer ${isChecked ? 'bg-white shadow-sm border border-yellow-200' : ''}`}
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
                                                                            className="mt-0.5 data-[state=checked]:bg-yellow-600 data-[state=checked]:border-yellow-600"
                                                                        />
                                                                    </FormControl>
                                                                    <div className="space-y-1 leading-none">
                                                                        <FormLabel className="font-bold text-sm cursor-pointer text-gray-800">
                                                                            Habitación {hab.numero}
                                                                        </FormLabel>
                                                                        <FormDescription className="text-xs">
                                                                            {hab.categoriaHabitacion?.nombre} • {hab.categoriaHabitacion?.precioBase ? `$${hab.categoriaHabitacion.precioBase}` : 'N/A'}
                                                                        </FormDescription>
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
                                    <FormLabel className="font-bold text-gray-700">Estado de Reserva</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
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

                        <DialogFooter className="pt-4 border-t gap-2">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-11 border-gray-300">
                                Cancelar
                            </Button>
                            <Button type="submit" className="h-11 bg-slate-900 hover:bg-slate-800 text-white min-w-[120px]">
                                {isEditing ? 'Guardar' : 'Pagar'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
