import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ActiveFilterProps {
    showInactive: boolean;
    onChange: (show: boolean) => void;
    activeLabel?: string;
    inactiveLabel?: string;
}

export const ActiveFilter = ({
    showInactive,
    onChange,
    activeLabel = "Ver Activos",
    inactiveLabel = "Ver Inactivos"
}: ActiveFilterProps) => (
    <div className="flex items-center gap-2 bg-gray-100 rounded-md p-1">
        <Button
            variant={!showInactive ? "default" : "ghost"}
            size="sm"
            onClick={() => onChange(false)}
            className={cn(
                "h-8 transition-all",
                !showInactive && "bg-white shadow-sm"
            )}
        >
            {activeLabel}
        </Button>
        <Button
            variant={showInactive ? "default" : "ghost"}
            size="sm"
            onClick={() => onChange(true)}
            className={cn(
                "h-8 transition-all",
                showInactive && "bg-white shadow-sm"
            )}
        >
            {inactiveLabel}
        </Button>
    </div>
);
