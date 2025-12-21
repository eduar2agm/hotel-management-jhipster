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
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { ConfiguracionSistemaService } from '../../../services/configuracion-sistema.service';
import { ImagenService } from '../../../services/imagen.service';
import { type ConfiguracionSistemaDTO, type NewConfiguracionSistemaDTO, type TipoConfiguracion } from '../../../types/api/ConfiguracionSistema';
import { type ImagenDTO } from '../../../types/api/Imagen';

export const SistemaTab = () => {
    const [configuraciones, setConfiguraciones] = useState<ConfiguracionSistemaDTO[]>([]);
    const [imagenes, setImagenes] = useState<ImagenDTO[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentSys, setCurrentSys] = useState<Partial<ConfiguracionSistemaDTO>>({});

    const itemsPerPage = 100;

    const loadSistema = async () => {
        setIsLoading(true);
        try {
            const res = await ConfiguracionSistemaService.getConfiguraciones({
                page: 0,
                size: itemsPerPage,
                sort: 'id,asc'
            });
            setConfiguraciones(res.data);
            
            const imgRes = await ImagenService.getImagens({ size: 1000 });
            setImagenes(imgRes.data);
        } catch (error) {
            toast.error('Error al cargar configuración del sistema');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadSistema();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (currentSys.id) {
                await ConfiguracionSistemaService.updateConfiguracion(currentSys.id, currentSys as ConfiguracionSistemaDTO);
                toast.success('Configuración actualizada');
            } else {
                await ConfiguracionSistemaService.createConfiguracion({ ...currentSys, activo: true } as NewConfiguracionSistemaDTO);
                toast.success('Configuración creada');
            }
            setIsDialogOpen(false);
            loadSistema();
        } catch (error) {
            toast.error('Error al guardar configuración');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Eliminar configuración?')) return;
        try {
            await ConfiguracionSistemaService.deleteConfiguracion(id);
            toast.success('Configuración eliminada');
            loadSistema();
        } catch (error) {
            toast.error('Error al eliminar');
        }
    };

    return (
        <>
            <Card className="bg-white border-0 shadow-xl overflow-hidden rounded-2xl">
                <CardHeader className="border-b border-gray-100 bg-white p-6 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl font-bold text-gray-800">Variables del Sistema</CardTitle>
                        <p className="text-gray-500 text-sm mt-1">Configuración técnica y operativa global.</p>
                    </div>
                    <Button
                        onClick={() => { setCurrentSys({}); setIsDialogOpen(true); }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md rounded-full px-6 transition-all hover:scale-105"
                    >
                        <Plus className="mr-2 h-5 w-5" /> Nueva Config
                    </Button>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-gray-50">
                            <TableRow>
                                <TableHead className="font-bold text-gray-600 py-5 pl-8">CLAVE</TableHead>
                                <TableHead className="font-bold text-gray-600 py-5">TIPO</TableHead>
                                <TableHead className="font-bold text-gray-600 py-5">VALOR</TableHead>
                                <TableHead className="font-bold text-gray-600 py-5 text-right pr-8">ACCIONES</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow><TableCell colSpan={4} className="h-32 text-center text-gray-500">Cargando datos...</TableCell></TableRow>
                            ) : configuraciones.length === 0 ? (
                                <TableRow><TableCell colSpan={4} className="h-32 text-center text-gray-500">No hay configuraciones.</TableCell></TableRow>
                            ) : (
                                configuraciones.map(sys => (
                                    <TableRow key={sys.id} className="hover:bg-gray-50/80 transition-colors border-b border-gray-100">
                                        <TableCell className="py-5 pl-8 font-mono text-xs">{sys.clave}</TableCell>
                                        <TableCell className="py-5"><Badge variant="outline">{sys.tipo}</Badge></TableCell>
                                        <TableCell className="py-5 text-gray-600 text-sm truncate max-w-xs">{sys.valor}</TableCell>
                                        <TableCell className="py-5 text-right pr-8">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-indigo-50" onClick={() => { setCurrentSys(sys); setIsDialogOpen(true); }}>
                                                    <Pencil className="h-5 w-5" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-10 w-10 text-gray-400" onClick={() => Number(sys.id) && handleDelete(Number(sys.id))}>
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
                        <DialogTitle className="text-xl font-bold">{currentSys.id ? 'Editar' : 'Crear'} Configuración</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSave} className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>Clave Única</Label>
                            <Input value={currentSys.clave || ''} onChange={e => setCurrentSys({ ...currentSys, clave: e.target.value })} placeholder="hotel_name" required />
                        </div>
                        <div className="grid gap-2">
                            <Label>Tipo</Label>
                            <Select value={currentSys.tipo} onValueChange={val => setCurrentSys({ ...currentSys, tipo: val as TipoConfiguracion })}>
                                <SelectTrigger><SelectValue placeholder="Seleccione..." /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="TEXT">TEXTO</SelectItem>
                                    <SelectItem value="NUMBER">NÚMERO</SelectItem>
                                    <SelectItem value="BOOLEAN">BOOLEANO</SelectItem>
                                    <SelectItem value="IMAGE">IMAGEN</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label>Valor</Label>
                            <Input value={currentSys.valor || ''} onChange={e => setCurrentSys({ ...currentSys, valor: e.target.value })} placeholder="Valor de la config" />
                        </div>
                        <div className="grid gap-2">
                            <Label>Imagen (Opcional si tipo es IMAGE)</Label>
                            <Select
                                value={currentSys.imagen?.id?.toString() || 'none'}
                                onValueChange={val => {
                                    const img = imagenes.find(i => i.id?.toString() === val);
                                    setCurrentSys({ ...currentSys, imagen: img || null });
                                }}
                            >
                                <SelectTrigger><SelectValue placeholder="Vincular imagen" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Ninguna</SelectItem>
                                    {imagenes.map(i => <SelectItem key={i.id} value={i.id?.toString() || ''}>{i.nombre}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <DialogFooter>
                             <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                             <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">Guardar</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
};
