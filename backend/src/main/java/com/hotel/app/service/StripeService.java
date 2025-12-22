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
    private final com.hotel.app.repository.ServicioContratadoRepository servicioContratadoRepository;

    @Value("${stripe.key.secret}")
    private String secretKey;

    @Value("${stripe.key.webhook-secret}")
    private String endpointSecret;

    private final ServicioContratadoService servicioContratadoService;

    public StripeService(PagoRepository pagoRepository, ReservaRepository reservaRepository,
            com.hotel.app.repository.ServicioContratadoRepository servicioContratadoRepository,
            ServicioContratadoService servicioContratadoService) {
        this.pagoRepository = pagoRepository;
        this.reservaRepository = reservaRepository;
        this.servicioContratadoRepository = servicioContratadoRepository;
        this.servicioContratadoService = servicioContratadoService;
    }

    public PaymentIntentResponse createPaymentIntent(PaymentIntentRequest request) throws StripeException {
        Stripe.apiKey = secretKey;

        PaymentIntentCreateParams.Builder paramsBuilder = PaymentIntentCreateParams.builder()
                .setAmount(request.getAmount().multiply(new BigDecimal(100)).longValue()) // Amount in cents
                .setCurrency(request.getCurrency())
                .setDescription(request.getDescription())
                .putMetadata("reservaId", request.getReservaId() != null ? request.getReservaId().toString() : "")
                .setAutomaticPaymentMethods(
                        PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                .setEnabled(true)
                                .build());

        if (request.getServicioContratadoId() != null) {
            paramsBuilder.putMetadata("servicioContratadoId", request.getServicioContratadoId().toString());
        }

        PaymentIntentCreateParams params = paramsBuilder.build();

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
            pago = pagoRepository.save(pago);
            log.info("Created pending payment for Transaction ID: {}", transactionId);

            if (request.getServicioContratadoId() != null) {
                Optional<com.hotel.app.domain.ServicioContratado> servicio = servicioContratadoRepository
                        .findById(request.getServicioContratadoId());
                if (servicio.isPresent()) {
                    com.hotel.app.domain.ServicioContratado s = servicio.get();
                    s.setPago(pago);
                    servicioContratadoRepository.save(s);
                    log.info("Linked payment to ServicioContratado ID: {}", s.getId());
                }
            }
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

        log.info("Webhook received - Event Type: {}", event.getType());

        if ("payment_intent.succeeded".equals(event.getType())) {
            log.info("Processing payment_intent.succeeded event");

            try {
                // Use getData().getObject() instead of getDataObjectDeserializer()
                com.stripe.model.StripeObject stripeObject = event.getData().getObject();
                log.info("StripeObject type: {}",
                        stripeObject != null ? stripeObject.getClass().getSimpleName() : "null");

                if (stripeObject instanceof PaymentIntent) {
                    PaymentIntent paymentIntent = (PaymentIntent) stripeObject;
                    log.info("Payment succeeded for Transaction ID: {}", paymentIntent.getId());
                    log.info("PaymentIntent metadata: {}", paymentIntent.getMetadata());
                    log.info("PaymentIntent status: {}", paymentIntent.getStatus());

                    updatePaymentStatus(paymentIntent.getId(), EstadoPago.COMPLETADO);

                    // Check if it's for a service
                    String servicioContratadoIdStr = paymentIntent.getMetadata().get("servicioContratadoId");
                    log.info("servicioContratadoId from metadata: {}", servicioContratadoIdStr);

                    if (servicioContratadoIdStr != null && !servicioContratadoIdStr.isEmpty()) {
                        try {
                            Long servicioId = Long.parseLong(servicioContratadoIdStr);
                            log.info("Calling servicioContratadoService.confirmar for ID: {}", servicioId);
                            // Use service specific method to confirm, which includes notifications
                            servicioContratadoService.confirmar(servicioId);
                            log.info("Confirmed ServicioContratado ID: {}", servicioId);
                        } catch (Exception e) {
                            log.error("Error confirming service: {}", e.getMessage(), e);
                        }
                    } else {
                        log.warn("No servicioContratadoId found in metadata or it's empty");
                    }
                } else {
                    log.error("StripeObject is not a PaymentIntent, it's: {}",
                            stripeObject != null ? stripeObject.getClass().getName() : "null");
                }
            } catch (Exception e) {
                log.error("Error processing payment_intent.succeeded: {}", e.getMessage(), e);
            }
        } else if ("payment_intent.payment_failed".equals(event.getType())) {
            try {
                com.stripe.model.StripeObject stripeObject = event.getData().getObject();
                if (stripeObject instanceof PaymentIntent) {
                    PaymentIntent paymentIntent = (PaymentIntent) stripeObject;
                    log.info("Payment failed for Transaction ID: {}", paymentIntent.getId());
                    updatePaymentStatus(paymentIntent.getId(), EstadoPago.RECHAZADO);
                }
            } catch (Exception e) {
                log.error("Error processing payment_intent.payment_failed: {}", e.getMessage(), e);
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
