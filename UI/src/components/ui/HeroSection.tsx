import { useEffect, useState, useRef } from 'react';
import { 
    Facebook, Instagram, Twitter, ChevronLeft, ChevronRight, 
    Edit, Save, Link as LinkIcon, Image as ImageIcon, Plus, Trash2, Globe, 
    YoutubeIcon,
    Navigation
} from 'lucide-react';
import { SeccionHeroService } from '../../services/seccion-hero.service';
import { RedSociallandingService } from '../../services/red-sociallanding.service';
import type { SeccionHeroDTO } from '../../types/api/SeccionHero';
import type { RedSociallandingDTO } from '../../types/api/RedSociallanding';
import { getImageUrl } from '../../utils/imageUtils';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import defaultBack from '../../assets/imgBack.avif';


const getSocialIcon = (name: string, className?: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('facebook')) return <Facebook className={className} />;
    if (lower.includes('twitter') || lower.includes('x')) return <Twitter className={className} />;
    if (lower.includes('instagram')) return <Instagram className={className} />;
    if (lower.includes('Youtube') || lower.includes('youtube')) return <YoutubeIcon className={className} />;
    if (lower.includes('Telegram') || lower.includes('telegram')) return <Navigation className={className} />;
    if (lower.includes('Tiktok') || lower.includes('tiktok')) return <Globe className={className} />;
    return <Globe className={className} />;
};

