import { useEffect, useState } from 'react';
import { ServicioService } from '../../services';
import { getImageUrl } from '../../utils/imageUtils';
import { TipoServicio, type ServicioDTO } from '../../types/api/Servicio';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ExternalLink, Info, Check, ChevronsUpDown, Calendar } from 'lucide-react';
import { ServiceAvailabilityInfo } from '../services/ServiceAvailabilityInfo';
import { ServicioDisponibilidadService } from '../../services/servicio-disponibilidad.service';
import type { ServicioDisponibilidadDTO } from '../../types/api/ServicioDisponibilidad';

import { toast } from 'sonner';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { ReservaService } from '../../services/reserva.service';
import type { ReservaDTO } from '../../types/api/Reserva';
import { format } from 'date-fns';
import { ImagenService } from '../../services/imagen.service';
import type { ImagenDTO } from '../../types/api/Imagen';
import { DetailsImageGallery } from '../common/DetailsImageGallery';

export const ServicesCarousel = () => {
    const [servicios, setServicios] = useState<ServicioDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedService, setSelectedService] = useState<ServicioDTO | null>(null);
    const [disponibilidades, setDisponibilidades] = useState<ServicioDisponibilidadDTO[]>([]);

    const [loadingDetails, setLoadingDetails] = useState(false);
    const [isServiceDetailOpen, setIsServiceDetailOpen] = useState(false);
    const [extraImages, setExtraImages] = useState<ImagenDTO[]>([]);

    // Client Selection for Admin/Employee
    const [isClientSelectOpen, setIsClientSelectOpen] = useState(false);
    const [reservas, setReservas] = useState<ReservaDTO[]>([]);
    const [loadingReservas, setLoadingReservas] = useState(false);
    const [selectedReserva, setSelectedReserva] = useState<ReservaDTO | null>(null);
    const [openReservaCombobox, setOpenReservaCombobox] = useState(false);

    const navigate = useNavigate();
    const { isAdmin, isEmployee } = useAuth();

    useEffect(() => {
        const loadServices = async () => {
            try {
                // Fetch services
                const res = await ServicioService.getServicios({ page: 0, size: 50 });
                // Filter those with images and available
                const validServices = res.data.filter(s => s.urlImage && s.disponible);
                setServicios(validServices);
            } catch (error) {
                console.error("Failed to load carousel services", error);
            } finally {
                setLoading(false);
            }
        };
        loadServices();
    }, []);

    const handleServiceClick = async (servicio: ServicioDTO) => {
        setSelectedService(servicio);
        setIsServiceDetailOpen(true);
        setLoadingDetails(true);
        setExtraImages([]); // Clear previous images

        try {
            const [dispoRes, imgRes] = await Promise.all([
                ServicioDisponibilidadService.getByServicio(servicio.id),
                ImagenService.getImagens({ 'servicioId.equals': servicio.id })
            ]);

            setDisponibilidades(dispoRes.data);
            setExtraImages(imgRes.data);
        } catch (error) {
            console.error("Error loading details", error);
        } finally {
            setLoadingDetails(false);
        }
    };

    const handleContratar = async () => {
        if (!selectedService) return;

        if (isAdmin() || isEmployee()) {
            // Close details modal, then open selection modal
            setIsServiceDetailOpen(false);

            // Wait a tick to avoid focus fighting or simple state batching if needed
            // But React batching usually handles this.
            // Keeping selectedService populated is key.

            setSelectedReserva(null);
            setLoadingReservas(true);
            setIsClientSelectOpen(true);
            try {
                const res = await ReservaService.getReservas({ size: 100, sort: 'fechaInicio,desc' });
                // Consider filtering active?
                setReservas(res.data);
            } catch (error) {
                console.error("Error loading reservas", error);
                toast.error("Error cargando lista de clientes");
            } finally {
                setLoadingReservas(false);
            }
        } else {
            // Client: Navigate to services catalog with pre-selected service
            const serviceToBook = selectedService;
            setIsServiceDetailOpen(false);
            setSelectedService(null);
            navigate('/client/servicios', { state: { preSelectedService: serviceToBook } });
        }
    };

    const handleConfirmAdminContract = () => {
        if (!selectedReserva || !selectedService) return;

        const target = isAdmin() ? '/admin/servicios/contratar' : '/employee/servicios/contratar';

        // Close modals
        setIsClientSelectOpen(false);
        setSelectedService(null);

        navigate(target, {
            state: {
                preSelectedService: selectedService,
                preSelectedReserva: selectedReserva
            }
        });
    };

    if (loading || servicios.length === 0) return null;

    // Use duplicated list only if there are enough items to warrant a loop
    const displayServices = [...servicios, ...servicios];

    return (
        <div className="w-full bg-muted border-y border-border overflow-hidden py-8">
            <style>
                {`
                @keyframes scroll-ltr {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-scroll-services {
                    display: flex;
                    width: max-content;
                    animation: scroll-ltr 40s linear infinite;
                }
                .animate-scroll-services:hover {
                    animation-play-state: paused;
                }
                `}
            </style>

            <div className="relative w-full max-w-[1920px] mx-auto ">

                {/* Gradient Masks */}
                <div className="absolute left-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-r from-gray-900 to-transparent pointer-events-none"></div>
                <div className="absolute right-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-l from-gray-900 to-transparent pointer-events-none"></div>

                <div
                    className="flex gap-6 w-max animate-scroll-services "
                >
                    {displayServices.map((servicio, idx) => (
                        <div
                            key={`${servicio.id}-${idx}`}
                            onClick={() => handleServiceClick(servicio)}
                            className="relative w-80 h-50 flex-shrink-0 rounded-lg overflow-hidden border-2 border-gray-700 shadow-xl group hover:border-yellow-500 transition-colors cursor-pointer"
                        >
                            <img
                                src={servicio.urlImage ? getImageUrl(servicio.urlImage) : '/placeholder.jpg'}
                                alt={servicio.nombre}
                                className="w-full h-full object-cover grayscale-50 group-hover:grayscale-0 transition-all duration-400 transform group-hover:scale-110"
                            />

                            {/* Hover Overlay with text "Ver más" */}
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-300 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100">
                                <div className="bg-yellow-500 text-black px-4 py-2 rounded-full font-bold flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 shadow-lg">
                                    <Info size={18} />
                                    <span>Ver información</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* SERVICE INFO DIALOG */}
            <Dialog open={isServiceDetailOpen} onOpenChange={setIsServiceDetailOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col p-0 gap-0 bg-background text-foreground border-none">
                <DialogHeader className="p-6 pb-2 shrink-0">
                    <DialogTitle className="text-2xl font-bold">{selectedService?.nombre}</DialogTitle>
                    <DialogDescription className="text-gray-500">
                        Detalles del servicio
                    </DialogDescription>
                </DialogHeader>

                    <div className="flex-1 overflow-y-auto p-6 pt-2 space-y-6">
                        <div className="relative h-64 w-full rounded-lg  bg-gray-100">
                            <DetailsImageGallery
                                mainImage={selectedService?.urlImage}
                                extraImages={extraImages}
                                className="h-full w-full"
                                autoPlay={true}
                            />
                        </div>

                        <p className="text-gray-700 leading-relaxed">
                            {selectedService?.descripcion || "Sin descripción disponible."}
                        </p>

                        {selectedService?.tipo === TipoServicio.PAGO && (
                            <div className="flex items-center justify-between p-4 bg-gray-200 dark:bg-gray-800 rounded-lg border-none">
                                <span className="font-bold text-foreground">Precio</span>
                                <span className="text-2xl font-bold text-yellow-600">
                                    ${selectedService?.precio !== undefined ? selectedService.precio : '0.00'}
                                </span>
                            </div>
                        )}

                        {loadingDetails ? (
                            <div className="flex justify-center p-4">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
                            </div>
                        ) : (
                            <ServiceAvailabilityInfo disponibilidades={disponibilidades} />
                        )}


                        {selectedService?.tipo === TipoServicio.PAGO ? (
                            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mt-4 dark:bg-yellow-900/20">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <Info className="h-5 w-5 text-yellow-500" aria-hidden="true" />
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-yellow-700">
                                            Nota: Los servicios solo pueden ser contratados por clientes que tengan una reserva activa.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : selectedService?.tipo === TipoServicio.GRATUITO ? (
                            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mt-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <Info className="h-5 w-5 text-blue-500" aria-hidden="true" />
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-blue-700">
                                            Con tu reserva ya viene este servicio incluido de manera gratuita.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </div>

                <DialogFooter className="p-6 pt-0 gap-2 sm:gap-0 shrink-0">
                    <Button variant="outline" onClick={() => setIsServiceDetailOpen(false)}>Cerrar</Button>
                    {selectedService?.tipo === TipoServicio.PAGO && (
                        <Button onClick={handleContratar} className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold">
                            {isAdmin() || isEmployee() ? 'Gestionar Contratación' : 'Ir a Contratar'} <ExternalLink className="ml-2 w-4 h-4" />
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
            </Dialog>

            {/* ADMIN/EMPLOYEE CLIENT SELECTION DIALOG */}
            <Dialog open={isClientSelectOpen} onOpenChange={setIsClientSelectOpen}>
                <DialogContent className="sm:max-w-[500px] bg-white text-gray-900">
                    <DialogHeader>
                        <DialogTitle>Seleccionar Cliente</DialogTitle>
                        <DialogDescription>
                            Para contratar <strong>{selectedService?.nombre}</strong>, primero indique para qué cliente/reserva es.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        <label className="text-sm font-bold text-gray-700 block mb-2">Buscar por ID de reserva</label>
                        <Popover open={openReservaCombobox} onOpenChange={setOpenReservaCombobox}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={openReservaCombobox}
                                    className="w-full justify-between"
                                >
                                    {selectedReserva ? (
                                        <span className="flex items-center gap-2 truncate">
                                            <Calendar className="h-4 w-4 text-gray-500" />
                                            #{selectedReserva.id} - {selectedReserva.cliente?.nombre} {selectedReserva.cliente?.apellido}
                                        </span>
                                    ) : (
                                        <span className="text-muted-foreground">
                                            {loadingReservas ? "Cargando..." : "Buscar por ID de reserva..."}
                                        </span>
                                    )}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[450px] p-0" align="start">
                                <Command>
                                    <CommandInput placeholder="Buscar por ID de reserva..." />
                                    <CommandList>
                                        <CommandEmpty>No se encontraron reservas.</CommandEmpty>
                                        <CommandGroup className="max-h-[300px] overflow-auto">
                                            {reservas.map((r) => {
                                                const clienteNombre = `${r.cliente?.nombre || ''} ${r.cliente?.apellido || ''}`.trim();
                                                const doc = r.cliente?.numeroIdentificacion || '';
                                                const searchValue = `${r.id} ${clienteNombre} ${doc}`.toLowerCase();
                                                return (
                                                    <CommandItem
                                                        key={r.id}
                                                        value={searchValue}
                                                        onSelect={() => {
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
                                                        <div className="flex flex-col">
                                                            <div className="font-medium flex items-center gap-2">
                                                                <span>Reserva #{r.id}</span>
                                                                <span className="text-gray-400">|</span>
                                                                <span>{clienteNombre}</span>
                                                            </div>
                                                            {doc && <div className="text-xs text-gray-500">Doc: {doc}</div>}
                                                            <div className="text-xs text-gray-400">
                                                                {r.fechaInicio ? format(new Date(r.fechaInicio), 'dd/MMM') : ''} - {r.fechaFin ? format(new Date(r.fechaFin), 'dd/MMM') : ''}
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
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsClientSelectOpen(false)}>Cancelar</Button>
                        <Button
                            onClick={handleConfirmAdminContract}
                            disabled={!selectedReserva}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white"
                        >
                            Continuar a Contratación
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
