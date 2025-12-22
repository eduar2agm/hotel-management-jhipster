import React, { useEffect, useState } from 'react';
import {
    Phone,
    Mail,
    Facebook,
    Twitter,
    Instagram,
    Linkedin,
    Youtube,
    Globe,
    Pencil,
    Loader2,
    Plus,
    Trash2,
    Settings
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { SeccionContactoService, RedSocialService, TelefonoService } from '../services';
import type { SeccionContactoDTO, RedSocialDTO, TelefonoDTO, NewSeccionContactoDTO, NewRedSocialDTO, NewTelefonoDTO } from '../types/api';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogTrigger
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

const IconMap: Record<string, any> = {
    facebook: Facebook,
    twitter: Twitter,
    instagram: Instagram,
    linkedin: Linkedin,
    youtube: Youtube,
    default: Globe
};

const getSocialIcon = (name: string) => {
    const key = name.toLowerCase();
    for (const iconKey in IconMap) {
        if (key.includes(iconKey)) return IconMap[iconKey];
    }
    return IconMap.default;
};

export const ContactSection = () => {
    const { isAdmin } = useAuth();
    const [loading, setLoading] = useState(true);
    const [seccion, setSeccion] = useState<SeccionContactoDTO | null>(null);
    const [redes, setRedes] = useState<RedSocialDTO[]>([]);
    const [telefonos, setTelefonos] = useState<TelefonoDTO[]>([]);

    // Dialog states
    const [isSeccionDialogOpen, setIsSeccionDialogOpen] = useState(false);
    const [isRedesDialogOpen, setIsRedesDialogOpen] = useState(false);
    const [isTelefonosDialogOpen, setIsTelefonosDialogOpen] = useState(false);

    // Form states
    const [editSeccion, setEditSeccion] = useState<Partial<SeccionContactoDTO>>({});
    const [editRed, setEditRed] = useState<Partial<RedSocialDTO>>({});
    const [editTelefono, setEditTelefono] = useState<Partial<TelefonoDTO>>({});

    const [isSaving, setIsSaving] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [seccionRes, redesRes, telsRes] = await Promise.all([
                SeccionContactoService.getSeccionContactos({ activo: true }),
                RedSocialService.getRedSocials({ activo: true }),
                TelefonoService.getTelefonos({ activo: true })
            ]);

            console.log("Backend response - seccionRes.data:", seccionRes.data);

            if (seccionRes.data.length > 0) {
                console.log("First section:", seccionRes.data[0]);
                console.log("Section ID:", seccionRes.data[0].id);
                setSeccion(seccionRes.data[0]);
                setEditSeccion(seccionRes.data[0]);
            } else {
                console.warn("No active contact sections found in database");
            }
            setRedes(redesRes.data);
            setTelefonos(telsRes.data);
        } catch (error) {
            console.error("Error loading contact data:", error);
            toast.error("Error al cargar la información de contacto");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Seccion Contacto handlers
    const handleSaveSeccion = async (e: React.FormEvent) => {
        e.preventDefault();

        console.log("Validating editSeccion:", editSeccion);
        console.log("seccion?.id:", seccion?.id);

        // Validate required fields
        const missingFields = [];
        if (!editSeccion.titulo || editSeccion.titulo.trim() === '') missingFields.push('Título');
        if (!editSeccion.descripcion || editSeccion.descripcion.trim() === '') missingFields.push('Descripción');
        if (!editSeccion.imagenFondoUrl || editSeccion.imagenFondoUrl.trim() === '') missingFields.push('URL de Imagen');

        if (missingFields.length > 0) {
            toast.error(`Campos requeridos faltantes: ${missingFields.join(', ')}`);
            return;
        }

        setIsSaving(true);
        try {
            console.log("Creating/Updating data with:");
            console.log("  titulo:", editSeccion.titulo);
            console.log("  descripcion:", editSeccion.descripcion);
            console.log("  imagenFondoUrl:", editSeccion.imagenFondoUrl);

            if (seccion?.id) {
                // UPDATE existing section
                const updateData: SeccionContactoDTO = {
                    id: seccion.id,
                    titulo: editSeccion.titulo!.trim(),
                    descripcion: editSeccion.descripcion!.trim(),
                    imagenFondoUrl: editSeccion.imagenFondoUrl!.trim(),
                    correo: editSeccion.correo?.trim() || null,
                    activo: true
                };

                console.log("Updating section:", JSON.stringify(updateData, null, 2));
                const response = await SeccionContactoService.updateSeccionContacto(seccion.id, updateData);
                console.log("Server response:", response.data);
                toast.success("Sección actualizada");
            } else {
                // CREATE new section
                const newData: NewSeccionContactoDTO = {
                    titulo: editSeccion.titulo!.trim(),
                    descripcion: editSeccion.descripcion!.trim(),
                    imagenFondoUrl: editSeccion.imagenFondoUrl!.trim(),
                    correo: editSeccion.correo?.trim() || null,
                    activo: true
                };

                console.log("Creating new section:", JSON.stringify(newData, null, 2));
                const response = await SeccionContactoService.createSeccionContacto(newData);
                console.log("Server response:", response.data);
                toast.success("Sección creada exitosamente");
            }

            setIsSeccionDialogOpen(false);
            fetchData();
        } catch (error) {
            console.error("Error saving section:", error);
            toast.error("Error al guardar la sección");
        } finally {
            setIsSaving(false);
        }
    };

    // Red Social handlers
    const handleSaveRed = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editRed.nombre || !editRed.urlEnlace || !editRed.iconoUrl) {
            toast.error("Complete todos los campos requeridos");
            return;
        }

        setIsSaving(true);
        try {
            if (editRed.id) {
                await RedSocialService.updateRedSocial(editRed.id, editRed as RedSocialDTO);
                toast.success("Red social actualizada");
            } else {
                const newRed: NewRedSocialDTO = {
                    nombre: editRed.nombre,
                    urlEnlace: editRed.urlEnlace,
                    iconoUrl: editRed.iconoUrl,
                    colorHex: editRed.colorHex || null,
                    activo: true
                };
                await RedSocialService.createRedSocial(newRed);
                toast.success("Red social creada");
            }
            setEditRed({});
            fetchData();
        } catch (error) {
            console.error("Error:", error);
            toast.error("Error al guardar red social");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteRed = async (id: number) => {
        if (!confirm('¿Eliminar esta red social?')) return;
        try {
            await RedSocialService.deleteRedSocial(id);
            toast.success("Red social eliminada");
            fetchData();
        } catch (error) {
            toast.error("Error al eliminar");
        }
    };

    // Telefono handlers
    const handleSaveTelefono = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editTelefono.numeroTel) {
            toast.error("Ingrese un número de teléfono");
            return;
        }

        setIsSaving(true);
        try {
            if (editTelefono.id) {
                await TelefonoService.updateTelefono(editTelefono.id, editTelefono as TelefonoDTO);
                toast.success("Teléfono actualizado");
            } else {
                const newTel: NewTelefonoDTO = {
                    numeroTel: editTelefono.numeroTel,
                    activo: true
                };
                await TelefonoService.createTelefono(newTel);
                toast.success("Teléfono creado");
            }
            setEditTelefono({});
            fetchData();
        } catch (error) {
            console.error("Error:", error);
            toast.error("Error al guardar teléfono");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteTelefono = async (id: number) => {
        if (!confirm('¿Eliminar este teléfono?')) return;
        try {
            await TelefonoService.deleteTelefono(id);
            toast.success("Teléfono eliminado");
            fetchData();
        } catch (error) {
            toast.error("Error al eliminar");
        }
    };

    if (loading && !seccion) {
        return (
            <div className="w-full h-[400px] flex items-center justify-center bg-gray-900 text-white">
                <Loader2 className="animate-spin mr-2" />
                <span>Cargando contacto...</span>
            </div>
        );
    }

    const bgImage = seccion?.imagenFondoUrl || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80';

    return (
        <section id="contacto" className="relative py-24 overflow-hidden">
            <div
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${bgImage})` }}
            >
                <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" />
            </div>

            <div className="container relative z-10 mx-auto px-6 lg:px-12 text-center text-white">
                {isAdmin() && (
                    <div className="absolute top-0 right-0 p-4 flex gap-2">
                        {/* Editar Sección */}
                        <Dialog open={isSeccionDialogOpen} onOpenChange={(open) => {
                            setIsSeccionDialogOpen(open);
                            if (open) {
                                if (seccion) {
                                    // Edit mode: load existing data
                                    setEditSeccion({ ...seccion });
                                } else {
                                    // Create mode: initialize with empty values
                                    setEditSeccion({
                                        titulo: '',
                                        descripcion: '',
                                        imagenFondoUrl: '',
                                        correo: '',
                                        activo: true
                                    });
                                }
                            }
                        }}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                                    <Pencil className="w-4 h-4 mr-2" /> Editar Sección
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                                <DialogHeader>
                                    <DialogTitle>Editar Sección de Contacto</DialogTitle>
                                    <DialogDescription>Modifica el título, descripción y fondo de la sección.</DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleSaveSeccion} className="space-y-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="titulo">Título *</Label>
                                        <Input
                                            id="titulo"
                                            value={editSeccion.titulo || ''}
                                            onChange={(e) => setEditSeccion({ ...editSeccion, titulo: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="descripcion">Descripción *</Label>
                                        <Textarea
                                            id="descripcion"
                                            value={editSeccion.descripcion || ''}
                                            onChange={(e) => setEditSeccion({ ...editSeccion, descripcion: e.target.value })}
                                            rows={4}
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="correo">Correo</Label>
                                        <Input
                                            id="correo"
                                            type="email"
                                            value={editSeccion.correo || ''}
                                            onChange={(e) => setEditSeccion({ ...editSeccion, correo: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="imagen">URL Imagen de Fondo *</Label>
                                        <Input
                                            id="imagen"
                                            value={editSeccion.imagenFondoUrl || ''}
                                            onChange={(e) => setEditSeccion({ ...editSeccion, imagenFondoUrl: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <DialogFooter>
                                        <Button type="button" variant="ghost" onClick={() => setIsSeccionDialogOpen(false)}>Cancelar</Button>
                                        <Button type="submit" disabled={isSaving}>
                                            {isSaving && <Loader2 className="animate-spin mr-2 w-4 h-4" />}
                                            Guardar
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>

                        {/* Gestionar Redes Sociales */}
                        <Dialog open={isRedesDialogOpen} onOpenChange={setIsRedesDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                                    <Settings className="w-4 h-4 mr-2" /> Redes Sociales
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>Gestionar Redes Sociales</DialogTitle>
                                    <DialogDescription>Agrega, edita o elimina redes sociales.</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <form onSubmit={handleSaveRed} className="grid gap-3 p-4 border rounded-lg">
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <Label>Nombre *</Label>
                                                <Input value={editRed.nombre || ''} onChange={(e) => setEditRed({ ...editRed, nombre: e.target.value })} required />
                                            </div>
                                            <div>
                                                <Label>URL Enlace *</Label>
                                                <Input value={editRed.urlEnlace || ''} onChange={(e) => setEditRed({ ...editRed, urlEnlace: e.target.value })} required />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <Label>Icono * (facebook, twitter, etc.)</Label>
                                                <Input placeholder="facebook" value={editRed.iconoUrl || ''} onChange={(e) => setEditRed({ ...editRed, iconoUrl: e.target.value })} required />
                                            </div>
                                            <div>
                                                <Label>Color Hex</Label>
                                                <Input placeholder="#1DA1F2" value={editRed.colorHex || ''} onChange={(e) => setEditRed({ ...editRed, colorHex: e.target.value })} />
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button type="submit" disabled={isSaving} className="flex-1">
                                                {isSaving && <Loader2 className="animate-spin mr-2 w-4 h-4" />}
                                                {editRed.id ? 'Actualizar' : 'Agregar'}
                                            </Button>
                                            {editRed.id && <Button type="button" variant="ghost" onClick={() => setEditRed({})}>Cancelar</Button>}
                                        </div>
                                    </form>

                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Nombre</TableHead>
                                                <TableHead>URL</TableHead>
                                                <TableHead className="text-right">Acciones</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {redes.map((red) => (
                                                <TableRow key={red.id}>
                                                    <TableCell>{red.nombre}</TableCell>
                                                    <TableCell className="truncate max-w-[200px]">{red.urlEnlace}</TableCell>
                                                    <TableCell className="text-right">
                                                        <Button variant="ghost" size="icon" onClick={() => setEditRed(red)}><Pencil className="w-4 h-4" /></Button>
                                                        <Button variant="ghost" size="icon" onClick={() => red.id && handleDeleteRed(red.id)}><Trash2 className="w-4 h-4" /></Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </DialogContent>
                        </Dialog>

                        {/* Gestionar Teléfonos */}
                        <Dialog open={isTelefonosDialogOpen} onOpenChange={setIsTelefonosDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                                    <Phone className="w-4 h-4 mr-2" /> Teléfonos
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                                <DialogHeader>
                                    <DialogTitle>Gestionar Teléfonos</DialogTitle>
                                    <DialogDescription>Agrega, edita o elimina números de contacto.</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <form onSubmit={handleSaveTelefono} className="flex gap-2">
                                        <Input
                                            placeholder="Número de teléfono"
                                            value={editTelefono.numeroTel || ''}
                                            onChange={(e) => setEditTelefono({ ...editTelefono, numeroTel: e.target.value })}
                                            required
                                            className="flex-1"
                                        />
                                        <Button type="submit" disabled={isSaving}>
                                            {isSaving && <Loader2 className="animate-spin mr-2 w-4 h-4" />}
                                            {editTelefono.id ? 'Actualizar' : <Plus className="w-4 h-4" />}
                                        </Button>
                                        {editTelefono.id && <Button type="button" variant="ghost" onClick={() => setEditTelefono({})}>Cancelar</Button>}
                                    </form>

                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Número</TableHead>
                                                <TableHead className="text-right">Acciones</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {telefonos.map((tel) => (
                                                <TableRow key={tel.id}>
                                                    <TableCell>{tel.numeroTel}</TableCell>
                                                    <TableCell className="text-right">
                                                        <Button variant="ghost" size="icon" onClick={() => setEditTelefono(tel)}><Pencil className="w-4 h-4" /></Button>
                                                        <Button variant="ghost" size="icon" onClick={() => tel.id && handleDeleteTelefono(tel.id)}><Trash2 className="w-4 h-4" /></Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                )}

                <div className="max-w-4xl mx-auto mb-16">
                    <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6 tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {seccion?.titulo || "Contáctanos"}
                    </h2>
                    <div className="w-24 h-1 bg-yellow-500 mx-auto mb-8 ring-4 ring-yellow-500/20 rounded-full" />
                    <p className="text-lg md:text-xl text-gray-200 leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-1000">
                        {seccion?.descripcion || "Estamos aquí para asistirte en todo lo que necesites."}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-20">
                    {/* Phones */}
                    <div className="flex flex-col items-center">
                        <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/20 mb-6 hover:scale-110 transition-transform">
                            <Phone className="w-8 h-8 text-yellow-400" />
                        </div>
                        <h3 className="text-xl font-bold mb-3 uppercase tracking-widest text-yellow-400">Teléfonos</h3>
                        <div className="space-y-2">
                            {telefonos.length > 0 ? telefonos.map((tel) => (
                                <p key={tel.id} className="text-lg text-gray-100 hover:text-white transition-colors cursor-pointer">
                                    {tel.numeroTel}
                                </p>
                            )) : (
                                <p className="text-gray-400 italic">No hay teléfonos</p>
                            )}
                        </div>
                    </div>

                    {/* Email */}
                    <div className="flex flex-col items-center">
                        <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/20 mb-6 hover:scale-110 transition-transform">
                            <Mail className="w-8 h-8 text-yellow-500" />
                        </div>
                        <h3 className="text-xl font-bold mb-3 uppercase tracking-widest text-yellow-500">Email</h3>
                        <a
                            href={`mailto:${seccion?.correo || 'contacto@hotel.com'}`}
                            className="text-lg text-gray-100 hover:text-white transition-colors underline underline-offset-4 decoration-yellow-500/50"
                        >
                            {seccion?.correo || 'contacto@hotel.com'}
                        </a>
                    </div>

                    {/* Social Networks */}
                    <div className="flex flex-col items-center">
                        <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/20 mb-6 hover:scale-110 transition-transform">
                            <Globe className="w-8 h-8 text-yellow-600" />
                        </div>
                        <h3 className="text-xl font-bold mb-3 uppercase tracking-widest text-yellow-600">Redes Sociales</h3>
                        <div className="flex flex-wrap justify-center gap-4">
                            {redes.length > 0 ? redes.map((red) => {
                                const Icon = getSocialIcon(red.nombre);
                                return (
                                    <a
                                        key={red.id}
                                        href={red.urlEnlace}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-3 bg-white/10 rounded-full hover:bg-yellow-500 hover:text-black transition-all group relative"
                                        title={red.nombre}
                                    >
                                        <Icon className="w-6 h-6" />
                                        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs bg-black text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                            {red.nombre}
                                        </span>
                                    </a>
                                );
                            }) : (
                                <p className="text-gray-400 italic">No hay redes sociales</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="pt-10 border-t border-white/10">
                    <p className="text-sm text-gray-400 uppercase tracking-[0.3em]">
                        Experiencia de Lujo & Confort
                    </p>
                </div>
            </div>
        </section>
    );
};
