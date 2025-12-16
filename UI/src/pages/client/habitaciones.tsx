import { useState, useMemo } from 'react';
import { Navbar } from '../../components/ui/Navbar';
import { Footer } from '../../components/ui/Footer';
import { RoomCard } from '../../components/ui/RoomCard';
import { Search, SlidersHorizontal, X } from 'lucide-react';

const HABITACIONES_MOCK = [
  { id: 1, titulo: "Suite Presidencial", precio: 350, capacidad: 4, categoria: "SUITE", imagen: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=800", descripcion: "Vista al mar y jacuzzi." },
  { id: 2, titulo: "Doble Deluxe", precio: 120, capacidad: 2, categoria: "DOBLE", imagen: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=800", descripcion: "Espaciosa y moderna." },
  { id: 3, titulo: "Sencilla Standard", precio: 85, capacidad: 1, categoria: "SENCILLA", imagen: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80&w=800", descripcion: "Ideal para negocios." },
  { id: 4, titulo: "Suite Familiar", precio: 280, capacidad: 5, categoria: "SUITE", imagen: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&q=80&w=800", descripcion: "Dos ambientes conectados." },
  { id: 5, titulo: "Doble Twin", precio: 110, capacidad: 2, categoria: "DOBLE", imagen: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&q=80&w=800", descripcion: "Dos camas individuales." },
  { id: 6, titulo: "Penthouse", precio: 550, capacidad: 6, categoria: "LUJO", imagen: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&q=80&w=800", descripcion: "La joya del hotel." },
];

export const Habitaciones = () => {
  const [busqueda, setBusqueda] = useState("");
  const [categoriaSelec, setCategoriaSelec] = useState("TODAS");
  const [precioMax, setPrecioMax] = useState(600);

  const habitacionesFiltradas = useMemo(() => {
    return HABITACIONES_MOCK.filter(hab => {
      const matchTexto = hab.titulo.toLowerCase().includes(busqueda.toLowerCase());
      const matchCategoria = categoriaSelec === "TODAS" || hab.categoria === categoriaSelec;
      const matchPrecio = hab.precio <= precioMax;
      
      return matchTexto && matchCategoria && matchPrecio;
    });
  }, [busqueda, categoriaSelec, precioMax]);

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <Navbar />
      
      <div className="bg-gray-900 pt-32 pb-12 px-6 text-center">
        <h1 className="text-4xl font-black text-white uppercase tracking-wider mb-4">Catálogo de Habitaciones</h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Encuentra el espacio perfecto para tu estadía. Filtra por precio, categoría o capacidad.
        </p>
      </div>

      {/* CAMBIO 1: Reemplacé 'container' por 'max-w-[1600px]'. 
         Esto permite que el contenido se expanda más hacia los bordes en pantallas grandes.
      */}
      <div className="max-w-[1600px] mx-auto px-6 md:px-10 py-12 flex flex-col lg:flex-row gap-8">
        
        {/* CAMBIO 2: Ajusté el ancho del Sidebar.
           En lugar de 'w-1/4' (que puede ser muy ancho en pantallas gigantes), 
           le puse un ancho fijo 'lg:w-80' (320px) para dejar más espacio a las cartas.
        */}
        <aside className="w-full lg:w-80 h-fit bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24 shrink-0">
          <div className="flex items-center gap-2 mb-6 text-gray-800 font-bold border-b pb-2">
            <SlidersHorizontal size={20} /> Filtros
          </div>

          {/* Buscador */}
          <div className="mb-6">
            <label className="text-xs font-bold uppercase mb-2 block">Buscar</label>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Ej: Suite..." 
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 text-gray-800 border border-gray-200 rounded-lg focus:outline-none focus:border-yellow-500 transition-colors text-sm"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            </div>
          </div>

          {/* Categorías */}
          <div className="mb-6">
            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Categoría</label>
            <div className="space-y-2">
              {["TODAS", "SENCILLA", "DOBLE", "SUITE", "LUJO"].map(cat => (
                <label key={cat} className="flex items-center gap-2 cursor-pointer hover:text-yellow-600 transition-colors">
                  <input 
                    type="radio" 
                    name="categoria" 
                    checked={categoriaSelec === cat}
                    onChange={() => setCategoriaSelec(cat)}
                    className="accent-yellow-500"
                  />
                  <span className="text-sm font-medium text-gray-700 capitalize">{cat.toLowerCase()}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Rango de Precio */}
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Precio Máximo</label>
              <span className="text-sm font-bold text-yellow-600">${precioMax}</span>
            </div>
            <input 
              type="range" 
              min="50" 
              max="600" 
              step="10"
              value={precioMax}
              onChange={(e) => setPrecioMax(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-yellow-500"
            />
          </div>

          {/* Botón Limpiar */}
          <button 
            onClick={() => { setBusqueda(""); setCategoriaSelec("TODAS"); setPrecioMax(600); }}
            className="w-full flex justify-center items-center gap-2 text-xs font-bold text-gray-400 hover:text-red-500 transition-colors py-2"
          >
            <X size={14} /> Limpiar Filtros
          </button>
        </aside>

        {/* --- GRID DE RESULTADOS --- */}
        <main className="flex-1">
          <div className="mb-4 text-sm text-gray-500">
            Mostrando <strong className="text-gray-900">{habitacionesFiltradas.length}</strong> resultados
          </div>

          {habitacionesFiltradas.length > 0 ? (
            /* CAMBIO 3: Agregué 'xl:grid-cols-3' y '2xl:grid-cols-4'.
               Ahora:
               - Móvil: 1 columna
               - Tablet/Laptop (md): 2 columnas
               - Pantalla Grande (xl): 3 columnas <--- LO QUE PEDISTE
               - Pantalla Muy Grande (2xl): 4 columnas (opcional, para aprovechar el espacio extra)
            */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
              {habitacionesFiltradas.map((hab) => (
                <RoomCard 
                  key={hab.id}
                  titulo={hab.titulo}
                  precio={hab.precio}
                  capacidad={hab.capacidad}
                  imagen={hab.imagen}
                  descripcion={hab.descripcion}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
              <Search className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No encontramos resultados</h3>
              <p className="text-gray-500 text-sm">Intenta ajustar los filtros de búsqueda.</p>
            </div>
          )}
        </main>

      </div>
      <Footer />
    </div>
  );
};

export default Habitaciones;