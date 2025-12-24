import React, { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ServicioService, ImagenService } from '../../services';
import type { ServicioDTO, NewServicioDTO } from '../../types/api';
import { getImageUrl } from '../../utils/imageUtils';
import { TipoServicio } from '../../types/api/Servicio';
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
import { Plus, Search, Pencil, Briefcase, Upload, Loader2, Image as ImageIcon, Clock } from 'lucide-react';
import { ServicioDisponibilidadManager } from '../../components/admin/servicios/ServicioDisponibilidadManager';
import { ServiceScheduleSelector } from '../../components/services/ServiceScheduleSelector';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ServiceCard } from '@/components/ui/ServiceCard';
import { ActiveFilter } from '@/components/ui/ActiveFilter';
import { PaginationControl } from '@/components/common/PaginationControl';
import { MultiImageUpload } from '../../components/common/MultiImageUpload';
import type { ImagenDTO } from '../../types/api/Imagen';
import { DetailsImageGallery } from '../../components/common/DetailsImageGallery';

const servicioSchema = z.object({
    id: z.number().optional(),
    nombre: z.string().min(1, 'Nombre es requerido'),
    descripcion: z.string().optional().or(z.literal('')),
    tipo: z.nativeEnum(TipoServicio).default(TipoServicio.PAGO),
    precio: z.coerce.number().min(0, 'Precio no puede ser negativo'),
    disponible: z.boolean().default(true),
    urlImage: z.string().optional().or(z.literal('')),
});

type ServicioFormValues = z.infer<typeof servicioSchema>;

