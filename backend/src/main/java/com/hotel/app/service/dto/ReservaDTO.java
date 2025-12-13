package com.hotel.app.service.dto;

import com.hotel.app.domain.enumeration.EstadoReserva;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import java.util.Objects;

/**
 * A DTO for the {@link com.hotel.app.domain.Reserva} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class ReservaDTO implements Serializable {

    private Long id;

    @NotNull
    private Instant fechaReserva;

    @NotNull
    private Instant fechaInicio;

    @NotNull
    private Instant fechaFin;

    @NotNull
    private EstadoReserva estado;

    @NotNull
    private Boolean activo;

    private ClienteDTO cliente;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Instant getFechaReserva() {
        return fechaReserva;
    }

    public void setFechaReserva(Instant fechaReserva) {
        this.fechaReserva = fechaReserva;
    }

    public Instant getFechaInicio() {
        return fechaInicio;
    }

    public void setFechaInicio(Instant fechaInicio) {
        this.fechaInicio = fechaInicio;
    }

    public Instant getFechaFin() {
        return fechaFin;
    }

    public void setFechaFin(Instant fechaFin) {
        this.fechaFin = fechaFin;
    }

    public EstadoReserva getEstado() {
        return estado;
    }

    public void setEstado(EstadoReserva estado) {
        this.estado = estado;
    }

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }

    public ClienteDTO getCliente() {
        return cliente;
    }

    public void setCliente(ClienteDTO cliente) {
        this.cliente = cliente;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof ReservaDTO)) {
            return false;
        }

        ReservaDTO reservaDTO = (ReservaDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, reservaDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "ReservaDTO{" +
            "id=" + getId() +
            ", fechaReserva='" + getFechaReserva() + "'" +
            ", fechaInicio='" + getFechaInicio() + "'" +
            ", fechaFin='" + getFechaFin() + "'" +
            ", estado='" + getEstado() + "'" +
            ", activo='" + getActivo() + "'" +
            ", cliente=" + getCliente() +
            "}";
    }
}
