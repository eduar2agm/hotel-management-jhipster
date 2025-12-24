package com.hotel.app.service.impl;

import com.hotel.app.service.*;
import com.hotel.app.service.dto.PaymentIntentRequest;
import com.hotel.app.service.dto.PaymentIntentResponse;
import com.hotel.app.service.dto.MensajeSoporteDTO;
import com.stripe.Stripe;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.model.PaymentIntent;
import com.stripe.model.StripeObject;
import com.stripe.net.ApiResource;
import com.stripe.net.Webhook;
import com.stripe.param.PaymentIntentCreateParams;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;

/**
 * Service Implementation for managing Stripe payments.
 */
@Service
@Transactional
public class StripeServiceImpl implements StripeService {

    private static final Logger LOG = LoggerFactory.getLogger(StripeServiceImpl.class);

    private final ReservaService reservaService;
    private final ServicioContratadoService servicioContratadoService;
    private final MensajeSoporteService mensajeSoporteService;
    private final ConfiguracionSistemaService configuracionSistemaService;

    @Value("${stripe.secret-key}")
    private String stripeSecretKey;

    @Value("${stripe.webhook-secret}")
    private String webhookSecret;

    public StripeServiceImpl(
            ReservaService reservaService,
            ServicioContratadoService servicioContratadoService,
            MensajeSoporteService mensajeSoporteService,
            ConfiguracionSistemaService configuracionSistemaService) {
        this.reservaService = reservaService;
        this.servicioContratadoService = servicioContratadoService;
        this.mensajeSoporteService = mensajeSoporteService;
        this.configuracionSistemaService = configuracionSistemaService;
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
        if (request.getServicioContratadoId() != null) {
            paramsBuilder.putMetadata("servicioContratadoId", String.valueOf(request.getServicioContratadoId()));
            paramsBuilder.putMetadata("type", "servicio");
            if (request.getReservaId() != null) {
                paramsBuilder.putMetadata("reservaId", String.valueOf(request.getReservaId()));
            }
        } else if (request.getReservaId() != null) {
            paramsBuilder.putMetadata("reservaId", String.valueOf(request.getReservaId()));
            paramsBuilder.putMetadata("type", "reserva");
        }

        PaymentIntent paymentIntent = PaymentIntent.create(paramsBuilder.build());

        return new PaymentIntentResponse(paymentIntent.getClientSecret(), paymentIntent.getId());
    }

