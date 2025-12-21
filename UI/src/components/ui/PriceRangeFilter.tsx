import { Input as ShadcnInput } from "./input";
import { Label } from "./label";

import { Search } from "lucide-react";
import { Button } from "./button";

interface PriceRangeFilterProps {
    minPrice: number | string;
    maxPrice: number | string;
    onMinPriceChange: (value: string) => void;
    onMaxPriceChange: (value: string) => void;
    onSearch?: () => void;
    className?: string;
    variant?: 'vertical' | 'horizontal';
}

export const PriceRangeFilter: React.FC<PriceRangeFilterProps> = ({
    minPrice,
    maxPrice,
    onMinPriceChange,
    onMaxPriceChange,
    onSearch,
    className = "",
    variant = 'vertical',
}) => {
    if (variant === 'horizontal') {
        const handleKeyDown = (e: React.KeyboardEvent) => {
            if (e.key === 'Enter' && onSearch) {
                onSearch();
            }
        };

        return (
            <div className={`flex items-end justify-center gap-4 ${className}`}>
                <div className="flex flex-col items-center gap-1">
                    <Label className="block text-xs font-bold text-yellow-600 uppercase tracking-widest text-center mb-1">
                        Rango de Precio
                    </Label>
                    <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-gray-100 shadow-sm">
                        <div className="relative flex-1 min-w-[120px]">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                            <ShadcnInput
                                type="number"
                                placeholder="Mín"
                                value={minPrice}
                                onChange={(e) => onMinPriceChange(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="pl-7 h-10 border-gray-200 focus:border-yellow-600 focus:ring-yellow-600/20"
                            />
                            <span className="absolute -top-5 left-0 w-full text-center text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Min</span>
                        </div>
                        <span className="text-gray-300 font-light">—</span>
                        <div className="relative flex-1 min-w-[120px]">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                            <ShadcnInput
                                type="number"
                                placeholder="Máx"
                                value={maxPrice}
                                onChange={(e) => onMaxPriceChange(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="pl-7 h-10 border-gray-200 focus:border-yellow-600 focus:ring-yellow-600/20"
                            />
                            <span className="absolute -top-5 left-0 w-full text-center text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Max</span>
                        </div>
                    </div>
                </div>
                {onSearch && (
                    <Button
                        type="button"
                        onClick={onSearch}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white shadow-md rounded-md flex items-center gap-2 px-6 h-11"
                        size="sm"
                    >
                        <Search className="h-4 w-4" />
                        <span className="hidden md:inline font-bold">Buscar</span>
                    </Button>
                )}
            </div>
        );
    }

    return (
        <div className={`space-y-4 ${className}`}>
            <Label className="w-full block text-xs font-bold text-yellow-600 uppercase tracking-widest text-center mb-1">
                Rango de Precio
            </Label>
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                    <span className="text-[10px] text-gray-400 uppercase font-bold px-1">Mínimo</span>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                        <ShadcnInput
                            type="number"
                            placeholder="0"
                            value={minPrice}
                            onChange={(e) => onMinPriceChange(e.target.value)}
                            className="pl-7 h-9 border-gray-200 focus:border-yellow-600"
                        />
                    </div>
                </div>
                <div className="space-y-1">
                    <span className="text-[10px] text-gray-400 uppercase font-bold px-1">Máximo</span>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                        <ShadcnInput
                            type="number"
                            placeholder="9999"
                            value={maxPrice}
                            onChange={(e) => onMaxPriceChange(e.target.value)}
                            className="pl-7 h-9 border-gray-200 focus:border-yellow-600"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
