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
import { CarouselItemService } from '../../../services/carousel-item.service';
import { ImagenService } from '../../../services/imagen.service';
import { type CarouselItemDTO, type NewCarouselItemDTO } from '../../../types/api/CarouselItem';
import { type ImagenDTO } from '../../../types/api/Imagen';
import { getImageUrl } from '../../../utils/imageUtils';

export const CarouselTab = () => {
    const [carouselItems, setCarouselItems] = useState<CarouselItemDTO[]>([]);
    const [imagenes, setImagenes] = useState<ImagenDTO[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<Partial<CarouselItemDTO>>({});

    const itemsPerPage = 100;

    const loadCarousel = async () => {
        setIsLoading(true);
        try {
            const res = await CarouselItemService.getCarouselItems({
                page: 0,
                size: itemsPerPage,
                sort: 'orden,asc'
            });
            setCarouselItems(res.data);

            // Also load images for dropdown
            const imgRes = await ImagenService.getImagens({ size: 1000 });
            setImagenes(imgRes.data);

        } catch (error) {
            toast.error('Error al cargar datos del carrusel');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadCarousel();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (currentItem.id) {
                await CarouselItemService.updateCarouselItem(currentItem.id, currentItem as CarouselItemDTO);
                toast.success('Item actualizado');
            } else {
                await CarouselItemService.createCarouselItem({ ...currentItem, activo: true } as NewCarouselItemDTO);
                toast.success('Item creado');
            }
            setIsDialogOpen(false);
            loadCarousel();
        } catch (error) {
            toast.error('Error al guardar item');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Eliminar item del carrusel?')) return;
        try {
            await CarouselItemService.deleteCarouselItem(id);
            toast.success('Item eliminado');
            loadCarousel();
        } catch (error) {
            toast.error('Error al eliminar');
        }
    };

    return (
        <>
            <Card className="bg-white border-0 shadow-xl overflow-hidden rounded-2xl">
                <CardHeader className="border-b border-gray-100 bg-white p-6 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl font-bold text-gray-800">Items del Carrusel</CardTitle>
                        <p className="text-gray-500 text-sm mt-1">Gestione las imágenes y textos del carrusel de inicio.</p>
                    </div>
                    <Button
                        onClick={() => { setCurrentItem({}); setIsDialogOpen(true); }}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white shadow-md rounded-full px-6 transition-all hover:scale-105"
                    >
                        <Plus className="mr-2 h-5 w-5" /> Nuevo Item
                    </Button>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-gray-50">
                            <TableRow>
                                <TableHead className="font-bold text-gray-600 py-5 pl-8">ORDEN</TableHead>
                                <TableHead className="font-bold text-gray-600 py-5">TITULO</TableHead>
                                <TableHead className="font-bold text-gray-600 py-5">IMAGEN</TableHead>
                                <TableHead className="font-bold text-gray-600 py-5 text-right pr-8">ACCIONES</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow><TableCell colSpan={4} className="h-32 text-center text-gray-500">Cargando datos...</TableCell></TableRow>
                            ) : carouselItems.length === 0 ? (
                                <TableRow><TableCell colSpan={4} className="h-32 text-center text-gray-500">No hay items registrados.</TableCell></TableRow>
                            ) : (
                                carouselItems.map(item => (
                                    <TableRow key={item.id} className="hover:bg-gray-50/80 transition-colors border-b border-gray-100">
                                        <TableCell className="py-5 pl-8 font-bold">{item.orden}</TableCell>
                                        <TableCell className="py-5 text-gray-800 font-medium">{item.titulo}</TableCell>
                                        <TableCell className="py-5">
                                            {item.imagen?.nombreArchivo ? (
                                                <img src={getImageUrl(item.imagen.nombreArchivo)} className="h-10 w-20 object-cover rounded" />
                                            ) : 'Sin imagen'}
                                        </TableCell>
                                        <TableCell className="py-5 text-right pr-8">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-indigo-50" onClick={() => { setCurrentItem(item); setIsDialogOpen(true); }}>
                                                    <Pencil className="h-5 w-5" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-10 w-10 text-gray-400" onClick={() => Number(item.id) && handleDelete(Number(item.id))}>
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
                        <DialogTitle className="text-xl font-bold">{currentItem.id ? 'Editar' : 'Crear'} Item</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSave} className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>Título</Label>
                            <Input value={currentItem.titulo || ''} onChange={e => setCurrentItem({ ...currentItem, titulo: e.target.value })} required maxLength={150} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Descripción</Label>
                            <Input value={currentItem.descripcion || ''} onChange={e => setCurrentItem({ ...currentItem, descripcion: e.target.value })} maxLength={500} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Orden</Label>
                                <Input type="number" value={currentItem.orden?.toString() || ''} onChange={e => setCurrentItem({ ...currentItem, orden: parseInt(e.target.value) })} required />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label>Imagen</Label>
                            <Select
                                value={currentItem.imagen?.id?.toString() || 'none'}
                                onValueChange={val => {
                                    const img = imagenes.find(i => i.id?.toString() === val);
                                    setCurrentItem({ ...currentItem, imagen: img || null });
                                }}
                            >
                                <SelectTrigger><SelectValue placeholder="Seleccione imagen..." /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Ninguna</SelectItem>
                                    {imagenes.map(i => <SelectItem key={i.id} value={i.id?.toString() || ''}>{i.nombre}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                            <Button type="submit" className="bg-yellow-600 hover:bg-yellow-700 text-white">Guardar</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
};
