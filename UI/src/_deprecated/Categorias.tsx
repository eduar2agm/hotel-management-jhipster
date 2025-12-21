
// import { useEffect, useState } from 'react';
// import { DashboardLayout } from '../../components/DashboardLayout';
// import { CategoriaHabitacionService } from '../../services';
// import type { CategoriaHabitacionDTO } from '../../types/api';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Plus, Pencil, Trash2, CheckCircle2, XCircle } from 'lucide-react';
// import { ActiveFilter } from '@/components/ui/ActiveFilter';
// import { ActiveBadge } from '@/components/ui/ActiveBadge';
// import { toast } from 'sonner';
// import { CategoriaHabitacionNombre } from '../../types/enums';

// export const AdminCategorias = () => {
//     const [categorias, setCategorias] = useState<CategoriaHabitacionDTO[]>([]);
//     const [loading, setLoading] = useState(false);
//     const [isDialogOpen, setIsDialogOpen] = useState(false);
//     const [currentItem, setCurrentItem] = useState<Partial<CategoriaHabitacionDTO>>({});
//     const [isEditing, setIsEditing] = useState(false);
//     const [showInactive, setShowInactive] = useState(false);

//     const loadData = async () => {
//         setLoading(true);
//         try {
//             const res = showInactive
//                 ? await CategoriaHabitacionService.getCategoriasInactivas({ page: 0, size: 50 })
//                 : await CategoriaHabitacionService.getCategorias({ page: 0, size: 50 });
//             setCategorias(res.data);
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
//                 await CategoriaHabitacionService.updateCategoria(currentItem.id, currentItem as CategoriaHabitacionDTO);
//                 toast.success('Categoría actualizada');
//             } else {
//                 await CategoriaHabitacionService.createCategoria(currentItem as any);
//                 toast.success('Categoría creada');
//             }
//             setIsDialogOpen(false);
//             loadData();
//         } catch (error) {
//             toast.error('Error al guardar categoría');
//         }
//     };

//     const handleToggleActivo = async (id: number, currentState: boolean) => {
//         try {
//             if (currentState) {
//                 await CategoriaHabitacionService.desactivarCategoria(id);
//                 toast.success('Categoría desactivada');
//             } else {
//                 await CategoriaHabitacionService.activarCategoria(id);
//                 toast.success('Categoría activada');
//             }
//             loadData();
//         } catch (error) {
//             toast.error('Error al cambiar estado');
//         }
//     };

//     const handleEdit = (item: CategoriaHabitacionDTO) => {
//         if (!item.activo) {
//             toast.warning('No se puede editar una categoría inactiva');
//             return;
//         }
//         setCurrentItem({ ...item });
//         setIsEditing(true);
//         setIsDialogOpen(true);
//     };

//     const handleCreate = () => {
//         setCurrentItem({
//             nombre: CategoriaHabitacionNombre.SENCILLA,
//             precioBase: '0',
//             activo: true
//         });
//         setIsEditing(false);
//         setIsDialogOpen(true);
//     };

//     const handleDelete = async (id: number) => {
//         if (!confirm('¿Estás seguro?')) return;
//         try {
//             await CategoriaHabitacionService.deleteCategoria(id);
//             toast.success('Categoría eliminada');
//             loadData();
//         } catch (error) {
//             toast.error('Error al eliminar');
//         }
//     };

//     return (
//         <DashboardLayout title="Gestión de Categorías" role="Administrador">
//             <Card>
//                 <CardHeader className="flex flex-row items-center justify-between">
//                     <div className="flex items-center gap-4">
//                         <CardTitle>Listado de Categorías</CardTitle>
//                         <ActiveFilter showInactive={showInactive} onChange={setShowInactive} />
//                     </div>
//                     <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//                         <DialogTrigger asChild>
//                             <Button onClick={handleCreate}>
//                                 <Plus className="mr-2 h-4 w-4" /> Nueva Categoría
//                             </Button>
//                         </DialogTrigger>
//                         <DialogContent>
//                             <DialogHeader>
//                                 <DialogTitle>{isEditing ? 'Editar Categoría' : 'Nueva Categoría'}</DialogTitle>
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
//                                             {Object.values(CategoriaHabitacionNombre).map(n => (
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
//                                     <Label htmlFor="precio">Precio Base</Label>
//                                     <Input
//                                         id="precio"
//                                         type="number"
//                                         value={currentItem.precioBase || ''}
//                                         onChange={e => setCurrentItem({ ...currentItem, precioBase: e.target.value })}
//                                         required
//                                     />
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
//                                 <TableHead>Precio Base</TableHead>
//                                 <TableHead>Estado</TableHead>
//                                 <TableHead className="text-right">Acciones</TableHead>
//                             </TableRow>
//                         </TableHeader>
//                         <TableBody>
//                             {loading ? (
//                                 <TableRow><TableCell colSpan={5} className="text-center">Cargando...</TableCell></TableRow>
//                             ) : categorias.length === 0 ? (
//                                 <TableRow><TableCell colSpan={5} className="text-center">No hay categorías</TableCell></TableRow>
//                             ) : (
//                                 categorias.map((cat) => (
//                                     <TableRow key={cat.id}>
//                                         <TableCell className="font-medium">{cat.nombre}</TableCell>
//                                         <TableCell>{cat.descripcion}</TableCell>
//                                         <TableCell>${cat.precioBase}</TableCell>
//                                         <TableCell><ActiveBadge activo={cat.activo ?? false} size="sm" /></TableCell>
//                                         <TableCell className="text-right space-x-2">
//                                             <Button variant="ghost" size="icon" onClick={() => handleEdit(cat)} disabled={!cat.activo}>
//                                                 <Pencil className="h-4 w-4" />
//                                             </Button>
//                                             <Button variant="ghost" size="icon" onClick={() => cat.id && handleToggleActivo(cat.id, cat.activo ?? false)}>
//                                                 {cat.activo ? <XCircle className="h-4 w-4 text-orange-500" /> : <CheckCircle2 className="h-4 w-4 text-green-500" />}
//                                             </Button>
//                                             <Button variant="ghost" size="icon" className="text-destructive" onClick={() => cat.id && handleDelete(cat.id)}>
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
