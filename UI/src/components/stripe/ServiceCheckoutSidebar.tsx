import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import type { ServicioContratadoDTO } from '../../types/api/ServicioContratado';
import { apiClient } from '../../api/axios-instance';
import { StripePaymentForm } from './StripePaymentForm';
import { toast } from 'sonner';
import { X, ShoppingBag, CreditCard, ShieldCheck, Sparkles } from 'lucide-react';

// Initialize Stripe Key (reuse environment variable)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface Props {
    servicio: ServicioContratadoDTO | null;
    onClose: () => void;
    onPaymentSuccess: () => void;
}

export const ServiceCheckoutSidebar = ({ servicio, onClose, onPaymentSuccess }: Props) => {
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [loadingSecret, setLoadingSecret] = useState(false);

    // Reset state when service changes
    useEffect(() => {
        setClientSecret(null);
    }, [servicio?.id]);

    if (!servicio) return null;

    const total = (Number(servicio.precioUnitario) || 0) * (servicio.cantidad || 1);

    const handleInitiatePayment = async () => {
        if (!servicio.id || total <= 0) return;

        setLoadingSecret(true);
        try {
            const response = await apiClient.post('/stripe/payment-intent', {
                amount: total,
                currency: 'usd',
                reservaId: servicio.reserva?.id, // Link to reservation is good practice
                servicioContratadoId: servicio.id, // CRITICAL: This triggers the service confirmation workflow backend
                description: `Pago Servicio: ${servicio.servicio?.nombre}`
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
        <div className="bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden sticky top-32 animate-in slide-in-from-right duration-300 h-fit max-h-[85vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-slate-900 text-white p-6 flex justify-between items-start">
                <div>
                    <span className="text-yellow-500 font-bold tracking-widest text-xs uppercase mb-1 block">Checkout Servicio</span>
                    <h3 className="text-xl font-bold">{servicio.servicio?.nombre}</h3>
                </div>
                <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="p-6">
                {/* Summary Details */}
                <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="bg-yellow-100 p-2 rounded-full text-yellow-600">
                                <Sparkles size={20} />
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 text-sm">Resumen</p>
                                <p className="text-xs text-gray-500">{servicio.cantidad} x ${Number(servicio.precioUnitario).toFixed(2)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center text-lg pt-2">
                        <span className="font-bold text-gray-900">Total a Pagar</span>
                        <span className="font-bold text-yellow-600 text-2xl">${total.toFixed(2)}</span>
                    </div>
                </div>

                {/* Payment Section */}
                {!clientSecret ? (
                    <div className="space-y-4">
                        <div className="bg-blue-50 p-4 rounded-lg flex items-start gap-3">
                            <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-blue-800">
                                Su pago será procesado de forma segura a través de Stripe.
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
                                    <CreditCard className="w-5 h-5" /> Pagar Ahora
                                </>
                            )}
                        </button>
                    </div>
                ) : (
                    <div className="animate-in fade-in duration-500">
                        <Elements stripe={stripePromise} options={options}>
                            <StripePaymentForm
                                onSuccess={onPaymentSuccess}
                                // We redirect back to same page. Backend webhook handles status update even if redirect fails or user closes tab.
                                returnUrl={`${window.location.origin}${window.location.pathname}?confirm_servicio_id=${servicio.id}`}
                            />
                        </Elements>
                    </div>
                )}
            </div>
        </div>
    );
};
