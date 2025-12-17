package com.hotel.app.web.rest;

import com.hotel.app.service.StripeService;
import com.hotel.app.service.dto.PaymentIntentRequest;
import com.hotel.app.service.dto.PaymentIntentResponse;
import com.stripe.exception.StripeException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/stripe")
public class StripeResource {

    private final Logger log = LoggerFactory.getLogger(StripeResource.class);

    private final StripeService stripeService;

    public StripeResource(StripeService stripeService) {
        this.stripeService = stripeService;
    }

    @PostMapping("/payment-intent")
    public ResponseEntity<PaymentIntentResponse> createPaymentIntent(@RequestBody PaymentIntentRequest request) {
        log.debug("REST request to create Payment Intent: {}", request);
        try {
            PaymentIntentResponse response = stripeService.createPaymentIntent(request);
            return ResponseEntity.ok(response);
        } catch (StripeException e) {
            log.error("Error creating payment intent", e);
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/webhook")
    public ResponseEntity<Void> handleWebhook(@RequestBody String payload, @RequestHeader("Stripe-Signature") String sigHeader) {
        log.debug("REST request to handle Stripe Webhook");
        try {
            stripeService.handleWebhook(payload, sigHeader);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Webhook handling failed", e);
            return ResponseEntity.badRequest().build();
        }
    }
}
