import { useState, useMemo } from 'react';
import { Navbar } from '../../components/ui/Navbar';
import { Footer } from '../../components/ui/Footer';
import { Calendar, User, Star, Info } from 'lucide-react';

// Reutilizamos el Mock mientras se arregla el Backend
const HABITACIONES_MOCK = [
    { id: 1, titulo: "Suite Presidencial", precio: 350, capacidad: 4, categoria: "SUITE", imagen: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=800", descripcion: "Vista al mar, jacuzzi y servicio a la habitación 24/7." },
    { id: 2, titulo: "Doble Deluxe", precio: 120, capacidad: 2, categoria: "DOBLE", imagen: "https://images.unsplash.com/photo-1590490360182-f33db079502d?auto=format&fit=crop&q=80&w=800", descripcion: "Espaciosa, cama King size y acabados de lujo." },
    { id: 3, titulo: "Sencilla Standard", precio: 85, capacidad: 1, categoria: "SENCILLA", imagen: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80&w=800", descripcion: "Perfecta para viajeros de negocios. Wifi de alta velocidad." },
    { id: 4, titulo: "Suite Familiar", precio: 280, capacidad: 5, categoria: "SUITE", imagen: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&q=80&w=800", descripcion: "Dos ambientes conectados, ideal para familias grandes." },
];

export const Reservas = () => {
    // --- ESTADOS DEL FORMULARIO ---
    const [checkIn, setCheckIn] = useState("");
    const [checkOut, setCheckOut] = useState("");
    const [huespedes, setHuespedes] = useState(2);
    const [habitacionSeleccionada, setHabitacionSeleccionada] = useState<number | null>(null);

    // --- CÁLCULOS ---
    const habitacionActual = HABITACIONES_MOCK.find(h => h.id === habitacionSeleccionada);

    const noches = useMemo(() => {
        if (!checkIn || !checkOut) return 0;
        const inicio = new Date(checkIn);
        const fin = new Date(checkOut);
        const diffTime = Math.abs(fin.getTime() - inicio.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    }, [checkIn, checkOut]);

    const precioTotal = habitacionActual ? habitacionActual.precio * (noches || 1) : 0;

    const handleReserva = () => {
        if (!habitacionSeleccionada) return alert("Selecciona una habitación");
        if (noches === 0) return alert("Selecciona fechas válidas");

        alert(`¡Reserva Simulada!\nHabitación: ${habitacionActual?.titulo}\nTotal: $${precioTotal}\nNoches: ${noches}`);
        // Aquí iría la lógica para enviar al Backend o a la pasarela de pago
    };

    return (
        <div className="bg-gray-50 min-h-screen font-sans">
            <Navbar />

            {/* --- HERO / BUSCADOR --- */}
            <div className="bg-gray-900 pt-32 pb-20 px-6">
                <div className="max-w-[1600px] mx-auto text-center">
                    <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-wider mb-8">
                        Agenda tu Estadía
                    </h1>

                    {/* Barra de Búsqueda Flotante */}
                    <div className="bg-white p-4 rounded-lg shadow-xl max-w-4xl mx-auto flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1 w-full text-left">
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block ml-1">Check-In</label>
                            <div className="relative">
                                <input
                                    type="date"
                                    className="w-full bg-gray-50 text-gray-800 border border-gray-200 rounded-lg p-3 pl-10 focus:outline-none focus:border-yellow-500"
                                    value={checkIn}
                                    onChange={(e) => setCheckIn(e.target.value)}
                                />
                                <Calendar className="absolute left-3 top-3.5 text-gray-400" size={18} />
                            </div>
                        </div>

                        <div className="flex-1 w-full text-left">
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block ml-1">Check-Out</label>
                            <div className="relative">
                                <input
                                    type="date"
                                    className="w-full bg-gray-50 text-gray-800 border border-gray-200 rounded-lg p-3 pl-10 focus:outline-none focus:border-yellow-500"
                                    value={checkOut}
                                    onChange={(e) => setCheckOut(e.target.value)}
                                />
                                <Calendar className="absolute left-3 top-3.5 text-gray-400" size={18} />
                            </div>
                        </div>

                        <div className="w-full md:w-48 text-left">
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block ml-1">Huéspedes</label>
                            <div className="relative">
                                <select
                                    className="w-full bg-gray-50 text-gray-800 border border-gray-200 rounded-lg p-3 pl-10 appearance-none focus:outline-none focus:border-yellow-500"
                                    value={huespedes}
                                    onChange={(e) => setHuespedes(Number(e.target.value))}
                                >
                                    {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} Personas</option>)}
                                </select>
                                <User className="absolute left-3 top-3.5 text-gray-400" size={18} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- CONTENIDO PRINCIPAL --- */}
            <div className="max-w-[1600px] mx-auto px-6 py-12 flex flex-col lg:flex-row gap-8 items-start">

                {/* IZQUIERDA: LISTA DE HABITACIONES */}
                <div className="flex-1 space-y-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Star className="text-yellow-500 fill-yellow-500" size={20} /> Habitaciones Disponibles
                    </h2>

                    {HABITACIONES_MOCK.map((hab) => (
                        <div
                            key={hab.id}
                            onClick={() => setHabitacionSeleccionada(hab.id)}
                            className={`
                        group relative flex flex-col md:flex-row bg-white rounded-xl overflow-hidden shadow-sm border transition-all cursor-pointer hover:shadow-md
                        ${habitacionSeleccionada === hab.id ? 'border-yellow-500 ring-2 ring-yellow-500/20' : 'border-gray-100'}
                    `}
                        >
                            {/* Imagen */}
                            <div className="w-full md:w-64 h-48 md:h-auto relative overflow-hidden">
                                <img src={hab.imagen} alt={hab.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            </div>

                            {/* Info */}
                            <div className="p-6 flex-1 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-1 rounded uppercase tracking-wider">{hab.categoria}</span>
                                            <h3 className="text-xl font-bold text-gray-900 mt-2">{hab.titulo}</h3>
                                        </div>
                                        <div className="text-right">
                                            <span className="block text-2xl font-black text-gray-900">${hab.precio}</span>
                                            <span className="text-xs text-gray-500">/ noche</span>
                                        </div>
                                    </div>
                                    <p className="text-gray-500 text-sm mt-3 leading-relaxed">{hab.descripcion}</p>

                                    <div className="flex gap-4 mt-4 text-xs font-medium text-gray-400">
                                        <span className="flex items-center gap-1"><User size={14} /> {hab.capacidad} Huéspedes</span>
                                        <span className="flex items-center gap-1"><Info size={14} /> Cancelación Gratuita</span>
                                    </div>
                                </div>

                                {/* Botón Seleccionar (Visible solo en móvil o estado inactivo) */}
                                <div className="mt-4 md:hidden">
                                    <button className="w-full py-2 bg-gray-100 text-gray-700 font-bold rounded hover:bg-gray-200">
                                        {habitacionSeleccionada === hab.id ? 'Seleccionada' : 'Seleccionar'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* DERECHA: RESUMEN DE RESERVA (STICKY) */}
                <div className="w-full lg:w-96 shrink-0 sticky top-32">
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="bg-gray-900 p-4 text-white text-center font-bold uppercase tracking-widest text-sm">
                            Resumen de Reserva
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Fechas */}
                            <div className="flex justify-between text-sm">
                                <div className="text-center">
                                    <span className="block text-gray-400 text-xs uppercase mb-1">Entrada</span>
                                    <span className="font-bold text-gray-800">{checkIn || "--/--/--"}</span>
                                </div>
                                <div className="h-full w-px bg-gray-200"></div>
                                <div className="text-center">
                                    <span className="block text-gray-400 text-xs uppercase mb-1">Salida</span>
                                    <span className="font-bold text-gray-800">{checkOut || "--/--/--"}</span>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 pt-4">
                                {habitacionActual ? (
                                    <>
                                        <h4 className="font-bold text-gray-900 mb-1">{habitacionActual.titulo}</h4>
                                        <p className="text-xs text-gray-500 mb-4">{habitacionActual.categoria} • {huespedes} Huéspedes</p>

                                        <div className="space-y-2 text-sm text-gray-600">
                                            <div className="flex justify-between">
                                                <span>${habitacionActual.precio} x {noches || 1} noches</span>
                                                <span>${precioTotal}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Impuestos y tasas</span>
                                                <span>$0.00</span>
                                            </div>
                                            <div className="flex justify-between font-black text-lg text-gray-900 pt-2 border-t border-gray-100 mt-2">
                                                <span>Total</span>
                                                <span>${precioTotal}</span>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-6 text-gray-400 text-sm">
                                        <Info className="mx-auto mb-2 opacity-50" />
                                        Selecciona una habitación de la izquierda para ver el detalle.
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={handleReserva}
                                disabled={!habitacionActual || !checkIn || !checkOut}
                                className={`
                            w-full py-4 rounded-lg font-bold uppercase tracking-widest transition-all
                            ${habitacionActual && checkIn && checkOut
                                        ? 'bg-yellow-500 hover:bg-yellow-400 text-white shadow-lg shadow-yellow-500/30'
                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
                        `}
                            >
                                Confirmar Reserva
                            </button>

                            <p className="text-xs text-center text-gray-400">
                                No se te cobrará nada todavía.
                            </p>
                        </div>
                    </div>
                </div>

            </div>

            <Footer />
        </div>
    );
};

export default Reservas;