export const ServiciosList = ({ readOnly = false }: { readOnly?: boolean }) => {
    const [servicios, setServicios] = useState<ServicioDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [localPreview, setLocalPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const itemsPerPage = 8;

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [searchFilter, setSearchFilter] = useState('');
    const [showInactive, setShowInactive] = useState(false);

    const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
    const [selectedServiceForDetails, setSelectedServiceForDetails] = useState<ServicioDTO | null>(null);
    const [detailsImages, setDetailsImages] = useState<ImagenDTO[]>([]);

    const [isAvailabilityDialogOpen, setIsAvailabilityDialogOpen] = useState(false);
    const [selectedService, setSelectedService] = useState<ServicioDTO | null>(null);
    const [galleryImages, setGalleryImages] = useState<ImagenDTO[]>([]);

    const fetchGallery = async () => {
        const currentId = form.getValues('id');
        if (currentId) {
            try {
                const res = await ImagenService.getImagens({ 'servicioId.equals': currentId });
                setGalleryImages(res.data);
            } catch (e) {
                console.error(e);
            }
        } else {
            setGalleryImages([]);
        }
    };

    useEffect(() => {
        if (isDialogOpen) {
            fetchGallery();
        }
    }, [isDialogOpen]);

    const form = useForm<ServicioFormValues>({
        resolver: zodResolver(servicioSchema) as any,
        defaultValues: {
            nombre: '',
            descripcion: '',
            tipo: TipoServicio.PAGO,
            precio: 0,
            disponible: true,
            urlImage: ''
        }
    });

    const loadData = async () => {
        setLoading(true);
        try {
            const servRes = await (showInactive
                ? ServicioService.getServicios({ page: currentPage, size: itemsPerPage, sort: 'id,asc' })
                : ServicioService.getServiciosDisponibles({ page: currentPage, size: itemsPerPage, sort: 'id,asc' }));

            setServicios(servRes.data);
            const total = parseInt(servRes.headers['x-total-count'] || '0', 10);
            setTotalItems(total);
        } catch (error) {
            toast.error('Error al cargar servicios');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, [currentPage, showInactive]);

    useEffect(() => {
        if (!isDialogOpen) {
            form.reset();
            setLocalPreview(null);
        }
    }, [isDialogOpen, form]);

    const onSubmit = async (data: ServicioFormValues) => {
        try {
            if (isEditing && data.id) {
                await ServicioService.updateServicio(data.id, data as ServicioDTO);
                toast.success('Servicio actualizado correctamente');
            } else {
                await ServicioService.createServicio(data as NewServicioDTO);
                toast.success('Servicio creado exitosamente');
            }
            setIsDialogOpen(false);
            loadData();
        } catch (error) {
            toast.error('Error al guardar servicio');
            console.error(error);
        }
    };

    const handleDirectUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Set instant local preview
        const objectUrl = URL.createObjectURL(file);
        setLocalPreview(objectUrl);

        setIsUploading(true);
        try {
            const formData = new FileReader();
            formData.onload = async (event) => {
                const base64String = (event.target?.result as string).split(',')[1];

                try {
                    const newImg = await ImagenService.createImagen({
                        nombre: file.name,
                        fichero: base64String,
                        ficheroContentType: file.type,
                        activo: true,
                        servicio: form.getValues('id') ? { id: form.getValues('id') } : {}
                    } as any);

                    if (newImg.data.nombreArchivo) {
                        form.setValue('urlImage', newImg.data.nombreArchivo);
                        toast.success('Imagen subida correctamente');
                    }
                } catch (err) {
                    toast.error('Error al guardar la imagen en el servidor');
                    setLocalPreview(null);
                } finally {
                    setIsUploading(false);
                }
            };
            formData.readAsDataURL(file);
        } catch (error) {
            toast.error('Error al leer el archivo');
            setIsUploading(false);
            setLocalPreview(null);
        }
    };

    const handleEdit = (item: ServicioDTO) => {
        if (readOnly) return;
        setIsEditing(true);
        form.reset({
            id: item.id,
            nombre: item.nombre,
            descripcion: item.descripcion || '',
            tipo: item.tipo,
            precio: Number(item.precio),
            disponible: item.disponible,
            urlImage: item.urlImage || ''
        });
        setIsDialogOpen(true);
    };

    const handleCreate = () => {
        if (readOnly) return;
        setIsEditing(false);
        form.reset({
            nombre: '',
            descripcion: '',
            tipo: TipoServicio.PAGO,
            precio: 0,
            disponible: true,
            urlImage: ''
        });
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (readOnly) return;
        if (!confirm('¿Estás seguro de eliminar este servicio?')) return;
        try {
            await ServicioService.deleteServicio(id);
            toast.success('Servicio eliminado');
            loadData();
        } catch (error) {
            toast.error('Error al eliminar servicio');
        }
    };

    const handleToggleActive = async (id: number, currentStatus: boolean | undefined) => {
        if (readOnly) return;
        try {
            await ServicioService.partialUpdateServicio(id, { disponible: currentStatus });
            toast.success(`Servicio ${currentStatus ? 'activado' : 'desactivado'}`);
            loadData();
        } catch (error) {
            toast.error('Error al cambiar estado');
        }
    };

    const handleManageAvailability = (servicio: ServicioDTO) => {
        if (readOnly) return;
        setSelectedService(servicio);
        setIsAvailabilityDialogOpen(true);
    };

    const handleViewDetails = (servicio: ServicioDTO) => {
        setSelectedServiceForDetails(servicio);
        setIsDetailsDialogOpen(true);
        if (servicio.id) {
            ImagenService.getImagens({ 'servicioId.equals': servicio.id })
                .then(res => setDetailsImages(res.data))
                .catch(e => console.error(e));
        } else {
            setDetailsImages([]);
        }
    };

    const filteredServicios = servicios.filter(s => {
        if (!searchFilter) return true;
        const searchLower = searchFilter.toLowerCase();
        return (
            s.nombre.toLowerCase().includes(searchLower) ||
            (s.descripcion && s.descripcion.toLowerCase().includes(searchLower))
        );
    });

    return (
        <div className="font-sans text-foreground bg-background min-h-screen flex flex-col">

            <div className="bg-[#0F172A] pt-32 pb-20 px-4 md:px-8 lg:px-20 relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 pointer-events-none">
                    <Briefcase className="w-96 h-96 text-white" />
                </div>
                <div className="relative max-w-7xl mx-auto z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <span className="text-yellow-500 font-bold tracking-[0.2em] uppercase text-xs mb-2 block">Administración</span>
                        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-2">
                            {readOnly ? 'Catálogo de Servicios' : 'Gestión de Servicios'}
                        </h1>
                        <p className="text-muted-foreground text-lg max-w-2xl">
                            {readOnly ? 'Explore los servicios disponibles.' : 'Administre el catálogo de servicios extra y comodidades.'}
                        </p>
                    </div>
                    {!readOnly && (
                        <div>
                            <Button
                                onClick={handleCreate}
                                className="bg-yellow-600 hover:bg-yellow-700 text-white border-0 shadow-lg hover:shadow-yellow-600/20 transition-all rounded-sm px-6 py-6 text-sm uppercase tracking-widest font-bold"
                            >
                                <Plus className="mr-2 h-5 w-5" /> Nuevo Servicio
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <main className="flex-grow py-5  px-4 md:px-8 lg:px-20 -mt-10 relative z-10">
                <Card className="max-w-7xl mx-auto border-t-4 border-gray-600 shadow-xl bg-card">
                    <CardHeader className="border-b bg-muted/30 pb-6">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <div>
                                <CardTitle className="text-xl font-bold text-card-foreground">Catálogo de Servicios</CardTitle>
                                <CardDescription>Total de servicios: {totalItems}</CardDescription>
                            </div>
                            <div className="flex flex-col md:flex-row gap-4 items-center w-full md:w-auto">
                                {!readOnly && <ActiveFilter showInactive={showInactive} onChange={(val) => { setShowInactive(val); setCurrentPage(0); }} inactiveLabel="Mostrar no disponibles" />}
                                <div className="relative w-full md:w-96 group">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-yellow-600 transition-colors" />
                                    <Input
                                        placeholder="Buscar servicio..."
                                        value={searchFilter}
                                        onChange={(e) => setSearchFilter(e.target.value)}
                                        className="pl-10 border-input focus:border-yellow-600 focus:ring-yellow-600/20 h-11 transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 md:p-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {loading ? (
                                <div className="col-span-full h-32 flex flex-col items-center justify-center text-muted-foreground">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mb-2"></div>
                                    <span>Cargando servicios...</span>
                                </div>
                            ) : filteredServicios.length === 0 ? (
                                <div className="col-span-full h-32 flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
                                    No se encontraron servicios
                                </div>
                            ) : (
                                filteredServicios.map((s) => (
                                    <ServiceCard
                                        key={s.id}
                                        servicio={s}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                        onToggleActive={handleToggleActive}
                                        onManageAvailability={handleManageAvailability}
                                        onViewDetails={handleViewDetails}
                                        readOnly={readOnly}
                                    />
                                ))
                            )}
                        </div>

                        <div className="mt-8">
                            <PaginationControl
                                currentPage={currentPage}
                                totalItems={totalItems}
                                itemsPerPage={itemsPerPage}
                                onPageChange={setCurrentPage}
                                isLoading={loading}
                            />
                        </div>
                    </CardContent>
                </Card>

                {!readOnly && (
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogContent className="max-w-lg p-0 overflow-hidden border-0 shadow-2xl">
                            <DialogHeader className="bg-[#0F172A] text-white p-6">
                                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                                    {isEditing ? <Pencil className="h-5 w-5 text-yellow-500" /> : <Plus className="h-5 w-5 text-yellow-500" />}
                                    {isEditing ? 'Editar Servicio' : 'Nuevo Servicio'}
                                </DialogTitle>
                                <DialogDescription className="text-slate-400">
                                    Detalles del servicio ofrecido.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="p-6 bg-background overflow-y-auto max-h-[80vh]">
                                <Form {...(form as any)}>
                                    <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-5">
                                        <FormField
                                            control={form.control as any}
                                            name="nombre"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-bold text-gray-500 uppercase tracking-widest">Nombre</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Ej: Spa Completo" className="h-9" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control as any}
                                            name="descripcion"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-bold text-gray-500 uppercase tracking-widest">Descripción</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder="Detalles del servicio..."
                                                            className="resize-none h-20"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control as any}
                                                name="tipo"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs font-bold text-gray-500 uppercase tracking-widest">Tipo</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger className="h-9">
                                                                    <SelectValue placeholder="Seleccione..." />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value={TipoServicio.PAGO}>Pago</SelectItem>
                                                                <SelectItem value={TipoServicio.GRATUITO}>Gratuito</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control as any}
                                                name="precio"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs font-bold text-gray-500 uppercase tracking-widest">Precio</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" step="0.01" className="h-9" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <FormField
                                            control={form.control as any}
                                            name="urlImage"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-bold text-gray-500 uppercase tracking-widest">Imagen del Servicio</FormLabel>
                                                    <FormControl>
                                                        <div className="space-y-4">
                                                            <div
                                                                className={cn(
                                                                    "relative overflow-hidden rounded-xl border-2 border-dashed transition-all duration-300 group",
                                                                    (field.value || localPreview) ? "border-yellow-600/50" : "border-gray-200 hover:border-yellow-400"
                                                                )}
                                                            >
                                                                {field.value || localPreview ? (
                                                                    <div className="relative aspect-video w-full bg-gray-50">
                                                                        <img
                                                                            src={localPreview || getImageUrl(field.value)}
                                                                            className="h-full w-full object-cover"
                                                                            onError={(e) => {
                                                                                if (!localPreview) {
                                                                                    e.currentTarget.src = 'https://placehold.co/400x200?text=Error+al+cargar';
                                                                                }
                                                                            }}
                                                                        />
                                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-[2px]">
                                                                            <Button
                                                                                type="button"
                                                                                onClick={() => fileInputRef.current?.click()}
                                                                                variant="secondary"
                                                                                className="gap-2 font-bold shadow-2xl"
                                                                                disabled={isUploading}
                                                                            >
                                                                                {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                                                                Cambiar imagen
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div
                                                                        onClick={() => fileInputRef.current?.click()}
                                                                        className="aspect-video w-full flex flex-col items-center justify-center cursor-pointer bg-gray-50/50 hover:bg-gray-50 transition-colors py-10"
                                                                    >
                                                                        <div className="h-12 w-12 rounded-full bg-yellow-50 flex items-center justify-center mb-3">
                                                                            {isUploading ? <Loader2 className="h-6 w-6 animate-spin text-yellow-600" /> : <ImageIcon className="h-6 w-6 text-yellow-600" />}
                                                                        </div>
                                                                        <p className="text-sm font-bold text-gray-600 uppercase tracking-tight">
                                                                            {isUploading ? 'Subiendo archivo...' : 'Haga clic para subir una imagen'}
                                                                        </p>
                                                                        <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Formatos sugeridos: JPG, PNG • Max 5MB</p>
                                                                    </div>
                                                                )}
                                                                <input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    className="hidden"
                                                                    ref={fileInputRef}
                                                                    onChange={handleDirectUpload}
                                                                    disabled={isUploading}
                                                                />
                                                            </div>
                                                            {field.value && (
                                                                <div className="flex justify-between items-center px-1">
                                                                    <span className="text-[10px] text-gray-400 font-mono truncate max-w-[200px]">{field.value}</span>
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="h-6 text-[10px] font-bold text-red-500 hover:text-red-600 hover:bg-red-50"
                                                                        onClick={() => {
                                                                            field.onChange('');
                                                                            setLocalPreview(null);
                                                                        }}
                                                                    >
                                                                        Eliminar
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control as any}
                                            name="disponible"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border bg-muted/30 p-3">
                                                    <div className="space-y-0.5">
                                                        <FormLabel className="text-sm font-medium text-foreground">Disponible</FormLabel>
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
                                        <div className="space-y-2 pt-4 border-t border-border">
                                            <FormLabel className="text-xs font-bold text-gray-500 uppercase tracking-widest">Galería Adicional</FormLabel>
                                            <MultiImageUpload
                                                parentId={form.getValues('id')}
                                                parentType="servicio"
                                                images={galleryImages}
                                                onUpdate={fetchGallery}
                                            />
                                        </div>

                                        <div className="pt-4 flex justify-end gap-3 border-t">
                                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="h-10">Cancelar</Button>
                                            <Button type="submit" className="bg-yellow-600 hover:bg-yellow-700 text-white h-10 px-6">
                                                {isEditing ? 'Guardar Cambios' : 'Crear Servicio'}
                                            </Button>
                                        </div>
                                    </form>
                                </Form>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}

                <Dialog open={isAvailabilityDialogOpen} onOpenChange={setIsAvailabilityDialogOpen}>
                    <DialogContent className="max-w-4xl p-0 overflow-hidden border-0 shadow-2xl">
                        <DialogHeader className="bg-[#0F172A] text-white p-6">
                            <DialogTitle className="text-xl font-bold flex items-center gap-2">
                                <Clock className="h-5 w-5 text-yellow-500" />
                                Gestión de Disponibilidad
                            </DialogTitle>
                            <DialogDescription className="text-slate-400">
                                {selectedService?.nombre} - Configure los horarios y cupos.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="p-6 bg-background overflow-y-auto max-h-[80vh]">
                            {selectedService && <ServicioDisponibilidadManager servicio={selectedService} />}
                        </div>
                        <div className="p-4 bg-muted border-t flex justify-end">
                            <Button variant="outline" onClick={() => setIsAvailabilityDialogOpen(false)}>Cerrar</Button>
                        </div>
                    </DialogContent>
                </Dialog>

                <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
                    <DialogContent className="max-w-4xl p-0 overflow-hidden border-0 shadow-2xl">
                        <DialogHeader className="bg-[#0F172A] text-white p-6">
                            <DialogTitle className="text-xl font-bold flex items-center gap-2">
                                <Briefcase className="h-5 w-5 text-yellow-500" />
                                Detalles del Servicio
                            </DialogTitle>
                            <DialogDescription className="text-slate-400">
                                Información detallada y calendario de disponibilidad.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-1 lg:grid-cols-3 bg-muted/20">
                            {/* Panel izquierdo: Información */}
                            <div className="p-6 space-y-6 lg:border-r border-border">
                                {selectedServiceForDetails && (
                                    <>
                                        <div className="aspect-video w-full rounded-lg overflow-hidden border border-border bg-card shadow-sm main-video-container">
                                            <DetailsImageGallery
                                                mainImage={selectedServiceForDetails.urlImage}
                                                extraImages={detailsImages}
                                                className="w-full h-full"
                                                autoPlay={true}
                                            />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-foreground mb-2">{selectedServiceForDetails.nombre}</h3>
                                            <p className="text-muted-foreground text-sm leading-relaxed">
                                                {selectedServiceForDetails.descripcion || 'Sin descripción disponible.'}
                                            </p>
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Detalles</h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-card p-3 rounded-lg border border-border shadow-sm">
                                                    <div className="text-xs text-muted-foreground mb-1">Precio</div>
                                                    <div className="font-bold text-yellow-600">${selectedServiceForDetails.precio}</div>
                                                </div>
                                                <div className="bg-card p-3 rounded-lg border border-border shadow-sm">
                                                    <div className="text-xs text-muted-foreground mb-1">Tipo</div>
                                                    <div className="font-bold text-foreground">{selectedServiceForDetails.tipo}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Panel derecho: Calendario de Disponibilidad */}
                            <div className="lg:col-span-2 p-6 bg-background overflow-y-auto max-h-[70vh]">
                                <h4 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-muted-foreground" />
                                    Calendario de Disponibilidad
                                </h4>
                                <div className="text-sm text-foreground mb-4 bg-blue-500/10 text-blue-500 p-3 rounded-md border border-blue-500/20">
                                    <p>Seleccione una fecha para ver los horarios y cupos disponibles en tiempo real.</p>
                                </div>
                                {selectedServiceForDetails && selectedServiceForDetails.id && (
                                    <div className="border border-border rounded-lg p-4 bg-card">
                                        <ServiceScheduleSelector
                                            servicioId={selectedServiceForDetails.id}
                                            onSelect={() => { }} // No-op, solo visualización
                                            reserva={null}
                                        // No pasamos fechas seleccionadas para que el usuario pueda explorar libremente
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="p-4 bg-muted border-t flex justify-end">
                            <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>Cerrar</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </main>
        </div>
    );
};

export const AdminServicios = () => <ServiciosList readOnly={false} />;
