package com.hotel.app.service;

import com.hotel.app.service.dto.PaymentIntentRequest;
import com.hotel.app.service.dto.PaymentIntentResponse;
import com.stripe.exception.StripeException;

/**
 * Service Interface for managing Stripe payments.
 */
public interface StripeService {
    /**
     * Create a payment intent.
     *
     * @param request the payment intent request
     * @return the payment intent response
     * @throws StripeException if the request fails
     */
    PaymentIntentResponse createPaymentIntent(PaymentIntentRequest request) throws StripeException;

    /**
     * Handle a Stripe webhook event.
     *
     * @param payload   the webhook payload
     * @param sigHeader the Stripe signature header
     * @throws Exception if the webhook handling fails
     */
    void handleWebhook(String payload, String sigHeader) throws Exception;
}
