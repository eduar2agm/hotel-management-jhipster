import { useState } from 'react';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { Coffee, Utensils, Wine } from 'lucide-react';

// --- MOCK DATA DEL MENÚ ---
const MENU_ITEMS = {
  desayuno: [
    { id: 1, nombre: "Huevos Benedictinos", desc: "Pochados sobre muffin inglés, lomo canadiense y salsa holandesa trufada.", precio: 18, tags: ["Clásico"] },
    { id: 2, nombre: "Açai Bowl Tropical", desc: "Puré de açai orgánico, granola casera, banano, fresas y miel de abeja.", precio: 14, tags: ["Vegano", "Saludable"] },
    { id: 3, nombre: "Omelette del Chef", desc: "Tres huevos orgánicos, queso brie, espinaca baby y champiñones salteados.", precio: 16, tags: [] },
    { id: 4, nombre: "Pancakes de Buttermilk", desc: "Torre de pancakes esponjosos con mantequilla batida y miel de maple pura.", precio: 12, tags: ["Dulce"] },
    { id: 5, nombre: "Desayuno Nica Premium", desc: "Gallo pinto, huevos al gusto, queso frito, maduro y tortilla palmeada.", precio: 15, tags: ["Local"] },
    { id: 6, nombre: "Tostada Francesa", desc: "Brioche artesanal, compota de frutos rojos y crema batida de vainilla.", precio: 14, tags: [] },
  ],
  fuerte: [
    { id: 7, nombre: "Ribeye Steak (12oz)", desc: "Corte Angus importado a la parrilla, puré de papa trufado y espárragos.", precio: 45, tags: ["Chef's Choice"] },
    { id: 8, nombre: "Salmón Noruego", desc: "A la plancha con salsa de cítricos, quinoa y vegetales baby glaseados.", precio: 32, tags: ["Saludable"] },
    { id: 9, nombre: "Risotto de Hongos", desc: "Arroz arborio, mezcla de hongos silvestres, aceite de trufa y parmesano.", precio: 24, tags: ["Vegetariano"] },
    { id: 10, nombre: "Hamburguesa Wagyu", desc: "Carne Wagyu, queso cheddar añejo, mermelada de tocino y papas trufadas.", precio: 28, tags: [] },
    { id: 11, nombre: "Pasta Frutti di Mare", desc: "Linguine con camarones, calamares y mejillones en salsa de tomate picante.", precio: 29, tags: [] },
    { id: 12, nombre: "Pollo Orgánico Asado", desc: "Marinado en hierbas finas, acompañado de vegetales rústicos al horno.", precio: 22, tags: [] },
  ],
  bar: [
    { id: 13, nombre: "Signature Old Fashioned", desc: "Bourbon infusionado con café, bitter de naranja y azúcar morena.", precio: 14, tags: ["Coctel"] },
    { id: 14, nombre: "Vino Tinto Malbec", desc: "Copa de reserva, Mendoza Argentina. Notas a frutos negros y vainilla.", precio: 12, tags: ["Vino"] },
    { id: 15, nombre: "Mojito de Maracuyá", desc: "Ron blanco, menta fresca, pulpa de maracuyá y agua con gas.", precio: 10, tags: ["Refrescante"] },
    { id: 16, nombre: "Cerveza Artesanal IPA", desc: "Producción local, notas cítricas y amargor equilibrado.", precio: 8, tags: ["Cerveza"] },
    { id: 17, nombre: "Limonada de Coco", desc: "Bebida virgen cremosa con leche de coco y limón fresco.", precio: 7, tags: ["Sin Alcohol"] },
    { id: 18, nombre: "Espresso Martini", desc: "Vodka, licor de café y shot de espresso recién hecho.", precio: 12, tags: [] },
  ]
};

export const Menu = () => {
  const [categoriaActiva, setCategoriaActiva] = useState<'desayuno' | 'fuerte' | 'bar'>('fuerte');

  return (
    <div className="bg-white min-h-screen font-sans text-gray-900">
      <Navbar />

      {/* --- HERO SECTION --- */}
      <div className="relative h-[50vh] w-full overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2070&auto=format&fit=crop"
            alt="Gastronomía"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60"></div>
        </div>
        <div className="relative z-10 text-center px-6">
          <span className="text-yellow-500 font-bold tracking-widest uppercase text-sm mb-2 block">Restaurante & Bar</span>
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-wider mb-4">
            Menú Ejecutivo
          </h1>
          <p className="text-gray-300 text-lg max-w-xl mx-auto">
            Una fusión de sabores locales e internacionales preparados por nuestros chefs galardonados.
          </p>
        </div>
      </div>

      {/* --- MENU TABS --- */}
      <div className="sticky top-20 z-40 bg-white/95 backdrop-blur shadow-sm border-b border-gray-100">
        <div className="max-w-[1600px] mx-auto px-6 flex justify-center gap-2 md:gap-8 py-4 overflow-x-auto">

          <button
            onClick={() => setCategoriaActiva('desayuno')}
            className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold uppercase tracking-wider transition-all whitespace-nowrap
                ${categoriaActiva === 'desayuno' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <Coffee size={18} /> Desayuno
          </button>

          <button
            onClick={() => setCategoriaActiva('fuerte')}
            className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold uppercase tracking-wider transition-all whitespace-nowrap
                ${categoriaActiva === 'fuerte' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <Utensils size={18} /> Almuerzo & Cena
          </button>

          <button
            onClick={() => setCategoriaActiva('bar')}
            className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold uppercase tracking-wider transition-all whitespace-nowrap
                ${categoriaActiva === 'bar' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <Wine size={18} /> Bar & Cocteles
          </button>

        </div>
      </div>

      {/* --- MENU LIST --- */}
      <div className="max-w-5xl mx-auto px-6 py-16 min-h-[500px]">

        {/* Título de Sección */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-gray-900 uppercase">
            {categoriaActiva === 'desayuno' && "Para empezar el día"}
            {categoriaActiva === 'fuerte' && "Platos Principales"}
            {categoriaActiva === 'bar' && "Nuestra Selección de Bebidas"}
          </h2>
          <div className="w-24 h-1 bg-yellow-500 mx-auto mt-4"></div>
        </div>

        {/* Grid de Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
          {MENU_ITEMS[categoriaActiva].map((item) => (
            <div key={item.id} className="group flex flex-col pb-4 border-b border-gray-100 hover:border-gray-300 transition-colors">
              <div className="flex justify-between items-baseline mb-2">
                <h3 className="text-xl font-bold text-gray-800 group-hover:text-yellow-600 transition-colors">
                  {item.nombre}
                </h3>
                <span className="text-lg font-black text-gray-900">${item.precio}</span>
              </div>

              <p className="text-gray-500 text-sm leading-relaxed mb-3">
                {item.desc}
              </p>

              <div className="flex gap-2">
                {item.tags.map((tag, i) => (
                  <span key={i} className="text-[10px] font-bold uppercase bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Menu;