import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { 
    Pencil, 
    Trash2, 
    Plus, 
    Tag, 
    Activity, 
    Settings, 
    Loader2,
    CheckCircle2,
    DollarSign
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

// --- SERVICES & TYPES ---
import { CategoriaHabitacionService, EstadoHabitacionService } from '../../services';
import type { CategoriaHabitacionDTO, NewCategoriaHabitacionDTO } from '../../types/api/CategoriaHabitacion';
import type { EstadoHabitacionDTO, NewEstadoHabitacionDTO } from '../../types/api/EstadoHabitacion';

export const AdminConfiguracion = () => {
    const [activeTab, setActiveTab] = useState<'categorias' | 'estados'>('categorias');

    // --- ESTADOS ---
    const [categorias, setCategorias] = useState<CategoriaHabitacionDTO[]>([]);
    const [estados, setEstados] = useState<EstadoHabitacionDTO[]>([]);
    const [loading, setLoading] = useState(false);

    // Dialogs
    const [isCatDialogOpen, setIsCatDialogOpen] = useState(false);
    const [currentCat, setCurrentCat] = useState<Partial<CategoriaHabitacionDTO>>({});
    
    const [isEstDialogOpen, setIsEstDialogOpen] = useState(false);
    const [currentEst, setCurrentEst] = useState<Partial<EstadoHabitacionDTO>>({});

    // --- CARGA DE DATOS ---
    const loadData = async () => {
        setLoading(true);
        try {
            const [catRes, estRes] = await Promise.all([
                CategoriaHabitacionService.getCategorias(),
                EstadoHabitacionService.getEstados()
            ]);
            setCategorias(catRes.data);
            setEstados(estRes.data);
        } catch (error) {
            toast.error('Error al cargar la configuración del sistema');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // --- MANEJADORES DE CATEGORÍAS ---
    const handleSaveCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (currentCat.id) {
                await CategoriaHabitacionService.updateCategoria(currentCat.id, currentCat as CategoriaHabitacionDTO);
                toast.success('Categoría actualizada');
            } else {
                await CategoriaHabitacionService.createCategoria({ ...currentCat, activo: true } as NewCategoriaHabitacionDTO);
                toast.success('Nueva categoría creada');
            }
            setIsCatDialogOpen(false);
            loadData();
        } catch (error) {
            toast.error('No se pudo guardar la categoría');
        }
    };

    const handleDeleteCategory = async (id: number) => {
        if (!confirm('¿Eliminar esta categoría? Podría afectar habitaciones existentes.')) return;
        try {
            await CategoriaHabitacionService.deleteCategoria(id);
            toast.success('Categoría eliminada');
            loadData();
        } catch (error) {
            toast.error('No se puede eliminar (en uso)');
        }
    };

    // --- MANEJADORES DE ESTADOS ---
    const handleSaveStatus = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (currentEst.id) {
                await EstadoHabitacionService.updateEstado(currentEst.id, currentEst as EstadoHabitacionDTO);
                toast.success('Estado actualizado');
            } else {
                await EstadoHabitacionService.createEstado({ ...currentEst, activo: true } as NewEstadoHabitacionDTO);
                toast.success('Nuevo estado operativo creado');
            }
            setIsEstDialogOpen(false);
            loadData();
        } catch (error) {
            toast.error('No se pudo guardar el estado');
        }
    };

    const handleDeleteStatus = async (id: number) => {
        if (!confirm('¿Eliminar este estado operativo?')) return;
        try {
            await EstadoHabitacionService.deleteEstado(id);
            toast.success('Estado eliminado');
            loadData();
        } catch (error) {
            toast.error('No se puede eliminar (en uso)');
        }
    };

    // --- RENDER ---
    return (
        <div className="bg-gray-50 min-h-screen font-sans">
            <Navbar />

            {/* --- HERO SECTION --- */}
            <div className="bg-slate-900 pt-32 pb-24 px-6 relative border-b border-slate-800">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-end relative z-10 gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2 text-yellow-400">
                            <Settings size={16} />
                            <span className="text-xs font-bold uppercase tracking-widest">Configuración</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-wider">
                            Parámetros del Sistema
                        </h1>
                        <p className="text-slate-400 mt-2 max-w-xl">
                            Administra las categorías de habitaciones, precios base y los estados operativos del flujo de trabajo.
                        </p>
                    </div>
                </div>
            </div>

            {/* --- CONTENIDO PRINCIPAL --- */}
            <div className="max-w-6xl mx-auto px-6 -mt-16 pb-20 relative z-20">
                
                {/* Tabs Navigation */}
                <div className="flex gap-4 mb-6">
                    <button
                        onClick={() => setActiveTab('categorias')}
                        className={`flex items-center gap-2 px-6 py-4 rounded-t-lg font-bold text-sm transition-all shadow-sm
                        ${activeTab === 'categorias' 
                            ? 'bg-white text-slate-900 border-b-4 border-yellow-500 translate-y-1' 
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'}`}
                    >
                        <Tag size={16} /> Categorías y Tarifas
                    </button>
                    <button
                        onClick={() => setActiveTab('estados')}
                        className={`flex items-center gap-2 px-6 py-4 rounded-t-lg font-bold text-sm transition-all shadow-sm
                        ${activeTab === 'estados' 
                            ? 'bg-white text-slate-900 border-b-4 border-yellow-500 translate-y-1' 
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'}`}
                    >
                        <Activity size={16} /> Estados Operativos
                    </button>
                </div>

                {/* Panel Content */}
                <div className="bg-white rounded-b-xl rounded-tr-xl shadow-lg border border-gray-100 overflow-hidden min-h-[400px]">
                    
                    {/* --- TAB: CATEGORÍAS --- */}
                    {activeTab === 'categorias' && (
                        <div>
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900">Catálogo de Habitaciones</h3>
                                    <p className="text-sm text-gray-500">Define los tipos de habitación y sus precios base.</p>
                                </div>
                                <Button onClick={() => { setCurrentCat({}); setIsCatDialogOpen(true); }} className="bg-yellow-600 hover:bg-yellow-700 text-white">
                                    <Plus className="mr-2 h-4 w-4" /> Nueva Categoría
                                </Button>
                            </div>
                            
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="pl-6 w-[200px]">Nombre</TableHead>
                                        <TableHead>Descripción</TableHead>
                                        <TableHead className="w-[150px]">Precio Base</TableHead>
                                        <TableHead className="text-right pr-6 w-[100px]">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow><TableCell colSpan={4} className="h-40 text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin text-yellow-500"/></TableCell></TableRow>
                                    ) : (
                                        categorias.map(cat => (
                                            <TableRow key={cat.id} className="hover:bg-yellow-50/30 transition-colors">
                                                <TableCell className="pl-6 font-bold text-gray-800">{cat.nombre}</TableCell>
                                                <TableCell className="text-gray-500 text-sm">{cat.descripcion || 'Sin descripción'}</TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 border-emerald-200 font-mono">
                                                        ${cat.precioBase}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right pr-6">
                                                    <div className="flex justify-end gap-1">
                                                        <Button variant="ghost" size="icon" onClick={() => { setCurrentCat(cat); setIsCatDialogOpen(true); }} className="hover:text-yellow-600">
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteCategory(cat.id!)} className="hover:text-red-600">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    {/* --- TAB: ESTADOS --- */}
                    {activeTab === 'estados' && (
                        <div>
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900">Flujo de Estados</h3>
                                    <p className="text-sm text-gray-500">Configura los estados posibles para habitaciones (Ej: Disponible, Mantenimiento).</p>
                                </div>
                                <Button onClick={() => { setCurrentEst({}); setIsEstDialogOpen(true); }} className="bg-yellow-600 hover:bg-yellow-700 text-white">
                                    <Plus className="mr-2 h-4 w-4" /> Nuevo Estado
                                </Button>
                            </div>

                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="pl-6 w-[200px]">Estado</TableHead>
                                        <TableHead>Descripción Operativa</TableHead>
                                        <TableHead className="text-right pr-6 w-[100px]">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow><TableCell colSpan={3} className="h-40 text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin text-yellow-500"/></TableCell></TableRow>
                                    ) : (
                                        estados.map(est => (
                                            <TableRow key={est.id} className="hover:bg-yellow-50/30 transition-colors">
                                                <TableCell className="pl-6">
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle2 size={16} className="text-yellow-500"/>
                                                        <span className="font-bold text-gray-800">{est.nombre}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-gray-500 text-sm">{est.descripcion || '---'}</TableCell>
                                                <TableCell className="text-right pr-6">
                                                    <div className="flex justify-end gap-1">
                                                        <Button variant="ghost" size="icon" onClick={() => { setCurrentEst(est); setIsEstDialogOpen(true); }} className="hover:text-yellow-600">
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteStatus(est.id!)} className="hover:text-red-600">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>
            </div>

            {/* --- MODAL CATEGORÍA --- */}
            <Dialog open={isCatDialogOpen} onOpenChange={setIsCatDialogOpen}>
                <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden gap-0 rounded-xl">
                    <DialogHeader className="bg-gray-50 p-6 border-b border-gray-100">
                        <DialogTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
                            <Tag className="h-5 w-5 text-yellow-600"/>
                            {currentCat.id ? 'Editar Categoría' : 'Nueva Categoría'}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSaveCategory} className="p-6 grid gap-4">
                        <div className="grid gap-2">
                            <Label className="text-xs font-bold uppercase text-gray-500">Nombre de Categoría</Label>
                            <Input 
                                placeholder="Ej: Suite Presidencial" 
                                value={currentCat.nombre || ''} 
                                onChange={e => setCurrentCat({ ...currentCat, nombre: e.target.value })} 
                                required 
                                className="bg-gray-50 border-gray-200 py-5"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label className="text-xs font-bold uppercase text-gray-500">Precio por Noche</Label>
                            <div className="relative">
                                <Input 
                                    type="number" 
                                    step="0.01" 
                                    placeholder="0.00"
                                    value={currentCat.precioBase || ''} 
                                    onChange={e => setCurrentCat({ ...currentCat, precioBase: e.target.value })} 
                                    required 
                                    className="bg-gray-50 border-gray-200 py-5 pl-10"
                                />
                                <DollarSign className="absolute left-3 top-3 text-gray-400 h-4 w-4"/>
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label className="text-xs font-bold uppercase text-gray-500">Descripción</Label>
                            <Input 
                                placeholder="Detalles de la habitación..." 
                                value={currentCat.descripcion || ''} 
                                onChange={e => setCurrentCat({ ...currentCat, descripcion: e.target.value })} 
                                className="bg-gray-50 border-gray-200 py-5"
                            />
                        </div>
                        <DialogFooter className="pt-4 mt-2">
                            <Button type="button" variant="outline" onClick={() => setIsCatDialogOpen(false)}>Cancelar</Button>
                            <Button type="submit" className="bg-yellow-600 hover:bg-yellow-700">Guardar Cambios</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* --- MODAL ESTADO --- */}
            <Dialog open={isEstDialogOpen} onOpenChange={setIsEstDialogOpen}>
                <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden gap-0 rounded-xl">
                    <DialogHeader className="bg-gray-50 p-6 border-b border-gray-100">
                        <DialogTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
                            <Activity className="h-5 w-5 text-yellow-600"/>
                            {currentEst.id ? 'Editar Estado' : 'Nuevo Estado Operativo'}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSaveStatus} className="p-6 grid gap-4">
                        <div className="grid gap-2">
                            <Label className="text-xs font-bold uppercase text-gray-500">Nombre del Estado</Label>
                            <Input 
                                placeholder="Ej: EN LIMPIEZA" 
                                value={currentEst.nombre || ''} 
                                onChange={e => setCurrentEst({ ...currentEst, nombre: e.target.value })} 
                                required 
                                className="bg-gray-50 border-gray-200 py-5"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label className="text-xs font-bold uppercase text-gray-500">Descripción</Label>
                            <Input 
                                placeholder="Cuándo se aplica este estado..." 
                                value={currentEst.descripcion || ''} 
                                onChange={e => setCurrentEst({ ...currentEst, descripcion: e.target.value })} 
                                className="bg-gray-50 border-gray-200 py-5"
                            />
                        </div>
                        <DialogFooter className="pt-4 mt-2">
                            <Button type="button" variant="outline" onClick={() => setIsEstDialogOpen(false)}>Cancelar</Button>
                            <Button type="submit" className="bg-yellow-600 hover:bg-yellow-700">Guardar Cambios</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Footer />
        </div>
    );
};