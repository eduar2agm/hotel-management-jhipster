import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActiveBadgeProps {
    activo: boolean;
    size?: 'sm' | 'md' | 'lg';
}

export const ActiveBadge = ({ activo, size = 'md' }: ActiveBadgeProps) => (
    <Badge
        variant="outline"
        className={cn(
            activo
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-gray-100 text-gray-600 border-gray-200",
            size === 'sm' && 'text-xs px-1.5 py-0.5',
            size === 'md' && 'text-sm px-2 py-0.5',
            size === 'lg' && 'text-base px-3 py-1'
        )}
    >
        {activo ? (
            <><CheckCircle2 className="h-3 w-3 mr-1" /> Activo</>
        ) : (
            <><XCircle className="h-3 w-3 mr-1" /> Inactivo</>
        )}
    </Badge>
);