    @Override
    public void handleWebhook(String payload, String sigHeader) throws Exception {
        LOG.debug("Handling Stripe webhook");

        Event event;

        if (webhookSecret == null || webhookSecret.isEmpty()) {
            LOG.warn(
                    "Webhook secret not configured, processing without signature verification (NOT RECOMMENDED FOR PRODUCTION)");
            // Parse the event directly from the payload without signature verification
            event = ApiResource.GSON.fromJson(payload, Event.class);
        } else {
            try {
                event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
            } catch (SignatureVerificationException e) {
                LOG.error("Webhook signature verification failed", e);
                throw e;
            }
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
            // Fallback for dev mode where signature verification is skipped or API version
            // mismatch
            if (event.getData() != null) {
                stripeObject = event.getData().getObject();
            }
        }

        if (stripeObject == null) {
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
                        sendPaymentSuccessMessageReserva(reservaId, paymentIntent.getAmount());
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
                        sendPaymentSuccessMessageServicio(servicioId, paymentIntent.getAmount());
                    } catch (Exception e) {
                        LOG.error("Error confirming service", e);
                    }
                }
            }
        }
    }

    private void handlePaymentIntentFailed(Event event) {
        LOG.debug("Handling payment_intent.payment_failed event");

        EventDataObjectDeserializer dataObjectDeserializer = event.getDataObjectDeserializer();
        StripeObject stripeObject = null;
        if (dataObjectDeserializer.getObject().isPresent()) {
            stripeObject = dataObjectDeserializer.getObject().get();
        } else if (event.getData() != null) {
            stripeObject = event.getData().getObject();
        }

        if (stripeObject instanceof PaymentIntent) {
            PaymentIntent paymentIntent = (PaymentIntent) stripeObject;
            String type = paymentIntent.getMetadata().get("type");

            if ("reserva".equals(type)) {
                String reservaIdStr = paymentIntent.getMetadata().get("reservaId");
                if (reservaIdStr != null) {
                    Long reservaId = Long.parseLong(reservaIdStr);
                    sendPaymentFailedMessage(reservaId, null);
                }
            } else if ("servicio".equals(type)) {
                String servicioIdStr = paymentIntent.getMetadata().get("servicioContratadoId");
                if (servicioIdStr != null) {
                    Long servicioId = Long.parseLong(servicioIdStr);
                    sendPaymentFailedMessage(null, servicioId);
                }
            }
        }
    }

    private void sendPaymentSuccessMessageReserva(Long reservaId, Long amountInCents) {
        try {
            reservaService.findOne(reservaId).ifPresent(reserva -> {
                if (reserva.getCliente() == null || reserva.getCliente().getKeycloakId() == null) {
                    return;
                }

                try {
                    double amount = amountInCents / 100.0;
                    String msgText = "💳 ¡Pago recibido! Su pago de $" + String.format("%.2f", amount)
                            + " para la reserva #" + reservaId + " ha sido procesado exitosamente.";

                    try {
                        var configOpt = configuracionSistemaService.findByClave("MSG_PAGO_EXITOSO_RESERVA");
                        if (configOpt.isPresent() && configOpt.get().getValor() != null) {
                            msgText = configOpt.get().getValor()
                                    .replace("{monto}", String.format("%.2f", amount))
                                    .replace("{reservaId}", reservaId.toString());
                        }
                    } catch (Exception e) {
                        LOG.debug("Using default payment success message");
                    }

                    MensajeSoporteDTO mensaje = new MensajeSoporteDTO();
                    mensaje.setUserId(reserva.getCliente().getKeycloakId());
                    mensaje.setUserName((reserva.getCliente().getNombre() != null ? reserva.getCliente().getNombre()
                            : "") + " "
                            + (reserva.getCliente().getApellido() != null ? reserva.getCliente().getApellido() : "")
                                    .trim());
                    mensaje.setMensaje(msgText);
                    mensaje.setRemitente("SISTEMA");
                    mensaje.setLeido(false);
                    mensaje.setActivo(true);
                    mensaje.setFechaMensaje(Instant.now());

                    mensajeSoporteService.save(mensaje);
                } catch (Exception e) {
                    LOG.error("Error sending payment success message", e);
                }
            });
        } catch (Exception e) {
            LOG.error("Error finding reservation for payment message", e);
        }
    }

    private void sendPaymentSuccessMessageServicio(Long servicioId, Long amountInCents) {
        try {
            servicioContratadoService.findOne(servicioId).ifPresent(servicio -> {
                if (servicio.getCliente() == null || servicio.getCliente().getKeycloakId() == null) {
                    return;
                }

                try {
                    double amount = amountInCents / 100.0;
                    String servicioNombre = servicio.getServicio() != null ? servicio.getServicio().getNombre()
                            : "servicio";
                    String msgText = "💳 ¡Pago recibido! Su pago de $" + String.format("%.2f", amount)
                            + " para el servicio '" + servicioNombre + "' ha sido procesado exitosamente.";

                    try {
                        var configOpt = configuracionSistemaService.findByClave("MSG_PAGO_EXITOSO_SERVICIO");
                        if (configOpt.isPresent() && configOpt.get().getValor() != null) {
                            msgText = configOpt.get().getValor()
                                    .replace("{monto}", String.format("%.2f", amount))
                                    .replace("{servicioNombre}", servicioNombre);
                        }
                    } catch (Exception e) {
                        LOG.debug("Using default payment success message for service");
                    }

                    MensajeSoporteDTO mensaje = new MensajeSoporteDTO();
                    mensaje.setUserId(servicio.getCliente().getKeycloakId());
                    mensaje.setUserName((servicio.getCliente().getNombre() != null ? servicio.getCliente().getNombre()
                            : "") + " "
                            + (servicio.getCliente().getApellido() != null ? servicio.getCliente().getApellido() : "")
                                    .trim());
                    mensaje.setMensaje(msgText);
                    mensaje.setRemitente("SISTEMA");
                    mensaje.setLeido(false);
                    mensaje.setActivo(true);
                    mensaje.setFechaMensaje(Instant.now());

                    mensajeSoporteService.save(mensaje);
                } catch (Exception e) {
                    LOG.error("Error sending payment success message", e);
                }
            });
        } catch (Exception e) {
            LOG.error("Error finding service for payment message", e);
        }
    }

    private void sendPaymentFailedMessage(Long reservaId, Long servicioId) {
        try {
            String userId = null;
            String userName = "";

            if (reservaId != null) {
                var reservaOpt = reservaService.findOne(reservaId);
                if (reservaOpt.isPresent() && reservaOpt.get().getCliente() != null) {
                    userId = reservaOpt.get().getCliente().getKeycloakId();
                    userName = (reservaOpt.get().getCliente().getNombre() != null
                            ? reservaOpt.get().getCliente().getNombre()
                            : "") + " "
                            + (reservaOpt.get().getCliente().getApellido() != null
                                    ? reservaOpt.get().getCliente().getApellido()
                                    : "");
                }
            } else if (servicioId != null) {
                var servicioOpt = servicioContratadoService.findOne(servicioId);
                if (servicioOpt.isPresent() && servicioOpt.get().getCliente() != null) {
                    userId = servicioOpt.get().getCliente().getKeycloakId();
                    userName = (servicioOpt.get().getCliente().getNombre() != null
                            ? servicioOpt.get().getCliente().getNombre()
                            : "") + " "
                            + (servicioOpt.get().getCliente().getApellido() != null
                                    ? servicioOpt.get().getCliente().getApellido()
                                    : "");
                }
            }

            if (userId == null) {
                LOG.warn("Cannot send payment failed message - no client found");
                return;
            }

            String msgText = "❌ Pago rechazado. Hubo un problema al procesar su pago. Por favor, intente nuevamente o contacte a su banco.";

            try {
                var configOpt = configuracionSistemaService.findByClave("MSG_PAGO_FALLIDO");
                if (configOpt.isPresent() && configOpt.get().getValor() != null) {
                    msgText = configOpt.get().getValor();
                }
            } catch (Exception e) {
                LOG.debug("Using default payment failed message");
            }

            MensajeSoporteDTO mensaje = new MensajeSoporteDTO();
            mensaje.setUserId(userId);
            mensaje.setUserName(userName.trim());
            mensaje.setMensaje(msgText);
            mensaje.setRemitente("SISTEMA");
            mensaje.setLeido(false);
            mensaje.setActivo(true);
            mensaje.setFechaMensaje(Instant.now());

            mensajeSoporteService.save(mensaje);
        } catch (Exception e) {
            LOG.error("Error sending payment failed message", e);
        }
    }
}
