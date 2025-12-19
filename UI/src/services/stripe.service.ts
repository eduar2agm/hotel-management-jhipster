import { apiClient } from '../api/axios-instance';

export interface PaymentIntentRequest {
    amount: number;
    currency: string;
    description: string;
    reservaId: number;
    servicioContratadoId?: number;
}

export interface PaymentIntentResponse {
    clientSecret: string;
    transactionId: string;
}

const base = '/stripe';

export const StripeService = {
    createPaymentIntent: (request: PaymentIntentRequest) => apiClient.post<PaymentIntentResponse>(`${base}/payment-intent`, request),
};
