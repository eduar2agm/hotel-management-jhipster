import { useState, type FormEvent } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { apiClient } from '../../api/axios-instance';
import { toast } from 'sonner';

// Load Stripe outside of a component’s render to avoid recreating the Stripe object on every render.
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = ({ clientSecret }: { clientSecret: string }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Return URL where the user is redirected after the payment.
        // For this test, we can stay on the same page or go to a success page.
        // Ensure this route exists or Stripe will throw an error on redirect.
        return_url: window.location.origin + '/client/reservas',
      },
    });

    if (error) {
        toast.error(error.message || 'Error desconocido en el pago');
    } else {
        // This point will only be reached if there is an immediate error when
        // confirming the payment. Otherwise, your customer will be redirected to
        // your `return_url`.
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4 p-4 border rounded shadow">
      <PaymentElement />
      <button 
        disabled={isLoading || !stripe || !elements} 
        id="submit"
        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        <span id="button-text">
          {isLoading ? "Procesando..." : "Pagar Ahora"}
        </span>
      </button>
    </form>
  );
};

export const StripeTest = () => {
    const [amount, setAmount] = useState<number>(0);
    const [reservaId, setReservaId] = useState<string>('');
    const [clientSecret, setClientSecret] = useState<string | null>(null);

    const createPaymentIntent = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const response = await apiClient.post('/api/stripe/payment-intent', {
                amount: amount,
                currency: 'usd',
                reservaId: parseInt(reservaId),
                description: `Pago prueba reserva ${reservaId}`
            });
            setClientSecret(response.data.clientSecret);
            toast.success('Intención de pago creada. Complete el formulario.');
        } catch (error) {
            console.error(error);
            toast.error('Error al crear intención de pago');
        }
    };

    const appearance = {
        theme: 'stripe' as const,
    };
    const options = {
        clientSecret,
        appearance,
    };

    return (
        <div className="container mx-auto p-8 max-w-md">
            <h1 className="text-2xl font-bold mb-6">Prueba de Pasarela Stripe</h1>
            
            {!clientSecret ? (
                <form onSubmit={createPaymentIntent} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Monto (USD)</label>
                        <input 
                            type="number" 
                            step="0.01" 
                            value={amount} 
                            onChange={(e) => setAmount(parseFloat(e.target.value))}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">ID Reserva</label>
                        <input 
                            type="number" 
                            value={reservaId} 
                            onChange={(e) => setReservaId(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                            required
                        />
                    </div>
                    <button 
                        type="submit"
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                        Generar Formulario de Pago
                    </button>
                </form>
            ) : (
                <>
                    <button 
                        onClick={() => setClientSecret(null)}
                        className="text-sm text-gray-500 hover:text-gray-700 mb-2"
                    >
                        ← Volver
                    </button>
                    {clientSecret && (
                        <Elements options={options as any} stripe={stripePromise}>
                            <CheckoutForm clientSecret={clientSecret} />
                        </Elements>
                    )}
                </>
            )}
        </div>
    );
};
