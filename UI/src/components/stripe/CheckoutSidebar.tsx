import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import type { ReservaDTO, ReservaDetalleDTO } from '../../types/api';
import { apiClient } from '../../api/axios-instance';
import { StripePaymentForm } from './StripePaymentForm';
import { toast } from 'sonner';
import { X, ShoppingBag, CreditCard, ShieldCheck } from 'lucide-react';

// Initialize Stripe Key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface Props {
  reserva: ReservaDTO | null;
  details: ReservaDetalleDTO[];
  onClose: () => void;
  onPaymentSuccess: () => void;
}

export const CheckoutSidebar = ({ reserva, details, onClose, onPaymentSuccess }: Props) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loadingSecret, setLoadingSecret] = useState(false);

  // Reset state when reservation changes
  useEffect(() => {
    setClientSecret(null);
  }, [reserva?.id]);

  if (!reserva) {
    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 text-center sticky top-32">
            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="text-gray-300 w-8 h-8" />
            </div>
            <h3 className="text-gray-900 font-bold mb-2">Resumen de Pago</h3>
            <p className="text-gray-400 text-sm">Selecciona una reserva pendiente para proceder al pago.</p>
        </div>
    );
  }

  const handleInitiatePayment = async () => {
    if (!reserva.id || !reserva.total) return;
    
    setLoadingSecret(true);
    try {
        const response = await apiClient.post('/api/stripe/payment-intent', {
            amount: reserva.total,
            currency: 'usd', // Assuming USD for now, could actuaize based on business logic
            reservaId: reserva.id,
            description: `Pago Reserva #${reserva.id}`
        });
        setClientSecret(response.data.clientSecret);
    } catch (error) {
        console.error(error);
        toast.error('No se pudo iniciar el proceso de pago. Intente nuevamente.');
    } finally {
        setLoadingSecret(false);
    }
  };

  const appearance = {
    theme: 'stripe' as const,
    variables: {
        colorPrimary: '#ca8a04', // yellow-600
        colorText: '#1f2937',
    },
  };

  const options = {
    clientSecret: clientSecret || '',
    appearance,
  };

  return (
    <div className="bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden sticky top-32 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex justify-between items-start">
            <div>
                <span className="text-yellow-500 font-bold tracking-widest text-xs uppercase mb-1 block">Checkout</span>
                <h3 className="text-xl font-bold">Reserva #{reserva.id}</h3>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
            </button>
        </div>

        <div className="p-6">
            {/* Summary Details */}
            <div className="space-y-4 mb-8">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Cantidad de Habitaciones</span>
                    <span className="font-medium text-gray-900">{details.length}</span>
                </div>
                
                <div className="border-t border-gray-100 my-4"></div>

                {details.map((detail, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-500">
                             Habitación {detail.habitacion?.numero} ({detail.habitacion?.categoriaHabitacion?.nombre})
                        </span>
                        <span className="font-medium text-gray-900">
                            ${detail.precioUnitario?.toFixed(2)}
                        </span>
                    </div>
                ))}
                 
                 <div className="border-t border-gray-100 my-4"></div>

                 <div className="flex justify-between items-center text-lg">
                    <span className="font-bold text-gray-900">Total a Pagar</span>
                    <span className="font-bold text-yellow-600 text-2xl">${reserva.total?.toFixed(2)}</span>
                 </div>
            </div>

            {/* Payment Section */}
            {!clientSecret ? (
                <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg flex items-start gap-3">
                         <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                         <p className="text-sm text-blue-800">
                             Su pago será procesado de forma segura a través de Stripe. No almacenamos los datos de su tarjeta.
                         </p>
                    </div>
                    
                    <button 
                        onClick={handleInitiatePayment}
                        disabled={loadingSecret}
                        className="w-full bg-slate-900 text-white py-4 rounded-lg font-bold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-70 flex justify-center items-center gap-2"
                    >
                        {loadingSecret ? (
                             <span className="flex items-center gap-2">
                                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2A10 10 0 1022 12 10 10 0 0012 2zm0 18a8 8 0 118-8 8 8 0 01-8 8z" className="opacity-25"></path><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path></svg>
                                Iniciando...
                             </span>
                        ) : (
                             <>
                                <CreditCard className="w-5 h-5" /> Ir a Pagar
                             </>
                        )}
                    </button>
                </div>
            ) : (
                <div className="animate-in fade-in duration-500">
                     <Elements stripe={stripePromise} options={options}>
                        <StripePaymentForm onSuccess={onPaymentSuccess} />
                     </Elements>
                </div>
            )}
        </div>
    </div>
  );
};
