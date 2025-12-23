import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationControlProps {
    currentPage: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    isLoading?: boolean;
}

export const PaginationControl = ({ 
    currentPage, 
    totalItems, 
    itemsPerPage, 
    onPageChange, 
    isLoading 
}: PaginationControlProps) => {
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

    return (
        <div className="flex items-center justify-end gap-4 px-6 py-4 border-t border-border">
            <span className="text-sm text-muted-foreground">
                Página {currentPage + 1} de {totalPages}
            </span>
            <div className="flex gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0 || isLoading}
                >
                    <ChevronLeft className="h-4 w-4" /> Anterior
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
                    disabled={currentPage >= totalPages - 1 || isLoading}
                >
                    Siguiente <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};