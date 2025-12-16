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
import { Plus, Search, User, CheckCircle2, Send, ChevronRight, MessageCircle, ShieldCheck } from 'lucide-react';
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

export const AdminMensajesSoporte = () => {
    const { user } = useAuth();
    const [mensajes, setMensajes] = useState<MensajeSoporteDTO[]>([]);
    const [clientes, setClientes] = useState<ClienteDTO[]>([]);
    const [loading, setLoading] = useState(false);
    
    // Dialog states
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
    
    const chatEndRef = useRef<HTMLDivElement>(null);
    const [replyText, setReplyText] = useState('');

    const loadData = async () => {
        setLoading(true);
        try {
            const [msgsRes, clientesRes] = await Promise.all([
                MensajeSoporteService.getMyMensajes({ page: 0, size: 1000, sort: 'fechaMensaje,desc' }),
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

    // 1. Compute ALL conversations first
    const allConversations = useMemo(() => {
        const groups = new Map<string, Conversation>();

        mensajes.forEach(msg => {
            const isMe = msg.userId === user?.id;
            // For Admin, grouping logic:
            // If I sent it, other party is 'destinatarioId'
            // If I received it, other party is 'userId' (the sender)
            // Ideally we group by the CLIENT'S ID.
            
            // NOTE: Assuming Admin 'userId' is distinct from Clients.
            // If msg.remitente === 'CLIENTE', then userId is the client.
            // If msg.remitente === 'ADMINISTRATIVO', then destinatarioId is the client.
            
            let otherId = '';
            let otherName = '';

            if (msg.remitente === Remitente.CLIENTE) {
                otherId = msg.userId || 'unknown';
                otherName = msg.userName || 'Cliente Desconocido';
            } else {
                // Sent by Admin
                otherId = msg.destinatarioId || 'unknown';
                otherName = msg.destinatarioName || 'Cliente';
            }

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
            
            // Count unread messages FROM the client
            if (!msg.leido && msg.remitente === Remitente.CLIENTE) {
                group.unreadCount++;
            }
        });

        const result: Conversation[] = [];
        groups.forEach(group => {
            group.messages.sort((a, b) => new Date(a.fechaMensaje!).getTime() - new Date(b.fechaMensaje!).getTime());
            group.lastMessage = group.messages[group.messages.length - 1];
            result.push(group);
        });

        return result.sort((a, b) => new Date(b.lastMessage.fechaMensaje!).getTime() - new Date(a.lastMessage.fechaMensaje!).getTime());
    }, [mensajes, user]);

    // 2. Filter for display list
    const filteredConversations = useMemo(() => {
        return allConversations.filter(c => 
            c.otherPartyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.lastMessage.mensaje?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [allConversations, searchTerm]);

    // 3. Derived Active Conversation 
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

        // Mark as read when Admin opens chat and message is from Client
        const unreadMsgs = conv.messages.filter(m => !m.leido && m.remitente === Remitente.CLIENTE);
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
                userId: user?.id || 'admin',
                userName: user?.username || 'Administrador',
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

            setMensajes(prev => [...prev, newMsg]);
            setReplyText('');
            
        } catch (error) {
            toast.error('Error al enviar respuesta');
        }
    };

    // New Message State
    const [newMsgState, setNewMsgState] = useState<{destinatarioId?: string, destinatarioName?: string, mensaje?: string}>({});
    
    const sendNewMessage = async () => {
        if (!newMsgState.destinatarioId || !newMsgState.mensaje) {
            toast.error("Complete los campos");
            return;
        }
        try {
            const payload = {
                 userId: user?.id || 'admin',
                 userName: user?.username || 'Administrador',
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

            if (payload.destinatarioId) {
                setSelectedConversationId(payload.destinatarioId);
                setIsViewDialogOpen(true);
            }

        } catch(e) {
            toast.error("Error al enviar");
        }
    }


    return (
        <div className="font-sans text-gray-900 bg-gray-50 min-h-screen flex flex-col">
            <Navbar />

            {/* --- HERO SECTION --- */}
            <div className="relative bg-[#0F172A] pt-32 pb-20 px-4 md:px-8 lg:px-20 overflow-hidden shadow-xl">
                 <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 pointer-events-none">
                     <ShieldCheck className="w-96 h-96 text-white" />
                 </div>
                 
                 <div className="relative max-w-7xl mx-auto z-10 flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
                    <div>
                        <span className="text-yellow-500 font-bold tracking-[0.2em] uppercase text-xs mb-3 block animate-in fade-in slide-in-from-bottom-2 duration-500">
                            Administración
                        </span>
                        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
                            Centro de Soporte
                        </h2>
                        <p className="text-slate-400 font-light text-lg max-w-xl leading-relaxed">
                            Gestione todas las consultas y solicitudes de soporte de los clientes.
                        </p>
                    </div>
                 </div>
            </div>

            <main className="flex-grow py-12 px-4 md:px-8 lg:px-20 relative z-10">
                <div className="max-w-7xl mx-auto -mt-16">
                    <div className="bg-white rounded-sm shadow-xl p-6 md:p-10 overflow-hidden border border-gray-100 min-h-[600px]">
                        
                        {/* HEADER TOOLBAR */}
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <MessageCircle className="h-5 w-5 text-yellow-600" /> Bandeja de Entrada
                            </h3>
                            <div className="flex gap-3 w-full md:w-auto">
                                <div className="relative w-full md:w-80">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Buscar cliente..."
                                        className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <Button 
                                    onClick={handleCreate}
                                    className="bg-yellow-600 hover:bg-yellow-700 text-white shadow-md rounded-md"
                                >
                                    <Plus className="mr-2 h-4 w-4" /> Nuevo
                                </Button>
                            </div>
                        </div>

                        {/* CONVERSATION LIST TABLE */}
                        <div className="rounded-md border border-gray-100 overflow-hidden">
                            <Table>
                                <TableHeader className="bg-gray-50">
                                    <TableRow>
                                        <TableHead className="font-bold text-gray-700 uppercase tracking-wider text-xs py-4 pl-6">Cliente</TableHead>
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
                                                    Cargando soporte...
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredConversations.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-20 text-gray-400 font-light text-lg">
                                                No hay mensajes de soporte.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredConversations.map((conv) => (
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
                                                                <User className="h-3 w-3" /> ID: {conv.otherPartyId.substring(0,8)}...
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="max-w-xl">
                                                        <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'font-bold text-slate-800' : 'text-slate-600'}`}>
                                                            <span className="text-xs text-gray-400 mr-2 font-normal">
                                                                {conv.lastMessage.remitente === Remitente.ADMINISTRATIVO ? 'Tú: ' : ''}
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
                                                         {new Date(conv.lastMessage.fechaMensaje!).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
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
                </div>

                {/* --- CHAT DIALOG --- */}
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
                                    <span className="text-xs text-slate-500">
                                        Historial de conversación
                                    </span>
                                </div>
                            </div>
                        </DialogHeader>

                        {/* Chat Messages */}
                        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-4">
                            {currentConversation?.messages.map((msg, idx) => {
                                    const isAdmin = msg.remitente === Remitente.ADMINISTRATIVO;
                                    return (
                                        <div key={idx} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                                            <div className={`max-w-[80%] rounded-2xl p-3 px-4 text-sm shadow-sm ${
                                                isAdmin
                                                    ? 'bg-blue-600 text-white rounded-tr-none' 
                                                    : 'bg-white text-slate-800 border border-gray-100 rounded-tl-none'
                                            }`}>
                                                <p className="whitespace-pre-wrap leading-relaxed">{msg.mensaje}</p>
                                                <div className={`flex items-center gap-1 mt-1 text-[10px] ${isAdmin ? 'text-blue-200 justify-end' : 'text-gray-400'}`}>
                                                    {new Date(msg.fechaMensaje).toLocaleDateString()} {new Date(msg.fechaMensaje).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                                    {isAdmin && msg.leido && <CheckCircle2 className="h-3 w-3 ml-1" />}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            }
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
                                    placeholder="Escribe una respuesta como Administrador..."
                                    onKeyDown={(e) => {
                                        if(e.key === 'Enter' && !e.shiftKey) {
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

                {/* --- CREATE NEW CONVERSATION DIALOG --- */}
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Contactar Cliente</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                            <div className="grid gap-2">
                                 <Label>Seleccionar Cliente</Label>
                                 <Select
                                    value={newMsgState.destinatarioId || undefined}
                                    onValueChange={(val) => {
                                        const c = clientes.find(cl => cl.keycloakId === val);
                                        setNewMsgState(prev => ({ ...prev, destinatarioId: val, destinatarioName: c ? `${c.nombre} ${c.apellido}` : undefined}));
                                    }}
                                >
                                    <SelectTrigger><SelectValue placeholder="Buscar cliente..." /></SelectTrigger>
                                    <SelectContent>
                                        {clientes.map(c => (
                                            <SelectItem key={c.id} value={c.keycloakId || String(c.id)}>
                                                {c.nombre} {c.apellido} ({c.correo})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                 <Label>Mensaje</Label>
                                 <Textarea 
                                     value={newMsgState.mensaje || ''} 
                                     onChange={e => setNewMsgState({...newMsgState, mensaje: e.target.value})}
                                     rows={4}
                                     placeholder="Escribe tu mensaje..."
                                 />
                            </div>
                            <DialogFooter>
                                 <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancelar</Button>
                                 <Button onClick={sendNewMessage}>Enviar</Button>
                            </DialogFooter>
                        </div>
                    </DialogContent>
                </Dialog>

            </main>
            <Footer />
        </div>
    );
};
