import { useEffect, useState, useRef, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { MensajeSoporteService, ClienteService } from '../../services';
import type { MensajeSoporteDTO, ClienteDTO } from '../../types/api';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, User, CheckCircle2, Send, ChevronRight, MessageCircle, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Navbar } from '../../components/ui/Navbar';
import { Footer } from '../../components/ui/Footer';
import { Remitente } from '../../types/enums';

interface Conversation {
    otherPartyId: string;
    otherPartyName: string;
    messages: MensajeSoporteDTO[];
    lastMessage: MensajeSoporteDTO;
    unreadCount: number;
}

export const EmployeeMensajesSoporte = () => {
    const { user } = useAuth();
    const [mensajes, setMensajes] = useState<MensajeSoporteDTO[]>([]);
    const [clientes, setClientes] = useState<ClienteDTO[]>([]);
    const [loading, setLoading] = useState(false);

    // Dialog states
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Changed from storing object to storing ID to allow reactive updates
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

    const chatEndRef = useRef<HTMLDivElement>(null);
    const [replyText, setReplyText] = useState('');

    // Pagination
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 10;

    const loadData = async () => {
        setLoading(true);
        try {
            const [msgsRes, clientesRes] = await Promise.all([
                MensajeSoporteService.getMyMensajes({ page: 0, size: 500, sort: 'fechaMensaje,desc' }),
                ClienteService.getClientes()
            ]);
            setMensajes(msgsRes.data);
            setClientes(clientesRes.data);
        } catch (error) {
            toast.error('Error al cargar mensajes');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // 1. Compute ALL conversations first (derived from messages)
    const allConversations = useMemo(() => {
        const groups = new Map<string, Conversation>();

        mensajes.forEach(msg => {
            const isMe = msg.userId === user?.id;
            let otherId = isMe ? msg.destinatarioId : msg.userId;
            let otherName = isMe ? msg.destinatarioName : msg.userName;

            if (!otherId) otherId = 'unknown';
            if (!otherName) otherName = 'Usuario Desconocido';

            if (!groups.has(otherId)) {
                groups.set(otherId, {
                    otherPartyId: otherId,
                    otherPartyName: otherName,
                    messages: [],
                    lastMessage: msg,
                    unreadCount: 0
                });
            }

            const group = groups.get(otherId)!;
            group.messages.push(msg);

            if (!msg.leido && !isMe) {
                group.unreadCount++;
            }
        });

        const result: Conversation[] = [];
        groups.forEach(group => {
            // Sort messages chronological for chat view
            group.messages.sort((a, b) => new Date(a.fechaMensaje!).getTime() - new Date(b.fechaMensaje!).getTime());
            // Last message is the last one in the array
            group.lastMessage = group.messages[group.messages.length - 1];
            result.push(group);
        });

        // Sort conversations by latest activity (desc)
        return result.sort((a, b) => new Date(b.lastMessage.fechaMensaje!).getTime() - new Date(a.lastMessage.fechaMensaje!).getTime());
    }, [mensajes, user]);

    // 2. Filter for display list
    const filteredConversations = useMemo(() => {
        return allConversations.filter(c =>
            c.otherPartyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.lastMessage.mensaje?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [allConversations, searchTerm]);

    // 2.5 Paginate
    const paginatedConversations = useMemo(() => {
        const start = currentPage * itemsPerPage;
        return filteredConversations.slice(start, start + itemsPerPage);
    }, [filteredConversations, currentPage]);

    // Reset pagination on search
    useEffect(() => {
        setCurrentPage(0);
    }, [searchTerm]);

    // 3. Derived Active Conversation 
    // This solves the bug: when 'mensajes' updates, 'allConversations' updates, and 'currentConversation' re-evaluates.
    const currentConversation = useMemo(() => {
        return allConversations.find(c => c.otherPartyId === selectedConversationId) || null;
    }, [allConversations, selectedConversationId]);


    // Scroll to bottom of chat
    useEffect(() => {
        if (isViewDialogOpen && chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [isViewDialogOpen, currentConversation]);

    const handleCreate = () => {
        setIsCreateDialogOpen(true);
        setReplyText('');
    };

    const handleSelectConversation = async (conv: Conversation) => {
        setSelectedConversationId(conv.otherPartyId);
        setReplyText('');
        setIsViewDialogOpen(true);

        const unreadMsgs = conv.messages.filter(m => !m.leido && m.userId !== user?.id);
        if (unreadMsgs.length > 0) {
            try {
                const updatedIds = unreadMsgs.map(m => m.id);
                setMensajes(prev => prev.map(m => updatedIds.includes(m.id) ? { ...m, leido: true } : m));

                await Promise.all(unreadMsgs.map(m =>
                    m.id ? MensajeSoporteService.partialUpdateMensaje(m.id, { id: m.id, leido: true }) : Promise.resolve()
                ));
            } catch (error) {
                console.error("Error marking messages as read", error);
            }
        }
    };

    const handleSendReply = async () => {
        if (!replyText.trim() || !currentConversation) return;

        try {
            const payload = {
                userId: user?.id || 'employee',
                userName: user?.username || 'Employee',
                fechaMensaje: new Date().toISOString(),
                remitente: Remitente.ADMINISTRATIVO,
                leido: false,
                activo: true,
                mensaje: replyText,
                reserva: currentConversation.messages.find(m => m.reserva)?.reserva,
                destinatarioId: currentConversation.otherPartyId,
                destinatarioName: currentConversation.otherPartyName
            };

            const resp = await MensajeSoporteService.createMensaje(payload as any);
            const newMsg = resp.data;

            // This update triggers the chain: mensajes -> allConversations -> currentConversation -> View Re-render
            setMensajes(prev => [...prev, newMsg]);

            setReplyText('');

        } catch (error) {
            toast.error('Error al enviar respuesta');
        }
    };

    // New Message State
    const [newMsgState, setNewMsgState] = useState<{ destinatarioId?: string, destinatarioName?: string, mensaje?: string }>({});

    const sendNewMessage = async () => {
        if (!newMsgState.destinatarioId || !newMsgState.mensaje) {
            toast.error("Complete los campos");
            return;
        }
        try {
            const payload = {
                userId: user?.id || 'employee',
                userName: user?.username || 'Employee',
                fechaMensaje: new Date().toISOString(),
                remitente: Remitente.ADMINISTRATIVO,
                leido: false,
                activo: true,
                mensaje: newMsgState.mensaje,
                destinatarioId: newMsgState.destinatarioId,
                destinatarioName: newMsgState.destinatarioName
            };
            const resp = await MensajeSoporteService.createMensaje(payload as any);

            setMensajes(prev => [...prev, resp.data]);

            setIsCreateDialogOpen(false);
            setNewMsgState({});
            toast.success("Mensaje enviado");

            // Optional: Automatically open the conversation
            if (payload.destinatarioId) {
                setSelectedConversationId(payload.destinatarioId);
                setIsViewDialogOpen(true);
            }

        } catch (e) {
            toast.error("Error al enviar");
        }
    }


    return (
        <div className="font-sans text-gray-900 bg-gray-50 min-h-screen flex flex-col">
            <Navbar />

            {/* --- HERO SECTION --- */}
            <div className="relative bg-[#0F172A] pt-32 pb-20 px-4 md:px-8 lg:px-20 overflow-hidden shadow-xl">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-900/10 to-transparent pointer-events-none"></div>

                <div className="relative max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
                    <div>
                        <span className="text-yellow-500 font-bold tracking-[0.2em] uppercase text-xs mb-3 block animate-in fade-in slide-in-from-bottom-2 duration-500">
                            Atención al Huésped
                        </span>
                        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
                            Centro de Mensajes
                        </h2>
                        <p className="text-slate-400 font-light text-lg max-w-xl leading-relaxed">
                            Gestione los hilos de conversación con sus clientes en un solo lugar.
                        </p>
                    </div>

                    <Button
                        onClick={handleCreate}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white rounded-none px-6 py-6 shadow-lg transition-all border border-yellow-600/30 text-lg"
                    >
                        <Plus className="mr-2 h-5 w-5" /> Iniciar Conversación
                    </Button>
                </div>
            </div>

            <main className="flex-grow py-12 px-4 md:px-8 lg:px-20 relative z-10">
                <div className="max-w-6xl mx-auto -mt-16">
                    <div className="bg-white rounded-sm shadow-xl p-6 md:p-10 overflow-hidden border border-gray-100 min-h-[600px]">

                        {/* HEADER TOOLBAR */}
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <MessageCircle className="h-5 w-5 text-yellow-600" /> Conversaciones Recientes
                            </h3>
                            <div className="relative w-full md:w-96">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Buscar cliente o mensaje..."
                                    className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* CONVERSATION LIST TABLE */}
                        <div className="rounded-md border border-gray-100 overflow-hidden">
                            <Table>
                                <TableHeader className="bg-gray-50">
                                    <TableRow>
                                        <TableHead className="font-bold text-gray-700 uppercase tracking-wider text-xs py-4 pl-6">Usuario / Cliente</TableHead>
                                        <TableHead className="font-bold text-gray-700 uppercase tracking-wider text-xs">Último Mensaje</TableHead>
                                        <TableHead className="font-bold text-gray-700 uppercase tracking-wider text-xs hidden md:table-cell">Fecha</TableHead>
                                        <TableHead className="text-right font-bold text-gray-700 uppercase tracking-wider text-xs pr-6"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-20 text-gray-500">
                                                <div className="flex justify-center items-center gap-2">
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                                                    Cargando conversaciones...
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredConversations.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-20 text-gray-400 font-light text-lg">
                                                No hay conversaciones registradas.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        paginatedConversations.map((conv) => (
                                            <TableRow
                                                key={conv.otherPartyId}
                                                onClick={() => handleSelectConversation(conv)}
                                                className={`cursor-pointer transition-all border-b border-gray-50 group
                                                    ${conv.unreadCount > 0 ? 'bg-blue-50/40 hover:bg-blue-50' : 'hover:bg-slate-50'}
                                                `}
                                            >
                                                <TableCell className="pl-6 w-[250px]">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`relative w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm
                                                            ${conv.unreadCount > 0 ? 'bg-blue-600' : 'bg-slate-400'}
                                                        `}>
                                                            {conv.otherPartyName.charAt(0).toUpperCase()}
                                                            {conv.unreadCount > 0 && (
                                                                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white ring-2 ring-white">
                                                                    {conv.unreadCount}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className={`text-sm ${conv.unreadCount > 0 ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                                                                {conv.otherPartyName}
                                                            </span>
                                                            <div className="flex items-center gap-1 text-xs text-slate-400">
                                                                <User className="h-3 w-3" /> Cliente
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="max-w-xl">
                                                        <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'font-bold text-slate-800' : 'text-slate-600'}`}>
                                                            <span className="text-xs text-gray-400 mr-2 font-normal">
                                                                {conv.lastMessage.userId === user?.id ? 'Tú: ' : ''}
                                                            </span>
                                                            {conv.lastMessage.mensaje}
                                                        </p>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell w-[180px]">
                                                    <span className={`text-xs ${conv.unreadCount > 0 ? 'font-bold text-blue-700' : 'text-gray-500'}`}>
                                                        {new Date(conv.lastMessage.fechaMensaje!).toLocaleDateString()}
                                                    </span>
                                                    <div className="text-[10px] text-gray-400">
                                                        {new Date(conv.lastMessage.fechaMensaje!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right pr-6 w-[50px]">
                                                    <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-blue-500 transition-colors" />
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    {/* PAGINATION */}
                    <div className="flex items-center justify-end gap-4 mt-4">
                        <span className="text-sm text-gray-500">
                            Página {currentPage + 1} de {Math.max(1, Math.ceil(filteredConversations.length / itemsPerPage))}
                        </span>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                                disabled={currentPage === 0}
                                className="bg-white border-gray-200"
                            >
                                <ChevronLeft className="h-4 w-4" /> Anterior
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => p + 1)}
                                disabled={(currentPage + 1) * itemsPerPage >= filteredConversations.length}
                                className="bg-white border-gray-200"
                            >
                                Siguiente <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>

            </main >

    <Footer />

{/* --- CHAT DIALOG --- */ }
<Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
    <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden flex flex-col h-[600px] gap-0">

        {/* Header */}
        <DialogHeader className="p-4 bg-white border-b border-gray-100 flex-shrink-0 z-10 shadow-sm flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-3">
                <div className="bg-blue-50 p-2 rounded-full text-blue-600">
                    <User className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                    <span className="text-lg font-bold text-slate-900 leading-tight">
                        {currentConversation?.otherPartyName}
                    </span>
                    <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        En línea
                    </span>
                </div>
            </div>
        </DialogHeader>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-4">
            {currentConversation?.messages.map((msg, idx) => {
                const isMe = msg.userId === user?.id;
                return (
                    <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                        <div className={`max-w-[80%] rounded-2xl p-3 px-4 text-sm shadow-sm ${isMe
                            ? 'bg-blue-600 text-white rounded-tr-none'
                            : 'bg-white text-slate-800 border border-gray-100 rounded-tl-none'
                            }`}>
                            <p className="whitespace-pre-wrap leading-relaxed">{msg.mensaje}</p>
                            <div className={`flex items-center gap-1 mt-1 text-[10px] ${isMe ? 'text-blue-200 justify-end' : 'text-gray-400'}`}>
                                {new Date(msg.fechaMensaje).toLocaleDateString()} {new Date(msg.fechaMensaje).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                {isMe && msg.leido && <CheckCircle2 className="h-3 w-3 ml-1" />}
                            </div>
                        </div>
                    </div>
                );
            })
            }
            {/* Empty State if needed */}
            {(!currentConversation?.messages || currentConversation.messages.length === 0) && (
                <div className="text-center text-gray-400 mt-10">Sin mensajes. Saluda!</div>
            )}
            <div ref={chatEndRef} />
        </div>

        {/* Reply Area */}
        <div className="p-4 bg-white border-t border-gray-100 flex-shrink-0">
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    handleSendReply();
                }}
                className="flex gap-3 items-end"
            >
                <Textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="min-h-[50px] max-h-[120px] bg-gray-50 border-gray-200 resize-none focus:bg-white transition-all"
                    placeholder="Escribe tu mensaje..."
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendReply();
                        }
                    }}
                />
                <Button type="submit" size="icon" className="h-11 w-11 bg-slate-900 hover:bg-slate-800 text-white rounded-lg flex-shrink-0" disabled={!replyText.trim()}>
                    <Send className="h-5 w-5" />
                </Button>
            </form>
        </div>
    </DialogContent>
</Dialog>

{/* --- CREATE NEW CONVERSATION DIALOG --- */ }
<Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
    <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
            <DialogTitle>Nueva Conversación</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
            <div className="grid gap-2">
                <Label>Seleccionar Cliente</Label>
                <Select
                    value={newMsgState.destinatarioId || undefined}
                    onValueChange={(val) => {
                        const c = clientes.find(cl => cl.keycloakId === val);
                        setNewMsgState(prev => ({ ...prev, destinatarioId: val, destinatarioName: c ? `${c.nombre} ${c.apellido}` : undefined }));
                    }}
                >
                    <SelectTrigger><SelectValue placeholder="Buscar cliente..." /></SelectTrigger>
                    <SelectContent>
                        {clientes.map(c => (
                            <SelectItem key={c.id} value={c.keycloakId || String(c.id)}>
                                {c.nombre} {c.apellido}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="grid gap-2">
                <Label>Mensaje Inicial</Label>
                <Textarea
                    value={newMsgState.mensaje || ''}
                    onChange={e => setNewMsgState({ ...newMsgState, mensaje: e.target.value })}
                    rows={4}
                />
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancelar</Button>
                <Button onClick={sendNewMessage}>Enviar</Button>
            </DialogFooter>
        </div>
    </DialogContent>
</Dialog>
        </div >
    );
};
