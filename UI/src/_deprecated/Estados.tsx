
// import { useEffect, useState } from 'react';
// import { DashboardLayout } from '../../components/DashboardLayout';
// import { EstadoHabitacionService } from '../../services';
// import type { EstadoHabitacionDTO } from '../../types/api';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Plus, Pencil, Trash2, CheckCircle2, XCircle } from 'lucide-react';
// import { toast } from 'sonner';
// import { EstadoHabitacionNombre } from '../../types/enums';
// import { ActiveFilter } from '@/components/ui/ActiveFilter';
// import { ActiveBadge } from '@/components/ui/ActiveBadge';

// export const AdminEstados = () => {
//     const [estados, setEstados] = useState<EstadoHabitacionDTO[]>([]);
//     const [loading, setLoading] = useState(false);
//     const [isDialogOpen, setIsDialogOpen] = useState(false);
//     const [currentItem, setCurrentItem] = useState<Partial<EstadoHabitacionDTO>>({});
//     const [isEditing, setIsEditing] = useState(false);
//     const [showInactive, setShowInactive] = useState(false);

//     const loadData = async () => {
//         setLoading(true);
//         try {
//             const res = showInactive
//                 ? await EstadoHabitacionService.getEstadosInactivos({ page: 0, size: 50 })
//                 : await EstadoHabitacionService.getEstados({ page: 0, size: 50 });
//             setEstados(res.data);
//         } catch (error) {
//             toast.error('Error al cargar datos');
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         loadData();
//     }, [showInactive]);

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//         try {
//             if (isEditing && currentItem.id) {
//                 await EstadoHabitacionService.updateEstado(currentItem.id, currentItem as EstadoHabitacionDTO);
//                 toast.success('Estado actualizado');
//             } else {
//                 await EstadoHabitacionService.createEstado(currentItem as any);
//                 toast.success('Estado creado');
//             }
//             setIsDialogOpen(false);
//             loadData();
//         } catch (error) {
//             toast.error('Error al guardar estado');
//         }
//     };

//     const handleEdit = (item: EstadoHabitacionDTO) => {
//         setCurrentItem(item);
//         setIsEditing(true);
//         setIsDialogOpen(true);
//     };

//     const handleCreate = () => {
//         setCurrentItem({
//             nombre: EstadoHabitacionNombre.DISPONIBLE,
//             activo: true
//         });
//         setIsEditing(false);
//         setIsDialogOpen(true);
//     };

//     const handleToggleActivo = async (id: number, currentState: boolean) => {
//         try {
//             if (currentState) {
//                 await EstadoHabitacionService.desactivarEstado(id);
//                 toast.success('Estado desactivado');
//             } else {
//                 await EstadoHabitacionService.activarEstado(id);
//                 toast.success('Estado activado');
//             }
//             loadData();
//         } catch (error) {
//             toast.error('Error al cambiar estado');
//         }
//     };

//     const handleDelete = async (id: number) => {
//         if (!confirm('¿Estás seguro?')) return;
//         try {
//             await EstadoHabitacionService.deleteEstado(id);
//             toast.success('Estado eliminado');
//             loadData();
//         } catch (error) {
//             toast.error('Error al eliminar');
//         }
//     };

//     return (
//         <DashboardLayout title="Gestión de Estados" role="Administrador">
//             <Card>
//                 <CardHeader className="flex flex-row items-center justify-between">
//                     <div className="flex items-center gap-4">
//                         <CardTitle>Listado de Estados</CardTitle>
//                         <ActiveFilter showInactive={showInactive} onChange={setShowInactive} />
//                     </div>
//                     <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//                         <DialogTrigger asChild>
//                             <Button onClick={handleCreate}>
//                                 <Plus className="mr-2 h-4 w-4" /> Nuevo Estado
//                             </Button>
//                         </DialogTrigger>
//                         <DialogContent>
//                             <DialogHeader>
//                                 <DialogTitle>{isEditing ? 'Editar Estado' : 'Nuevo Estado'}</DialogTitle>
//                             </DialogHeader>
//                             <form onSubmit={handleSubmit} className="grid gap-4 py-4">
//                                 <div className="grid gap-2">
//                                     <Label htmlFor="nombre">Nombre</Label>
//                                     <Select
//                                         value={currentItem.nombre}
//                                         onValueChange={(val) => setCurrentItem({ ...currentItem, nombre: val as any })}
//                                     >
//                                         <SelectTrigger>
//                                             <SelectValue placeholder="Seleccionar" />
//                                         </SelectTrigger>
//                                         <SelectContent>
//                                             {Object.values(EstadoHabitacionNombre).map(n => (
//                                                 <SelectItem key={n} value={n}>{n}</SelectItem>
//                                             ))}
//                                         </SelectContent>
//                                     </Select>
//                                 </div>
//                                 <div className="grid gap-2">
//                                     <Label htmlFor="descripcion">Descripción</Label>
//                                     <Input
//                                         id="descripcion"
//                                         value={currentItem.descripcion || ''}
//                                         onChange={e => setCurrentItem({ ...currentItem, descripcion: e.target.value })}
//                                     />
//                                 </div>
//                                 <div className="grid gap-2">
//                                     <Label htmlFor="activo">Activo</Label> {/* Simplified boolean generic would be nice, but simple here */}
//                                     {/* Just keeping it simple for now as per other forms */}
//                                 </div>

//                                 <DialogFooter>
//                                     <Button type="submit">{isEditing ? 'Guardar' : 'Crear'}</Button>
//                                 </DialogFooter>
//                             </form>
//                         </DialogContent>
//                     </Dialog>
//                 </CardHeader>
//                 <CardContent>
//                     <Table>
//                         <TableHeader>
//                             <TableRow>
//                                 <TableHead>Nombre</TableHead>
//                                 <TableHead>Descripción</TableHead>
//                                 <TableHead>Estado</TableHead>
//                                 <TableHead className="text-right">Acciones</TableHead>
//                             </TableRow>
//                         </TableHeader>
//                         <TableBody>
//                             {loading ? (
//                                 <TableRow><TableCell colSpan={4} className="text-center">Cargando...</TableCell></TableRow>
//                             ) : estados.length === 0 ? (
//                                 <TableRow><TableCell colSpan={4} className="text-center">No hay estados</TableCell></TableRow>
//                             ) : (
//                                 estados.map((est) => (
//                                     <TableRow key={est.id}>
//                                         <TableCell className="font-medium">{est.nombre}</TableCell>
//                                         <TableCell>{est.descripcion}</TableCell>
//                                         <TableCell><ActiveBadge activo={!!est.activo} size="sm" /></TableCell>
//                                         <TableCell className="text-right space-x-2">
//                                             <Button variant="ghost" size="icon" onClick={() => handleEdit(est)} disabled={!est.activo}>
//                                                 <Pencil className="h-4 w-4" />
//                                             </Button>
//                                             <Button variant="ghost" size="icon" onClick={() => est.id && handleToggleActivo(est.id, !!est.activo)}>
//                                                 {est.activo ? <XCircle className="h-4 w-4 text-orange-500" /> : <CheckCircle2 className="h-4 w-4 text-green-500" />}
//                                             </Button>
//                                             <Button variant="ghost" size="icon" className="text-destructive" onClick={() => est.id && handleDelete(est.id)}>
//                                                 <Trash2 className="h-4 w-4" />
//                                             </Button>
//                                         </TableCell>
//                                     </TableRow>
//                                 ))
//                             )}
//                         </TableBody>
//                     </Table>
//                 </CardContent>
//             </Card>
//         </DashboardLayout>
//     );
// };
