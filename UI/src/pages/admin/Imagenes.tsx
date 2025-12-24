import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ImagenService, HabitacionService, ServicioService } from '../../services';
import type { ImagenDTO, NewImagenDTO, HabitacionDTO, ServicioDTO } from '../../types/api';
import { toast } from 'sonner';
import { Pencil, Trash2, Plus, Image as ImageIcon, FileUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getImageUrl } from '../../utils/imageUtils';
import { PaginationControl } from '@/components/common/PaginationControl';

export const AdminImagenes = () => {
    const [imagenes, setImagenes] = useState<ImagenDTO[]>([]);
    const [habitaciones, setHabitaciones] = useState<HabitacionDTO[]>([]);
    const [servicios, setServicios] = useState<ServicioDTO[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentImg, setCurrentImg] = useState<Partial<ImagenDTO>>({});

    // Pagination
    const [currentPage, setCurrentPage] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const itemsPerPage = 10;

    const loadData = async (page: number) => {
        setIsLoading(true);
        try {
            const [imgRes, habRes, servRes] = await Promise.all([
                ImagenService.getImagens({
                    page: page,
                    size: itemsPerPage,
                    sort: 'id,desc'
                }),
                HabitacionService.getHabitacions({ size: 1000 }),
                ServicioService.getServicios({ size: 1000 })
            ]);
            setImagenes(imgRes.data);
            setHabitaciones(habRes.data);
            setServicios(servRes.data);
            setTotalItems(parseInt(imgRes.headers['x-total-count'] || '0', 10));
        } catch (error) {
            toast.error('Error al cargar datos');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData(currentPage);
    }, [currentPage]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const base64String = (event.target?.result as string).split(',')[1];
                setCurrentImg({
                    ...currentImg,
                    fichero: base64String,
                    ficheroContentType: file.type,
                    nombre: currentImg.nombre || file.name
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (currentImg.id) {
                await ImagenService.updateImagen(currentImg.id, currentImg as ImagenDTO);
                toast.success('Imagen actualizada');
            } else {
                await ImagenService.createImagen({ ...currentImg, activo: true } as NewImagenDTO);
                toast.success('Imagen creada y guardada localmente');
            }
            setIsDialogOpen(false);
            loadData(currentPage);
        } catch (error) {
            toast.error('Error al guardar imagen');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Eliminar imagen?')) return;
        try {
            await ImagenService.deleteImagen(id);
            toast.success('Imagen eliminada');
            loadData(currentPage);
        } catch (error) {
            toast.error('Error al eliminar');
        }
    };

    return (
        <div className="font-sans text-foreground bg-background min-h-screen flex flex-col">

            <div className="bg-[#0F172A] pt-32 pb-20 px-4 md:px-8 lg:px-20 relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 pointer-events-none">
                    <ImageIcon className="w-96 h-96 text-white" />
                </div>
                <div className="relative max-w-7xl mx-auto z-10">
                    <span className="text-yellow-500 font-bold tracking-[0.2em] uppercase text-xs mb-2 block">Administración</span>
                    <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-2">
                        Galería de Imágenes
                    </h1>
                    <p className="text-slate-400 text-lg max-w-2xl">
                        Gestione los recursos visuales del sistema. Las imágenes se guardan automáticamente en carpetas locales según su categoría.
                    </p>
                </div>
            </div>

            <main className="flex-grow py-5 px-4 md:px-8 lg:px-20 -mt-10 relative z-10">
                <div className="max-w-7xl mx-auto space-y-6">
                    <Card className="bg-card border-border shadow-xl overflow-hidden rounded-2xl">
                        <CardHeader className="border-b border-border bg-card p-6 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-2xl font-bold text-foreground">Catálogo de Imágenes</CardTitle>
                                <p className="text-muted-foreground text-sm mt-1">Gestión de archivos, asociaciones y almacenamiento local.</p>
                            </div>
                            <Button
                                onClick={() => { setCurrentImg({ activo: true }); setIsDialogOpen(true); }}
                                className="bg-yellow-600 hover:bg-yellow-700 text-white shadow-md rounded-full px-6 transition-all hover:scale-105"
                            >
                                <Plus className="mr-2 h-5 w-5" /> Subir Imagen
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow className="border-border">
                                        <TableHead className="font-bold text-muted-foreground py-5 pl-8">VISTA PREVIA</TableHead>
                                        <TableHead className="font-bold text-muted-foreground py-5">NOMBRE</TableHead>
                                        <TableHead className="font-bold text-muted-foreground py-5">VINCULADO A</TableHead>
                                        <TableHead className="font-bold text-muted-foreground py-5">RUTA ARCHIVO</TableHead>
                                        <TableHead className="font-bold text-muted-foreground py-5 text-right pr-8">ACCIONES</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow><TableCell colSpan={5} className="h-32 text-center text-gray-500">Cargando imágenes...</TableCell></TableRow>
                                    ) : imagenes.length === 0 ? (
                                        <TableRow><TableCell colSpan={5} className="h-32 text-center text-gray-500">No hay imágenes registradas.</TableCell></TableRow>
                                    ) : (
                                        imagenes.map(img => (
                                            <TableRow key={img.id} className="hover:bg-muted/50 transition-colors border-b border-border">
                                                <TableCell className="py-5 pl-8">
                                                    <div className="h-16 w-24 rounded-lg overflow-hidden bg-muted border border-border">
                                                        {img.nombreArchivo ? (
                                                            <img
                                                                src={getImageUrl(img.nombreArchivo)}
                                                                alt={img.nombre}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex items-center justify-center h-full text-muted-foreground">
                                                                <ImageIcon size={20} />
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-5">
                                                    <div className="font-bold text-foreground">{img.nombre}</div>
                                                    <div className="text-xs text-muted-foreground">{img.descripcion || 'Sin descripción'}</div>
                                                </TableCell>
                                                <TableCell className="py-5">
                                                    {img.habitacion && (
                                                        <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-bold border border-blue-200 dark:border-blue-800">
                                                            Hab: {img.habitacion.numero}
                                                        </span>
                                                    )}
                                                    {img.servicio && (
                                                        <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full text-xs font-bold border border-purple-200 dark:border-purple-800">
                                                            Serv: {img.servicio.nombre}
                                                        </span>
                                                    )}
                                                    {!img.habitacion && !img.servicio && (
                                                        <span className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-xs font-bold border border-border">
                                                            Carrusel / General
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="py-5 font-mono text-[10px] text-muted-foreground">
                                                    {img.nombreArchivo || 'Pendiente de guardado'}
                                                </TableCell>
                                                <TableCell className="py-5 text-right pr-8">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-full" onClick={() => { setCurrentImg(img); setIsDialogOpen(true); }}>
                                                            <Pencil className="h-5 w-5" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 rounded-full" onClick={() => handleDelete(img.id!)}>
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

                    <div className="bg-muted/20 border border-border rounded-xl px-6 pb-6 pt-4">
                        <PaginationControl
                            currentPage={currentPage}
                            totalItems={totalItems}
                            itemsPerPage={itemsPerPage}
                            onPageChange={setCurrentPage}
                            isLoading={isLoading}
                        />
                    </div>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold">{currentImg.id ? 'Editar' : 'Subir'} Imagen</DialogTitle>
                            <DialogDescription>
                                La imagen se procesará y guardará en el disco del servidor.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSave} className="space-y-4 py-4">
                            <div className="grid gap-2">
                                <Label>Nombre de la Imagen</Label>
                                <Input
                                    value={currentImg.nombre || ''}
                                    onChange={e => setCurrentImg({ ...currentImg, nombre: e.target.value })}
                                    required
                                    placeholder="Ej: Suite Principal Vista"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label>Vincular a (Carpeta de destino)</Label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] uppercase text-gray-400">Habitación</Label>
                                        <Select
                                            value={currentImg.habitacion?.id?.toString() || 'none'}
                                            onValueChange={(val) => {
                                                const h = habitaciones.find(hab => hab.id?.toString() === val);
                                                setCurrentImg({ ...currentImg, habitacion: h || null, servicio: null });
                                            }}
                                        >
                                            <SelectTrigger><SelectValue placeholder="No vincular" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">Ninguna</SelectItem>
                                                {habitaciones.map(h => (
                                                    <SelectItem key={h.id} value={h.id?.toString() || ''}>Hab {h.numero}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] uppercase text-gray-400">Servicio</Label>
                                        <Select
                                            value={currentImg.servicio?.id?.toString() || 'none'}
                                            onValueChange={(val) => {
                                                const s = servicios.find(ser => ser.id?.toString() === val);
                                                setCurrentImg({ ...currentImg, servicio: s || null, habitacion: null });
                                            }}
                                        >
                                            <SelectTrigger><SelectValue placeholder="No vincular" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">Ninguno</SelectItem>
                                                {servicios.map(s => (
                                                    <SelectItem key={s.id} value={s.id?.toString() || ''}>{s.nombre}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label>Archivo de Imagen</Label>
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center justify-center w-full">
                                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer bg-muted/20 hover:bg-muted/50 transition-colors">
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <FileUp className="w-8 h-8 mb-3 text-muted-foreground" />
                                                <p className="mb-2 text-sm text-foreground font-semibold">Haz clic para subir</p>
                                                <p className="text-xs text-muted-foreground">JPG, PNG, GIF o WEBP</p>
                                            </div>
                                            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                        </label>
                                    </div>
                                    {currentImg.fichero && (
                                        <div className="relative h-20 w-32 rounded-lg overflow-hidden border mx-auto">
                                            <img src={`data:${currentImg.ficheroContentType};base64,${currentImg.fichero}`} className="h-full w-full object-cover" />
                                            <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                                                <span className="text-[10px] font-bold text-green-700 bg-white/80 px-2 py-0.5 rounded">Nuevo archivo</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                                <Button type="submit" className="bg-yellow-600 hover:bg-yellow-700 text-white">
                                    {currentImg.id ? 'Actualizar' : 'Subir e Instalar'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </main>
        </div>
    );
};

export default AdminImagenes;
