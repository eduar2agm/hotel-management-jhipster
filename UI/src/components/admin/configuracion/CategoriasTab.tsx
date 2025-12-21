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
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { CategoriaHabitacionService } from '../../../services/categoria-habitacion.service';
import { type CategoriaHabitacionDTO, type NewCategoriaHabitacionDTO, type CategoriaHabitacionNombreType } from '../../../types/api/CategoriaHabitacion';

export const CategoriasTab = () => {
    const [categorias, setCategorias] = useState<CategoriaHabitacionDTO[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentCat, setCurrentCat] = useState<Partial<CategoriaHabitacionDTO>>({});

    const itemsPerPage = 100; // Simplified for now, or pass props

    const loadCategorias = async () => {
        setIsLoading(true);
        try {
            const res = await CategoriaHabitacionService.getCategorias({
                page: 0,
                size: itemsPerPage,
                sort: 'id,asc'
            });
            setCategorias(res.data);
        } catch (error) {
            toast.error('Error al cargar categorías');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadCategorias();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (currentCat.id) {
                await CategoriaHabitacionService.updateCategoria(currentCat.id, currentCat as CategoriaHabitacionDTO);
                toast.success('Categoría actualizada');
            } else {
                await CategoriaHabitacionService.createCategoria({ ...currentCat, activo: true } as NewCategoriaHabitacionDTO);
                toast.success('Categoría creada');
            }
            setIsDialogOpen(false);
            loadCategorias();
        } catch (error) {
            toast.error('Error al guardar categoría');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Eliminar categoría?')) return;
        try {
            await CategoriaHabitacionService.deleteCategoria(id);
            toast.success('Categoría eliminada');
            loadCategorias();
        } catch (error) {
            toast.error('Error al eliminar (puede estar en uso)');
        }
    };

    return (
        <>
            <Card className="bg-white border-0 shadow-xl overflow-hidden rounded-2xl">
                <CardHeader className="border-b border-gray-100 bg-white p-6 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl font-bold text-gray-800">Categorías de Habitación</CardTitle>
                        <p className="text-gray-500 text-sm mt-1">Defina los tipos de habitaciones y sus precios base.</p>
                    </div>
                    <Button
                        onClick={() => { setCurrentCat({}); setIsDialogOpen(true); }}
                        className="bg-green-600 hover:bg-green-700 text-white shadow-md rounded-full px-6 transition-all hover:scale-105"
                    >
                        <Plus className="mr-2 h-5 w-5" /> Nueva Categoría
                    </Button>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-gray-50">
                            <TableRow>
                                <TableHead className="font-bold text-gray-600 py-5 pl-8">NOMBRE</TableHead>
                                <TableHead className="font-bold text-gray-600 py-5">DESCRIPCIÓN</TableHead>
                                <TableHead className="font-bold text-gray-600 py-5">PRECIO BASE</TableHead>
                                <TableHead className="font-bold text-gray-600 py-5 text-right pr-8">ACCIONES</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow><TableCell colSpan={4} className="h-32 text-center text-gray-500">Cargando datos...</TableCell></TableRow>
                            ) : categorias.length === 0 ? (
                                <TableRow><TableCell colSpan={4} className="h-32 text-center text-gray-500">No hay categorías registradas.</TableCell></TableRow>
                            ) : (
                                categorias.map(cat => (
                                    <TableRow key={cat.id} className="hover:bg-gray-50/80 transition-colors border-b border-gray-100">
                                        <TableCell className="py-5 pl-8">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-3 h-12 rounded-full shadow-sm ${cat.nombre === 'SUITE' ? 'bg-yellow-400' :
                                                    cat.nombre === 'DOBLE' ? 'bg-blue-400' : 'bg-gray-300'
                                                    }`}></div>
                                                <span className="font-bold text-gray-800 text-lg">{cat.nombre}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-5 text-gray-600 text-base">{cat.descripcion}</TableCell>
                                        <TableCell className="py-5">
                                            <span className="bg-green-100 text-green-700 py-1.5 px-4 rounded-full font-bold text-sm shadow-sm border border-green-200">
                                                ${cat.precioBase?.toLocaleString()}
                                            </span>
                                        </TableCell>
                                        <TableCell className="py-5 text-right pr-8">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-indigo-50 hover:text-indigo-600 rounded-full" onClick={() => { setCurrentCat(cat); setIsDialogOpen(true); }}>
                                                    <Pencil className="h-5 w-5" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-10 w-10 text-gray-400 hover:bg-red-50 hover:text-red-600 rounded-full" onClick={() => cat.id && handleDelete(cat.id)}>
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
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-gray-900">{currentCat.id ? 'Editar' : 'Crear'} Categoría</DialogTitle>
                        <DialogDescription>
                            Complete la información para configurar la categoría de habitación.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSave} className="grid gap-6 py-4">
                        <div className="grid gap-2">
                            <Label className="text-sm font-semibold text-gray-700">Tipo de Categoría</Label>
                            <Select
                                value={currentCat.nombre || ''}
                                onValueChange={(value) => setCurrentCat({ ...currentCat, nombre: value as CategoriaHabitacionNombreType })}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccione..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="SENCILLA">SENCILLA</SelectItem>
                                    <SelectItem value="DOBLE">DOBLE</SelectItem>
                                    <SelectItem value="SUITE">SUITE</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label className="text-sm font-semibold text-gray-700">Descripción</Label>
                            <Input
                                value={currentCat.descripcion || ''}
                                onChange={e => setCurrentCat({ ...currentCat, descripcion: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label className="text-sm font-semibold text-gray-700">Precio Base ($)</Label>
                            <Input
                                type="number"
                                step="0.01"
                                value={currentCat.precioBase?.toString() || ''}
                                onChange={e => setCurrentCat({ ...currentCat, precioBase: parseFloat(e.target.value) })}
                                className="font-mono"
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">Guardar Cambios</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
};
