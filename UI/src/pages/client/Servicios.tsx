import { Navbar } from '../../components/ui/Navbar';
import { Footer } from '../../components/ui/Footer';
import { Wifi, Waves, Utensils, Car, Dumbbell, Baby, Sparkles, Coffee } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Servicios = () => {
  
  // Lista de Servicios Gratuitos (Amenidades)
  const AMENIDADES = [
    { icon: <Wifi size={32} />, titulo: "Wi-Fi de Alta Velocidad", desc: "Conexión de fibra óptica en todas las habitaciones y áreas comunes." },
    { icon: <Waves size={32} />, titulo: "Piscina Infinity", desc: "Abierta de 6:00 AM a 10:00 PM con servicio de toallas incluido." },
    { icon: <Baby size={32} />, titulo: "Niños Comen Gratis", desc: "Para menores de 12 años en el buffet de desayuno acompañados de un adulto." },
    { icon: <Dumbbell size={32} />, titulo: "Gimnasio 24/7", desc: "Equipado con máquinas de última generación y zona de peso libre." },
    { icon: <Car size={32} />, titulo: "Parking Privado", desc: "Estacionamiento vigilado gratuito para todos nuestros huéspedes." },
    { icon: <Coffee size={32} />, titulo: "Coffee Station", desc: "Café y té de cortesía en el lobby durante todo el día." },
  ];

  return (
    <div className="bg-white min-h-screen font-sans text-gray-900">
      <Navbar />

      {/* --- HERO SECTION --- */}
      <div className="relative h-[60vh] w-full overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop" 
            alt="Servicios Hotel" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        <div className="relative z-10 text-center px-6">
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-wider mb-4">
            Experiencias & Servicios
          </h1>
          <p className="text-gray-200 text-lg max-w-2xl mx-auto">
            Elevamos tu estancia con detalles pensados para tu confort. 
            Desde relajación absoluta hasta facilidades para toda la familia.
          </p>
        </div>
      </div>

      {/* --- SECCIÓN 1: EL SPA (PREMIUM) --- */}
      <section className="py-20 px-6">
        <div className="max-w-[1600px] mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                {/* Imagen del Spa */}
                <div className="w-full lg:w-1/2 relative">
                    <div className="absolute -top-4 -left-4 w-24 h-24 bg-yellow-500/20 rounded-tl-3xl z-0"></div>
                    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gray-900/10 rounded-br-3xl z-0"></div>
                    <img 
                        src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=2070&auto=format&fit=crop" 
                        alt="Spa Experience" 
                        className="relative z-10 rounded-xl shadow-2xl w-full h-[500px] object-cover"
                    />
                    {/* Badge de Costo Extra */}
                    <div className="absolute top-6 right-6 z-20 bg-white/90 backdrop-blur text-gray-900 px-4 py-2 text-xs font-bold uppercase tracking-widest rounded shadow-lg">
                        Servicio Premium
                    </div>
                </div>

                {/* Texto del Spa */}
                <div className="w-full lg:w-1/2 space-y-6">
                    <span className="text-yellow-600 font-bold tracking-widest uppercase text-sm">Relajación Total</span>
                    <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight">
                        The Royal Spa
                    </h2>
                    <p className="text-gray-500 text-lg leading-relaxed">
                        Desconecta del mundo en nuestro santuario de bienestar. Ofrecemos tratamientos exclusivos, 
                        masajes terapéuticos y un circuito de hidroterapia diseñado para renovar tu energía.
                    </p>
                    
                    <ul className="space-y-4 pt-4">
                        <li className="flex items-center gap-4 text-gray-700 font-medium">
                            <Sparkles className="text-yellow-500" /> Masajes de tejido profundo y aromaterapia
                        </li>
                        <li className="flex items-center gap-4 text-gray-700 font-medium">
                            <Sparkles className="text-yellow-500" /> Sauna seco y baño de vapor
                        </li>
                        <li className="flex items-center gap-4 text-gray-700 font-medium">
                            <Sparkles className="text-yellow-500" /> Tratamientos faciales orgánicos
                        </li>
                    </ul>

                    <div className="pt-8">
                        <button className="bg-gray-900 text-white px-8 py-3 uppercase tracking-widest text-sm font-bold hover:bg-yellow-500 transition-colors">
                            Reservar Cita
                        </button>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* --- SECCIÓN 2: AMENIDADES INCLUIDAS (GRATIS) --- */}
      <section className="py-20 bg-gray-50 px-6">
        <div className="max-w-[1600px] mx-auto text-center mb-16">
            <h2 className="text-3xl font-black text-gray-900 uppercase mb-4">
                Todo esto va por nuestra cuenta
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
                Tu tarifa incluye acceso ilimitado a estas facilidades para que disfrutes sin preocupaciones adicionales.
            </p>
        </div>

        <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-6">
            {AMENIDADES.map((item, idx) => (
                <div key={idx} className="bg-white p-8 rounded-xl shadow-sm hover:shadow-xl transition-shadow border border-gray-100 group">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-900 mb-6 group-hover:bg-yellow-500 group-hover:text-white transition-colors">
                        {item.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{item.titulo}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                        {item.desc}
                    </p>
                </div>
            ))}
        </div>
      </section>

      {/* --- BANNER RESTAURANTE (CTA EXTRA) --- */}
      <section className="relative py-24 px-6 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
             <img 
                src="https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1974&auto=format&fit=crop" 
                alt="Restaurante" 
                className="w-full h-full object-cover"
             />
             <div className="absolute inset-0 bg-gray-900/80"></div>
        </div>

        <div className="relative z-10 text-center max-w-3xl space-y-6">
            <Utensils className="mx-auto text-yellow-500 h-12 w-12 mb-4" />
            <h2 className="text-3xl md:text-5xl font-black text-white">Gastronomía Internacional</h2>
            <p className="text-gray-300 text-lg">
                Disfruta de nuestros 3 restaurantes temáticos. Desayuno buffet incluido en todas las reservas.
            </p>
            <div className="flex justify-center gap-4 pt-4">
                <Link to="/client/Menu" className="border border-white text-white px-8 py-3 uppercase tracking-widest text-sm font-bold hover:bg-white hover:text-gray-900 transition-colors">
                    Ver Menú
                </Link>
            </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Servicios;