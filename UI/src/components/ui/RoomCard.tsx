import { User, Maximize, ArrowRight } from 'lucide-react';

interface RoomCardProps {
  titulo: string;
  precio: number;
  capacidad: number;
  imagen: string;
  descripcion: string;
}

export const RoomCard = ({ titulo, precio, capacidad, imagen, descripcion }: RoomCardProps) => {
  return (
    <div className="group bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
      {/* Imagen con efecto Zoom */}
      <div className="relative h-64 overflow-hidden">
        <img 
          src={imagen} 
          alt={titulo} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-800 shadow-sm">
          ${precio} / noche
        </div>
      </div>

      {/* Contenido */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{titulo}</h3>
        <p className="text-gray-500 text-sm line-clamp-2 mb-4">{descripcion}</p>

        {/* Características */}
        <div className="flex items-center gap-4 mb-6 text-gray-400 text-sm">
          <div className="flex items-center gap-1">
            <User size={16} />
            <span>{capacidad} Pers.</span>
          </div>
          <div className="flex items-center gap-1">
            <Maximize size={16} />
            <span>45 m²</span>
          </div>
        </div>

        {/* Botón */}
        <button className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-3 rounded-lg hover:bg-black transition-colors font-medium">
          Reservar Ahora <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};