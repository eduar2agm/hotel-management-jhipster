import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChevronRight, User, Archive, ArchiveRestore } from 'lucide-react';
import { Remitente } from '../../../types/enums';
import { type Conversation } from '../../../hooks/useAdminChat';

import { PaginationControl } from '@/components/common/PaginationControl';

interface ConversationListProps {
    conversations: Conversation[];
    isLoading: boolean;
    onSelect: (conv: Conversation) => void;
    onToggleActivo: (msg: any) => void;

    // Pagination
    currentPage: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
}

export const ConversationList = ({
    conversations,
    isLoading,
    onSelect,
    onToggleActivo,
    currentPage,
    totalItems,
    itemsPerPage,
    onPageChange
}: ConversationListProps) => {

    return (
        <div className="rounded-md border border-border overflow-hidden bg-card">
            <Table>
                <TableHeader className="bg-muted/50">
                    <TableRow className="border-border">
                        <TableHead className="font-bold text-muted-foreground uppercase tracking-wider text-xs py-4 pl-6">Cliente</TableHead>
                        <TableHead className="font-bold text-muted-foreground uppercase tracking-wider text-xs">Último Mensaje</TableHead>
                        <TableHead className="font-bold text-muted-foreground uppercase tracking-wider text-xs hidden md:table-cell">Fecha</TableHead>
                        <TableHead className="text-right font-bold text-muted-foreground uppercase tracking-wider text-xs pr-6"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center py-20 text-muted-foreground">
                                <div className="flex justify-center items-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                                    Cargando soporte...
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : conversations.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center py-20 text-muted-foreground font-light text-lg">
                                No hay mensajes de soporte.
                            </TableCell>
                        </TableRow>
                    ) : (
                        conversations.map((conv) => (
                            <TableRow
                                key={conv.otherPartyId}
                                onClick={() => onSelect(conv)}
                                className={`cursor-pointer transition-all border-b border-border group
                                    ${conv.unreadCount > 0 ? 'bg-blue-500/10 hover:bg-blue-500/20 dark:bg-blue-900/10 dark:hover:bg-blue-900/20' : 'hover:bg-muted/50'}
                                `}
                            >
                                <TableCell className="pl-6 w-[250px]">
                                    <div className="flex items-center gap-3">
                                        <div className={`relative w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm
                                            ${conv.unreadCount > 0 ? 'bg-blue-600' : 'bg-muted/80 text-foreground'}
                                        `}>
                                            {conv.otherPartyName.charAt(0).toUpperCase()}
                                            {conv.unreadCount > 0 && (
                                                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white ring-2 ring-white">
                                                    {conv.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className={`text-sm ${conv.unreadCount > 0 ? 'font-bold text-foreground' : 'font-medium text-foreground/80'}`}>
                                                {conv.otherPartyName}
                                            </span>
                                            {conv.otherPartyId !== 'unknown' && (
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                    <User className="h-3 w-3" /> ID: {conv.otherPartyId.substring(0, 8)}...
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="max-w-xl">
                                        <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'font-bold text-foreground' : 'text-foreground/70'}`}>
                                            <span className="text-xs text-muted-foreground mr-2 font-normal">
                                                {conv.lastMessage.remitente === Remitente.ADMINISTRATIVO ? 'Tú: ' : ''}
                                            </span>
                                            {conv.lastMessage.mensaje}
                                        </p>
                                    </div>
                                </TableCell>
                                <TableCell className="hidden md:table-cell w-[180px]">
                                    <span className={`text-xs ${conv.unreadCount > 0 ? 'font-bold text-blue-600 dark:text-blue-400' : 'text-muted-foreground'}`}>
                                        {new Date(conv.lastMessage.fechaMensaje!).toLocaleDateString()}
                                    </span>
                                    <div className="text-[10px] text-muted-foreground">
                                        {new Date(conv.lastMessage.fechaMensaje!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right pr-6 w-[80px] flex items-center justify-end gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-blue-600"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onToggleActivo(conv.lastMessage);
                                        }}
                                        title={conv.lastMessage.activo ? "Archivar" : "Restaurar"}
                                    >
                                        {conv.lastMessage.activo ? <Archive className="h-4 w-4" /> : <ArchiveRestore className="h-4 w-4" />}
                                    </Button>
                                    <ChevronRight className="h-5 w-5 text-muted-foreground/30 group-hover:text-blue-500 transition-colors" />
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            {/* Pagination */}
            <div className="bg-muted/20 border-t border-border">
                <PaginationControl
                    currentPage={currentPage}
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                    onPageChange={onPageChange}
                />
            </div>
        </div>
    );
};

