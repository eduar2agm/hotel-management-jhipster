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
import { Pencil, Trash2, Plus, Activity, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { EstadoHabitacionService } from '../../../services/estado-habitacion.service';
import { type EstadoHabitacionDTO, type NewEstadoHabitacionDTO, type EstadoHabitacionNombreType } from '../../../types/api/EstadoHabitacion';

export const EstadosTab = () => {
    const [estados, setEstados] = useState<EstadoHabitacionDTO[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentEst, setCurrentEst] = useState<Partial<EstadoHabitacionDTO>>({});

    const itemsPerPage = 100;

    const loadEstados = async () => {
        setIsLoading(true);
        try {
            const res = await EstadoHabitacionService.getEstados({
                page: 0,
                size: itemsPerPage,
                sort: 'id,asc'
            });
            setEstados(res.data);
        } catch (error) {
            toast.error('Error al cargar estados');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadEstados();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (currentEst.id) {
                await EstadoHabitacionService.updateEstado(currentEst.id, currentEst as EstadoHabitacionDTO);
                toast.success('Estado actualizado');
            } else {
                await EstadoHabitacionService.createEstado({ ...currentEst, activo: true } as NewEstadoHabitacionDTO);
                toast.success('Estado creado');
            }
            setIsDialogOpen(false);
            loadEstados();
        } catch (error) {
            toast.error('Error al guardar estado');
        }
    };

    const handleDelete = async (id: number) => {
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
        <>
            <Card className="bg-card border-0 shadow-xl overflow-hidden rounded-2xl">
                <CardHeader className="border-b border-border bg-card p-6 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl font-bold text-foreground">Estados de Habitación</CardTitle>
                        <p className="text-muted-foreground text-sm mt-1">Gestione los ciclos de vida y disponibilidad.</p>
                    </div>
                    <Button
                        onClick={() => { setCurrentEst({}); setIsDialogOpen(true); }}
                        className="bg-blue-600 hover:bg-blue-700 text-white shadow-md rounded-full px-6 transition-all hover:scale-105"
                    >
                        <Plus className="mr-2 h-5 w-5" /> Nuevo Estado
                    </Button>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow className="border-border">
                                <TableHead className="font-bold text-muted-foreground py-5 pl-8">ESTADO</TableHead>
                                <TableHead className="font-bold text-muted-foreground py-5">DESCRIPCIÓN</TableHead>
                                <TableHead className="font-bold text-muted-foreground py-5 text-right pr-8">ACCIONES</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow><TableCell colSpan={3} className="h-32 text-center text-muted-foreground">Cargando datos...</TableCell></TableRow>
                            ) : estados.length === 0 ? (
                                <TableRow><TableCell colSpan={3} className="h-32 text-center text-muted-foreground">No hay estados registradas.</TableCell></TableRow>
                            ) : (
                                estados.map(est => (
                                    <TableRow key={est.id} className="hover:bg-muted/50 transition-colors border-b border-border">
                                        <TableCell className="py-5 pl-8">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-2.5 rounded-full shadow-sm ${est.nombre === 'DISPONIBLE' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                                                    est.nombre === 'OCUPADA' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                                                        est.nombre === 'MANTENIMIENTO' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' :
                                                            'bg-muted text-muted-foreground'
                                                    }`}>
                                                    <Activity className="w-5 h-5" />
                                                </div>
                                                <span className="font-bold text-foreground text-lg">{est.nombre}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-5 text-muted-foreground text-base">{est.descripcion}</TableCell>
                                        <TableCell className="py-5 text-right pr-8">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-full" onClick={() => { setCurrentEst(est); setIsDialogOpen(true); }}>
                                                    <Pencil className="h-5 w-5" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 rounded-full" onClick={() => Number(est.id) && handleDelete(Number(est.id))}>
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
                        <DialogTitle className="text-xl font-bold text-foreground">{currentEst.id ? 'Editar' : 'Crear'} Estado</DialogTitle>
                        <DialogDescription>
                            Defina el estado operativo para el control de habitaciones.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSave} className="grid gap-6 py-4">
                        <div className="grid gap-2">
                            <Label className="text-sm font-semibold text-foreground">Estado</Label>
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
                            <Label className="text-sm font-semibold text-foreground">Descripción</Label>
                            <Input
                                value={currentEst.descripcion || ''}
                                onChange={e => setCurrentEst({ ...currentEst, descripcion: e.target.value })}
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
