import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, MessageCircle } from 'lucide-react';
import { ActiveFilter } from '@/components/ui/ActiveFilter';
import { PageHeader } from '@/components/common/PageHeader';

import { useAdminChat, type Conversation } from '../../hooks/useAdminChat';
import { type MensajeSoporteDTO } from '../../types/api/MensajeSoporte';
import { ConversationList } from '@/components/admin/soporte/ConversationList';
import { ChatDialog } from '@/components/admin/soporte/ChatDialog';
import { NewConversationDialog } from '@/components/admin/soporte/NewConversationDialog';

export const AdminMensajesSoporte = () => {
    const {
        conversations,
        loading,
        showInactive,
        setShowInactive,
        searchTerm,
        setSearchTerm,
        markAsRead,
        addMessage,
        toggleActivo,
        clientes,
        loadData // In case we need to reload manually
    } = useAdminChat();

    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 10;

    // Derived pagination
    const paginatedConversations = conversations.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

    // Derived selected conversation - finds the fresh object from the updated list
    const selectedConversation = conversations.find(c => c.otherPartyId === selectedConversationId) || null;

    const handleSelectConversation = (conv: Conversation) => {
        setSelectedConversationId(conv.otherPartyId);
        setIsViewDialogOpen(true);
        markAsRead(conv);
    };

    const handleMessageSent = (newMsg: MensajeSoporteDTO) => {
        addMessage(newMsg);
        // If it was a new conversation (destinatarioId), we might want to select it, but for simplicity just add it.
        // The list will update.
    };

    const handleNewConversationSuccess = (newMsg: MensajeSoporteDTO) => {
        addMessage(newMsg);
        // Try to find the new conversation or just re-fetch?
        // Ideally we should just add the message and the useMemo will regroup it.
        // We can also select it if we want.
        loadData(); // Reload to be safe and ensure proper grouping if user ID was missing locally
    };

    return (
        <div className="font-sans text-foreground bg-background min-h-screen flex flex-col">

            <PageHeader
                title="Centro de Soporte"
                subtitle="Gestione todas las consultas y solicitudes de soporte de los clientes."
                category="ADMINISTRACIÓN"
            />

            <main className="flex-grow py-12 px-4 md:px-8 lg:px-20 relative z-10 -mt-10">
                <div className="max-w-7xl mx-auto -mt-6">
                    <div className="bg-card rounded-lg shadow-xl p-6 md:p-10 overflow-hidden border border-border min-h-[600px]">

                        {/* HEADER TOOLBAR */}
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                            <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                                <MessageCircle className="h-5 w-5 text-yellow-600" /> Bandeja de Entrada
                            </h3>
                            <div className="flex gap-3 w-full md:w-auto items-center">
                                <ActiveFilter showInactive={showInactive} onChange={setShowInactive} activeLabel="Activos" inactiveLabel="Archivados" />
                                <div className="relative w-full md:w-80">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar cliente..."
                                        className="pl-10 bg-muted/50 border-input focus:bg-background transition-colors"
                                        value={searchTerm}
                                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(0); }}
                                    />
                                </div>
                                <Button
                                    onClick={() => setIsCreateDialogOpen(true)}
                                    className="bg-yellow-600 hover:bg-yellow-700 text-white shadow-md rounded-md"
                                >
                                    <Plus className="mr-2 h-4 w-4" /> Nuevo
                                </Button>
                            </div>
                        </div>

                        {/* CONVERSATION LIST */}
                        <ConversationList
                            conversations={paginatedConversations}
                            isLoading={loading}
                            onSelect={handleSelectConversation}
                            onToggleActivo={toggleActivo}
                            currentPage={currentPage}
                            totalItems={conversations.length}
                            itemsPerPage={itemsPerPage}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                </div>

                <ChatDialog
                    open={isViewDialogOpen}
                    onOpenChange={setIsViewDialogOpen}
                    conversation={selectedConversation}
                    onMessageSent={handleMessageSent}
                />

                <NewConversationDialog
                    open={isCreateDialogOpen}
                    onOpenChange={setIsCreateDialogOpen}
                    clientes={clientes}
                    onSuccess={handleNewConversationSuccess}
                />

            </main>
        </div>
    );
};
