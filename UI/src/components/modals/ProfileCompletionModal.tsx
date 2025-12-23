import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { ClienteService } from '../../services';
import {
    IDENTIFICATION_TYPES,
    validateIdentification,
    formatIdentification,
    IDENTIFICATION_PLACEHOLDERS,
    TipoIdentificacion
} from '../../utils/identification';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';
import { ShieldCheck, Contact, Hotel, Save, Loader2 } from 'lucide-react';
import type { NewClienteDTO } from '../../types/api';

export const ProfileCompletionModal = () => {
    const { user, isAuthenticated, isLoading: authLoading, isClient } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [idError, setIdError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        correo: '',
        telefono: '',
        direccion: '',
        tipoIdentificacion: 'CEDULA' as TipoIdentificacion,
        numeroIdentificacion: '',
        fechaNacimiento: ''
    });

    useEffect(() => {
        const checkClientRecord = async () => {
            // EVITAR EN HOME: Si el usuario está en la página principal, no molestamos con el modal.
            const isHomePage = window.location.pathname === '/' || window.location.pathname === '/HomePage';

            if (isAuthenticated && isClient() && user?.email && !isHomePage) {
                try {
                    const res = await ClienteService.getClientes({ size: 1000 });
                    const found = res.data.find(c => c.correo === user.email);

                    if (!found) {
                        setFormData(prev => ({
                            ...prev,
                            nombre: user.firstName || prev.nombre,
                            apellido: user.lastName || prev.apellido,
                            correo: user.email || prev.correo,
                        }));
                        setIsOpen(true);
                    } else {
                        setIsOpen(false);
                    }
                } catch (error) {
                    console.error('ProfileCompletionModal: Error de red o servidor', error);
                    // Si el servidor está apagado (ECONNREFUSED), NO abrimos el modal
                    // para no bloquear la experiencia de desarrollo.
                    setIsOpen(false);
                }
            } else {
                setIsOpen(false);
            }
        };

        if (!authLoading && user) {
            checkClientRecord();
        }
    }, [isAuthenticated, isClient, user, authLoading, window.location.pathname]);

    // Bloquear scroll del body cuando el modal esté abierto
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);



    // GUARDIA ABSOLUTA: Si no hay login, el componente es invisible.
    if (authLoading || !isAuthenticated || !isClient() || !user) {
        return null;
    }

    const handleIdChange = (val: string) => {
        const formatted = formatIdentification(formData.tipoIdentificacion, val);
        setFormData({ ...formData, numeroIdentificacion: formatted });
        const error = validateIdentification(formData.tipoIdentificacion, formatted);
        setIdError(error);
    };

    const handleTypeChange = (val: string) => {
        setFormData({
            ...formData,
            tipoIdentificacion: val as TipoIdentificacion,
            numeroIdentificacion: ''
        });
        setIdError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const error = validateIdentification(formData.tipoIdentificacion, formData.numeroIdentificacion);
        if (error) {
            setIdError(error);
            toast.error(`Error en Identificación: ${error}`);
            return;
        }

        // Validación de Edad (Mayor de 18 años)
        if (!formData.fechaNacimiento) {
            toast.error('Fecha de nacimiento requerida.');
            return;
        }
        const dob = new Date(formData.fechaNacimiento);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
            age--;
        }
        if (age < 18) {
            toast.error('Debe ser mayor de 18 años para registrarse.');
            return;
        }

        // Validación de consistencia Cédula vs Fecha de Nacimiento
        // Formato Cédula NI: XXX-DDMMYY-XXXXL
        if (formData.tipoIdentificacion === 'CEDULA' && formData.numeroIdentificacion) {
            // Extrae solo dígitos para el análisis: 281270200...
            const sequence = formData.numeroIdentificacion.replace(/[^0-9A-Z]/gi, '');
            // Si el formato es estándar: 3 dígitos municipio + 6 fecha + ... 
            // La fecha empieza en índice 3
            if (sequence.length >= 9) {
                const cedulaDate = sequence.substring(3, 9); // DDMMYY
                // formData.fechaNacimiento es YYYY-MM-DD
                const [year, month, day] = formData.fechaNacimiento.split('-');
                const dobFormatted = `${day}${month}${year.slice(2)}`;

                if (cedulaDate !== dobFormatted) {
                    toast.error('La fecha de nacimiento no coincide con la cédula (DDMMYY).');
                    return;
                }
            }
        }

        setIsSaving(true);
        try {
            const payload: NewClienteDTO = {
                ...formData,
                keycloakId: user?.id || 'unknown',
                activo: true
            };
            await ClienteService.createCliente(payload);
            toast.success('¡Perfil completado con éxito!');
            setIsOpen(false);
        } catch (error) {
            console.error('Error saving profile:', error);
            toast.error('Hubo un error al guardar su perfil. Por favor intente más tarde.');
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-4 overflow-y-auto">
            <div className="bg-white w-full max-w-xl rounded-sm shadow-2xl border-t-8 border-yellow-600 animate-in fade-in zoom-in duration-300 my-8">

                {/* Header del Modal */}
                <div className="p-6 border-b border-gray-100 flex flex-col items-center text-center relative">
                    <div className="bg-yellow-50 p-3 rounded-full mb-3">
                        <Hotel className="h-8 w-8 text-yellow-600" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 font-serif lowercase"><span className="uppercase">C</span>ompletar <span className="uppercase">R</span>egistro</h2>
                    <p className="text-gray-400 mt-1 text-xs font-light max-w-md italic">
                        Paso obligatorio para acceder a nuestra plataforma de reservas.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">

                    {/* Sección: Información Básica (Read-only from Keycloak) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Nombre completo</Label>
                            <div className="h-9 px-3 flex items-center bg-gray-50 border border-gray-100 text-gray-500 text-xs font-medium">
                                {formData.nombre} {formData.apellido}
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Correo electrónico</Label>
                            <div className="h-9 px-3 flex items-center bg-gray-50 border border-gray-100 text-gray-500 text-xs font-medium">
                                {formData.correo}
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent w-full"></div>

                    {/* Sección: Datos de Negocio */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-1 font-bold text-gray-900 text-xs uppercase tracking-wider">
                                <Contact className="h-3.5 w-3.5 text-yellow-600" /> Contacto
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold text-gray-500 uppercase">Teléfono móvil</Label>
                                <Input
                                    required
                                    placeholder="+505 0000 0000"
                                    className="h-10 text-sm border-gray-200 focus:border-yellow-600 focus:ring-yellow-600/20"
                                    value={formData.telefono}
                                    onChange={e => setFormData({ ...formData, telefono: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold text-gray-500 uppercase">Dirección de domicilio</Label>
                                <Input
                                    className="h-10 text-sm border-gray-200 focus:border-yellow-600 focus:ring-yellow-600/20"
                                    placeholder="Ciudad, departamento..."
                                    value={formData.direccion}
                                    onChange={e => setFormData({ ...formData, direccion: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold text-gray-500 uppercase">Fecha de Nacimiento</Label>
                                <Input
                                    type="date"
                                    required
                                    className="h-10 text-sm border-gray-200 focus:border-yellow-600 focus:ring-yellow-600/20"
                                    value={formData.fechaNacimiento}
                                    onChange={e => setFormData({ ...formData, fechaNacimiento: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-1 font-bold text-gray-900 text-xs uppercase tracking-wider">
                                <ShieldCheck className="h-3.5 w-3.5 text-yellow-600" /> Identificación
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold text-gray-500 uppercase">Tipo de documento</Label>
                                <Select value={formData.tipoIdentificacion} onValueChange={handleTypeChange}>
                                    <SelectTrigger className="h-10 text-sm border-gray-200 focus:ring-yellow-600/20">
                                        <SelectValue placeholder="Seleccione tipo" />
                                    </SelectTrigger>
                                    <SelectContent className="z-[99999]">
                                        {IDENTIFICATION_TYPES.map(type => (
                                            <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold text-gray-500 uppercase">Número de documento</Label>
                                <div className="relative">
                                    <Input
                                        required
                                        className={`h-10 text-sm ${idError ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-yellow-600"}`}
                                        placeholder={IDENTIFICATION_PLACEHOLDERS[formData.tipoIdentificacion] || 'Ingrese número'}
                                        value={formData.numeroIdentificacion}
                                        onChange={e => handleIdChange(e.target.value)}
                                    />
                                    {idError && <span className="absolute -bottom-5 left-0 text-[10px] text-red-500 font-medium">{idError}</span>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer / Acción */}
                    <div className="pt-6 flex flex-col gap-3">
                        <Button
                            type="submit"
                            disabled={isSaving || !!idError}
                            className="w-full h-11 bg-gray-900 hover:bg-gray-800 text-white rounded-none uppercase text-xs tracking-widest font-black transition-all shadow-xl disabled:opacity-50"
                        >
                            {isSaving ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" /> Procesando registro...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Save className="h-4 w-4" /> Finalizar y entrar
                                </span>
                            )}
                        </Button>
                        <p className="text-[10px] text-gray-400 text-center italic">
                            * Al finalizar, su cuenta quedará vinculada permanentemente a nuestro sistema de gestión.
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};
