import { useEffect, useState } from 'react';
import { Facebook, Instagram, Twitter, ChevronLeft, ChevronRight } from 'lucide-react';
import { CarouselItemService } from '../../services/carousel-item.service';
import type { CarouselItemDTO } from '../../types/api/CarouselItem';
import defaultImagen from '../../assets/imgBack.avif';
import { getImageUrl } from '../../utils/imageUtils';

export const HeroSection = () => {
  const [items, setItems] = useState<CarouselItemDTO[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCarousel = async () => {
      try {
        const res = await CarouselItemService.getCarouselItems({
          activo: true,
          sort: 'orden,asc'
        });
        setItems(res.data);
      } catch (error) {
        console.error("Error loading carousel", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadCarousel();
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  // Automatic slide
  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [items.length]);

  if (isLoading) {
    return <div className="h-screen w-full bg-black animate-pulse flex items-center justify-center">
      <div className="text-white font-black text-4xl">Cargando...</div>
    </div>;
  }

  const currentItem = items[currentIndex];

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      {/* Background Image with Transition */}
      <div className="absolute inset-0">
        <img
          key={currentIndex}
          src={currentItem?.imagen?.nombreArchivo ? getImageUrl(currentItem.imagen.nombreArchivo) : defaultImagen}
          alt={currentItem?.titulo || "Hotel Luxury"}
          className="w-full h-full object-cover transition-opacity duration-1000"
        />
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      {/* Navigation Arrows for Carousel */}
      {items.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-sm transition-all"
          >
            <ChevronLeft size={32} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-sm transition-all"
          >
            <ChevronRight size={32} />
          </button>

          {/* Indicators */}
          <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-30 flex gap-2">
            {items.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 w-8 rounded-full transition-all ${i === currentIndex ? 'bg-yellow-500' : 'bg-white/30'}`}
              />
            ))}
          </div>
        </>
      )}

      {/* 2. Barra Lateral Izquierda */}
      <div className="absolute left-0 top-0 h-full w-24 flex flex-col justify-end items-center pb-10 z-20 hidden md:flex border-r border-white/10">
        <div className="flex flex-col gap-6 text-white mb-10">
          <Twitter className="w-5 h-5 hover:text-yellow-400 cursor-pointer" />
          <Facebook className="w-5 h-5 hover:text-yellow-400 cursor-pointer" />
          <Instagram className="w-5 h-5 hover:text-yellow-400 cursor-pointer" />
        </div>
        <div className="transform -rotate-90 text-white text-xs tracking-[0.2em] opacity-80 whitespace-nowrap mb-24">
          @HotelManagement
        </div>
      </div>

      {/* 3. Contenido Central */}
      <div className="relative z-10 h-full flex flex-col justify-end px-12 md:px-32 max-w-5xl pb-10 md:pb-24">
        <div key={currentIndex} className="animate-in fade-in slide-in-from-bottom-5 duration-700">
          <h1 className="text-5xl md:text-8xl font-black text-white leading-tight mb-6 drop-shadow-lg">
            {currentItem?.titulo || (
              <>Disfruta tu <br /> comodidad</>
            )}
          </h1>

          <p className="text-gray-300 text-sm md:text-base max-w-2xl leading-relaxed">
            {currentItem?.descripcion || (
              "Descubre un refugio de tranquilidad donde cada detalle está pensado para tu descanso. \
              Desde nuestras suites de lujo hasta nuestro servicio personalizado, tu experiencia \
              será inolvidable. Relájate, desconecta y vive el momento."
            )}
          </p>

          <div className="mt-8">
            <button
              onClick={() => document.getElementById('habitaciones-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-white text-black px-8 py-4 font-bold uppercase tracking-widest hover:bg-yellow-400 transition-all hover:scale-105 active:scale-95"
            >
              Ver Habitaciones
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
