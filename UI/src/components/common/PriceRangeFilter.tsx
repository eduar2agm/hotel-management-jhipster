import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface PriceRangeFilterProps {
    minPrice: string;
    maxPrice: string;
    onMinChange: (value: string) => void;
    onMaxChange: (value: string) => void;
    onSearch?: () => void;
    className?: string;
    variant?: 'horizontal' | 'vertical';
    label?: string;
}

export const PriceRangeFilter = ({
    minPrice,
    maxPrice,
    onMinChange,
    onMaxChange,
    onSearch,
    className = "",
    variant = 'vertical',
    label = "Price range"
}: PriceRangeFilterProps) => {
    const isHorizontal = variant === 'horizontal';

    return (
        <div className={`bg-card rounded-lg ${isHorizontal ? 'p-0' : 'p-4 border border-border shadow-sm'} ${className}`}>
            {!isHorizontal && <h3 className="text-center font-bold text-foreground text-sm mb-4">{label}</h3>}

            <div className={`flex ${isHorizontal ? 'flex-row items-end' : 'flex-col'} gap-4`}>
                <div className="flex items-center gap-3 flex-1">
                    <div className="flex-1 space-y-1">
                        <Label className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest ml-1">Min</Label>
                        <div className="relative">
                            <Input
                                type="number"
                                placeholder="0"
                                value={minPrice}
                                onChange={(e) => onMinChange(e.target.value)}
                                className="h-10 pr-8 border-input focus:border-primary focus:ring-primary/20 bg-background rounded-lg text-sm font-bold"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">$</span>
                        </div>
                    </div>

                    <span className="text-muted-foreground mt-6">—</span>

                    <div className="flex-1 space-y-1">
                        <Label className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest ml-1">Max</Label>
                        <div className="relative">
                            <Input
                                type="number"
                                placeholder="Max"
                                value={maxPrice}
                                onChange={(e) => onMaxChange(e.target.value)}
                                className="h-10 pr-8 border-input focus:border-primary focus:ring-primary/20 bg-background rounded-lg text-sm font-bold"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">$</span>
                        </div>
                    </div>
                </div>

                {onSearch && (
                    <Button
                        type="button"
                        onClick={onSearch}
                        className={`${isHorizontal ? 'h-10 mb-0' : 'w-full h-10 mt-2'} bg-primary hover:bg-primary/90 text-primary-foreground gap-2 rounded-lg`}
                    >
                        <Search className="w-4 h-4" />
                        <span>Buscar</span>
                    </Button>
                )}
            </div>
        </div>
    );
};
