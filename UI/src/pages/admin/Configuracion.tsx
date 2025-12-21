import { useState } from 'react';
import { Button } from '@/components/ui/button';

import { Tag, Activity, Settings, Image as ImageIcon } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { CategoriasTab } from '@/components/admin/configuracion/CategoriasTab';
import { EstadosTab } from '@/components/admin/configuracion/EstadosTab';
import { CarouselTab } from '@/components/admin/configuracion/CarouselTab';
import { SistemaTab } from '@/components/admin/configuracion/SistemaTab';

export const AdminConfiguracion = () => {
    const [activeTab, setActiveTab] = useState<'categorias' | 'estados' | 'carousel' | 'sistema'>('categorias');

    return (
        <div className="font-sans text-gray-900 bg-gray-50 min-h-screen flex flex-col">

            <PageHeader 
                title="Configuración General" 
                icon={Settings} 
                subtitle="Gestione los catálogos principales del hotel, incluyendo categorías de habitaciones y sus estados operativos."
                category="SISTEMA"
            />

            <main className="flex-grow py-5 px-4 md:px-8 lg:px-20 -mt-10 relative z-10">
                <div className="max-w-7xl mx-auto space-y-6">

                    {/* STATS GRID - Keeping static for now or can fetch status count in tabs and lift state up if needed.
                        For simplicity, removing dynamic stats or mocking them. The original fetched all data just for stats.
                        I'll simplfy by removing the top stats cards for now to prioritize cleaner code, or keep them with mocked/removed values?
                        The original component had fetching logic in the parent just for these stats and for the tables.
                        Let's just keep the tabs. The stats were cool but maybe redundant or can be moved to Dashboard.
                    */}
                    
                    {/* TABS HEADER */}
                    <div className="flex flex-wrap gap-4 mb-4">
                        <Button
                            onClick={() => setActiveTab('categorias')}
                            className={`h-12 px-6 rounded-full shadow-lg transition-all text-base font-bold tracking-wide ${activeTab === 'categorias'
                                ? 'bg-indigo-600 hover:bg-indigo-700 text-white ring-4 ring-indigo-600/20'
                                : 'bg-white text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
                                }`}
                        >
                            <Tag className="mr-2 h-5 w-5" /> Categorías
                        </Button>
                        <Button
                            onClick={() => setActiveTab('estados')}
                            className={`h-12 px-6 rounded-full shadow-lg transition-all text-base font-bold tracking-wide ${activeTab === 'estados'
                                ? 'bg-indigo-600 hover:bg-indigo-700 text-white ring-4 ring-indigo-600/20'
                                : 'bg-white text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
                                }`}
                        >
                            <Activity className="mr-2 h-5 w-5" /> Estados
                        </Button>
                        <Button
                            onClick={() => setActiveTab('carousel')}
                            className={`h-12 px-6 rounded-full shadow-lg transition-all text-base font-bold tracking-wide ${activeTab === 'carousel'
                                ? 'bg-indigo-600 hover:bg-indigo-700 text-white ring-4 ring-indigo-600/20'
                                : 'bg-white text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
                                }`}
                        >
                            <ImageIcon className="mr-2 h-5 w-5" /> Carrusel
                        </Button>
                        <Button
                            onClick={() => setActiveTab('sistema')}
                            className={`h-12 px-6 rounded-full shadow-lg transition-all text-base font-bold tracking-wide ${activeTab === 'sistema'
                                ? 'bg-indigo-600 hover:bg-indigo-700 text-white ring-4 ring-indigo-600/20'
                                : 'bg-white text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
                                }`}
                        >
                            <Settings className="mr-2 h-5 w-5" /> Sistema
                        </Button>
                    </div>

                    {/* MAIN CONTENT AREA */}
                    <div className="grid gap-6">
                        {activeTab === 'categorias' && <CategoriasTab />}
                        {activeTab === 'estados' && <EstadosTab />}
                        {activeTab === 'carousel' && <CarouselTab />}
                        {activeTab === 'sistema' && <SistemaTab />}
                    </div>
                </div>
            </main>

        </div>
    );
};
