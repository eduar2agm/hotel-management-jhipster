import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ServicioDisponibilidadService } from '../../../services/servicio-disponibilidad.service';
import type { ServicioDisponibilidadDTO } from '../../../types/api/ServicioDisponibilidad';
import type { ServicioDTO } from '../../../types/api/Servicio';
import { DiaSemana } from '../../../types/enums';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Pencil, Calendar, Clock, Users } from 'lucide-react';
import { toast } from 'sonner';

// Schema Definition
const disponibilidadSchema = z.object({
    id: z.number().optional(),
    diaSemana: z.nativeEnum(DiaSemana),
    horaInicio: z.string().regex(/^([01]\d|2[0-3]):?([0-5]\d)(:?([0-5]\d))?$/, 'Formato HH:mm invalido'),
    horaFin: z.string().optional().or(z.literal('')),
    cupoMaximo: z.coerce.number().min(1, 'Cupo debe ser al menos 1'),
    horaFija: z.boolean().default(false),
    activo: z.boolean().default(true)
});

type DisponibilidadFormValues = z.infer<typeof disponibilidadSchema>;

interface Props {
    servicio: ServicioDTO;
}

export const ServicioDisponibilidadManager = ({ servicio }: Props) => {
    const [items, setItems] = useState<ServicioDisponibilidadDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const form = useForm<DisponibilidadFormValues>({
        resolver: zodResolver(disponibilidadSchema) as any,
        defaultValues: {
            cupoMaximo: 10,
            horaFija: false,
            activo: true,
            horaInicio: '08:00',
            horaFin: '18:00',
            diaSemana: DiaSemana.LUNES
        }
    });

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await ServicioDisponibilidadService.getByServicio(servicio.id);
            setItems(res.data);
        } catch (error) {
            toast.error('Error al cargar disponibilidades');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, [servicio.id]);

    const onSubmit = async (data: DisponibilidadFormValues) => {
        try {
            const payload = {
                ...data,
                horaInicio: data.horaInicio.length === 5 ? data.horaInicio + ':00' : data.horaInicio,
                horaFin: data.horaFin && data.horaFin.length === 5 ? data.horaFin + ':00' : data.horaFin,
                servicio: { id: servicio.id }
            };

            if (editingId && data.id) {
                await ServicioDisponibilidadService.update(data.id, payload as any);
                toast.success('Actualizado correctamente');
            } else {
                await ServicioDisponibilidadService.create(payload as any);
                toast.success('Creado correctamente');
            }
            form.reset({
                cupoMaximo: 10,
                horaFija: false,
                activo: true,
                horaInicio: '08:00',
                horaFin: '18:00',
                diaSemana: DiaSemana.LUNES
            });
            setEditingId(null);
            loadData();
        } catch (error) {
            toast.error('Error al guardar');
            console.error(error);
        }
    };

    const handleEdit = (item: ServicioDisponibilidadDTO) => {
        setEditingId(item.id);
        form.reset({
            id: item.id,
            diaSemana: item.diaSemana,
            horaInicio: item.horaInicio?.substring(0, 5), // HH:mm
            horaFin: item.horaFin?.substring(0, 5) || '',
            cupoMaximo: item.cupoMaximo,
            horaFija: item.horaFija,
            activo: item.activo
        });
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Eliminar regla?')) return;
        try {
            await ServicioDisponibilidadService.delete(id);
            toast.success('Eliminado');
            loadData();
        } catch (error) {
            toast.error('Error al eliminar');
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        form.reset({
            cupoMaximo: 10,
            horaFija: false,
            activo: true,
            horaInicio: '08:00',
            horaFin: '18:00',
            diaSemana: DiaSemana.LUNES
        });
    };

    return (
        <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                    <Calendar className="h-5 w-5 text-yellow-600" />
                    <h3 className="font-bold text-gray-800">
                        {editingId ? 'Editar Regla' : 'Nueva Regla de Disponibilidad'}
                    </h3>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <FormField
                                control={form.control}
                                name="diaSemana"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs uppercase font-bold text-gray-500">Día</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {Object.values(DiaSemana).map(day => (
                                                    <SelectItem key={day} value={day}>{day}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="cupoMaximo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs uppercase font-bold text-gray-500">Cupo</FormLabel>
                                        <FormControl>
                                            <Input type="number" min="1" className="bg-white" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <FormField
                                control={form.control}
                                name="horaInicio"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs uppercase font-bold text-gray-500">Hora Inicio</FormLabel>
                                        <FormControl>
                                            <Input type="time" className="bg-white" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="horaFin"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs uppercase font-bold text-gray-500">Hora Fin</FormLabel>
                                        <FormControl>
                                            <Input type="time" className="bg-white" disabled={form.watch('horaFija')} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex items-center gap-6">
                            <FormField
                                control={form.control}
                                name="horaFija"
                                render={({ field }) => (
                                    <FormItem className="flex items-center gap-2 space-y-0">
                                        <FormControl>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                        <FormLabel className="font-normal cursor-pointer">Hora Fija (Punto exacto)</FormLabel>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="activo"
                                render={({ field }) => (
                                    <FormItem className="flex items-center gap-2 space-y-0">
                                        <FormControl>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                        <FormLabel className="font-normal cursor-pointer">Activo</FormLabel>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            {editingId && (
                                <Button type="button" variant="outline" size="sm" onClick={handleCancelEdit}>
                                    Cancelar
                                </Button>
                            )}
                            <Button type="submit" size="sm" className="bg-yellow-600 hover:bg-yellow-700">
                                {editingId ? <Pencil className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                                {editingId ? 'Actualizar Regla' : 'Agregar Regla'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Día</TableHead>
                            <TableHead>Horario</TableHead>
                            <TableHead>Cupo</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                    No hay reglas de disponibilidad configuradas.
                                </TableCell>
                            </TableRow>
                        ) : (
                            items.map(item => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.diaSemana}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-3 h-3 text-gray-400" />
                                            {item.horaInicio?.substring(0, 5)}
                                            {!item.horaFija && ` - ${item.horaFin?.substring(0, 5)}`}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <Users className="w-3 h-3 text-gray-400" />
                                            {item.cupoMaximo}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {item.horaFija ? (
                                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Fijo</span>
                                        ) : (
                                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Rango</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Switch checked={item.activo} disabled />
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600" onClick={() => handleEdit(item)}>
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" onClick={() => handleDelete(item.id)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};