export const HeroSection = () => {
    const { isAdmin } = useAuth();
    
    // Data States
    const [items, setItems] = useState<SeccionHeroDTO[]>([]);
    const [socials, setSocials] = useState<RedSociallandingDTO[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    // Edit States
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItems, setEditingItems] = useState<SeccionHeroDTO[]>([]);
    const [editingSocials, setEditingSocials] = useState<RedSociallandingDTO[]>([]);
    const [editIndex, setEditIndex] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            // Load Hero Sections
            const heroRes = await SeccionHeroService.getSeccionHeroes({ sort: 'orden,asc', size: 20 });
            setItems(heroRes.data); // Store all items (active and inactive)

            // Load Socials
            const socialRes = await RedSociallandingService.getRedSociallandings({ sort: 'id,asc' });
            setSocials(socialRes.data.filter(s => s.activo !== false));
            
        } catch (error) {
            console.error("Error loading landing data", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Derived state for public display
    const activeItems = items.filter(i => i.activo !== false);

    // Auto Play
    useEffect(() => {
        if (activeItems.length <= 1 || isDialogOpen) return;
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % activeItems.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [activeItems.length, isDialogOpen]);

    const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % activeItems.length);
    const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + activeItems.length) % activeItems.length);

    // Editing Logic
    const handleOpenEdit = () => {
        // Deep copy items or create default if empty
        const initialItems = items.length > 0 ? items : [{
            titulo: 'Nuevo Slide',
            descripcion: '',
            textoBoton: 'Ver Más',
            enlaceBoton: '#',
            imagenFondoUrl: '',
            orden: 0,
            activo: true
        }];
        setEditingItems(JSON.parse(JSON.stringify(initialItems)));
        setEditingSocials(JSON.parse(JSON.stringify(socials)));
        setEditIndex(0);
        setIsDialogOpen(true);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            // Upload using custom endpoint
            const res = await SeccionHeroService.uploadImage(file); // returns relative path string
            const relativePath = res.data; 
            
            // Update local state
            const newItems = [...editingItems];
            newItems[editIndex] = {
                ...newItems[editIndex],
                imagenFondoUrl: relativePath
            };
            setEditingItems(newItems);
            toast.success('Imagen subida correctamente');
        } catch (error) {
            console.error('Error uploading image', error);
            toast.error('Error al subir imagen');
        }
    };

    const handleSaveAll = async () => {
        try {
            // 1. Save Hero Items
            for (let i = 0; i < editingItems.length; i++) {
                const item = editingItems[i];
                item.orden = i;
                if (!item.titulo) item.titulo = "Slide " + (i+1);
                
                if (item.id) {
                    await SeccionHeroService.updateSeccionHero(item.id, item);
                } else {
                    const { id, ...newItem } = item;
                    await SeccionHeroService.createSeccionHero(newItem);
                }
            }

            // 2. Save Socials
            for (const sock of editingSocials) {
                if (sock.id) {
                    await RedSociallandingService.updateRedSociallanding(sock.id, sock);
                } else if (sock.nombre && sock.urlEnlace) {
                     const { id, ...newSock } = sock;
                     await RedSociallandingService.createRedSociallanding(newSock);
                }
            }
            // Deletions would need separate tracking, simpler here to just update/create

            toast.success('Cambios guardados');
            setIsDialogOpen(false);
            loadData();
        } catch (error) {
            console.error(error);
            toast.error('Error al guardar cambios');
        }
    };

    const addNewSlide = () => {
        setEditingItems([...editingItems, { 
            titulo: 'Nuevo Slide', 
            descripcion: '', 
            textoBoton: 'Ver Más', 
            enlaceBoton: '#', 
            imagenFondoUrl: '', 
            orden: editingItems.length, 
            activo: true 
        }]);
        setEditIndex(editingItems.length);
    };

    const removeSlide = async (index: number) => {
        const item = editingItems[index];
        if (item.id) {
            try {
                await SeccionHeroService.deleteSeccionHero(item.id);
            } catch (e) { console.error("Error deleting", e); }
        }
        const newItems = editingItems.filter((_, i) => i !== index);
        setEditingItems(newItems);
        setEditIndex(Math.max(0, index - 1));
    };

    // Socials Management in Edit
    const handleSocialChange = (index: number, field: keyof RedSociallandingDTO, value: string) => {
        const newSocials = [...editingSocials];
        newSocials[index] = { ...newSocials[index], [field]: value };
        setEditingSocials(newSocials);
    };

    const addNewSocial = () => {
        setEditingSocials([...editingSocials, { nombre: 'Nueva Red', urlEnlace: '#', iconoUrl: '', activo: true }]);
    };

    const removeSocial = async (index: number) => {
        const item = editingSocials[index];
        if (item.id) {
             try { await RedSociallandingService.deleteRedSociallanding(item.id); } catch(e){}
        }
        setEditingSocials(editingSocials.filter((_, i) => i !== index));
    };


    if (isLoading) return <div className="h-screen bg-black text-white flex items-center justify-center">Cargando...</div>;

    const currentItem = activeItems[currentIndex];

    return (
        <div className="relative h-screen w-full overflow-hidden bg-black group">
            
            {/* 1. Background Image (Only if item exists) */}
            {currentItem && (
                <div className="absolute inset-0">
                    <img
                        key={currentIndex}
                        src={currentItem.imagenFondoUrl ? getImageUrl(currentItem.imagenFondoUrl) : defaultBack}
                        alt={currentItem.titulo || "Hotel"}
                        className="w-full h-full object-cover transition-opacity duration-1000 opacity-90"
                    />
                    <div className="absolute inset-0 bg-black/60"></div>
                </div>
            )}

            {/* 2. Fallback State (No items) */}
            {!currentItem && (
                <div className="absolute inset-0 flex items-center justify-center flex-col gap-4 z-10">
                    <h1 className="text-3xl font-bold text-white">Bienvenido</h1>
                    {/* Center Button for Empty State */}
                    {isAdmin() && (
                        <Button onClick={handleOpenEdit} variant="outline">
                            Configurar Landing
                        </Button>
                    )}
                </div>
            )}

            {/* 3. Navigation Arrows (Only if > 1 item) */}
            {activeItems.length > 1 && (
                <>
                    <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-sm transition-all md:block hidden">
                        <ChevronLeft size={32} />
                    </button>
                    <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-sm transition-all md:block hidden">
                        <ChevronRight size={32} />
                    </button>
                    <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-30 flex gap-2">
                        {activeItems.map((_, i) => (
                            <div key={i} className={`h-1.5 rounded-full transition-all ${i === currentIndex ? 'bg-yellow-500 w-8' : 'bg-white/30 w-4'}`} />
                        ))}
                    </div>
                </>
            )}

            {/* 4. Left Sidebar - Socials (Only if content exists) */}
            {currentItem && (
                <div className="absolute left-0 top-0 h-full w-24 flex flex-col justify-end items-center pb-10 z-20 hidden md:flex border-r border-white/10">
                    <div className="flex flex-col gap-6 text-white mb-10">
                        {socials.map((sock, i) => (
                            <a key={i} href={sock.urlEnlace} target="_blank" rel="noreferrer" className="text-white hover:text-yellow-400 cursor-pointer transition-colors">
                                {getSocialIcon(sock.nombre || '', "w-5 h-5")}
                            </a>
                        ))}
                    </div>
                    
                </div>
            )}

            {/* 5. Main Content Text */}
            {currentItem && (
                <div className="relative z-10 h-full flex flex-col justify-end px-12 md:px-32 max-w-5xl pb-10 md:pb-24">
                    <div key={currentIndex} className="animate-in fade-in slide-in-from-bottom-5 duration-700">
                        <h1 className="text-5xl md:text-8xl font-black text-white leading-tight mb-6 drop-shadow-lg">
                            {currentItem.titulo || "Bienvenido"}
                        </h1>

                        <p className="text-gray-300 text-sm md:text-base max-w-2xl leading-relaxed whitespace-pre-line">
                            {currentItem.descripcion || "Disfruta tu estancia"}
                        </p>

                        <div className="mt-8">
                            <Button
                                onClick={() => {
                                    const link = currentItem.enlaceBoton || '#';
                                    if (link.startsWith('#')) {
                                        document.getElementById(link.substring(1))?.scrollIntoView({ behavior: 'smooth' });
                                    } else {
                                        window.location.href = link;
                                    }
                                }}
                                className="bg-white text-black px-8 py-3 h-auto font-bold uppercase tracking-widest hover:bg-yellow-400 border-none transition-all hover:scale-105 active:scale-95 rounded-sm text-sm"
                            >
                                {currentItem.textoBoton || 'Ver Más'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* 6. Admin Dialog (Top Right Button usually, but Component handles state) */}
            {isAdmin() && (
                <div className="absolute top-28 right-4 z-10">
                    {/* Top Right Button only shows if there is content to avoid overlapping the centered fallback button */}
                    {currentItem && (
                        <Button onClick={handleOpenEdit} variant="outline" className="bg-black/40 backdrop-blur text-white border-white/20 hover:bg-gray-800/60 hover:text-gray-300">
                            <Edit className="mr-2 h-4 w-4" /> Editar Landing
                        </Button>
                    )}

                    {/* The Dialog Component - Controlled by isDialogOpen State */}
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
                            <DialogHeader>
                                <DialogTitle className="flex justify-between items-center mr-8">
                                    <span>Gestor de Landing Page</span>
                                    <div className="flex gap-2">
                                        <Button size="sm" onClick={addNewSlide} className="bg-green-600 hover:bg-green-700 text-white">
                                            <Plus className="h-4 w-4 mr-1" /> Slide
                                        </Button>
                                    </div>
                                </DialogTitle>
                            </DialogHeader>

                            <div className="flex flex-1 gap-6 overflow-hidden pt-4">
                                {/* Lista Lateral Slides */}
                                <div className="w-1/3 border-r pr-4 overflow-y-auto space-y-2">
                                    <h4 className="font-bold text-sm mb-2 text-gray-500">Slides Hero</h4>
                                    {editingItems.map((item, idx) => (
                                        <div 
                                            key={idx}
                                            onClick={() => setEditIndex(idx)}
                                            className={`p-3 rounded-lg border cursor-pointer flex gap-2 items-center transition-colors ${idx === editIndex ? 'bg-yellow-50 border-yellow-500' : 'hover:bg-gray-50 border-gray-200'} ${item.activo === false ? 'opacity-50 grayscale' : ''}`}
                                        >
                                            <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                                                {item.imagenFondoUrl ? (
                                                    <img src={getImageUrl(item.imagenFondoUrl)} className="w-full h-full object-cover" />
                                                ) : <div className="w-full h-full bg-slate-300"/>}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold truncate">
                                                    {item.titulo || "Nuevo"}
                                                    {item.activo === false && <span className="text-xs font-normal text-red-500 ml-1">(Inactivo)</span>}
                                                </p>
                                                <p className="text-xs text-gray-500 truncate">Orden: {idx}</p>
                                            </div>
                                            <Button 
                                                variant="ghost" size="icon" 
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                onClick={(e) => { e.stopPropagation(); removeSlide(idx); }}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    
                                    <div className="mt-8 border-t pt-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <h4 className="font-bold text-sm text-gray-500">Redes Sociales</h4>
                                            <Button size="sm" variant="ghost" onClick={addNewSocial}><Plus className="h-3 w-3"/></Button>
                                        </div>
                                        {editingSocials.map((sock, i) => (
                                            <div key={i} className="flex gap-2 mb-2 items-center">
                                                {getSocialIcon(sock.nombre || '', "h-4 w-4 text-gray-500")}
                                                <Input 
                                                    value={sock.nombre} 
                                                    onChange={(e) => handleSocialChange(i, 'nombre', e.target.value)}
                                                    className="h-8 text-xs w-20" placeholder="Nombre"
                                                />
                                                <Input 
                                                    value={sock.urlEnlace} 
                                                    onChange={(e) => handleSocialChange(i, 'urlEnlace', e.target.value)}
                                                    className="h-8 text-xs flex-1" placeholder="URL"
                                                />
                                                <Button size="icon" variant="ghost" className="h-6 w-6 text-red-500" onClick={() => removeSocial(i)}><Trash2 className="h-3 w-3"/></Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Formulario Central (Slide Seleccionado) */}
                                <div className="w-2/3 overflow-y-auto pl-2 pr-2">
                                    {editingItems[editIndex] && (
                                        <div className="space-y-4 animate-in fade-in duration-300">
                                            <div className="flex justify-between items-start">
                                                <div className="grid gap-2 flex-1 mr-4">
                                                    <Label>Título del Slide</Label>
                                                    <Input 
                                                        value={editingItems[editIndex].titulo || ''} 
                                                        onChange={e => {
                                                            const newS = [...editingItems];
                                                            newS[editIndex].titulo = e.target.value;
                                                            setEditingItems(newS);
                                                        }} 
                                                    />
                                                </div>
                                                <div className="flex flex-col items-center gap-2 pt-6">
                                                    <Label className="text-xs">Activo</Label>
                                                    <Switch
                                                        checked={editingItems[editIndex].activo !== false}
                                                        onCheckedChange={(checked: boolean) => {
                                                            const newS = [...editingItems];
                                                            newS[editIndex].activo = checked;
                                                            setEditingItems(newS);
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid gap-2">
                                                <Label>Descripción</Label>
                                                <Textarea 
                                                    value={editingItems[editIndex].descripcion || ''} 
                                                    onChange={e => {
                                                        const newS = [...editingItems];
                                                        newS[editIndex].descripcion = e.target.value;
                                                        setEditingItems(newS);
                                                    }} 
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="grid gap-2">
                                                    <Label>Texto Botón</Label>
                                                    <Input 
                                                        value={editingItems[editIndex].textoBoton || ''} 
                                                        onChange={e => {
                                                            const newS = [...editingItems];
                                                            newS[editIndex].textoBoton = e.target.value;
                                                            setEditingItems(newS);
                                                        }} 
                                                    />
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label>Link (#id o https://)</Label>
                                                    <div className="relative">
                                                        <LinkIcon className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                                                        <Input className="pl-8"
                                                            value={editingItems[editIndex].enlaceBoton || ''} 
                                                            onChange={e => {
                                                                const newS = [...editingItems];
                                                                newS[editIndex].enlaceBoton = e.target.value;
                                                                setEditingItems(newS);
                                                            }} 
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Imagen */}
                                            <div className="border-t pt-4 mt-4">
                                                <h4 className="font-bold mb-3">Fondo e Imagen</h4>
                                                <div className="flex gap-4 items-start">
                                                    {editingItems[editIndex].imagenFondoUrl ? (
                                                        <img src={getImageUrl(editingItems[editIndex].imagenFondoUrl)} className="w-40 h-24 object-cover rounded-md border bg-gray-100" />
                                                    ) : <div className="w-40 h-24 bg-gray-100 rounded border flex items-center justify-center text-xs text-gray-400">Sin Imagen</div>}
                                                    
                                                    <div className="flex-1 space-y-4">
                                                        <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full">
                                                            <ImageIcon className="mr-2 h-4 w-4" /> Cambiar Imagen
                                                        </Button>
                                                        <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                                        <p className="text-xs text-gray-400">Se guardará en /images/landing/</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <DialogFooter className="mt-4 border-t pt-4">
                                <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                                <Button onClick={handleSaveAll} className="bg-yellow-500 hover:bg-yellow-600 text-black">
                                    <Save className="mr-2 h-4 w-4" /> Guardar Todo
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            )}
        </div>
    );
};
