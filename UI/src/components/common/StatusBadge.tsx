import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Check, AlertCircle, CheckCircle2, RefreshCcw, XCircle, Clock } from 'lucide-react';

interface StatusBadgeProps {
    status?: string;
    className?: string;
}

export const StatusBadge = ({ status = 'PENDIENTE', className }: StatusBadgeProps) => {
    const s = status?.toUpperCase();

    const config = {
        'CONFIRMADA': { color: 'bg-green-100 text-green-700 border-green-200', icon: Check },
        'COMPLETADO': { color: 'bg-green-100 text-green-700 border-green-200', icon: Check }, // Para Pagos
        'PENDIENTE':  { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: RefreshCcw },
        'CANCELADA':  { color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
        'FINALIZADA': { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: CheckCircle2 },
        'CHECK_IN':   { color: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: Clock },
        'CHECK_OUT':  { color: 'bg-gray-100 text-gray-600 border-gray-200', icon: AlertCircle },
    };

    // Default style if not found
    const style = config[s as keyof typeof config] || { color: 'bg-gray-100 text-gray-700', icon: AlertCircle };
    const Icon = style.icon;

    return (
        <Badge variant="outline" className={cn("px-2 py-0.5 gap-1 shadow-sm", style.color, className)}>
            <Icon className="h-3 w-3" />
            {s}
        </Badge>
    );
};