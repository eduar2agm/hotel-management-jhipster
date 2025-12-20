import { useEffect, useState } from 'react';
import { Navbar } from '../../components/ui/Navbar';
import { Footer } from '../../components/ui/Footer';
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
import { CategoriaHabitacionService } from '../../services/categoria-habitacion.service';
import { EstadoHabitacionService } from '../../services/estado-habitacion.service';
import { type CategoriaHabitacionDTO, type NewCategoriaHabitacionDTO, type CategoriaHabitacionNombreType } from '../../types/api/CategoriaHabitacion';
import { type EstadoHabitacionDTO, type NewEstadoHabitacionDTO, type EstadoHabitacionNombreType } from '../../types/api/EstadoHabitacion';
import { toast } from 'sonner';
import { Pencil, Trash2, Plus, Tag, Activity, Settings, LayoutGrid, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const AdminConfiguracion = () => {
    const [activeTab, setActiveTab] = useState<'categorias' | 'estados'>('categorias');

    // Categorias State
    const [categorias, setCategorias] = useState<CategoriaHabitacionDTO[]>([]);
    const [isLoadingCategorias, setIsLoadingCategorias] = useState(false);
    const [isCatDialogOpen, setIsCatDialogOpen] = useState(false);
    const [currentCat, setCurrentCat] = useState<Partial<CategoriaHabitacionDTO>>({});

    // Estados State
    const [estados, setEstados] = useState<EstadoHabitacionDTO[]>([]);
    const [isLoadingEstados, setIsLoadingEstados] = useState(false);
    const [isEstDialogOpen, setIsEstDialogOpen] = useState(false);
    const [currentEst, setCurrentEst] = useState<Partial<EstadoHabitacionDTO>>({});

    // Unified Pagination State
    const [currentPage, setCurrentPage] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const itemsPerPage = 10;

    const loadCategorias = async (page: number) => {
        setIsLoadingCategorias(true);
        try {
            const res = await CategoriaHabitacionService.getCategorias({
                page: page,
                size: itemsPerPage,
                sort: 'id,asc'
            });
            setCategorias(res.data);
            const total = parseInt(res.headers['x-total-count'] || '0', 10);
            if (activeTab === 'categorias') setTotalItems(total);
        } catch (error) {
            toast.error('Error al cargar categorías');
        } finally {
            setIsLoadingCategorias(false);
        }
    };

    const loadEstados = async (page: number) => {
        setIsLoadingEstados(true);
        try {
            const res = await EstadoHabitacionService.getEstados({
                page: page,
                size: itemsPerPage,
                sort: 'id,asc'
            });
            setEstados(res.data);
            const total = parseInt(res.headers['x-total-count'] || '0', 10);
            if (activeTab === 'estados') setTotalItems(total);
        } catch (error) {
            toast.error('Error al cargar estados');
        } finally {
            setIsLoadingEstados(false);
        }
    };

    // Reset pagination when tab changes
    useEffect(() => {
        setCurrentPage(0);
    }, [activeTab]);

    // Consolidate data loading
    useEffect(() => {
        if (activeTab === 'categorias') {
            loadCategorias(currentPage);
        } else {
            loadEstados(currentPage);
        }
    }, [activeTab, currentPage]);

    // Handlers for Categories
    const handleSaveCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (currentCat.id) {
                await CategoriaHabitacionService.updateCategoria(currentCat.id, currentCat as CategoriaHabitacionDTO);
                toast.success('Categoría actualizada');
            } else {
                await CategoriaHabitacionService.createCategoria({ ...currentCat, activo: true } as NewCategoriaHabitacionDTO);
                toast.success('Categoría creada');
            }
            setIsCatDialogOpen(false);
            loadCategorias(currentPage);
        } catch (error) {
            toast.error('Error al guardar categoría');
        }
    };

    const handleDeleteCategory = async (id: number) => {
        if (!confirm('¿Eliminar categoría?')) return;
        try {
            await CategoriaHabitacionService.deleteCategoria(id);
            toast.success('Categoría eliminada');
            loadCategorias(currentPage);
        } catch (error) {
            toast.error('Error al eliminar (puede estar en uso)');
        }
    };

    // Handlers for Statuses
    const handleSaveStatus = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (currentEst.id) {
                await EstadoHabitacionService.updateEstado(currentEst.id, currentEst as EstadoHabitacionDTO);
                toast.success('Estado actualizado');
            } else {
                await EstadoHabitacionService.createEstado({ ...currentEst, activo: true } as NewEstadoHabitacionDTO);
                toast.success('Estado creado');
            }
            setIsEstDialogOpen(false);
            loadEstados(currentPage);
        } catch (error) {
            toast.error('Error al guardar estado');
        }
    };

    const handleDeleteStatus = async (id: number) => {
        if (!confirm('¿Eliminar estado?')) return;
        try {
            await EstadoHabitacionService.deleteEstado(id);
            toast.success('Estado eliminado');
            loadEstados(currentPage);
        } catch (error) {
            toast.error('Error al eliminar (puede estar en uso)');
        }
    };

    return (
        <div className="font-sans text-gray-900 bg-gray-50 min-h-screen flex flex-col">
            <Navbar />

            {/* HERO SECTION */}
            <div className="bg-[#0F172A] pt-32 pb-20 px-4 md:px-8 lg:px-20 relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 pointer-events-none">
                    <Settings className="w-96 h-96 text-white" />
                </div>
                <div className="relative max-w-7xl mx-auto z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <span className="text-yellow-500 font-bold tracking-[0.2em] uppercase text-xs mb-2 block">Sistema</span>
                        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-2">
                            Configuración General
                        </h1>
                        <p className="text-slate-400 text-lg max-w-2xl">
                            Gestione los catálogos principales del hotel, incluyendo categorías de habitaciones y sus estados operativos.
                        </p>
                    </div>
                </div>
            </div>

            <main className="flex-grow py-5 px-4 md:px-8 lg:px-20 -mt-10 relative z-10">
                <div className="max-w-7xl mx-auto space-y-6">

                    {/* STATS GRID */}
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card className="bg-white border-none shadow-lg border-l-4 border-l-indigo-500">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between space-y-0 pb-2">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Categorías Activas</p>
                                    <div className="bg-indigo-100 p-2 rounded-full">
                                        <LayoutGrid className="h-5 w-5 text-indigo-600" />
                                    </div>
                                </div>
                                <div className="text-2xl font-black text-gray-800 mt-2">{categorias.length}</div>
                                <p className="text-xs text-gray-400 mt-1">Tipos de habitación definidos</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-white border-none shadow-lg border-l-4 border-l-pink-500">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between space-y-0 pb-2">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Estados Operativos</p>
                                    <div className="bg-pink-100 p-2 rounded-full">
                                        <CheckCircle className="h-5 w-5 text-pink-600" />
                                    </div>
                                </div>
                                <div className="text-2xl font-black text-gray-800 mt-2">{estados.length}</div>
                                <p className="text-xs text-gray-400 mt-1">Ciclos de vida configurados</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* TABS HEADER */}
                    <div className="flex flex-wrap gap-4 mb-4">
                        <Button
                            onClick={() => setActiveTab('categorias')}
                            className={`h-12 px-6 rounded-full shadow-lg transition-all text-base font-bold tracking-wide ${activeTab === 'categorias'
                                ? 'bg-indigo-600 hover:bg-indigo-700 text-white ring-4 ring-indigo-600/20'
                                : 'bg-white text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
                                }`}
                        >
                            <Tag className="mr-2 h-5 w-5" /> Categorías
                        </Button>
                        <Button
                            onClick={() => setActiveTab('estados')}
                            className={`h-12 px-6 rounded-full shadow-lg transition-all text-base font-bold tracking-wide ${activeTab === 'estados'
                                ? 'bg-indigo-600 hover:bg-indigo-700 text-white ring-4 ring-indigo-600/20'
                                : 'bg-white text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
                                }`}
                        >
                            <Activity className="mr-2 h-5 w-5" /> Estados
                        </Button>
                    </div>

                    {/* MAIN CONTENT AREA */}
                    <div className="grid gap-6">
                        {activeTab === 'categorias' && (
                            <Card className="bg-white border-0 shadow-xl overflow-hidden rounded-2xl">
                                <CardHeader className="border-b border-gray-100 bg-white p-6 flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle className="text-2xl font-bold text-gray-800">Categorías de Habitación</CardTitle>
                                        <p className="text-gray-500 text-sm mt-1">Defina los tipos de habitaciones y sus precios base.</p>
                                    </div>
                                    <Button
                                        onClick={() => { setCurrentCat({}); setIsCatDialogOpen(true); }}
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
                                            {isLoadingCategorias ? (
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
                                                                <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-indigo-50 hover:text-indigo-600 rounded-full" onClick={() => { setCurrentCat(cat); setIsCatDialogOpen(true); }}>
                                                                    <Pencil className="h-5 w-5" />
                                                                </Button>
                                                                <Button variant="ghost" size="icon" className="h-10 w-10 text-gray-400 hover:bg-red-50 hover:text-red-600 rounded-full" onClick={() => handleDeleteCategory(cat.id!)}>
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
                        )}

                        {activeTab === 'estados' && (
                            <Card className="bg-white border-0 shadow-xl overflow-hidden rounded-2xl">
                                <CardHeader className="border-b border-gray-100 bg-white p-6 flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle className="text-2xl font-bold text-gray-800">Estados de Habitación</CardTitle>
                                        <p className="text-gray-500 text-sm mt-1">Gestione los ciclos de vida y disponibilidad.</p>
                                    </div>
                                    <Button
                                        onClick={() => { setCurrentEst({}); setIsEstDialogOpen(true); }}
                                        className="bg-blue-600 hover:bg-blue-700 text-white shadow-md rounded-full px-6 transition-all hover:scale-105"
                                    >
                                        <Plus className="mr-2 h-5 w-5" /> Nuevo Estado
                                    </Button>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader className="bg-gray-50">
                                            <TableRow>
                                                <TableHead className="font-bold text-gray-600 py-5 pl-8">ESTADO</TableHead>
                                                <TableHead className="font-bold text-gray-600 py-5">DESCRIPCIÓN</TableHead>
                                                <TableHead className="font-bold text-gray-600 py-5 text-right pr-8">ACCIONES</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {isLoadingEstados ? (
                                                <TableRow><TableCell colSpan={3} className="h-32 text-center text-gray-500">Cargando datos...</TableCell></TableRow>
                                            ) : estados.length === 0 ? (
                                                <TableRow><TableCell colSpan={3} className="h-32 text-center text-gray-500">No hay estados registradas.</TableCell></TableRow>
                                            ) : (
                                                estados.map(est => (
                                                    <TableRow key={est.id} className="hover:bg-gray-50/80 transition-colors border-b border-gray-100">
                                                        <TableCell className="py-5 pl-8">
                                                            <div className="flex items-center gap-4">
                                                                <div className={`p-2.5 rounded-full shadow-sm ${est.nombre === 'DISPONIBLE' ? 'bg-green-100 text-green-700' :
                                                                    est.nombre === 'OCUPADA' ? 'bg-red-100 text-red-700' :
                                                                        est.nombre === 'MANTENIMIENTO' ? 'bg-orange-100 text-orange-700' :
                                                                            'bg-gray-100 text-gray-700'
                                                                    }`}>
                                                                    <Activity className="w-5 h-5" />
                                                                </div>
                                                                <span className="font-bold text-gray-800 text-lg">{est.nombre}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="py-5 text-gray-600 text-base">{est.descripcion}</TableCell>
                                                        <TableCell className="py-5 text-right pr-8">
                                                            <div className="flex justify-end gap-2">
                                                                <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-indigo-50 hover:text-indigo-600 rounded-full" onClick={() => { setCurrentEst(est); setIsEstDialogOpen(true); }}>
                                                                    <Pencil className="h-5 w-5" />
                                                                </Button>
                                                                <Button variant="ghost" size="icon" className="h-10 w-10 text-gray-400 hover:bg-red-50 hover:text-red-600 rounded-full" onClick={() => handleDeleteStatus(est.id!)}>
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
                        )}

                        {/* UNIFIED PAGINATION */}
                        <div className="flex items-center justify-end gap-4 px-6 pb-6 pt-4 bg-white/50 rounded-xl">
                            <span className="text-sm text-gray-500">
                                Página {currentPage + 1} de {Math.max(1, Math.ceil(totalItems / itemsPerPage))}
                            </span>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                                    disabled={currentPage === 0 || (activeTab === 'categorias' ? isLoadingCategorias : isLoadingEstados)}
                                    className="bg-white border-gray-200"
                                >
                                    <ChevronLeft className="h-4 w-4" /> Anterior
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(p => p + 1)}
                                    disabled={(currentPage + 1) * itemsPerPage >= totalItems || (activeTab === 'categorias' ? isLoadingCategorias : isLoadingEstados)}
                                    className="bg-white border-gray-200"
                                >
                                    Siguiente <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                    </div>
                </div>

                {/* DIALOGS */}
                <Dialog open={isCatDialogOpen} onOpenChange={setIsCatDialogOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold text-gray-900">{currentCat.id ? 'Editar' : 'Crear'} Categoría</DialogTitle>
                            <DialogDescription>
                                Complete la información para configurar la categoría de habitación.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSaveCategory} className="grid gap-6 py-4">
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
                                    value={currentCat.precioBase || ''}
                                    onChange={e => setCurrentCat({ ...currentCat, precioBase: parseFloat(e.target.value) })}
                                    required
                                    className="font-mono"
                                />
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="ghost" onClick={() => setIsCatDialogOpen(false)}>Cancelar</Button>
                                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">Guardar Cambios</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                <Dialog open={isEstDialogOpen} onOpenChange={setIsEstDialogOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold text-gray-900">{currentEst.id ? 'Editar' : 'Crear'} Estado</DialogTitle>
                            <DialogDescription>
                                Defina el estado operativo para el control de habitaciones.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSaveStatus} className="grid gap-6 py-4">
                            <div className="grid gap-2">
                                <Label className="text-sm font-semibold text-gray-700">Estado</Label>
                                <Select
                                    value={currentEst.nombre || ''}
                                    onValueChange={(value) => setCurrentEst({ ...currentEst, nombre: value as EstadoHabitacionNombreType })}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccione..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="DISPONIBLE">DISPONIBLE</SelectItem>
                                        <SelectItem value="OCUPADA">OCUPADA</SelectItem>
                                        <SelectItem value="MANTENIMIENTO">MANTENIMIENTO</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label className="text-sm font-semibold text-gray-700">Descripción</Label>
                                <Input
                                    value={currentEst.descripcion || ''}
                                    onChange={e => setCurrentEst({ ...currentEst, descripcion: e.target.value })}
                                />
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="ghost" onClick={() => setIsEstDialogOpen(false)}>Cancelar</Button>
                                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">Guardar Cambios</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

            </main>
            <Footer />
        </div>
    );
};
