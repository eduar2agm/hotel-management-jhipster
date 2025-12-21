import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { MensajeSoporteService } from '../../services';
import type { MensajeSoporteDTO } from '../../types/api';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { SupportMessageCard } from '../../components/client/support/SupportMessageCard';
import { useAuth } from '../../hooks/useAuth';
import { PaginationControl } from '@/components/common/PaginationControl';

// Importamos los componentes de UI del Hotel
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';

import { PageHeader } from '../../components/common/PageHeader';

export const ClientMensajesSoporte = () => {
    // --- LÓGICA ORIGINAL INTACTA ---
    const { user } = useAuth();
    const location = useLocation();
    const [mensajes, setMensajes] = useState<MensajeSoporteDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Pagination
    const [currentPage, setCurrentPage] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const itemsPerPage = 5;

    const [currentItem, setCurrentItem] = useState<Partial<MensajeSoporteDTO>>({});

    // Handle incoming navigation state (e.g. from Cancel Reservation)
    useEffect(() => {
        if (location.state && location.state.action === 'cancelRequest' && location.state.reservaId) {
             const { reservaId } = location.state;
             setCurrentItem({
                fechaMensaje: new Date().toISOString(),
                remitente: 'CLIENT',
                leido: false,
                activo: true,
                mensaje: `Deseo cancelar mi reservación. Usuario: ${user?.username || user?.email || 'N/A'}, Reserva: ${reservaId}`
            });
            setIsDialogOpen(true);
            // Clear state to prevent reopening on simple refresh
            window.history.replaceState({}, '');
        }
    }, [location, user]);

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

            {/* --- HERO SECTION --- */}
            <PageHeader
                title="Asistencia al Huésped"
                subtitle="Estamos aquí para resolver sus dudas y peticiones especiales. Su satisfacción es nuestra prioridad."
                category="Concierge Digital"
                className="bg-[#0F172A]"
            />

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
                                        <SupportMessageCard
                                            key={msg.id}
                                            message={msg}
                                            isSentByUser={!!isSentByUser}
                                        />
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Pagination Footer */}
                    {filteredMensajes.length > 0 && (
                        <div className="mt-8">
                            <PaginationControl
                                currentPage={currentPage}
                                totalItems={totalItems}
                                itemsPerPage={itemsPerPage}
                                onPageChange={setCurrentPage}
                                isLoading={loading}
                            />
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};