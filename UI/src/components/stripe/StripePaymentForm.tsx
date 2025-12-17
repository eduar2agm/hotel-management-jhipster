import { useState, type FormEvent } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { toast } from 'sonner';

interface Props {
  returnUrl?: string; // Optional custom return URL (default: current page)
  onSuccess?: () => void;
}

export const StripePaymentForm = ({ returnUrl, onSuccess }: Props) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: returnUrl || window.location.href, // This will reload the page on success usually, unless redirected
      },
      redirect: 'if_required' // Important: Handle success without redirect if possible to update UI
    });

    if (error) {
        setErrorMessage(error.message || 'Error desconocido en el pago');
        toast.error(error.message);
    } else {
        toast.success("Pago realizado con éxito");
        if (onSuccess) onSuccess();
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {errorMessage && (
        <div className="text-red-500 text-sm mt-2">{errorMessage}</div>
      )}
      <button 
        disabled={isLoading || !stripe || !elements} 
        id="submit"
        className="w-full bg-yellow-600 text-white py-3 px-4 rounded font-bold hover:bg-yellow-700 disabled:opacity-50 transition-colors shadow-lg"
      >
        {isLoading ? (
             <span className="flex items-center justify-center gap-2">
                 <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                 </svg>
                 Procesando...
             </span>
        ) : "Confirmar Pago"}
      </button>
    </form>
  );
};
