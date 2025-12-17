import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '../../hooks/useAuth';
import { ClienteService } from '../../services';
import type { ClienteDTO, NewClienteDTO } from '../../types/api';
import { toast } from 'sonner';
import { Save, UserCircle, ShieldCheck, Contact } from 'lucide-react'; // Iconos añadidos para decorar
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    IDENTIFICATION_TYPES,
    validateIdentification,
    formatIdentification,
    IDENTIFICATION_PLACEHOLDERS,
    TipoIdentificacion
} from '../../utils/identification';

// Importamos los componentes de UI del Hotel
import { Navbar } from '../../components/ui/Navbar';
import { Footer } from '../../components/ui/Footer';

export const Perfil = () => {
    // --- LÓGICA ORIGINAL INTACTA ---
    const { user } = useAuth();
    const [cliente, setCliente] = useState<Partial<ClienteDTO>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [exists, setExists] = useState(false);
    const [idError, setIdError] = useState<string | null>(null);

    useEffect(() => {
        const loadProfile = async () => {
            if (!user?.email) return;

            try {
                // Ideally backend should provide /api/clientes/me or filter by email
                // Simulating filtering client-side
                const res = await ClienteService.getClientes({ size: 1000 });
                const found = res.data.find(c => c.correo === user.email);

                if (found) {
                    // Check if this profile needs to be linked to the current Keycloak user
                    if ((!found.keycloakId || found.keycloakId === 'not-linked') && user.id) {
                        try {
                            // Link the profile
                            const updated = { ...found, keycloakId: user.id };
                            await ClienteService.updateCliente(found.id!, updated as ClienteDTO);
                            setCliente(updated);
                            setExists(true);
                            toast.success('Perfil vinculado exitosamente a su cuenta');
                        } catch (err) {
                            console.error('Failed to link profile', err);
                            toast.error('Error al vincular perfil existente');
                        }
                    } else {
                        setCliente(found);
                        setExists(true);
                    }
                } else {
                    setCliente({
                        nombre: user.firstName || '',
                        apellido: user.lastName || '',
                        correo: user.email,
                        telefono: '',
                        direccion: '',
                        tipoIdentificacion: 'CEDULA',
                        numeroIdentificacion: '',
                        keycloakId: user.id
                    });
                    setExists(false);
                }
            } catch (error) {
                console.error(error);
                toast.error('Error al cargar perfil');
            } finally {
                setIsLoading(false);
            }
        };

        loadProfile();
    }, [user]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate Identification
        if (cliente.tipoIdentificacion && cliente.numeroIdentificacion) {
            const error = validateIdentification(cliente.tipoIdentificacion, cliente.numeroIdentificacion);
            if (error) {
                setIdError(error);
                toast.error(`Error en Identificación: ${error}`);
                return;
            }
        }

        setIsSaving(true);
        try {
            if (exists && cliente.id) {
                await ClienteService.updateCliente(cliente.id, cliente as ClienteDTO);
                toast.success('Perfil actualizado correctamente');
            } else {
                const payload = {
                    ...cliente,
                    activo: true,
                    // Ensure keycloakId is present
                    keycloakId: cliente.keycloakId || user?.id
                } as NewClienteDTO;

                const newCliente = await ClienteService.createCliente(payload);
                setCliente(newCliente.data);
                setExists(true);
                toast.success('Perfil creado correctamente');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error al guardar perfil');
        } finally {
            setIsSaving(false);
        }
    };

    const handleIdChange = (val: string) => {
        // Apply auto-formatting
        const formatted = formatIdentification(cliente.tipoIdentificacion || 'DNI', val);

        setCliente({ ...cliente, numeroIdentificacion: formatted });

        // Validate with formatted value
        if (cliente.tipoIdentificacion) {
            const error = validateIdentification(cliente.tipoIdentificacion, formatted);
            setIdError(error);
        }
    };

    const handleTypeChange = (val: string) => {
        setCliente({
            ...cliente,
            tipoIdentificacion: val as any,
            // Clear ID when type changes to avoid invalid format confusion
            numeroIdentificacion: ''
        });
        setIdError(null);
    };

    // --- RENDERIZADO UI (REFACTORIZADO) ---

    return (
        <div className="font-sans text-gray-900 bg-gray-50 min-h-screen flex flex-col">
            <Navbar />

            {/* --- HERO SECTION --- */}
            <div className="relative bg-[#0F172A] pt-32 pb-20 px-4 md:px-8 lg:px-20 overflow-hidden shadow-xl">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-900/10 to-transparent pointer-events-none"></div>

                <div className="relative max-w-4xl mx-auto text-center md:text-left">
                    <span className="text-yellow-500 font-bold tracking-[0.2em] uppercase text-xs mb-3 block animate-in fade-in slide-in-from-bottom-2 duration-500">
                        Configuración
                    </span>
                    <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
                        Mi Perfil Personal
                    </h2>
                    <p className="text-slate-400 font-light text-lg max-w-xl leading-relaxed mx-auto md:mx-0">
                        Mantenga su información actualizada para agilizar su proceso de check-in y disfrutar de una experiencia personalizada.
                    </p>
                </div>
            </div>

            <main className="flex-grow py-12 px-4 md:px-8 lg:px-20 relative z-10">
                <div className="max-w-4xl mx-auto -mt-8">

                    {isLoading ? (
                        <div className="text-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto"></div>
                            <p className="mt-4 text-gray-400 uppercase tracking-widest text-sm">Cargando información...</p>
                        </div>
                    ) : (
                        <div className="bg-white shadow-xl border-t-4 border-yellow-600 p-8 md:p-12 rounded-sm">
                            <form onSubmit={handleSave}>
                                <div className="space-y-10">

                                    {/* Sección: Información Básica */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-6 pb-2 border-b border-gray-100">
                                            <UserCircle className="h-5 w-5 text-yellow-600" />
                                            <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wider">Información Básica</h3>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="grid gap-2">
                                                <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Nombre</Label>
                                                <Input
                                                    className="border-gray-200 focus:border-yellow-600 focus:ring-yellow-600/20 h-11 bg-gray-50/50"
                                                    value={cliente.nombre || ''}
                                                    onChange={e => setCliente({ ...cliente, nombre: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Apellido</Label>
                                                <Input
                                                    className="border-gray-200 focus:border-yellow-600 focus:ring-yellow-600/20 h-11 bg-gray-50/50"
                                                    value={cliente.apellido || ''}
                                                    onChange={e => setCliente({ ...cliente, apellido: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Sección: Contacto */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-6 pb-2 border-b border-gray-100">
                                            <Contact className="h-5 w-5 text-yellow-600" />
                                            <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wider">Datos de Contacto</h3>
                                        </div>

                                        <div className="grid gap-6">
                                            <div className="grid gap-2">
                                                <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Correo Electrónico</Label>
                                                <Input
                                                    value={cliente.correo || ''}
                                                    disabled={true}
                                                    className="bg-gray-100 border-gray-200 text-gray-500 h-11 cursor-not-allowed"
                                                />
                                                <p className="text-[10px] text-gray-400">El correo electrónico está vinculado a su cuenta de acceso y no se puede cambiar aquí.</p>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="grid gap-2">
                                                    <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Teléfono</Label>
                                                    <Input
                                                        className="border-gray-200 focus:border-yellow-600 focus:ring-yellow-600/20 h-11 bg-gray-50/50"
                                                        value={cliente.telefono || ''}
                                                        onChange={e => setCliente({ ...cliente, telefono: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Dirección</Label>
                                                    <Input
                                                        className="border-gray-200 focus:border-yellow-600 focus:ring-yellow-600/20 h-11 bg-gray-50/50"
                                                        value={cliente.direccion || ''}
                                                        onChange={e => setCliente({ ...cliente, direccion: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Sección: Identificación */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-6 pb-2 border-b border-gray-100">
                                            <ShieldCheck className="h-5 w-5 text-yellow-600" />
                                            <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wider">Identificación Legal</h3>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="grid gap-2">
                                                <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Tipo de Documento</Label>
                                                <Select
                                                    value={cliente.tipoIdentificacion || 'CEDULA'}
                                                    onValueChange={handleTypeChange}
                                                >
                                                    <SelectTrigger className="border-gray-200 h-11 bg-gray-50/50 focus:ring-yellow-600/20">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {IDENTIFICATION_TYPES.map((type) => (
                                                            <SelectItem key={type.value} value={type.value}>
                                                                {type.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="grid gap-2">
                                                <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Número de Documento</Label>
                                                <div className="relative">
                                                    <Input
                                                        value={cliente.numeroIdentificacion || ''}
                                                        onChange={e => handleIdChange(e.target.value)}
                                                        required
                                                        className={`h-11 bg-gray-50/50 ${idError ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-yellow-600"}`}
                                                        placeholder={IDENTIFICATION_PLACEHOLDERS[cliente.tipoIdentificacion as TipoIdentificacion] || ''}
                                                    />
                                                    {idError && <span className="absolute text-xs text-red-500 -bottom-5 left-0">{idError}</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-gray-100 flex justify-end">
                                        <Button
                                            type="submit"
                                            disabled={isSaving || !!idError}
                                            className="bg-gray-900 hover:bg-gray-800 text-white rounded-none px-8 py-6 h-auto text-sm uppercase tracking-widest transition-all shadow-lg hover:shadow-xl disabled:opacity-70"
                                        >
                                            <Save className="mr-2 h-4 w-4" />
                                            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};