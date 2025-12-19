package com.hotel.app.service.dto;

import java.math.BigDecimal;

public class PaymentIntentRequest {

    private BigDecimal amount;
    private String currency;
    private Long reservaId;
    private String description;

    // Getters and Setters
    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public Long getReservaId() {
        return reservaId;
    }

    public void setReservaId(Long reservaId) {
        this.reservaId = reservaId;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    private Long servicioContratadoId;

    public Long getServicioContratadoId() {
        return servicioContratadoId;
    }

    public void setServicioContratadoId(Long servicioContratadoId) {
        this.servicioContratadoId = servicioContratadoId;
    }
}
