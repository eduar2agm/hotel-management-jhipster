import React from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  category?: string;
  icon?: React.ElementType; // Lucide Icon
  children?: React.ReactNode; // Botones de acción (Exportar, Nuevo, etc.)
  className?: string;
}

export const PageHeader = ({ 
  title, 
  subtitle, 
  category, 
  icon: Icon, 
  children,
  className 
}: PageHeaderProps) => {
  return (
    <div className={cn("bg-[#0F172A] pt-40 pb-20 px-4 md:px-8 lg:px-20 relative overflow-hidden shadow-xl", className)}>
      {/* Icono de fondo decorativo */}
      
      {Icon && (
        <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 pointer-events-none">
          <Icon className="w-96 h-96 text-white" />
        </div>
      )}
      
      <div className="relative max-w-7xl mx-auto z-10 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          {category && (
            <span className="text-yellow-500 font-bold tracking-[0.2em] uppercase text-xs mb-2 block">
              {category}
            </span>
          )}
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-2">
            {/* Icono visible junto al título en móvil/tablet o decorativo en desktop */}
            {Icon && (
              <Icon className="w-8 h-8 md:w-12 md:h-12 text-yellow-500 mr-3 inline-block align-middle mb-2 md:mb-0" />
            )}
            {title}
          </h1>
          {subtitle && (
            <p className="text-slate-400 text-lg max-w-2xl">
              {subtitle}
            </p>
          )}
        </div>
        {children && (
          <div className="flex gap-3">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};