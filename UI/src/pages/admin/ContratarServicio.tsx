import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Check, ChevronsUpDown, User, Calendar, Save } from 'lucide-react';
import { toast } from 'sonner';
import { format, parseISO, startOfDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { ServiceScheduleSelector } from '../../components/services/ServiceScheduleSelector';

const contratoSchema = z.object({
    reservaId: z.string().min(1, 'Debe seleccionar una reserva'),
    servicioId: z.string().min(1, 'Debe seleccionar un servicio'),
    cantidad: z.number().min(1, 'La cantidad mínima es 1'),
    observaciones: z.string().optional()
});

type ContratoFormValues = z.infer<typeof contratoSchema>;

import { PaymentModal } from '../../components/modals/PaymentModal';

export const AdminContratarServicio = ({ returnPath = '/admin/servicios-contratados' }: { returnPath?: string }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [servicios, setServicios] = useState<ServicioDTO[]>([]);
    const [allReservas, setAllReservas] = useState<ReservaDTO[]>([]);
    const [openReservaCombobox, setOpenReservaCombobox] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [pendingServiceIds, setPendingServiceIds] = useState<number[]>([]);

    // Selected items for display
    const [selectedReserva, setSelectedReserva] = useState<ReservaDTO | null>(null);
    const [selectedServicio, setSelectedServicio] = useState<ServicioDTO | null>(null);

    // Fechas y hora - manejadas fuera del form, como en cliente
    const [fechas, setFechas] = useState<string[]>([]);
    const [hora, setHora] = useState<string>('');
    const [maxCupo, setMaxCupo] = useState<number>(0);

    const form = useForm<ContratoFormValues>({
        resolver: zodResolver(contratoSchema),
        defaultValues: {
            reservaId: '',
            servicioId: '',
            cantidad: 1,
            observaciones: ''
        }
    });

    useEffect(() => {
        // Load services and all reservas at once
        const loadData = async () => {
            try {
                const [serviciosRes, reservasRes] = await Promise.all([
                    ServicioService.getServiciosDisponibles({ size: 100 }),
                    ReservaService.getReservas({ size: 200, sort: 'fechaInicio,desc' })
                ]);

                // Mostrar todos los servicios disponibles (no filtrar solo pagos, ya que el usuario ya eligió uno)
                setServicios(serviciosRes.data);
                setAllReservas(reservasRes.data);
            } catch (error) {
                console.error('Error loading data:', error);
                toast.error('Error cargando datos');
            }
        };
        loadData();
    }, []);

    // Effect to handle pre-selections from other pages (e.g. ServicesCarousel)
    useEffect(() => {
        if (servicios.length > 0 && allReservas.length > 0 && location.state) {
            const state = location.state as any;
            let updated = false;

            if (state.preSelectedService) {
                const s = servicios.find(srv => srv.id === state.preSelectedService.id);
                if (s) {
                    setSelectedServicio(s);
                    form.setValue('servicioId', String(s.id));
                    updated = true;
                }
            }

            if (state.preSelectedReserva) {
                const r = allReservas.find(re => re.id === state.preSelectedReserva.id);
                if (r) {
                    setSelectedReserva(r);
                    form.setValue('reservaId', String(r.id));
                    updated = true;
                }
            }

            if (updated) {
                // Clean state to avoid loops, but maybe keep it for reference? 
                // Standard is to replace history state
                navigate(location.pathname, { replace: true, state: {} });
            }
        }
    }, [servicios, allReservas, location.state, navigate, form]);

    const handlePaymentSuccess = async () => {
        try {
            // Confirm all pending services
            await Promise.all(pendingServiceIds.map(id => ServicioContratadoService.confirmar(id)));
            toast.success('Servicios confirmados y pagados exitosamente.');
            navigate(returnPath);
        } catch (error) {
            console.error('Error confirming services:', error);
            toast.error('Pago registrado pero hubo un error confirmando los servicios. Por favor verifique.');
            navigate(returnPath);
        }
    };

    const onSubmit = async (data: ContratoFormValues) => {
        if (!selectedReserva) {
            toast.error('Por favor selecciona una reserva.');
            return;
        }

        if (fechas.length === 0 || !hora) {
            toast.error('Seleccione al menos un día y hora del servicio.');
            return;
        }

        // Validar que todas las fechas estén dentro del rango de la reserva
        const fechaInicioReserva = startOfDay(parseISO(selectedReserva.fechaInicio!));
        const fechaFinReserva = startOfDay(parseISO(selectedReserva.fechaFin!));

        for (const fech of fechas) {
            const fechaServicioDate = startOfDay(parseISO(fech));
            if (fechaServicioDate < fechaInicioReserva || fechaServicioDate > fechaFinReserva) {
                toast.error(
                    `La fecha ${format(fechaServicioDate, 'dd/MM/yyyy')} está fuera del rango de la reserva ` +
                    `(${format(fechaInicioReserva, 'dd/MM/yyyy')} - ${format(fechaFinReserva, 'dd/MM/yyyy')})`
                );
                return;
            }
        }

        try {
            // Crear un servicio contratado por cada fecha seleccionada
            const promises = fechas.map(async (fecha) => {
                const fechaServicio = new Date(`${fecha}T${hora}`).toISOString();

                const payload = {
                    fechaContratacion: new Date().toISOString(),
                    fechaServicio: fechaServicio,
                    numeroPersonas: data.cantidad,
                    cantidad: data.cantidad,
                    precioUnitario: selectedServicio?.precio || 0,
                    estado: EstadoServicioContratado.PENDIENTE,
                    observaciones: data.observaciones,
                    servicio: { id: Number(data.servicioId) },
                    reserva: { id: Number(data.reservaId) },
                    cliente: { id: selectedReserva?.cliente?.id }
                };

                return ServicioContratadoService.create(payload as any);
            });

            // Esperar a que todas las contrataciones se completen
            const responses = await Promise.all(promises);
            const newServiceIds = responses.map(r => r.data.id!);
            setPendingServiceIds(newServiceIds);

            toast.success('Servicios registrados. Proceda al pago.');
            setIsPaymentModalOpen(true);

        } catch (error) {
            console.error(error);
            toast.error('Error al contratar servicio.');
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

                                {/* SELECT RESERVA - Combobox con búsqueda */}
                                <div className="space-y-2">
                                    <FormLabel className="text-sm font-bold text-gray-700">Buscar Reserva</FormLabel>
                                    <Popover open={openReservaCombobox} onOpenChange={setOpenReservaCombobox}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={openReservaCombobox}
                                                className="w-full justify-between"
                                            >
                                                {selectedReserva ? (
                                                    <span className="flex items-center gap-2">
                                                        <Calendar className="h-4 w-4 text-gray-500" />
                                                        Reserva #{selectedReserva.id} - {selectedReserva.cliente?.nombre} {selectedReserva.cliente?.apellido}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted-foreground">Buscar por ID de reserva o Cliente...</span>
                                                )}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[500px] p-0" align="start">
                                            <Command>
                                                <CommandInput placeholder="Buscar por ID o nombre del cliente..." />
                                                <CommandList>
                                                    <CommandEmpty>No se encontraron reservas.</CommandEmpty>
                                                    <CommandGroup>
                                                        {allReservas.map((r) => {
                                                            const clienteNombre = `${r.cliente?.nombre || ''} ${r.cliente?.apellido || ''}`.trim();
                                                            const searchValue = `${r.id} ${clienteNombre}`.toLowerCase();

                                                            return (
                                                                <CommandItem
                                                                    key={r.id}
                                                                    value={searchValue}
                                                                    onSelect={() => {
                                                                        form.setValue('reservaId', String(r.id));
                                                                        setSelectedReserva(r);
                                                                        setOpenReservaCombobox(false);
                                                                    }}
                                                                >
                                                                    <Check
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            selectedReserva?.id === r.id ? "opacity-100" : "opacity-0"
                                                                        )}
                                                                    />
                                                                    <div className="flex-1 flex justify-between items-center">
                                                                        <div>
                                                                            <div className="font-bold flex items-center gap-2">
                                                                                <Calendar className="h-3 w-3 text-gray-500" />
                                                                                Reserva #{r.id}
                                                                            </div>
                                                                            <div className="text-sm text-gray-600 flex items-center gap-1">
                                                                                <User className="h-3 w-3" />
                                                                                {clienteNombre}
                                                                            </div>
                                                                        </div>
                                                                        <div className="text-xs bg-gray-200 px-2 py-1 rounded">
                                                                            {r.fechaInicio ? format(new Date(r.fechaInicio), 'dd/MM') : ''} - {r.fechaFin ? format(new Date(r.fechaFin), 'dd/MM') : ''}
                                                                        </div>
                                                                    </div>
                                                                </CommandItem>
                                                            );
                                                        })}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    {selectedReserva && (
                                        <div className="bg-green-50 p-3 rounded-md border border-green-200 text-green-800 text-sm flex justify-between items-center">
                                            <span>✓ Reserva #{selectedReserva.id} - {selectedReserva.cliente?.nombre} {selectedReserva.cliente?.apellido}</span>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedReserva(null);
                                                    form.setValue('reservaId', '');
                                                }}
                                                className="h-6 text-green-800 hover:text-green-900 hover:bg-green-100"
                                            >
                                                Cambiar
                                            </Button>
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

                                {/* Selector inteligente de horarios - Solo mostrar cuando hay reserva y servicio seleccionados */}
                                {selectedReserva && selectedServicio && (
                                    <div className="border-t pt-4">
                                        <ServiceScheduleSelector
                                            servicioId={selectedServicio.id!}
                                            reserva={selectedReserva}
                                            clienteId={selectedReserva.cliente?.id || null}
                                            onSelect={(newFechas, newHora) => {
                                                setFechas(newFechas);
                                                setHora(newHora);
                                            }}
                                            onQuotaAvailable={setMaxCupo}
                                            selectedFechas={fechas}
                                            selectedHora={hora}
                                        />
                                    </div>
                                )}

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
                                                        max={maxCupo > 0 ? maxCupo : undefined}
                                                        {...field}
                                                        onChange={e => {
                                                            const val = Number(e.target.value);
                                                            field.onChange(val);
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                                {maxCupo > 0 && fechas.length > 0 && hora && (
                                                    <div className="text-xs text-yellow-600 font-medium">
                                                        Cupo máximo disponible: {maxCupo} personas
                                                    </div>
                                                )}
                                            </FormItem>
                                        )}
                                    />
                                    <FormItem>
                                        <FormLabel className="text-sm font-bold text-gray-700">Total Estimado</FormLabel>
                                        <div className="h-10 flex items-center px-3 border rounded-md bg-gray-50 font-bold text-lg text-green-600">
                                            ${(Number(selectedServicio?.precio || 0) * (form.watch('cantidad') || 1) * (fechas.length || 1)).toFixed(2)}
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

                                <Button type="submit" disabled={maxCupo > 0 && form.watch('cantidad') > maxCupo} className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold h-12 text-lg">
                                    <Save className="mr-2" /> Registrar y Pagar
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </main>

            <PaymentModal
                open={isPaymentModalOpen}
                onOpenChange={(open) => {
                    setIsPaymentModalOpen(open);
                    if (!open && pendingServiceIds.length > 0) {
                        // If closed without payment, navigate away or keep them pending?
                        // Navigating away as they are already created as PENDING
                        navigate(returnPath);
                        toast.info("Servicios creados como pendientes de pago.");
                    }
                }}
                reserva={selectedReserva}
                total={Number(selectedServicio?.precio || 0) * (form.watch('cantidad') || 1) * (fechas.length || 0)}
                onSuccess={handlePaymentSuccess}
            />
        </div>
    );
};
