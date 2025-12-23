package com.hotel.app.service.impl;

import com.hotel.app.service.*;
import com.hotel.app.service.dto.PaymentIntentRequest;
import com.hotel.app.service.dto.PaymentIntentResponse;
import com.stripe.Stripe;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.model.PaymentIntent;
import com.stripe.model.StripeObject;
import com.stripe.net.Webhook;
import com.stripe.param.PaymentIntentCreateParams;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing Stripe payments.
 */
@Service
@Transactional
public class StripeServiceImpl implements StripeService {

    private static final Logger LOG = LoggerFactory.getLogger(StripeServiceImpl.class);

    private final ReservaService reservaService;
    private final ServicioContratadoService servicioContratadoService;

    @Value("${stripe.secret-key}")
    private String stripeSecretKey;

    @Value("${stripe.webhook-secret}")
    private String webhookSecret;

    public StripeServiceImpl(
            ReservaService reservaService,
            ServicioContratadoService servicioContratadoService) {
        this.reservaService = reservaService;
        this.servicioContratadoService = servicioContratadoService;
    }

    @Override
    public PaymentIntentResponse createPaymentIntent(PaymentIntentRequest request) throws StripeException {
        LOG.debug("Request to create Payment Intent: {}", request);

        Stripe.apiKey = stripeSecretKey;

        Long amountInCents = request.getAmount().multiply(new java.math.BigDecimal(100)).longValue();

        PaymentIntentCreateParams.Builder paramsBuilder = PaymentIntentCreateParams
                .builder()
                .setAmount(amountInCents)
                .setCurrency("usd")
                .setAutomaticPaymentMethods(
                        PaymentIntentCreateParams.AutomaticPaymentMethods.builder().setEnabled(true).build());

        // Add metadata based on payment type
        if (request.getReservaId() != null) {
            paramsBuilder.putMetadata("reservaId", String.valueOf(request.getReservaId()));
            paramsBuilder.putMetadata("type", "reserva");
        } else if (request.getServicioContratadoId() != null) {
            paramsBuilder.putMetadata("servicioContratadoId", String.valueOf(request.getServicioContratadoId()));
            paramsBuilder.putMetadata("type", "servicio");
        }

        PaymentIntent paymentIntent = PaymentIntent.create(paramsBuilder.build());

        return new PaymentIntentResponse(paymentIntent.getClientSecret(), paymentIntent.getId());
    }

    @Override
    public void handleWebhook(String payload, String sigHeader) throws Exception {
        LOG.debug("Handling Stripe webhook");

        if (webhookSecret == null || webhookSecret.isEmpty()) {
            LOG.warn("Webhook secret not configured, skipping signature verification");
            return;
        }

        Event event;
        try {
            event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
        } catch (SignatureVerificationException e) {
            LOG.error("Webhook signature verification failed", e);
            throw e;
        }

        LOG.debug("Processing event type: {}", event.getType());

        // Handle the event
        switch (event.getType()) {
            case "payment_intent.succeeded":
                handlePaymentIntentSucceeded(event);
                break;
            case "payment_intent.payment_failed":
                handlePaymentIntentFailed(event);
                break;
            default:
                LOG.debug("Unhandled event type: {}", event.getType());
        }
    }

    private void handlePaymentIntentSucceeded(Event event) {
        LOG.debug("Handling payment_intent.succeeded event");

        EventDataObjectDeserializer dataObjectDeserializer = event.getDataObjectDeserializer();
        StripeObject stripeObject = null;
        if (dataObjectDeserializer.getObject().isPresent()) {
            stripeObject = dataObjectDeserializer.getObject().get();
        } else {
            LOG.warn("Deserialization failed for: {}", event);
            return;
        }

        if (stripeObject instanceof PaymentIntent) {
            PaymentIntent paymentIntent = (PaymentIntent) stripeObject;
            String type = paymentIntent.getMetadata().get("type");

            if ("reserva".equals(type)) {
                String reservaIdStr = paymentIntent.getMetadata().get("reservaId");
                if (reservaIdStr != null) {
                    Long reservaId = Long.parseLong(reservaIdStr);
                    LOG.debug("Confirming reservation with ID: {}", reservaId);
                    try {
                        reservaService.activate(reservaId);
                    } catch (Exception e) {
                        LOG.error("Error confirming reservation", e);
                    }
                }
            } else if ("servicio".equals(type)) {
                String servicioIdStr = paymentIntent.getMetadata().get("servicioContratadoId");
                if (servicioIdStr != null) {
                    Long servicioId = Long.parseLong(servicioIdStr);
                    LOG.debug("Confirming service with ID: {}", servicioId);
                    try {
                        servicioContratadoService.confirmar(servicioId);
                    } catch (Exception e) {
                        LOG.error("Error confirming service", e);
                    }
                }
            }
        }
    }

    private void handlePaymentIntentFailed(Event event) {
        LOG.debug("Handling payment_intent.payment_failed event");
        // You can implement logic to handle failed payments if needed
        // For example, mark the reservation or service as payment failed
    }
}
