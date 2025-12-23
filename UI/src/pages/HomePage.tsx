import { Navbar } from '../components/layout/Navbar';
import { HeroSection } from '../components/ui/HeroSection';
import { Footer } from '../components/layout/Footer';
import { useHabitaciones } from '../hooks/useHabitaciones';
import { ImageCarousel } from '../components/ui/ImageCarousel';
import { ServicesCarousel } from '../components/ui/ServicesCarousel';
import { LocationMap } from '../components/ui/LocationMap';

export const Home = () => {

  const { } = useHabitaciones();

  return (
    <div className="font-sans text-foreground bg-muted">
      <Navbar />
      <HeroSection />
      <div>
        <h2 className="text-4xl text-foreground font-bold text-center p-6">Nuestras Habitaciones</h2>
      </div>
      <ImageCarousel />
      <div>
        <h2 className="text-4xl  text-foreground font-bold text-center p-6">Nuestros Servicios</h2>
      </div>
      <ServicesCarousel />
      <div className="container mx-auto px-0 py-12">
        <LocationMap />
      </div>
      <Footer />
    </div>
  );
};

export default Home;