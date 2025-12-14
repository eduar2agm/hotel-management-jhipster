import { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
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
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CategoriaHabitacionService } from '../../services/categoria-habitacion.service';
import { EstadoHabitacionService } from '../../services/estado-habitacion.service';
import { type CategoriaHabitacionDTO, type NewCategoriaHabitacionDTO } from '../../types/api/CategoriaHabitacion';
import { type EstadoHabitacionDTO, type NewEstadoHabitacionDTO } from '../../types/api/EstadoHabitacion';
import { toast } from 'sonner';
import { Pencil, Trash2, Plus, Tag, Activity } from 'lucide-react';
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

    const loadCategorias = async () => {
        setIsLoadingCategorias(true);
        try {
            const res = await CategoriaHabitacionService.getCategorias();
            setCategorias(res.data);
        } catch (error) {
            toast.error('Error al cargar categorías');
        } finally {
            setIsLoadingCategorias(false);
        }
    };

    const loadEstados = async () => {
        setIsLoadingEstados(true);
        try {
            const res = await EstadoHabitacionService.getEstados();
            setEstados(res.data);
        } catch (error) {
            toast.error('Error al cargar estados');
        } finally {
            setIsLoadingEstados(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'categorias') loadCategorias();
        else loadEstados();
    }, [activeTab]);

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
            loadCategorias();
        } catch (error) {
            toast.error('Error al guardar categoría');
        }
    };

    const handleDeleteCategory = async (id: number) => {
        if (!confirm('¿Eliminar categoría?')) return;
        try {
            await CategoriaHabitacionService.deleteCategoria(id);
            toast.success('Categoría eliminada');
            loadCategorias();
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
            loadEstados();
        } catch (error) {
            toast.error('Error al guardar estado');
        }
    };

    const handleDeleteStatus = async (id: number) => {
        if (!confirm('¿Eliminar estado?')) return;
        try {
            await EstadoHabitacionService.deleteEstado(id);
            toast.success('Estado eliminado');
            loadEstados();
        } catch (error) {
            toast.error('Error al eliminar (puede estar en uso)');
        }
    };

    return (
        <DashboardLayout title="Configuración del Sistema" role="Administrador">
            <div className="flex gap-2 mb-6 border-b pb-1">
                <Button
                    variant={activeTab === 'categorias' ? 'default' : 'ghost'}
                    onClick={() => setActiveTab('categorias')}
                    className="flex gap-2"
                >
                    <Tag className="h-4 w-4" /> Categorías de Habitación
                </Button>
                <Button
                    variant={activeTab === 'estados' ? 'default' : 'ghost'}
                    onClick={() => setActiveTab('estados')}
                    className="flex gap-2"
                >
                    <Activity className="h-4 w-4" /> Estados de Habitación
                </Button>
            </div>

            {activeTab === 'categorias' && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Gestión de Categorías</CardTitle>
                        <Button onClick={() => { setCurrentCat({}); setIsCatDialogOpen(true); }}>
                            <Plus className="mr-2 h-4 w-4" /> Nueva Categoría
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nombre</TableHead>
                                    <TableHead>Descripción</TableHead>
                                    <TableHead>Precio Base</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoadingCategorias ? (
                                    <TableRow><TableCell colSpan={4}>Cargando...</TableCell></TableRow>
                                ) : (
                                    categorias.map(cat => (
                                        <TableRow key={cat.id}>
                                            <TableCell>{cat.nombre}</TableCell>
                                            <TableCell>{cat.descripcion}</TableCell>
                                            <TableCell>${cat.precioBase}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" onClick={() => { setCurrentCat(cat); setIsCatDialogOpen(true); }}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDeleteCategory(cat.id!)}>
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
            )}

            {activeTab === 'estados' && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Gestión de Estados</CardTitle>
                        <Button onClick={() => { setCurrentEst({}); setIsEstDialogOpen(true); }}>
                            <Plus className="mr-2 h-4 w-4" /> Nuevo Estado
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nombre</TableHead>
                                    <TableHead>Descripción</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoadingEstados ? (
                                    <TableRow><TableCell colSpan={3}>Cargando...</TableCell></TableRow>
                                ) : (
                                    estados.map(est => (
                                        <TableRow key={est.id}>
                                            <TableCell>{est.nombre}</TableCell>
                                            <TableCell>{est.descripcion}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" onClick={() => { setCurrentEst(est); setIsEstDialogOpen(true); }}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDeleteStatus(est.id!)}>
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
            )}

            {/* Dialog Categoría */}
            <Dialog open={isCatDialogOpen} onOpenChange={setIsCatDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{currentCat.id ? 'Editar' : 'Nueva'} Categoría</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSaveCategory} className="grid gap-4">
                        <div className="grid gap-2">
                            <Label>Nombre</Label>
                            <Input value={currentCat.nombre || ''} onChange={e => setCurrentCat({ ...currentCat, nombre: e.target.value })} required />
                        </div>
                        <div className="grid gap-2">
                            <Label>Descripción</Label>
                            <Input value={currentCat.descripcion || ''} onChange={e => setCurrentCat({ ...currentCat, descripcion: e.target.value })} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Precio Base</Label>
                            <Input type="number" step="0.01" value={currentCat.precioBase || ''} onChange={e => setCurrentCat({ ...currentCat, precioBase: e.target.value })} required />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsCatDialogOpen(false)}>Cancelar</Button>
                            <Button type="submit">Guardar</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Dialog Estado */}
            <Dialog open={isEstDialogOpen} onOpenChange={setIsEstDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{currentEst.id ? 'Editar' : 'Nuevo'} Estado</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSaveStatus} className="grid gap-4">
                        <div className="grid gap-2">
                            <Label>Nombre</Label>
                            <Input value={currentEst.nombre || ''} onChange={e => setCurrentEst({ ...currentEst, nombre: e.target.value })} required />
                        </div>
                        <div className="grid gap-2">
                            <Label>Descripción</Label>
                            <Input value={currentEst.descripcion || ''} onChange={e => setCurrentEst({ ...currentEst, descripcion: e.target.value })} />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsEstDialogOpen(false)}>Cancelar</Button>
                            <Button type="submit">Guardar</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
};
