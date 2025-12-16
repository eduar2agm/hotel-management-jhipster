import { Facebook, Instagram, Twitter } from 'lucide-react';
import imagen from '../../assets/imgBack.avif' // Asegúrate de que esta ruta sea correcta

export const HeroSection = () => {
  return (
    <div className="relative h-screen w-full overflow-hidden">
      <div className="absolute inset-0">
        <img 
          src={imagen} 
          alt="Hotel Luxury" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      {/* 2. Barra Lateral Izquierda */}
      <div className="absolute left-0 top-0 h-full w-24 flex flex-col justify-end items-center pb-10 z-20 hidden md:flex">
     
        <div className="flex flex-col gap-6 text-white mb-10">
          <Twitter className="w-5 h-5 hover:text-yellow-400 cursor-pointer" />
          <Facebook className="w-5 h-5 hover:text-yellow-400 cursor-pointer" />
          <Instagram className="w-5 h-5 hover:text-yellow-400 cursor-pointer" />
        </div>
        
       
        <div className="h-10 w-px bg-white/0 mb-8"></div>


        <div className="transform -rotate-90 text-white text-xs tracking-[0.2em] opacity-80 whitespace-nowrap mb-24">
          @HotelManagement
        </div>
      </div>

      {/* 3. Contenido Central */}
      <div className="relative z-10 h-full flex flex-col justify-end px-12 md:px-32 max-w-5xl pb-10 md:pb-14">
        <h1 className="text-6xl md:text-8xl font-black text-white leading-tight mb-6 drop-shadow-lg">
          Disfruta tu <br />
          comodidad
        </h1>
        
        <p className="text-gray-300 text-sm md:text-base max-w-2xl leading-relaxed">
          Descubre un refugio de tranquilidad donde cada detalle está pensado para tu descanso. 
          Desde nuestras suites de lujo hasta nuestro servicio personalizado, tu experiencia 
          será inolvidable. Relájate, desconecta y vive el momento.
        </p>

        <div className="mt-8">
            <button className="bg-white text-black px-8 py-3 font-bold uppercase tracking-widest hover:bg-yellow-400 transition-colors">
                Ver Habitaciones
            </button>
        </div>
      </div>
    </div>
  );
};