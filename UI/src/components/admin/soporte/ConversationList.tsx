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
        <div className="rounded-md border border-gray-100 overflow-hidden bg-white">
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
                    {isLoading ? (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center py-20 text-gray-500">
                                <div className="flex justify-center items-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                                    Cargando soporte...
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : conversations.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center py-20 text-gray-400 font-light text-lg">
                                No hay mensajes de soporte.
                            </TableCell>
                        </TableRow>
                    ) : (
                        conversations.map((conv) => (
                            <TableRow
                                key={conv.otherPartyId}
                                onClick={() => onSelect(conv)}
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
                                            {conv.otherPartyId !== 'unknown' && (
                                                <div className="flex items-center gap-1 text-xs text-slate-400">
                                                    <User className="h-3 w-3" /> ID: {conv.otherPartyId.substring(0, 8)}...
                                                </div>
                                            )}
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
                                        {new Date(conv.lastMessage.fechaMensaje!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right pr-6 w-[80px] flex items-center justify-end gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-gray-400 hover:text-blue-600"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onToggleActivo(conv.lastMessage);
                                        }}
                                        title={conv.lastMessage.activo ? "Archivar" : "Restaurar"}
                                    >
                                        {conv.lastMessage.activo ? <Archive className="h-4 w-4" /> : <ArchiveRestore className="h-4 w-4" />}
                                    </Button>
                                    <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-blue-500 transition-colors" />
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            {/* Pagination */}
            <div className="bg-gray-50/50">
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

