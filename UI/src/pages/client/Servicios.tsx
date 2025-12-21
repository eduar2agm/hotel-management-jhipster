import { useEffect, useState } from 'react';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { Sparkles, Utensils } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ServicioService } from '../../services/servicio.service';
import { ReservaService } from '../../services/reserva.service';
import { ServicioContratadoService } from '../../services/servicio-contratado.service';
import type { ServicioDTO } from '../../types/api/Servicio';
import { TipoServicio } from '../../types/api/Servicio';
import type { ReservaDTO } from '../../types/api/Reserva';
import { EstadoServicioContratado } from '../../types/api/ServicioContratado';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';
import { format } from 'date-fns';

import { PageHeader } from '../../components/common/PageHeader';

export const Servicios = () => {
  const navigate = useNavigate();
  const [servicios, setServicios] = useState<ServicioDTO[]>([]);
  const [reservas, setReservas] = useState<ReservaDTO[]>([]);
  const [loading, setLoading] = useState(true);

  // Estado para el modal de contratación
  const [contractingService, setContractingService] = useState<ServicioDTO | null>(null);
  const [selectedReservaId, setSelectedReservaId] = useState<string>('');
  const [cantidad, setCantidad] = useState<number>(1);
  const [observaciones, setObservaciones] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadDat = async () => {
      try {
        const [serviciosRes, reservasRes] = await Promise.all([
          ServicioService.getServiciosDisponibles(),
          ReservaService.getReservas({ size: 100, sort: 'fechaInicio,desc' })
        ]);
        setServicios(serviciosRes.data);

        // Filtrar reservas activas (futuras o en curso)
        const now = new Date();
        const active = reservasRes.data.filter(r => {
          if (!r.fechaFin) return false;
          const end = new Date(r.fechaFin);
          return end >= now; // Reservas que no han terminado
        });
        setReservas(active);
      } catch (error) {
        console.error("Error fetching data", error);
        toast.error("No se pudieron cargar los datos.");
      } finally {
        setLoading(false);
      }
    };
    loadDat();
  }, []);

  const gratuitos = servicios.filter(s => s.tipo === TipoServicio.GRATUITO);
  const pagos = servicios.filter(s => s.tipo === TipoServicio.PAGO);

  const handleContratarClick = (servicio: ServicioDTO) => {
    if (reservas.length === 0) {
      toast.error("Necesitas tener una reserva activa para contratar servicios.");
      return;
    }
    setContractingService(servicio);
    setCantidad(1);
    setObservaciones('');
    // Pre-seleccionar si solo hay una reserva
    if (reservas.length === 1 && reservas[0].id) {
      setSelectedReservaId(String(reservas[0].id));
    } else {
      setSelectedReservaId('');
    }
  };

  const confirmContratacion = async () => {
    if (!selectedReservaId) {
      toast.error("Por favor selecciona una reserva.");
      return;
    }

    const reserva = reservas.find(r => String(r.id) === selectedReservaId);
    if (!reserva || !contractingService) return;

    setSubmitting(true);
    try {
      const payload = {
        fechaContratacion: new Date().toISOString(),
        cantidad: cantidad,
        precioUnitario: contractingService.precio,
        estado: EstadoServicioContratado.PENDIENTE,
        observaciones: observaciones,
        servicio: contractingService,
        reserva: { id: Number(selectedReservaId) },
        cliente: reserva.cliente // Usar el cliente de la reserva
      };

      await ServicioContratadoService.create(payload as any);
      toast.success("Solicitud enviada exitosamente.");
      setContractingService(null);
      navigate('/client/mis-servicios');
    } catch (error) {
      console.error(error);
      toast.error("Error al contratar el servicio.");
    } finally {
      setSubmitting(false);
    }
  };

  const totalPrice = contractingService ? (Number(contractingService.precio) * cantidad).toFixed(2) : '0.00';

  if (loading) {
    return (
      <div className="bg-white min-h-screen font-sans text-gray-900 flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-600"></div>
        </div>
        <Footer />
      </div>
    );
  }


  return (
    <div className="bg-white min-h-screen font-sans text-gray-900 flex flex-col">
      <Navbar />

      <PageHeader
        title="Experiencias & Servicios"
        subtitle="Elevamos tu estancia con detalles pensados para tu confort."
        category="Catálogo Exclusivo"
        className="bg-[#0F172A]"
      />

      {/* SECCIÓN 1: SERVICIOS PREMIUM (PAGO) */}
      <section className="py-20 px-6 max-w-[1600px] mx-auto">
        <div className="flex items-center gap-4 mb-12">
          <div className="h-1 w-12 bg-yellow-500"></div>
          <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Servicios Premium</h2>
        </div>

        {pagos.length === 0 ? (
          <p className="text-gray-500 italic">No hay servicios premium disponibles en este momento.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pagos.map((servicio) => (
              <Card key={servicio.id} className="overflow-hidden border-0 shadow-lg group hover:shadow-xl transition-all duration-300 flex flex-col h-full bg-white">
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={servicio.urlImage ? (servicio.urlImage.startsWith('http') ? servicio.urlImage : `/images/${servicio.urlImage}`) : "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=2000&auto=format&fit=crop"} // Fallback image
                    alt={servicio.nombre}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-yellow-500 text-white border-0 text-md px-3 py-1">
                      ${typeof servicio.precio === 'number' ? servicio.precio.toFixed(2) : servicio.precio}
                    </Badge>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gray-900">{servicio.nombre}</CardTitle>
                  <CardDescription>{servicio.disponible ? "Disponible" : "No disponible temporalmente"}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-gray-600 leading-relaxed">
                    {servicio.descripcion || "Disfruta de este servicio exclusivo diseñado para ti."}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={() => handleContratarClick(servicio)}
                    className="w-full bg-gray-900 hover:bg-yellow-600 text-white transition-colors uppercase tracking-wider font-bold"
                  >
                    Contratar
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* SECCIÓN 2: AMENIDADES (GRATUITO) */}
      <section className="py-20 bg-gray-50 px-6">
        <div className="max-w-[1600px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-gray-900 uppercase mb-4">
              Todo esto va por nuestra cuenta
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Amenidades incluidas en tu tarifa para una estancia perfecta.
            </p>
          </div>

          {gratuitos.length === 0 ? (
            <p className="text-center text-gray-500 italic">Estamos actualizando nuestras amenidades.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {gratuitos.map((servicio) => (
                <div key={servicio.id} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex flex-col items-center text-center">
                  <div className="w-14 h-14 bg-yellow-50 rounded-full flex items-center justify-center text-yellow-600 mb-4 overflow-hidden">
                    {servicio.urlImage ? (
                      <img src={servicio.urlImage.startsWith('http') ? servicio.urlImage : `/images/${servicio.urlImage}`} alt={servicio.nombre} className="w-full h-full object-cover" />
                    ) : (
                      <Sparkles size={24} />
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{servicio.nombre}</h3>
                  <p className="text-gray-500 text-sm">
                    {servicio.descripcion || "Disponible para todos nuestros huéspedes."}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* --- BANNER RESTAURANTE --- */}
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
            Disfruta de nuestros restaurantes temáticos.
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <Link to="/client/Menu" className="border border-white text-white px-8 py-3 uppercase tracking-widest text-sm font-bold hover:bg-white hover:text-gray-900 transition-colors">
              Ver Menú
            </Link>
          </div>
        </div>
      </section>

      <Dialog open={!!contractingService} onOpenChange={(open) => !open && setContractingService(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Contratar {contractingService?.nombre}</DialogTitle>
            <DialogDescription>
              Complete los detalles para validar su solicitud.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reserva">Seleccionar Reserva</Label>
              <Select
                value={selectedReservaId}
                onValueChange={setSelectedReservaId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione una reserva activa" />
                </SelectTrigger>
                <SelectContent>
                  {reservas.map((r) => (
                    <SelectItem key={r.id} value={String(r.id)}>
                      Reserva #{r.id} - {r.fechaInicio ? format(new Date(r.fechaInicio), 'dd/MM') : ''} al {r.fechaFin ? format(new Date(r.fechaFin), 'dd/MM') : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="cantidad">Cantidad</Label>
                <Input
                  id="cantidad"
                  type="number"
                  min="1"
                  value={cantidad}
                  onChange={(e) => setCantidad(Number(e.target.value))}
                />
              </div>
              <div className="grid gap-2">
                <Label>Precio Unitario</Label>
                <div className="flex h-10 w-full rounded-md border border-input bg-gray-50 px-3 py-2 text-sm text-gray-500">
                  ${Number(contractingService?.precio || 0).toFixed(2)}
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="obs">Observaciones (Opcional)</Label>
              <Input
                id="obs"
                placeholder="Detalles adicionales..."
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
              <span className="font-bold text-yellow-800">Total Estimado:</span>
              <span className="text-2xl font-black text-yellow-700">${totalPrice}</span>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setContractingService(null)}>Cancelar</Button>
            <Button onClick={confirmContratacion} disabled={submitting || !selectedReservaId} className="bg-yellow-600 hover:bg-yellow-700 text-white">
              {submitting ? 'Procesando...' : 'Confirmar Solicitud'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Servicios;