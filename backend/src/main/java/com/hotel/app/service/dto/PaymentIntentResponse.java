package com.hotel.app.service.dto;

public class PaymentIntentResponse {

    private String clientSecret;
    private String transactionId;

    public PaymentIntentResponse(String clientSecret, String transactionId) {
        this.clientSecret = clientSecret;
        this.transactionId = transactionId;
    }

    public String getClientSecret() {
        return clientSecret;
    }

    public void setClientSecret(String clientSecret) {
        this.clientSecret = clientSecret;
    }

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }
}
