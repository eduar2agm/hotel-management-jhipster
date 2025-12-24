
import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogTitle,
    DialogDescription
} from "../ui/dialog";
import type { HabitacionDTO } from "../../types/api/Habitacion";
import { Button } from "../ui/button";
import { Users, Info, DollarSign, Tag, Calendar, CheckCircle2, XCircle, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { ClienteService } from "../../services/cliente.service";
import type { ClienteDTO } from "../../types/api/Cliente";
import type { ImagenDTO } from "../../types/api/Imagen";
import { ImagenService } from "../../services/imagen.service";
import { DetailsImageGallery } from "../common/DetailsImageGallery";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "../ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "../ui/popover";
import { Check, ChevronsUpDown, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { HabitacionService } from "../../services/habitacion.service";
import { toast } from "sonner";

interface RoomInfoModalProps {
    room: HabitacionDTO | null;
    isOpen: boolean;
    onClose: () => void;
}

const getLocalTodayStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const RoomInfoModal = ({ room, isOpen, onClose }: RoomInfoModalProps) => {
    const navigate = useNavigate();
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isChecking, setIsChecking] = useState(false);
    const [availabilityStatus, setAvailabilityStatus] = useState<'idle' | 'available' | 'unavailable'>('idle');

    // ADMIN/EMPLOYEE STATE
    const { isAdmin, isEmployee } = useAuth();
    const isStaff = isAdmin() || isEmployee();
    const [clientes, setClientes] = useState<ClienteDTO[]>([]);
    const [selectedCliente, setSelectedCliente] = useState<ClienteDTO | null>(null);
    const [openClientCombo, setOpenClientCombo] = useState(false);

    // Load clients if user is staff
    useEffect(() => {
        if (isOpen && isStaff) {
            ClienteService.getClientes({ size: 1000 }).then(res => {
                setClientes(res.data);
            }).catch(err => console.error("Error loading clients", err));
        }
    }, [isOpen, isStaff]);

    // Reset state when modal opens/closes or room changes
    useEffect(() => {
        if (!isOpen) {
            setStartDate('');
            setEndDate('');
            setAvailabilityStatus('idle');
            setSelectedCliente(null);
            setExtraImages([]);
        } else if (room?.id) {
            ImagenService.getImagens({ 'habitacionId.equals': room.id })
                .then(res => setExtraImages(res.data))
                .catch(err => console.error(err));
        }
    }, [isOpen, room]);

    const [extraImages, setExtraImages] = useState<ImagenDTO[]>([]);

    if (!room) return null;

    const checkAvailability = async () => {
        if (!startDate || !endDate) {
            toast.error("Por favor seleccione ambas fechas");
            return;
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (start >= end) {
            toast.error("La fecha de salida debe ser posterior a la de llegada");
            return;
        }

        setIsChecking(true);
        setAvailabilityStatus('idle');

        try {
            const startStr = `${startDate}T00:00:00Z`;
            const endStr = `${endDate}T00:00:00Z`;
            // Request a large size to ensure we find the room if it's available
            const res = await HabitacionService.getAvailableHabitaciones(startStr, endStr, { size: 1000 });

            const isAvailable = res.data.some(h => h.id === room.id);
            setAvailabilityStatus(isAvailable ? 'available' : 'unavailable');

            if (isAvailable) {
                toast.success("¡Habitación disponible!");
            } else {
                toast.error("Habitación no disponible para las fechas seleccionadas.");
            }
        } catch (error) {
            console.error("Error checking availability:", error);
            toast.error("Error al establecer conexión para verificar disponibilidad");
        } finally {
            setIsChecking(false);
        }
    };

    const handleContinue = () => {
        if (isStaff && !selectedCliente && availabilityStatus === 'available') {
            toast.warning("Por favor seleccione un cliente para realizar la reserva");
            return;
        }

        onClose();

        // Determinar destino exacto basado en el Rol
        let targetPath = '/client/nueva-reserva';
        if (isAdmin()) {
            targetPath = '/admin/reservas';
        } else if (isEmployee()) {
            targetPath = '/employee/reservas';
        }

        const stateData = {
            preSelectedRoom: room,
            startDate,
            endDate,
            // If staff, pass the selected client
            preSelectedCliente: selectedCliente
        };

        if (availabilityStatus === 'available') {
            navigate(targetPath, { state: stateData });
        } else {
            navigate(targetPath);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] max-h-[85vh] flex flex-col bg-background text-foreground border-none p-0 gap-0">
                <div className="flex-1 overflow-y-auto min-h-0">
                    <DialogDescription className="sr-only">
                        Detalles de la habitación {room.numero} y consulta de disponibilidad.
                    </DialogDescription>
                    <div className="relative h-48 w-full flex-shrink-0">
                    <DetailsImageGallery
                        mainImage={room.imagen}
                        extraImages={extraImages}
                        className="w-full h-full"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>
                    <div className="absolute bottom-4 left-6">
                        <DialogTitle className="text-3xl font-bold text-white tracking-tight">
                            Habitación {room.numero}
                        </DialogTitle>
                    </div>
                </div>

                <div className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-yellow-50 rounded-lg dark:bg-yellow-600/20">
                                <Tag className="w-5 h-5 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Categoría</p>
                                <p className="text-base font-semibold text-gray-800 dark:text-gray-200">
                                    {room.categoriaHabitacion?.nombre || 'General'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-green-50 rounded-lg dark:bg-green-600/20">
                                <DollarSign className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Precio por noche</p>
                                <p className="text-base font-semibold text-gray-800 dark:text-gray-200 text-xl">
                                    ${room.categoriaHabitacion?.precioBase?.toLocaleString() || '0'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-blue-50 rounded-lg dark:bg-blue-600/20">
                                <Users className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Capacidad</p>
                                <p className="text-base font-semibold text-gray-800 dark:text-gray-200">
                                    {room.capacidad} {room.capacidad === 1 ? 'Persona' : 'Personas'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 col-span-2 border-t pt-4">
                            <div className="p-2 bg-purple-50 rounded-lg dark:bg-purple-600/20">
                                <Info className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Descripción</p>
                                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                    {room.descripcion || 'Sin descripción disponible para esta habitación.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Verificador de Disponibilidad */}
                    <div className=" p-6 rounded-2xl border-none space-y-4 bg-background dark:bg-slate-900">
                        <div className="flex items-center gap-2 mb-2">
                            <Calendar className="w-5 h-5 text-yellow-600" />
                            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Consultar Disponibilidad</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="start" className="text-[10px] font-bold text-gray-400 uppercase">Llegada</Label>
                                <Input
                                    id="start"
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => {
                                        setStartDate(e.target.value);
                                        setAvailabilityStatus('idle');
                                    }}
                                    min={getLocalTodayStr()}
                                    className="h-11 bg-background text-foreground border-input dark:[color-scheme:dark] focus:ring-yellow-500"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="end" className="text-[10px] font-bold text-gray-400 uppercase">Salida</Label>
                                <Input
                                    id="end"
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => {
                                        setEndDate(e.target.value);
                                        setAvailabilityStatus('idle');
                                    }}
                                    min={startDate || getLocalTodayStr()}
                                    className="h-11 bg-background text-foreground border-input dark:[color-scheme:dark] focus:ring-yellow-500"
                                />
                            </div>
                        </div>

                        <Button
                            onClick={checkAvailability}
                            disabled={!startDate || !endDate || isChecking}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-yellow-600/20 dark:hover:bg-yellow-600/30 dark:text-yellow-500 hover:dark:text-yellow-400 h-12 text-xs font-black uppercase tracking-[0.2em] transition-all"
                        >
                            {isChecking ? (
                                <span className="flex items-center gap-2">
                                    <Search className="w-4 h-4 animate-pulse" /> Verificando...
                                </span>
                            ) : "Verificar Disponibilidad"}
                        </Button>

                        {availabilityStatus === 'available' && (
                            <div className="flex items-center justify-center gap-2 p-3 bg-green-50 rounded-lg text-green-700 border border-none animate-in fade-in zoom-in duration-300 dark:bg-green-900/20">
                                <CheckCircle2 className="w-5 h-5" />
                                <span className="text-sm font-bold">¡Disponible para las fechas seleccionadas!</span>
                            </div>
                        )}
                        {availabilityStatus === 'unavailable' && (
                            <div className="flex items-center justify-center gap-2 p-3 bg-red-50 rounded-lg text-red-700 border border-red-100 animate-in fade-in zoom-in duration-300">
                                <XCircle className="w-5 h-5" />
                                <span className="text-sm font-bold">No disponible en este rango.</span>
                            </div>
                        )}
                    </div>

                    {/* SELECCION DE CLIENTE (SOLO ADMIN/EMPLOYEE) */}
                    {isStaff && availabilityStatus === 'available' && (
                        <div className="bg-gray-200 p-6 rounded-2xl border border-none dark:bg-background dark:ring-1 dark:ring-gray-800 space-y-4 animate-in fade-in slide-in-from-top-2">
                            <div className="flex items-center gap-2 mb-2">
                                <User className="w-5 h-5 text-blue-600" />
                                <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">Seleccionar Cliente</h3>
                            </div>

                            <Popover open={openClientCombo} onOpenChange={setOpenClientCombo}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={openClientCombo}
                                        className="w-full justify-between h-12 dark:ring-1 dark:ring-gray-800 bg-muted-background border-none"
                                    >
                                        {selectedCliente
                                            ? `${selectedCliente.nombre} ${selectedCliente.apellido} (${selectedCliente.numeroIdentificacion || 'Sin ID'})`
                                            : "Buscar cliente por nombre o DNI..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[calc(600px-4rem)] p-0 z-[10000]">
                                    <Command>
                                        <CommandInput placeholder="Ej: 001-XXXXXX-XXXXL o Nombre..." />
                                        <CommandList>
                                            <CommandEmpty>No se encontraron clientes.</CommandEmpty>
                                            <CommandGroup className="max-h-64 overflow-y-auto">
                                                {clientes.map((cliente) => (
                                                    <CommandItem
                                                        key={cliente.id}
                                                        value={`${cliente.nombre} ${cliente.apellido} ${cliente.numeroIdentificacion || ''}`}
                                                        onSelect={() => {
                                                            setSelectedCliente(cliente);
                                                            setOpenClientCombo(false);
                                                        }}
                                                        className="flex flex-col items-start py-3"
                                                    >
                                                        <div className="flex items-center w-full">
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    selectedCliente?.id === cliente.id ? "opacity-100" : "opacity-0"
                                                                )}
                                                            />
                                                            <span className="font-bold">{cliente.nombre} {cliente.apellido}</span>
                                                        </div>
                                                        <span className="text-[10px] text-gray-500 ml-6">
                                                            ID: {cliente.numeroIdentificacion || 'No registrado'} | {cliente.correo}
                                                        </span>
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                    )}
                </div>
                </div>

                <DialogFooter className="p-4 bg-gray-50 border-t border-gray-100 dark:bg-slate-900 dark:border-slate-800 gap-2 sm:gap-0 shrink-0 z-10">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="text-gray-500 ring-1 ring-gray-800 hover:text-gray-700 px-10 h-12 hover:bg-gray-200/50 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-slate-800 font-bold"
                    >
                        Cerrar
                    </Button>
                    <Button
                        onClick={handleContinue}
                        className={`font-black px-10 h-12 shadow-lg transition-all hover:-translate-y-1 active:translate-y-0 ${availabilityStatus === 'available'
                            ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-200'
                            : 'bg-yellow-500 hover:bg-yellow-600 text-black shadow-yellow-200/40'
                            }`}
                    >
                        {availabilityStatus === 'available' ? 'RESERVAR AHORA' : 'IR A RESERVAS'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
