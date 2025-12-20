import { useState, useMemo, useEffect } from 'react';
import { Navbar } from '../../components/ui/Navbar';
import { Footer } from '../../components/ui/Footer';
import { PublicRoomCard } from '../../components/ui/PublicRoomCard';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { HabitacionService } from '../../services/habitacion.service';
import type { HabitacionDTO } from '../../types/api';

// MOCK eliminado para usar datos reales

export const Habitaciones = () => {
  const [busqueda, setBusqueda] = useState("");
  const [categoriaSelec, setCategoriaSelec] = useState("TODAS");
  const [precioMax, setPrecioMax] = useState(600);
  const [habitaciones, setHabitaciones] = useState<HabitacionDTO[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    HabitacionService.getHabitacions()
      .then(res => {
        setHabitaciones(res.data.filter(h => h.activo));
        setCargando(false);
      })
      .catch(err => {
        console.error("Error al cargar habitaciones:", err);
        setCargando(false);
      });
  }, []);

  const habitacionesFiltradas = useMemo(() => {
    return habitaciones.filter(hab => {
      // Búsqueda en descripción o categoría
      const matchTexto =
        (hab.descripcion || "").toLowerCase().includes(busqueda.toLowerCase()) ||
        (hab.categoriaHabitacion?.nombre || "").toLowerCase().includes(busqueda.toLowerCase());

      const matchCategoria = categoriaSelec === "TODAS" || hab.categoriaHabitacion?.nombre === categoriaSelec;

      const precio = hab.categoriaHabitacion?.precioBase || 0;
      const matchPrecio = precio <= precioMax;

      return matchTexto && matchCategoria && matchPrecio;
    });
  }, [busqueda, categoriaSelec, precioMax, habitaciones]);

  if (cargando) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

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
              {["TODAS", "SENCILLA", "DOBLE", "SUITE"].map(cat => (
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
                <PublicRoomCard
                  key={hab.id}
                  titulo={`Habitación ${hab.numero} - ${hab.categoriaHabitacion?.nombre}`}
                  precio={hab.categoriaHabitacion?.precioBase || 0}
                  capacidad={hab.capacidad || 0}
                  imagen={hab.imagen ? (hab.imagen.startsWith('http') ? hab.imagen : `/images/${hab.imagen}`) : ''}
                  descripcion={hab.descripcion || ''}
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