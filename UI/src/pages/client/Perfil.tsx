import { useEffect, useState } from 'react';
import { Navbar } from '../../components/ui/Navbar';
import { Footer } from '../../components/ui/Footer'; // Asumo que tienes el Footer
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '../../hooks/useAuth';
import { ClienteService } from '../../services';
import type { ClienteDTO, NewClienteDTO } from '../../types/api';
import { toast } from 'sonner';
import { Save, User, Crown, Mail, Phone, MapPin, CreditCard } from 'lucide-react';
import logo from '../../assets/logoN.png';

export const Perfil = () => {
    const { user } = useAuth();
    const [cliente, setCliente] = useState<Partial<ClienteDTO>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [exists, setExists] = useState(false);

    useEffect(() => {
        const loadProfile = async () => {
            if (!user?.email) return;

            try {
                const res = await ClienteService.getClientes({ size: 1000 });
                const found = res.data.find(c => c.correo === user.email);

                if (found) {
                    setCliente(found);
                    setExists(true);
                } else {
                    setCliente({
                        nombre: user.firstName || '',
                        apellido: user.lastName || '',
                        correo: user.email,
                        telefono: '',
                        direccion: '',
                        tipoIdentificacion: 'DNI',
                        numeroIdentificacion: ''
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
        setIsSaving(true);
        try {
            if (exists && cliente.id) {
                await ClienteService.updateCliente(cliente.id, cliente as ClienteDTO);
                toast.success('Perfil actualizado correctamente');
            } else {
                const newCliente = await ClienteService.createCliente({ ...cliente, activo: true } as NewClienteDTO);
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

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin text-yellow-500">
                    <img src={logo} className="h-12 w-12" />
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen font-sans">
            <Navbar />
            
            {/* --- HERO SECTION --- */}
            <div className="bg-gray-900 pt-32 pb-24 px-6 relative overflow-hidden">
                {/* Patrón de fondo opcional */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl -translate-y-10 translate-x-10"></div>
                
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center justify-center p-3 bg-gray-800 rounded-full mb-6 border border-gray-700">
                        <img src={logo} className="h-20 w-20" />
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-wider mb-4">
                        Tu Membresía
                    </h1>
                    <p className="text-gray-400 text-lg max-w-xl mx-auto">
                        Mantén tu información actualizada para disfrutar de beneficios exclusivos y check-in express en tu próxima llegada.
                    </p>
                </div>
            </div>

            {/* --- CONTENIDO PRINCIPAL --- */}
            <div className="max-w-4xl mx-auto px-6 -mt-16 pb-20 relative z-20">
                <Card className="border-t-4 border-t-yellow-500 shadow-2xl rounded-xl overflow-hidden bg-white border-x-0 border-b-0">
                    <CardHeader className="border-b border-gray-100 bg-white p-8 flex flex-col items-center text-center">
                        <CardTitle className="flex items-center gap-3 text-2xl font-bold text-gray-900">
                            <User className="h-6 w-6 text-yellow-600" /> 
                            Información Personal
                        </CardTitle>
                        <p className="text-gray-500 text-sm mt-1">
                            Los campos marcados son necesarios para la facturación y reservas.
                        </p>
                    </CardHeader>

                    <form onSubmit={handleSave}>
                        <CardContent className="p-8 grid gap-8">
                            
                            {/* Sección 1: Datos Básicos */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 border-b pb-2">Identidad</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-gray-600 uppercase">Nombre</Label>
                                        <Input
                                            className="bg-gray-50 border-gray-200 focus:border-yellow-500 focus:ring-yellow-500/20 py-5"
                                            value={cliente.nombre || ''}
                                            onChange={e => setCliente({ ...cliente, nombre: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-gray-600 uppercase">Apellido</Label>
                                        <Input
                                            className="bg-gray-50 border-gray-200 focus:border-yellow-500 focus:ring-yellow-500/20 py-5"
                                            value={cliente.apellido || ''}
                                            onChange={e => setCliente({ ...cliente, apellido: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Sección 2: Contacto */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 border-b pb-2">Contacto</h3>
                                
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-gray-600 uppercase flex items-center gap-2">
                                        <Mail size={14}/> Correo Electrónico
                                    </Label>
                                    <Input
                                        value={cliente.correo || ''}
                                        disabled={true}
                                        className="bg-gray-100/50 border-gray-200 text-gray-500 cursor-not-allowed py-5"
                                    />
                                    <p className="text-[10px] text-gray-400 text-right">* El correo es gestionado por su cuenta de acceso.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-gray-600 uppercase flex items-center gap-2">
                                            <Phone size={14}/> Teléfono
                                        </Label>
                                        <Input
                                            className="bg-gray-50 border-gray-200 focus:border-yellow-500 focus:ring-yellow-500/20 py-5"
                                            value={cliente.telefono || ''}
                                            onChange={e => setCliente({ ...cliente, telefono: e.target.value })}
                                            placeholder="+505 0000 0000"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-gray-600 uppercase flex items-center gap-2">
                                            <MapPin size={14}/> Dirección
                                        </Label>
                                        <Input
                                            className="bg-gray-50 border-gray-200 focus:border-yellow-500 focus:ring-yellow-500/20 py-5"
                                            value={cliente.direccion || ''}
                                            onChange={e => setCliente({ ...cliente, direccion: e.target.value })}
                                            placeholder="Ciudad, País"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Sección 3: Documentación Legal */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 border-b pb-2">Documentación</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-gray-600 uppercase flex items-center gap-2">
                                            <CreditCard size={14}/> Tipo Documento
                                        </Label>
                                        <Select
                                            value={cliente.tipoIdentificacion || 'DNI'}
                                            onValueChange={(val) => setCliente({ ...cliente, tipoIdentificacion: val })}
                                        >
                                            <SelectTrigger className="bg-gray-50 border-gray-200 focus:ring-yellow-500/20 py-5">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="DNI">DNI / Cédula</SelectItem>
                                                <SelectItem value="PASAPORTE">Pasaporte</SelectItem>
                                                <SelectItem value="CEDULA">Licencia</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-gray-600 uppercase">Número de Documento</Label>
                                        <Input
                                            className="bg-gray-50 border-gray-200 focus:border-yellow-500 focus:ring-yellow-500/20 py-5"
                                            value={cliente.numeroIdentificacion || ''}
                                            onChange={e => setCliente({ ...cliente, numeroIdentificacion: e.target.value })}
                                            placeholder="Ej: 001-000000-0000A"
                                        />
                                    </div>
                                </div>
                            </div>

                        </CardContent>

                        <CardFooter className="bg-gray-50 px-8 py-6 flex justify-between items-center border-t border-gray-100">
                            <span className="text-xs text-gray-400 italic hidden md:block">
                                Última actualización: {new Date().toLocaleDateString()}
                            </span>
                            <Button 
                                type="submit" 
                                disabled={isSaving}
                                className="bg-gray-900 hover:bg-yellow-500 text-white font-bold uppercase tracking-widest px-8 py-6 transition-all shadow-lg hover:shadow-yellow-500/30"
                            >
                                <Save className="mr-2 h-4 w-4" />
                                {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
            
            <Footer />
        </div>
    );
};