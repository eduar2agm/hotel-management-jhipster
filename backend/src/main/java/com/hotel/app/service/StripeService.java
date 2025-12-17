package com.hotel.app.service;

import com.hotel.app.domain.Pago;
import com.hotel.app.domain.Reserva;
import com.hotel.app.domain.enumeration.EstadoPago;
import com.hotel.app.domain.enumeration.MetodoPago;
import com.hotel.app.repository.PagoRepository;
import com.hotel.app.repository.ReservaRepository;
import com.hotel.app.service.dto.PaymentIntentRequest;
import com.hotel.app.service.dto.PaymentIntentResponse;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.net.Webhook;
import com.stripe.param.PaymentIntentCreateParams;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Optional;

@Service
@Transactional
public class StripeService {

    private final Logger log = LoggerFactory.getLogger(StripeService.class);

    private final PagoRepository pagoRepository;
    private final ReservaRepository reservaRepository;

    @Value("${stripe.key.secret}")
    private String secretKey;

    @Value("${stripe.key.webhook-secret}")
    private String endpointSecret;

    public StripeService(PagoRepository pagoRepository, ReservaRepository reservaRepository) {
        this.pagoRepository = pagoRepository;
        this.reservaRepository = reservaRepository;
    }

    public PaymentIntentResponse createPaymentIntent(PaymentIntentRequest request) throws StripeException {
        Stripe.apiKey = secretKey;

        PaymentIntentCreateParams params =
            PaymentIntentCreateParams.builder()
                .setAmount(request.getAmount().multiply(new BigDecimal(100)).longValue()) // Amount in cents
                .setCurrency(request.getCurrency())
                .setDescription(request.getDescription())
                .putMetadata("reservaId", request.getReservaId() != null ? request.getReservaId().toString() : "")
                .setAutomaticPaymentMethods(
                    PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                        .setEnabled(true)
                        .build()
                )
                .build();

        PaymentIntent paymentIntent = PaymentIntent.create(params);

        // Create initial PENDING payment record
        if (request.getReservaId() != null) {
            createPendingPayment(request, paymentIntent.getId());
        }

        return new PaymentIntentResponse(paymentIntent.getClientSecret(), paymentIntent.getId());
    }

    private void createPendingPayment(PaymentIntentRequest request, String transactionId) {
        Optional<Reserva> reserva = reservaRepository.findById(request.getReservaId());
        if (reserva.isPresent()) {
            Pago pago = new Pago();
            pago.setFechaPago(Instant.now());
            pago.setMonto(request.getAmount());
            pago.setMetodoPago(MetodoPago.TARJETA); // Default for Stripe
            pago.setEstado(EstadoPago.PENDIENTE);
            pago.setActivo(true);
            pago.setReserva(reserva.get());
            pago.setTransactionId(transactionId);
            pagoRepository.save(pago);
            log.info("Created pending payment for Transaction ID: {}", transactionId);
        }
    }

    public void handleWebhook(String payload, String sigHeader) {
        Stripe.apiKey = secretKey;
        Event event = null;

        try {
            event = Webhook.constructEvent(payload, sigHeader, endpointSecret);
        } catch (Exception e) {
            log.error("Webhook error: {}", e.getMessage());
            throw new RuntimeException("Webhook verification failed");
        }

        if ("payment_intent.succeeded".equals(event.getType())) {
            PaymentIntent paymentIntent = (PaymentIntent) event.getDataObjectDeserializer().getObject().orElse(null);
            if (paymentIntent != null) {
                log.info("Payment succeeded for Transaction ID: {}", paymentIntent.getId());
                updatePaymentStatus(paymentIntent.getId(), EstadoPago.COMPLETADO);
            }
        } else if ("payment_intent.payment_failed".equals(event.getType())) {
            PaymentIntent paymentIntent = (PaymentIntent) event.getDataObjectDeserializer().getObject().orElse(null);
            if (paymentIntent != null) {
                log.info("Payment failed for Transaction ID: {}", paymentIntent.getId());
                updatePaymentStatus(paymentIntent.getId(), EstadoPago.RECHAZADO);
            }
        }
    }

    private void updatePaymentStatus(String transactionId, EstadoPago estado) {
        Optional<Pago> pagoOptional = pagoRepository.findByTransactionId(transactionId);
        if (pagoOptional.isPresent()) {
            Pago pago = pagoOptional.get();
            pago.setEstado(estado);
            pagoRepository.save(pago);
            log.debug("Updated payment status for Transaction ID: {} to {}", transactionId, estado);
        } else {
            log.warn("Payment not found for Transaction ID: {}", transactionId);
        }
    }
}
