import { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { HabitacionService, CategoriaHabitacionService, EstadoHabitacionService } from '../../services';
import type { HabitacionDTO, CategoriaHabitacionDTO, EstadoHabitacionDTO } from '../../types/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export const AdminHabitaciones = () => {
    const [habitaciones, setHabitaciones] = useState<HabitacionDTO[]>([]);
    const [categorias, setCategorias] = useState<CategoriaHabitacionDTO[]>([]);
    const [estados, setEstados] = useState<EstadoHabitacionDTO[]>([]);

    const [loading, setLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Form State
    const [currentItem, setCurrentItem] = useState<Partial<HabitacionDTO>>({});
    const [isEditing, setIsEditing] = useState(false);

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
            if (isEditing && currentItem.id) {
                await HabitacionService.updateHabitacion(currentItem.id, currentItem as HabitacionDTO);
                toast.success('Habitación actualizada');
            } else {
                await HabitacionService.createHabitacion(currentItem as any);
                toast.success('Habitación creada');
            }
            setIsDialogOpen(false);
            loadData();
        } catch (error) {
            toast.error('Error al guardar habitación');
        }
    };

    const handleEdit = (item: HabitacionDTO) => {
        setCurrentItem(item);
        setIsEditing(true);
        setIsDialogOpen(true);
    };

    const handleCreate = () => {
        setCurrentItem({
            numero: '',
            capacidad: 1,
            estadoHabitacion: estados.find(e => e.nombre === 'DISPONIBLE')
        });
        setIsEditing(false);
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
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{isEditing ? 'Editar Habitación' : 'Nueva Habitación'}</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="numero" className="text-right">Número</Label>
                                    <Input id="numero" value={currentItem.numero || ''} onChange={e => setCurrentItem({ ...currentItem, numero: e.target.value })} className="col-span-3" required />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="capacidad" className="text-right">Capacidad</Label>
                                    <Input type="number" id="capacidad" value={currentItem.capacidad || 1} onChange={e => setCurrentItem({ ...currentItem, capacidad: Number(e.target.value) })} className="col-span-3" required />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="categoria" className="text-right">Categoría</Label>
                                    <Select
                                        value={currentItem.categoriaHabitacion?.id ? String(currentItem.categoriaHabitacion.id) : undefined}
                                        onValueChange={(val) => {
                                            const cat = categorias.find(c => String(c.id) === val);
                                            setCurrentItem({ ...currentItem, categoriaHabitacion: cat });
                                        }}
                                    >
                                        <SelectTrigger className="col-span-3">
                                            <SelectValue placeholder="Seleccionar categoría" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categorias.map(c => (
                                                <SelectItem key={c.id} value={String(c.id)}>{c.nombre} ({c.descripcion})</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="estado" className="text-right">Estado</Label>
                                    <Select
                                        value={currentItem.estadoHabitacion?.id ? String(currentItem.estadoHabitacion.id) : undefined}
                                        onValueChange={(val) => {
                                            const est = estados.find(e => String(e.id) === val);
                                            setCurrentItem({ ...currentItem, estadoHabitacion: est });
                                        }}
                                    >
                                        <SelectTrigger className="col-span-3">
                                            <SelectValue placeholder="Seleccionar estado" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {estados.map(e => (
                                                <SelectItem key={e.id} value={String(e.id)}>{e.nombre}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <DialogFooter>
                                    <Button type="submit">{isEditing ? 'Guardar Cambios' : 'Crear Habitación'}</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Número</TableHead>
                                <TableHead>Capacidad</TableHead>
                                <TableHead>Precio</TableHead>
                                <TableHead>Categoría</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={6} className="text-center">Cargando...</TableCell></TableRow>
                            ) : habitaciones.length === 0 ? (
                                <TableRow><TableCell colSpan={6} className="text-center">No hay habitaciones</TableCell></TableRow>
                            ) : (
                                habitaciones.map((h) => (
                                    <TableRow key={h.id}>
                                        <TableCell className="font-medium">{h.numero}</TableCell>
                                        <TableCell>{h.capacidad} pers.</TableCell>
                                        <TableCell>{h.categoriaHabitacion?.precioBase ? `$${h.categoriaHabitacion.precioBase}` : '-'}</TableCell>
                                        <TableCell>{h.categoriaHabitacion?.nombre || '-'}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${h.estadoHabitacion?.nombre === 'DISPONIBLE' ? 'bg-green-100 text-green-800' :
                                                h.estadoHabitacion?.nombre === 'OCUPADA' ? 'bg-red-100 text-red-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                {h.estadoHabitacion?.nombre || 'N/A'}
                                            </span>
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
