import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { ContactSection } from '../components/ContactSection';

export const ContactPage = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow pt-20">
                <ContactSection />
            </main>
            <Footer />
        </div>
    );
};

export default ContactPage;
