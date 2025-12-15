import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { 
    Plus, 
    Pencil, 
    Trash2, 
    BedDouble, 
    Hotel, 
    DollarSign, 
    Loader2, 
    CheckCircle, 
    XCircle,
    Search,
    Wrench
} from 'lucide-react';

// --- UI COMPONENTS ---
import { Navbar } from '../../components/ui/Navbar';
import { Footer } from '../../components/ui/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

// --- SERVICES & TYPES ---
import { HabitacionService, CategoriaHabitacionService, EstadoHabitacionService } from '../../services';
import type { HabitacionDTO, CategoriaHabitacionDTO, EstadoHabitacionDTO } from '../../types/api';

export const AdminHabitaciones = () => {
    // --- ESTADOS ---
    const [habitaciones, setHabitaciones] = useState<HabitacionDTO[]>([]);
    const [categorias, setCategorias] = useState<CategoriaHabitacionDTO[]>([]);
    const [estados, setEstados] = useState<EstadoHabitacionDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<Partial<HabitacionDTO>>({});
    const [isEditing, setIsEditing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // --- CARGA DE DATOS ---
    const loadData = async () => {
        setLoading(true);
        try {
            const [habsRes, catsRes, estRes] = await Promise.all([
                HabitacionService.getHabitacions({ page: 0, size: 100, sort: 'id,asc' }),
                CategoriaHabitacionService.getCategorias({ size: 100 }),
                EstadoHabitacionService.getEstados({ size: 100 })
            ]);
            // Ordenar por número de habitación para facilitar lectura
            const sortedHabs = habsRes.data.sort((a, b) => 
                (a.numero || '').localeCompare(b.numero || '', undefined, { numeric: true })
            );
            setHabitaciones(sortedHabs);
            setCategorias(catsRes.data);
            setEstados(estRes.data);
        } catch (error) {
            toast.error('Error al cargar inventario de habitaciones');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // --- MANEJADORES ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isEditing && currentItem.id) {
                await HabitacionService.updateHabitacion(currentItem.id, currentItem as HabitacionDTO);
                toast.success('Habitación actualizada correctamente');
            } else {
                await HabitacionService.createHabitacion(currentItem as any);
                toast.success('Nueva habitación agregada al inventario');
            }
            setIsDialogOpen(false);
            loadData();
        } catch (error) {
            toast.error('Error al guardar los cambios');
        }
    };

    const handleEdit = (item: HabitacionDTO) => {
        setCurrentItem(item);
        setIsEditing(true);
        setIsDialogOpen(true);
    };

    const handleCreate = () => {
        // Buscar estado "DISPONIBLE" por defecto si existe
        const defaultState = estados.find(e => e.nombre?.toUpperCase() === 'DISPONIBLE') || estados[0];
        setCurrentItem({
            numero: '',
            capacidad: 2,
            estadoHabitacion: defaultState
        });
        setIsEditing(false);
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Confirma que desea eliminar esta habitación? Esto puede afectar el historial.')) return;
        try {
            await HabitacionService.deleteHabitacion(id);
            toast.success('Habitación eliminada');
            loadData();
        } catch (error) {
            toast.error('No se puede eliminar (posiblemente tiene reservas asociadas)');
        }
    };

    // --- FILTRADO ---
    const filteredHabs = habitaciones.filter(h => 
        h.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.categoriaHabitacion?.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // --- HELPERS VISUALES ---
    const getStatusConfig = (statusName?: string) => {
        const status = statusName?.toUpperCase() || '';
        if (status === 'DISPONIBLE') return { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle };
        if (status === 'OCUPADA') return { color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle };
        if (status === 'MANTENIMIENTO' || status === 'SUCIA') return { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Wrench };
        return { color: 'bg-slate-100 text-slate-700 border-slate-200', icon: Hotel };
    };

    // --- RENDER ---
    return (
        <div className="bg-gray-50 min-h-screen font-sans">
            <Navbar />

            {/* --- HERO SECTION --- */}
            <div className="bg-slate-900 pt-32 pb-24 px-6 relative">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end gap-6 relative z-10">
                    <div>
                        <div className="flex items-center gap-2 mb-2 text-slate-400">
                            <Hotel size={16} />
                            <span className="text-xs font-regular uppercase tracking-widest">Inventario</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-wider">
                            Habitaciones
                        </h1>
                        <p className="text-slate-400 mt-2 max-w-xl">
                            Configuración de unidades, categorías, precios base y disponibilidad.
                        </p>
                    </div>
                    
                    <Button 
                        onClick={handleCreate} 
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-regular uppercase tracking-widest px-6 py-6 shadow-lg shadow-emerald-900/20"
                    >
                        <Plus className="mr-2 h-5 w-5" /> Nueva Habitación
                    </Button>
                </div>
            </div>

            {/* --- BARRA DE CONTROL --- */}
            <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-20">
                <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-3.5 text-gray-400 h-5 w-5" />
                        <Input
                            placeholder="Buscar por número o categoría..."
                            className="pl-10 py-6 text-base border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20 bg-gray-50"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-4 text-sm px-4">
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                            <span className="text-gray-600">Disponibles: <strong>{habitaciones.filter(h => h.estadoHabitacion?.nombre === 'DISPONIBLE').length}</strong></span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-red-500"></span>
                            <span className="text-gray-600">Ocupadas: <strong>{habitaciones.filter(h => h.estadoHabitacion?.nombre === 'OCUPADA').length}</strong></span>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- TABLA --- */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                <Card className="border-none shadow-sm bg-white overflow-hidden rounded-xl">
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-gray-50">
                                <TableRow>
                                    <TableHead className="w-[100px] font-regular text-gray-500 uppercase tracking-wider text-xs py-5 pl-6">Número</TableHead>
                                    <TableHead className="font-regular text-gray-500 uppercase tracking-wider text-xs">Categoría</TableHead>
                                    <TableHead className="font-regular text-gray-500 uppercase tracking-wider text-xs">Capacidad</TableHead>
                                    <TableHead className="font-regular text-gray-500 uppercase tracking-wider text-xs">Precio Base</TableHead>
                                    <TableHead className="font-regular text-gray-500 uppercase tracking-wider text-xs">Estado Actual</TableHead>
                                    <TableHead className="text-right font-regular text-gray-500 uppercase tracking-wider text-xs pr-6">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-64 text-center">
                                            <div className="flex flex-col items-center justify-center text-gray-400 gap-3">
                                                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                                                <p>Cargando inventario...</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredHabs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-64 text-center text-gray-400">
                                            No se encontraron habitaciones.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredHabs.map((h) => {
                                        const statusConfig = getStatusConfig(h.estadoHabitacion?.nombre);
                                        const StatusIcon = statusConfig.icon;

                                        return (
                                            <TableRow key={h.id} className="hover:bg-slate-50 transition-colors group">
                                                
                                                {/* Número */}
                                                <TableCell className="pl-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-slate-100 rounded text-slate-600">
                                                            <BedDouble className="h-4 w-4" />
                                                        </div>
                                                        <span className="font-medium text-gray-900 text-lg">{h.numero}</span>
                                                    </div>
                                                </TableCell>

                                                {/* Categoría */}
                                                <TableCell>
                                                    <span className="font-medium text-gray-700">{h.categoriaHabitacion?.nombre || 'Estándar'}</span>
                                                    <p className="text-xs text-gray-400 truncate max-w-[150px]">{h.categoriaHabitacion?.descripcion}</p>
                                                </TableCell>

                                                {/* Capacidad */}
                                                <TableCell>
                                                    <span className="text-sm text-gray-600">{h.capacidad} Huéspedes</span>
                                                </TableCell>

                                                {/* Precio */}
                                                <TableCell>
                                                    <div className="flex items-center gap-1 font-regular text-gray-900">
                                                        <DollarSign className="h-3 w-3 text-emerald-600" />
                                                        {h.categoriaHabitacion?.precioBase || '0.00'}
                                                    </div>
                                                </TableCell>

                                                {/* Estado */}
                                                <TableCell>
                                                    <Badge variant="outline" className={`${statusConfig.color} flex w-fit items-center gap-1.5 px-2.5 py-1 uppercase text-[10px] tracking-widest`}>
                                                        <StatusIcon size={12} />
                                                        {h.estadoHabitacion?.nombre || 'DESCONOCIDO'}
                                                    </Badge>
                                                </TableCell>

                                                {/* Acciones */}
                                                <TableCell className="text-right pr-6">
                                                    <div className="flex justify-end gap-1">
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            onClick={() => handleEdit(h)}
                                                            className="hover:bg-blue-50 hover:text-blue-600"
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            className="text-gray-400 hover:text-red-600 hover:bg-red-50" 
                                                            onClick={() => h.id && handleDelete(h.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {/* --- MODAL (DIALOG) --- */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[500px] bg-white p-0 overflow-hidden gap-0 rounded-xl">
                    <DialogHeader className="bg-gray-50 p-6 border-b border-gray-100">
                        <DialogTitle className="flex items-center gap-2 text-xl font-regular text-gray-900">
                            {isEditing ? <Pencil className="h-5 w-5 text-emerald-600"/> : <Plus className="h-5 w-5 text-emerald-600"/>}
                            {isEditing ? 'Editar Detalles' : 'Nueva Habitación'}
                        </DialogTitle>
                    </DialogHeader>
                    
                    <form onSubmit={handleSubmit} className="p-6 grid gap-6">
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="numero" className="text-xs font-regular uppercase text-gray-500">Número</Label>
                                <Input 
                                    id="numero" 
                                    value={currentItem.numero || ''} 
                                    onChange={e => setCurrentItem({ ...currentItem, numero: e.target.value })} 
                                    required 
                                    className="bg-gray-50 border-gray-200 py-5 font-regular"
                                    placeholder="Ej: 101"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="capacidad" className="text-xs font-regular uppercase text-gray-500">Capacidad</Label>
                                <Input 
                                    type="number" 
                                    id="capacidad" 
                                    value={currentItem.capacidad || 1} 
                                    onChange={e => setCurrentItem({ ...currentItem, capacidad: Number(e.target.value) })} 
                                    required 
                                    className="bg-gray-50 border-gray-200 py-5"
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="categoria" className="text-xs font-regular uppercase text-gray-500">Categoría</Label>
                            <Select
                                value={currentItem.categoriaHabitacion?.id ? String(currentItem.categoriaHabitacion.id) : undefined}
                                onValueChange={(val) => {
                                    const cat = categorias.find(c => String(c.id) === val);
                                    setCurrentItem({ ...currentItem, categoriaHabitacion: cat });
                                }}
                            >
                                <SelectTrigger className="bg-gray-50 border-gray-200 py-5">
                                    <SelectValue placeholder="Seleccione categoría" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categorias.map(c => (
                                        <SelectItem key={c.id} value={String(c.id)}>
                                            {c.nombre} <span className="text-gray-400 text-xs ml-2">(${c.precioBase})</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="estado" className="text-xs font-regular uppercase text-gray-500">Estado Inicial</Label>
                            <Select
                                value={currentItem.estadoHabitacion?.id ? String(currentItem.estadoHabitacion.id) : undefined}
                                onValueChange={(val) => {
                                    const est = estados.find(e => String(e.id) === val);
                                    setCurrentItem({ ...currentItem, estadoHabitacion: est });
                                }}
                            >
                                <SelectTrigger className="bg-gray-50 border-gray-200 py-5">
                                    <SelectValue placeholder="Seleccione estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    {estados.map(e => (
                                        <SelectItem key={e.id} value={String(e.id)}>{e.nombre}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <DialogFooter className="pt-4 border-t border-gray-100">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="py-5">
                                Cancelar
                            </Button>
                            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 py-5 px-8 font-regular uppercase tracking-wider text-xs">
                                {isEditing ? 'Guardar Cambios' : 'Crear Habitación'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Footer />
        </div>
    );
};