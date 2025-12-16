import { useEffect, useState } from 'react';
import { MensajeSoporteService } from '../../services';
import type { MensajeSoporteDTO } from '../../types/api';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, MessageSquare, Clock, Send, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '../../hooks/useAuth';

// Importamos los componentes de UI del Hotel
import { Navbar } from '../../components/ui/Navbar';
import { Footer } from '../../components/ui/Footer';

export const ClientMensajesSoporte = () => {
    // --- LÓGICA ORIGINAL INTACTA ---
    const { user } = useAuth();
    const [mensajes, setMensajes] = useState<MensajeSoporteDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Pagination
    const [currentPage, setCurrentPage] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const itemsPerPage = 5;

    const [currentItem, setCurrentItem] = useState<Partial<MensajeSoporteDTO>>({});

    const loadData = async (page: number) => {
        setLoading(true);
        try {
            const msgsRes = await MensajeSoporteService.getMyMensajes({
                page: page,
                size: itemsPerPage,
                sort: 'fechaMensaje,desc'
            });
            setMensajes(msgsRes.data);
            const total = parseInt(msgsRes.headers['x-total-count'] || '0', 10);
            setTotalItems(total);
        } catch (error) {
            toast.error('Error al cargar mensajes');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData(currentPage);
    }, [currentPage]);

    const handleCreate = () => {
        setCurrentItem({
            fechaMensaje: new Date().toISOString(),
            remitente: 'CLIENT',
            leido: false,
            activo: true
        });
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...currentItem,
                userId: user?.id || 'client',
                userName: user?.username || 'Client',
                fechaMensaje: new Date().toISOString()
            };
            await MensajeSoporteService.createMensaje(payload as any);
            toast.success('Mensaje enviado al soporte');
            setIsDialogOpen(false);
            loadData(0); // Reload first page on new message
            setCurrentPage(0);
        } catch (error) {
            toast.error('Error al enviar mensaje');
        }
    };

    const filteredMensajes = mensajes.filter(m =>
        m.mensaje?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // --- RENDERIZADO UI (REFACTORIZADO) ---

    return (
        <div className="font-sans text-gray-900 bg-gray-50 min-h-screen flex flex-col">
            <Navbar />

            {/* --- HERO SECTION --- 
                Agregamos pt-32 (padding top) para compensar el Navbar absoluto y evitar que tape el contenido.
                Fondo azul marino oscuro (#0f172a = slate-900) solicitado.
            */}
            <div className="relative bg-[#0F172A] pt-32 pb-20 px-4 md:px-8 lg:px-20 overflow-hidden shadow-xl">
                {/* Efecto de fondo sutil */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-900/10 to-transparent pointer-events-none"></div>

                <div className="relative max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
                    <div>
                        <span className="text-yellow-500 font-bold tracking-[0.2em] uppercase text-xs mb-3 block animate-in fade-in slide-in-from-bottom-2 duration-500">
                            Concierge Digital
                        </span>
                        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
                            Asistencia al Huésped
                        </h2>
                        <p className="text-slate-400 font-light text-lg max-w-xl leading-relaxed">
                            Estamos aquí para resolver sus dudas y peticiones especiales. Su satisfacción es nuestra prioridad.
                        </p>
                    </div>
                </div>
            </div>

            <main className="flex-grow py-12 px-4 md:px-8 lg:px-20 relative z-10">
                <div className="max-w-5xl mx-auto -mt-8">

                    {/* Barra de Herramientas */}
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Buscar en mis consultas..."
                                className="pl-10 border-gray-200 bg-white h-11 focus:border-yellow-600 focus:ring-yellow-600/20 rounded-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    onClick={handleCreate}
                                    className="w-full md:w-auto bg-gray-900 hover:bg-gray-800 text-white rounded-none px-6 h-11 shadow-lg transition-all"
                                >
                                    <Plus className="mr-2 h-4 w-4 text-yellow-500" /> Nueva Solicitud
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px] border-t-4 border-t-yellow-600 rounded-sm">
                                <DialogHeader>
                                    <DialogTitle className="text-xl font-bold text-gray-900 uppercase tracking-wide">
                                        Contactar a Recepción
                                    </DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleSubmit} className="grid gap-6 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="mensaje" className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                                            ¿En qué podemos servirle?
                                        </Label>
                                        <Textarea
                                            id="mensaje"
                                            rows={5}
                                            className="border-gray-200 focus:border-yellow-600 bg-gray-50/50 resize-none"
                                            placeholder="Describa su solicitud, duda o requerimiento..."
                                            value={currentItem.mensaje || ''}
                                            onChange={e => setCurrentItem({ ...currentItem, mensaje: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit" className="bg-yellow-600 hover:bg-yellow-700 text-white w-full rounded-sm">
                                            Enviar Mensaje
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Lista de Mensajes (Reemplazo de Tabla) */}
                    <div className="space-y-4">
                        {loading ? (
                            <div className="text-center py-20">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mx-auto"></div>
                                <p className="mt-4 text-gray-400 text-sm tracking-widest uppercase">Consultando historial...</p>
                            </div>
                        ) : filteredMensajes.length === 0 ? (
                            <div className="bg-white p-12 text-center rounded-sm border border-dashed border-gray-300">
                                <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900">Sin mensajes recientes</h3>
                                <p className="text-gray-500 mt-1 text-sm">No ha enviado ninguna solicitud de soporte todavía.</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {filteredMensajes.map((msg) => {
                                    const isSentByUser = msg.userId === user?.id;

                                    return (
                                        <div
                                            key={msg.id}
                                            className={`bg-white p-6 rounded-sm border transition-all duration-300 hover:shadow-md
                                                ${!msg.leido && !isSentByUser ? 'border-l-4 border-l-yellow-500 shadow-sm' : 'border-l-4 border-l-gray-200 border-gray-100'}
                                            `}
                                        >
                                            <div className="flex flex-col md:flex-row justify-between gap-4">
                                                <div className="flex-grow space-y-2">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        {isSentByUser ? (
                                                            <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-100 rounded-full px-3 py-0.5 text-[10px] uppercase tracking-wider font-bold">
                                                                <Send className="w-3 h-3 mr-1" /> Enviado
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-100 rounded-full px-3 py-0.5 text-[10px] uppercase tracking-wider font-bold">
                                                                <MessageSquare className="w-3 h-3 mr-1" /> Respuesta
                                                            </Badge>
                                                        )}

                                                        <span className="text-xs text-gray-400 flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {new Date(msg.fechaMensaje!).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                                            {' • '}
                                                            {new Date(msg.fechaMensaje!).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>

                                                    <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                                                        {msg.mensaje}
                                                    </p>
                                                </div>

                                                <div className="flex items-center md:flex-col md:items-end md:justify-center min-w-[120px] pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-gray-100 pl-0 md:pl-6 gap-2">
                                                    <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Estado</span>
                                                    {msg.leido ? (
                                                        <div className="flex items-center text-emerald-600 text-xs font-medium bg-emerald-50 px-3 py-1 rounded-full">
                                                            <CheckCircle2 className="w-3 h-3 mr-1" /> Visto
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center text-gray-500 text-xs font-medium bg-gray-100 px-3 py-1 rounded-full">
                                                            Enviado
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Pagination Footer */}
                    {filteredMensajes.length > 0 && (
                        <div className="flex items-center justify-end gap-4 mt-8">
                            <span className="text-sm text-gray-500">
                                Página {currentPage + 1} de {Math.max(1, Math.ceil(totalItems / itemsPerPage))}
                            </span>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                                    disabled={currentPage === 0 || loading}
                                    className="bg-white border-gray-200"
                                >
                                    <ChevronLeft className="h-4 w-4" /> Anterior
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(p => p + 1)}
                                    disabled={(currentPage + 1) * itemsPerPage >= totalItems || loading}
                                    className="bg-white border-gray-200"
                                >
                                    Siguiente <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};