import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { HabitacionService, CategoriaHabitacionService, EstadoHabitacionService } from '../../services';
import type { HabitacionDTO, CategoriaHabitacionDTO, EstadoHabitacionDTO } from '../../types/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Plus, Search, ChevronsUpDown, Check, Hotel, Image as ImageIcon, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Navbar } from '../../components/ui/Navbar';
import { Footer } from '../../components/ui/Footer';
import { RoomCard } from '@/components/ui/RoomCard';

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
            capacidad: 2,
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
            const payload: any = {
                ...data,
                categoriaHabitacion: { id: Number(data.categoriaHabitacionId) },
                estadoHabitacion: { id: Number(data.estadoHabitacionId) }
            };
            delete payload.categoriaHabitacionId;
            delete payload.estadoHabitacionId;

            if (isEditing && data.id) {
                await HabitacionService.updateHabitacion(data.id, payload as HabitacionDTO);
                toast.success('Habitación actualizada correctamente');
            } else {
                await HabitacionService.createHabitacion(payload as any);
                toast.success('Habitación creada exitosamente');
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
        const defaultState = estados.find(e => e.nombre === 'DISPONIBLE')?.id?.toString() || '';
        form.reset({
            numero: '',
            capacidad: 2,
            descripcion: '',
            imagen: '',
            activo: true,
            categoriaHabitacionId: '',
            estadoHabitacionId: defaultState
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

    const filteredHabitaciones = habitaciones.filter(h => {
        if (!searchFilter) return true;
        const searchLower = searchFilter.toLowerCase();
        return (
            h.numero?.toLowerCase().includes(searchLower) ||
            h.categoriaHabitacion?.nombre?.toLowerCase().includes(searchLower) ||
            h.estadoHabitacion?.nombre?.toLowerCase().includes(searchLower)
        );
    });

    return (
        <div className="font-sans text-gray-900 bg-gray-50 min-h-screen flex flex-col">
            <Navbar />

            {/* HERO SECTION */}
            <div className="bg-[#0F172A] pt-32 pb-20 px-4 md:px-8 lg:px-20 relative overflow-hidden shadow-xl">
                 <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 pointer-events-none">
                     <Hotel className="w-96 h-96 text-white" />
                 </div>
                 <div className="relative max-w-7xl mx-auto z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <span className="text-yellow-500 font-bold tracking-[0.2em] uppercase text-xs mb-2 block">Administración</span>
                        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-2">
                            Gestión de Habitaciones
                        </h1>
                        <p className="text-slate-400 text-lg max-w-2xl">
                            Configure y administre el inventario de habitaciones, categorías y estados.
                        </p>
                    </div>
                    <div>
                        <Button 
                            onClick={handleCreate}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white border-0 shadow-lg hover:shadow-yellow-600/20 transition-all rounded-sm px-6 py-6 text-sm uppercase tracking-widest font-bold"
                        >
                            <Plus className="mr-2 h-5 w-5" /> Nueva Habitación
                        </Button>
                    </div>
                 </div>
            </div>

            <main className="flex-grow py-5  px-4 md:px-8 lg:px-20 -mt-10 relative z-10">
                <Card className="max-w-7xl mx-auto border-t-4 border-yellow-600 shadow-xl bg-white">
                    <CardHeader className="border-b bg-gray-50/50 pb-6">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                             <div>
                                <CardTitle className="text-xl font-bold text-gray-800">Inventario de Habitaciones</CardTitle>
                                <CardDescription>Total de unidades: {habitaciones.length}</CardDescription>
                            </div>
                            <div className="relative w-full md:w-96 group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-yellow-600 transition-colors" />
                                <Input
                                    placeholder="Buscar por número, categoría..."
                                    value={searchFilter}
                                    onChange={(e) => setSearchFilter(e.target.value)}
                                    className="pl-10 border-gray-200 focus:border-yellow-600 focus:ring-yellow-600/20 h-11 transition-all"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 md:p-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {loading ? (
                                <div className="col-span-full h-32 flex flex-col items-center justify-center text-gray-500">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mb-2"></div>
                                    <span>Cargando inventario...</span>
                                </div>
                            ) : filteredHabitaciones.length === 0 ? (
                                <div className="col-span-full h-32 flex items-center justify-center text-gray-500 border-2 border-dashed rounded-lg">
                                    No se encontraron habitaciones
                                </div>
                            ) : (
                                filteredHabitaciones.map((h) => (
                                    <RoomCard 
                                        key={h.id} 
                                        habitacion={h} 
                                        onEdit={handleEdit} 
                                        onDelete={(id) => handleDelete(id)} 
                                    />
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="max-w-lg p-0 overflow-hidden border-0 shadow-2xl">
                        <DialogHeader className="bg-[#0F172A] text-white p-6">
                            <DialogTitle className="text-xl font-bold flex items-center gap-2">
                                {isEditing ? <Pencil className="h-5 w-5 text-yellow-500" /> : <Plus className="h-5 w-5 text-yellow-500" />}
                                {isEditing ? 'Editar Habitación' : 'Nueva Habitación'}
                            </DialogTitle>
                            <DialogDescription className="text-slate-400">
                                Detalles de configuración de la unidad.
                            </DialogDescription>
                        </DialogHeader>
                        
                        <div className="p-6 bg-white overflow-y-auto max-h-[80vh]">
                            <Form {...(form as any)}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control as any}
                                            name="numero"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-bold text-gray-500 uppercase tracking-widest">Número</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="101" className="h-9 font-mono" {...field} />
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
                                                    <FormLabel className="text-xs font-bold text-gray-500 uppercase tracking-widest">Capacidad</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" className="h-9" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control as any}
                                        name="categoriaHabitacionId"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel className="text-xs font-bold text-gray-500 uppercase tracking-widest">Categoría</FormLabel>
                                                <Popover open={openCategoryPopover} onOpenChange={setOpenCategoryPopover}>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button
                                                                variant="outline"
                                                                role="combobox"
                                                                className={cn(
                                                                    "w-full justify-between h-9",
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
                                                    <PopoverContent className="w-[300px] p-0" align="start">
                                                        <Command>
                                                            <CommandInput placeholder="Buscar categoría..." />
                                                            <CommandList>
                                                                <CommandEmpty>No encontrada.</CommandEmpty>
                                                                <CommandGroup>
                                                                    {categorias.map((c) => (
                                                                        <CommandItem
                                                                            key={c.id}
                                                                            value={`${c.nombre} ${c.descripcion}`}
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
                                                                            <div className="flex flex-col">
                                                                                <span className="font-medium">{c.nombre}</span>
                                                                                <span className="text-xs text-muted-foreground">${c.precioBase}</span>
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

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control as any}
                                            name="estadoHabitacionId"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-bold text-gray-500 uppercase tracking-widest">Estado</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="h-9">
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
                                        <FormField
                                            control={form.control as any}
                                            name="imagen"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-bold text-gray-500 uppercase tracking-widest">URL Imagen</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <ImageIcon className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                                                            <Input placeholder="https://..." className="pl-8 h-9" {...field} />
                                                        </div>
                                                    </FormControl>
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
                                                <FormLabel className="text-xs font-bold text-gray-500 uppercase tracking-widest">Descripción</FormLabel>
                                                <FormControl>
                                                    <Textarea 
                                                        placeholder="Características de la habitación..." 
                                                        className="resize-none h-20" 
                                                        {...field} 
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control as any}
                                        name="activo"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-3">
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-sm font-medium text-gray-700">Habilitada para reservas</FormLabel>
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

                                    <div className="pt-4 flex justify-end gap-3 border-t">
                                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="h-10">Cancelar</Button>
                                        <Button type="submit" className="bg-yellow-600 hover:bg-yellow-700 text-white h-10 px-6">
                                            {isEditing ? 'Guardar Cambios' : 'Crear Habitación'}
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </div>
                    </DialogContent>
                </Dialog>
            </main>
            <Footer />
        </div>
    );
};
