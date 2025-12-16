import { Navbar } from '../components/ui/Navbar';
import { HeroSection } from '../components/ui/HeroSection';
import { RoomCard } from '../components/ui/RoomCard';
import { Footer } from '../components/ui/Footer';
import { useHabitaciones } from '../hooks/useHabitaciones'; 

export const Home = () => {
  // 1. Usar el hook para obtener datos reales
  const { habitaciones, loading, error } = useHabitaciones();

  return (
    <div className="font-sans text-gray-900">
      <Navbar />
      <HeroSection />

      <section className="py-20 px-6 md:px-20 bg-gray-50">
        <div className="text-center mb-16">
          <span className="text-yellow-600 font-bold tracking-widest uppercase text-xs mb-2 block">
            Descubre
          </span>
          <h2 className="text-4xl font-black text-gray-900">Nuestras Habitaciones</h2>
        </div>

        {/* 2. Manejo de Estados de Carga y Error */}
        {loading && (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Cargando disponibilidad...</p>
          </div>
        )}

        {error && (
          <div className="text-center text-red-500 py-10">
            <p>Error al cargar habitaciones: {error}</p>
          </div>
        )}

        {/* 3. Renderizado de Datos Reales */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 container mx-auto">
            {habitaciones.map((hab) => {
              // Lógica de Mapeo: Backend -> Frontend Card
              // Si no tiene imagen, usamos una por defecto para que no se vea roto
              const imagenPorDefecto = "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80&w=800";
              
              // El precio viene como string en el DTO ("150.00"), lo convertimos a número
              const precioNumerico = parseFloat(hab.categoriaHabitacion?.precioBase || "0");
              
              // El título será el nombre de la categoría (ej: "Suite") o el número de habitación
              const tituloCard = hab.categoriaHabitacion?.nombre || `Habitación ${hab.numero}`;

              return (
                <RoomCard 
                  key={hab.id}
                  titulo={tituloCard}
                  precio={precioNumerico}
                  capacidad={hab.capacidad}
                  imagen={hab.imagen || imagenPorDefecto}
                  descripcion={hab.descripcion || "Disfruta de una estancia inolvidable con todas las comodidades."}
                />
              );
            })}
          </div>
        )}
        
        {!loading && habitaciones.length === 0 && (
           <div className="text-center text-gray-500">No hay habitaciones disponibles en este momento.</div>
        )}

      </section>

      <Footer />
    </div>
  );
};

export default Home;