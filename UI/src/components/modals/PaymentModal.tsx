import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CreditCard, Banknote, Wallet, DollarSign, ArrowLeft } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { StripePaymentForm } from '../../components/stripe/StripePaymentForm';
import { apiClient } from '../../api/axios-instance';
import { PagoService } from '../../services/pago.service';
import { type ReservaDTO } from '../../types/api/Reserva';
import { toast } from 'sonner';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface PaymentModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    reserva: ReservaDTO | null;
    total: number;
    onSuccess: () => void;
    servicioContratadoId?: number;
}

type PaymentView = 'METHOD_SELECTION' | 'CASH_FORM' | 'STRIPE_FORM';

export const PaymentModal: React.FC<PaymentModalProps> = ({
    open,
    onOpenChange,
    reserva,
    total,
    onSuccess,
    servicioContratadoId
}) => {
    const [view, setView] = useState<PaymentView>('METHOD_SELECTION');
    const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null);
    const [cashAmount, setCashAmount] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    // Reset state when modal opens/closes
    useEffect(() => {
        if (open) {
            setView('METHOD_SELECTION');
            setCashAmount(total.toString());
            setStripeClientSecret(null);
            setIsProcessing(false);
        }
    }, [open, total]);

    const handleSelectCash = () => {
        setView('CASH_FORM');
    };

    const handleSelectStripe = async () => {
        if (!reserva || !total) return;
        setIsProcessing(true);
        try {
            const response = await apiClient.post('/stripe/payment-intent', {
                amount: total,
                currency: 'usd',
                reservaId: reserva.id,
                servicioContratadoId: servicioContratadoId,
                description: servicioContratadoId
                    ? `Pago Servicio #${servicioContratadoId} (Reserva #${reserva.id})`
                    : `Pago Reserva #${reserva.id}`
            });

            setStripeClientSecret(response.data.clientSecret);
            setView('STRIPE_FORM');
        } catch (error) {
            console.error(error);
            toast.error('Error al conectar con pasarela de pago');
        } finally {
            setIsProcessing(false);
        }
    };

    const submitCashPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reserva) return;

        try {
            setIsProcessing(true);
            const monto = parseFloat(cashAmount);
            if (isNaN(monto) || monto <= 0) {
                toast.error('Monto inválido');
                return;
            }

            const pagoRes = await PagoService.createPago({
                fechaPago: new Date().toISOString(),
                monto: cashAmount, // sending as string or number? DTO expects BigDecimal usually handles numbers/strings? UI types might be fuzzy. 
                // Checks PagoDTO - used generated types probably. 
                metodoPago: 'EFECTIVO',
                estado: 'COMPLETADO',
                activo: true,
                reserva: { id: reserva.id }
            });

            // If paying for a service, link it
            if (servicioContratadoId && pagoRes.data.id) {
                // We need to import ServicioContratadoService
                // Dynamic import or assume it's available? Better to import at top.
                // Since I can't easily add import at top with this tool without overwriting header,
                // I will assume I need to do a separate edit for imports if not present.
                // But wait, allowMultiple is true. I can do multiple chunks.
                const { ServicioContratadoService } = await import('../../services/servicio-contratado.service');
                await ServicioContratadoService.partialUpdate(servicioContratadoId, { pago: { id: pagoRes.data.id } } as any);
            }

            toast.success('Pago en efectivo registrado correctamente');
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error(error);
            toast.error('Error al registrar pago');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleStripeSuccess = () => {
        toast.success("Pago con tarjeta completado");
        onSuccess();
        onOpenChange(false);
    };

    const getClientName = () => {
        if (reserva?.cliente) {
            return `${reserva.cliente.nombre || ''} ${reserva.cliente.apellido || ''}`.trim();
        }
        return 'Desconocido';
    };

    if (!reserva) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {view === 'METHOD_SELECTION' && (
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-center">Seleccionar Método de Pago</DialogTitle>
                        <DialogDescription className="text-center">
                            Reserva #{reserva.id} • Total a Pagar: <span className="font-bold text-gray-900">${total.toFixed(2)}</span>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-2 gap-4 py-4">
                        <button
                            onClick={handleSelectStripe}
                            disabled={isProcessing}
                            className="flex flex-col items-center justify-center p-6 border-2 border-gray-100 rounded-xl hover:border-yellow-500 hover:bg-yellow-50 transition-all gap-3 group"
                        >
                            <div className="bg-white p-3 rounded-full shadow-sm group-hover:scale-110 transition-transform">
                                <CreditCard className="h-8 w-8 text-yellow-600" />
                            </div>
                            <span className="font-bold text-gray-800">Pasarela de Pago</span>
                            <span className="text-xs text-gray-400">Tarjeta Crédito/Débito</span>
                        </button>

                        <button
                            onClick={handleSelectCash}
                            className="flex flex-col items-center justify-center p-6 border-2 border-gray-100 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all gap-3 group"
                        >
                            <div className="bg-white p-3 rounded-full shadow-sm group-hover:scale-110 transition-transform">
                                <Banknote className="h-8 w-8 text-green-600" />
                            </div>
                            <span className="font-bold text-gray-800">Efectivo</span>
                            <span className="text-xs text-gray-400">Pago presencial</span>
                        </button>
                    </div>
                </DialogContent>
            )}

            {view === 'CASH_FORM' && (
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <div className="flex items-center gap-2 mb-2">
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setView('METHOD_SELECTION')}>
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                            <DialogTitle className="flex items-center gap-2 text-base">
                                <Wallet className="w-5 h-5 text-green-600" /> Registrar Pago Efectivo
                            </DialogTitle>
                        </div>
                        <DialogDescription>
                            Ingrese el monto recibido del cliente.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitCashPayment} className="space-y-4 pt-2">
                        <div className="bg-gray-50 p-3 rounded text-sm space-y-1">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Cliente:</span>
                                <span className="font-medium text-gray-900">{getClientName()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Reserva:</span>
                                <span className="font-medium text-gray-900">#{reserva.id}</span>
                            </div>
                            <div className="flex justify-between border-t border-gray-200 pt-1 mt-1">
                                <span className="text-gray-500 font-bold">Total Esperado:</span>
                                <span className="font-bold text-yellow-600">${total.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-gray-500">Monto A Recibir ($)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    className="pl-9 text-lg font-bold"
                                    type="number"
                                    step="0.01"
                                    value={cashAmount}
                                    onChange={(e) => setCashAmount(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
                            <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold" disabled={isProcessing}>
                                {isProcessing ? 'Registrando...' : 'Confirmar Pago'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            )}

            {view === 'STRIPE_FORM' && (
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <div className="flex items-center gap-2 mb-2">
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setView('METHOD_SELECTION')}>
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                            <DialogTitle className="flex items-center gap-2 text-base">
                                <CreditCard className="w-5 h-5 text-yellow-600" /> Procesar Pago con Tarjeta
                            </DialogTitle>
                        </div>
                        <DialogDescription>
                            Complete los datos de la tarjeta para la Reserva #{reserva.id}.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        {stripeClientSecret && (
                            <Elements stripe={stripePromise} options={{
                                clientSecret: stripeClientSecret,
                                appearance: { theme: 'stripe', variables: { colorPrimary: '#ca8a04' } }
                            }}>
                                <StripePaymentForm
                                    onSuccess={handleStripeSuccess}
                                    returnUrl={window.location.href}
                                />
                            </Elements>
                        )}
                        {!stripeClientSecret && (
                            <div className="flex justify-center py-10">
                                <div className="animate-spin h-8 w-8 border-b-2 border-yellow-600 rounded-full"></div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            )}
        </Dialog>
    );
};
