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
    <div className="flex items-center gap-1 bg-muted rounded-md p-1 border border-border/50">
        <Button
            variant="ghost"
            size="sm"
            onClick={() => onChange(false)}
            className={cn(
                "h-8 transition-all rounded-sm text-xs font-medium",
                !showInactive ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-transparent"
            )}
        >
            {activeLabel}
        </Button>
        <Button
            variant="ghost"
            size="sm"
            onClick={() => onChange(true)}
            className={cn(
                "h-8 transition-all rounded-sm text-xs font-medium",
                showInactive ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-transparent"
            )}
        >
            {inactiveLabel}
        </Button>
    </div>
);
