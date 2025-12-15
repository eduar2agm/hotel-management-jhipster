
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { DashboardLayout } from '../../components/DashboardLayout';
import { HabitacionService, CategoriaHabitacionService, EstadoHabitacionService } from '../../services';
import type { HabitacionDTO, CategoriaHabitacionDTO, EstadoHabitacionDTO } from '../../types/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Plus, Pencil, Trash2, Search, Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

const habitacionSchema = z.object({
    id: z.number().optional(),
    numero: z.string().min(1, 'Número es requerido'),
    capacidad: z.coerce.number().min(1, 'Capacidad mínima es 1').max(20, 'Capacidad máxima es 20'),
    descripcion: z.string().optional().or(z.literal('')),
    imagen: z.string().optional().or(z.literal('')),
    activo: z.boolean().default(true),
    categoriaHabitacionId: z.string().min(1, 'Categoría es requerida'),
    estadoHabitacionId: z.string().min(1, 'Estado es requerido'),
});

type HabitacionFormValues = z.infer<typeof habitacionSchema>;

export const AdminHabitaciones = () => {
    const [habitaciones, setHabitaciones] = useState<HabitacionDTO[]>([]);
    const [categorias, setCategorias] = useState<CategoriaHabitacionDTO[]>([]);
    const [estados, setEstados] = useState<EstadoHabitacionDTO[]>([]);
    const [loading, setLoading] = useState(false);

    // Dialog & Form State
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [openCategoryPopover, setOpenCategoryPopover] = useState(false);
    const [searchFilter, setSearchFilter] = useState('');

    const form = useForm<HabitacionFormValues>({
        resolver: zodResolver(habitacionSchema) as any,
        defaultValues: {
            numero: '',
            capacidad: 1,
            descripcion: '',
            imagen: '',
            activo: true,
            categoriaHabitacionId: '',
            estadoHabitacionId: ''
        }
    });

    const loadData = async () => {
        setLoading(true);
        try {
            const [habsRes, catsRes, estRes] = await Promise.all([
                HabitacionService.getHabitacions({ page: 0, size: 50, sort: 'id,asc' }),
                CategoriaHabitacionService.getCategorias({ size: 100 }),
                EstadoHabitacionService.getEstados({ size: 100 })
            ]);
            setHabitaciones(habsRes.data);
            setCategorias(catsRes.data);
            setEstados(estRes.data);
        } catch (error) {
            toast.error('Error al cargar datos');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    // Reset form when dialog opens/closes or mode changes
    useEffect(() => {
        if (!isDialogOpen) {
            form.reset();
        }
    }, [isDialogOpen, form]);

    const onSubmit = async (data: HabitacionFormValues) => {
        try {
            // Transform Form Data to DTO
            const payload: any = {
                ...data,
                categoriaHabitacion: { id: Number(data.categoriaHabitacionId) },
                estadoHabitacion: { id: Number(data.estadoHabitacionId) }
            };
            // Remove helper IDs if backend doesn't accept them directly, or keep them if it does.
            // JHipster usually ignores unknown fields but good to be clean.
            delete payload.categoriaHabitacionId;
            delete payload.estadoHabitacionId;

            if (isEditing && data.id) {
                await HabitacionService.updateHabitacion(data.id, payload as HabitacionDTO);
                toast.success('Habitación actualizada');
            } else {
                await HabitacionService.createHabitacion(payload as any);
                toast.success('Habitación creada');
            }
            setIsDialogOpen(false);
            loadData();
        } catch (error) {
            toast.error('Error al guardar habitación');
            console.error(error);
        }
    };

    const handleEdit = (item: HabitacionDTO) => {
        setIsEditing(true);
        form.reset({
            id: item.id,
            numero: item.numero,
            capacidad: item.capacidad,
            descripcion: item.descripcion || '',
            imagen: item.imagen || '',
            activo: item.activo,
            categoriaHabitacionId: item.categoriaHabitacion?.id?.toString() || '',
            estadoHabitacionId: item.estadoHabitacion?.id?.toString() || ''
        });
        setIsDialogOpen(true);
    };

    const handleCreate = () => {
        setIsEditing(false);
        form.reset({
            numero: '',
            capacidad: 2,
            descripcion: '',
            imagen: '',
            activo: true,
            // Set default or empty? Empty forces selection.
            categoriaHabitacionId: '',
            estadoHabitacionId: estados.find(e => e.nombre === 'DISPONIBLE')?.id?.toString() || ''
        });
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Estás seguro de eliminar esta habitación?')) return;
        try {
            await HabitacionService.deleteHabitacion(id);
            toast.success('Habitación eliminada');
            loadData();
        } catch (error) {
            toast.error('Error al eliminar');
        }
    };

    // Filter habitaciones based on search
    const filteredHabitaciones = habitaciones.filter(h => {
        if (!searchFilter) return true;
        const searchLower = searchFilter.toLowerCase();
        return (
            h.numero?.toLowerCase().includes(searchLower) ||
            h.categoriaHabitacion?.nombre?.toLowerCase().includes(searchLower) ||
            h.categoriaHabitacion?.descripcion?.toLowerCase().includes(searchLower) ||
            h.estadoHabitacion?.nombre?.toLowerCase().includes(searchLower) ||
            h.descripcion?.toLowerCase().includes(searchLower)
        );
    });

    return (
        <DashboardLayout title="Gestión de Habitaciones" role="Administrador">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Listado de Habitaciones</CardTitle>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={handleCreate}>
                                <Plus className="mr-2 h-4 w-4" /> Nueva Habitación
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>{isEditing ? 'Editar Habitación' : 'Nueva Habitación'}</DialogTitle>
                            </DialogHeader>
                            <Form {...(form as any)}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control as any}
                                            name="numero"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Número</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="101" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control as any}
                                            name="capacidad"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Capacidad</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control as any}
                                            name="categoriaHabitacionId"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-col">
                                                    <FormLabel>Categoría</FormLabel>
                                                    <Popover open={openCategoryPopover} onOpenChange={setOpenCategoryPopover}>
                                                        <PopoverTrigger asChild>
                                                            <FormControl>
                                                                <Button
                                                                    variant="outline"
                                                                    role="combobox"
                                                                    className={cn(
                                                                        "w-full justify-between",
                                                                        !field.value && "text-muted-foreground"
                                                                    )}
                                                                >
                                                                    {field.value
                                                                        ? (() => {
                                                                            const selected = categorias.find(c => String(c.id) === field.value);
                                                                            return selected
                                                                                ? `${selected.nombre} - $${selected.precioBase}`
                                                                                : "Seleccione categoría...";
                                                                        })()
                                                                        : "Seleccione categoría..."}
                                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                                </Button>
                                                            </FormControl>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-[400px] p-0">
                                                            <Command>
                                                                <CommandInput placeholder="Buscar por nombre, descripción o precio..." />
                                                                <CommandList>
                                                                    <CommandEmpty>No se encontró ninguna categoría.</CommandEmpty>
                                                                    <CommandGroup>
                                                                        {categorias.map((c) => (
                                                                            <CommandItem
                                                                                key={c.id}
                                                                                value={`${c.nombre} ${c.descripcion} ${c.precioBase}`}
                                                                                onSelect={() => {
                                                                                    field.onChange(String(c.id));
                                                                                    setOpenCategoryPopover(false);
                                                                                }}
                                                                            >
                                                                                <Check
                                                                                    className={cn(
                                                                                        "mr-2 h-4 w-4",
                                                                                        String(c.id) === field.value
                                                                                            ? "opacity-100"
                                                                                            : "opacity-0"
                                                                                    )}
                                                                                />
                                                                                <div className="flex flex-col flex-1">
                                                                                    <div className="flex items-center justify-between">
                                                                                        <span className="font-semibold">{c.nombre}</span>
                                                                                        <span className="text-sm font-bold text-primary">${c.precioBase}</span>
                                                                                    </div>
                                                                                    {c.descripcion && (
                                                                                        <span className="text-xs text-muted-foreground">{c.descripcion}</span>
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
                                        <FormField
                                            control={form.control as any}
                                            name="estadoHabitacionId"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Estado</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Seleccione..." />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {estados.map(e => (
                                                                <SelectItem key={e.id} value={String(e.id)}>
                                                                    {e.nombre}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control as any}
                                        name="descripcion"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Descripción</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="Detalles de la habitación..." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control as any}
                                        name="imagen"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>URL Imagen</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="https://..." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control as any}
                                        name="activo"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-base">Habilitada</FormLabel>
                                                    <FormDescription>
                                                        Indica si la habitación está en servicio.
                                                    </FormDescription>
                                                </div>
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />

                                    <DialogFooter>
                                        <Button type="submit">{isEditing ? 'Guardar Cambios' : 'Crear'}</Button>
                                    </DialogFooter>
                                </form>
                            </Form>
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent>
                    {/* Search Bar */}
                    <div className="flex items-center gap-2 mb-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por número, categoría, estado o descripción..."
                                value={searchFilter}
                                onChange={(e) => setSearchFilter(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                        {searchFilter && (
                            <Button
                                variant="ghost"
                                onClick={() => setSearchFilter('')}
                                size="sm"
                            >
                                Limpiar
                            </Button>
                        )}
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Info</TableHead>
                                <TableHead>Categoría</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={5} className="text-center">Cargando...</TableCell></TableRow>
                            ) : filteredHabitaciones.length === 0 ? (
                                <TableRow><TableCell colSpan={5} className="text-center">
                                    {searchFilter ? 'No se encontraron resultados' : 'No hay habitaciones'}
                                </TableCell></TableRow>
                            ) : (
                                filteredHabitaciones.map((h) => (
                                    <TableRow key={h.id}>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-bold">#{h.numero}</span>
                                                <span className="text-xs text-muted-foreground">Cap: {h.capacidad} | {h.descripcion?.substring(0, 30)}...</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{h.categoriaHabitacion?.nombre}</TableCell>
                                        <TableCell>
                                            <Badge variant={h.estadoHabitacion?.nombre === 'DISPONIBLE' ? 'outline' : 'destructive'}>
                                                {h.estadoHabitacion?.nombre}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={h.activo ? 'default' : 'secondary'}>{h.activo ? 'Activa' : 'Inactiva'}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(h)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => h.id && handleDelete(h.id)}>
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
