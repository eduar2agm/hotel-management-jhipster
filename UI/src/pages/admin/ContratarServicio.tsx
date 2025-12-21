import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ServicioService } from '../../services/servicio.service';
import { ServicioContratadoService } from '../../services/servicio-contratado.service';
import { ReservaService } from '../../services/reserva.service';
import type { ServicioDTO } from '../../types/api/Servicio';
import { TipoServicio } from '../../types/api/Servicio';
import type { ReservaDTO } from '../../types/api/Reserva';
import { EstadoServicioContratado } from '../../types/api/ServicioContratado';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Briefcase, User, Calendar, Plus, Save } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const contratoSchema = z.object({
    reservaId: z.string().min(1, 'Debe seleccionar una reserva'),
    servicioId: z.string().min(1, 'Debe seleccionar un servicio'),
    cantidad: z.number().min(1, 'La cantidad mínima es 1'),
    fecha: z.string().min(1, 'Fecha requerida'),
    hora: z.string().min(1, 'Hora requerida'),
    observaciones: z.string().optional()
});

type ContratoFormValues = z.infer<typeof contratoSchema>;

export const AdminContratarServicio = ({ returnPath = '/admin/servicios-contratados' }: { returnPath?: string }) => {
    const navigate = useNavigate();
    const [servicios, setServicios] = useState<ServicioDTO[]>([]);
    const [reservas, setReservas] = useState<ReservaDTO[]>([]);
    const [loadingReservas, setLoadingReservas] = useState(false);
    const [reservaSearch, setReservaSearch] = useState('');

    // Selected items for display
    const [selectedReserva, setSelectedReserva] = useState<ReservaDTO | null>(null);
    const [selectedServicio, setSelectedServicio] = useState<ServicioDTO | null>(null);

    const form = useForm<ContratoFormValues>({
        resolver: zodResolver(contratoSchema),
        defaultValues: {
            reservaId: '',
            servicioId: '',
            cantidad: 1,
            observaciones: '',
            fecha: new Date().toISOString().split('T')[0],
            hora: '09:00'
        }
    });

    useEffect(() => {
        // Load services
        ServicioService.getServiciosDisponibles().then(res => setServicios(res.data));
    }, []);

    const searchReservas = async () => {
        if (!reservaSearch) return;
        setLoadingReservas(true);
        try {
            // This is a naive search, ideally backend supports search by client name or reservation ID
            // Assuming getReservas supports filtering by id or getting all and filtering in memory for now
            // Or better, search by ID since it's admin
            const res = await ReservaService.getReserva(Number(reservaSearch));
            if (res.data) setReservas([res.data]);
            else setReservas([]);
        } catch (e) {
            // Fallback to get all active bookings (limited)
            try {
                const res = await ReservaService.getReservas({ page: 0, size: 20 });
                // Filter locally
                const filtered = res.data.filter(r =>
                    r.id?.toString() === reservaSearch ||
                    (r.cliente?.nombre || '').toLowerCase().includes(reservaSearch.toLowerCase()) ||
                    (r.cliente?.apellido || '').toLowerCase().includes(reservaSearch.toLowerCase())
                );
                setReservas(filtered);
            } catch (err) {
                toast.error('No se encontró reserva');
            }
        } finally {
            setLoadingReservas(false);
        }
    };

    const onSubmit = async (data: ContratoFormValues) => {
        try {
            const fechaServicio = new Date(`${data.fecha}T${data.hora}`).toISOString();

            const payload = {
                fechaContratacion: new Date().toISOString(),
                fechaServicio: fechaServicio, // NEW FIELD
                cantidad: data.cantidad,
                precioUnitario: selectedServicio?.precio || 0,
                estado: EstadoServicioContratado.PENDIENTE,
                observaciones: data.observaciones,
                servicio: { id: Number(data.servicioId) },
                reserva: { id: Number(data.reservaId) },
                cliente: { id: selectedReserva?.cliente?.id }
            };

            await ServicioContratadoService.create(payload as any);
            toast.success('Servicio contratado exitosamente');
            navigate(returnPath);
        } catch (error) {
            toast.error('Error al contratar servicio');
        }
    };

    return (
        <div className="font-sans text-gray-900 bg-gray-50 min-h-screen flex flex-col">

            <div className="bg-[#0F172A] pt-32 pb-20 px-4 md:px-8 lg:px-20 relative shadow-xl">
                <div className="relative max-w-7xl mx-auto z-10">
                    <span className="text-yellow-500 font-bold tracking-[0.2em] uppercase text-xs mb-2 block">Administración</span>
                    <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-2">
                        Nuevo Contrato de Servicio
                    </h1>
                </div>
            </div>

            <main className="flex-grow py-10 px-4 md:px-8 lg:px-20 -mt-10 relative z-10 flex justify-center">
                <Card className="w-full max-w-2xl border-t-4 border-yellow-600 shadow-xl bg-white">
                    <CardHeader>
                        <CardTitle>Registrar Servicio Adicional</CardTitle>
                        <CardDescription>Asocie un servicio a una reserva existente.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                                {/* SELECT RESERVA */}
                                <div className="space-y-2">
                                    <FormLabel className="text-sm font-bold text-gray-700">Buscar Reserva</FormLabel>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Buscar por ID de reserva o Cliente..."
                                            value={reservaSearch}
                                            onChange={(e) => setReservaSearch(e.target.value)}
                                        />
                                        <Button type="button" onClick={searchReservas} disabled={loadingReservas}>
                                            <Search className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    {reservas.length > 0 && (
                                        <div className="border rounded-md mt-2 max-h-40 overflow-y-auto">
                                            {reservas.map(r => (
                                                <div
                                                    key={r.id}
                                                    className={`p-3 cursor-pointer hover:bg-yellow-50 flex justify-between items-center ${form.getValues('reservaId') === String(r.id) ? 'bg-yellow-50 border-l-4 border-yellow-500' : ''}`}
                                                    onClick={() => {
                                                        form.setValue('reservaId', String(r.id));
                                                        setSelectedReserva(r);
                                                        setReservas([]); // Hide list after selection
                                                        setReservaSearch(String(r.id));
                                                    }}
                                                >
                                                    <div>
                                                        <div className="font-bold flex items-center gap-2">
                                                            <Calendar className="h-3 w-3 text-gray-500" /> Reserva #{r.id}
                                                        </div>
                                                        <div className="text-sm text-gray-600 flex items-center gap-1">
                                                            <User className="h-3 w-3" /> {r.cliente?.nombre} {r.cliente?.apellido}
                                                        </div>
                                                    </div>
                                                    <div className="text-xs bg-gray-200 px-2 py-1 rounded">
                                                        {r.fechaInicio ? format(new Date(r.fechaInicio), 'dd/MM') : ''} - {r.fechaFin ? format(new Date(r.fechaFin), 'dd/MM') : ''}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {selectedReserva && (
                                        <div className="bg-green-50 p-3 rounded-md border border-green-200 text-green-800 text-sm flex justify-between items-center">
                                            <span>Reserva #{selectedReserva.id} - {selectedReserva.cliente?.nombre} {selectedReserva.cliente?.apellido}</span>
                                            <Button type="button" variant="ghost" size="sm" onClick={() => { setSelectedReserva(null); form.setValue('reservaId', ''); setReservaSearch(''); }} className="h-6 text-green-800 hover:text-green-900 hover:bg-green-100">Cambiar</Button>
                                        </div>
                                    )}
                                    <FormMessage>{form.formState.errors.reservaId?.message}</FormMessage>
                                </div>

                                {/* SELECT SERVICIO */}
                                <FormField
                                    control={form.control}
                                    name="servicioId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-bold text-gray-700">Servicio</FormLabel>
                                            <Select onValueChange={(val) => {
                                                field.onChange(val);
                                                setSelectedServicio(servicios.find(s => String(s.id) === val) || null);
                                            }} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seleccione servicio..." />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {servicios.map(s => (
                                                        <SelectItem key={s.id} value={String(s.id)}>
                                                            <div className="flex justify-between w-full min-w-[200px]">
                                                                <span>{s.nombre}</span>
                                                                <span className="font-bold text-yellow-600">${s.precio}</span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="fecha"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-bold text-gray-700">Fecha Servicio</FormLabel>
                                                <FormControl>
                                                    <Input type="date" min={new Date().toISOString().split('T')[0]} {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="hora"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-bold text-gray-700">Hora</FormLabel>
                                                <FormControl>
                                                    <Input type="time" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="cantidad"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-bold text-gray-700">Cantidad</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        {...field}
                                                        onChange={e => field.onChange(Number(e.target.value))}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormItem>
                                        <FormLabel className="text-sm font-bold text-gray-700">Total Estimado</FormLabel>
                                        <div className="h-10 flex items-center px-3 border rounded-md bg-gray-50 font-bold text-lg text-green-600">
                                            ${(Number(selectedServicio?.precio || 0) * (form.watch('cantidad') || 1)).toFixed(2)}
                                        </div>
                                    </FormItem>
                                </div>

                                <FormField
                                    control={form.control}
                                    name="observaciones"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-bold text-gray-700">Observaciones</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Comentarios adicionales..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button type="submit" className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold h-12 text-lg">
                                    <Save className="mr-2" /> Registrar Servicio
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
};
