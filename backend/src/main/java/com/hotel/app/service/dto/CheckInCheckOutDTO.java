package com.hotel.app.service.dto;

import com.hotel.app.domain.enumeration.EstadoCheckInCheckOut;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.ZonedDateTime;
import java.util.Objects;

/**
 * A DTO for the {@link com.hotel.app.domain.CheckInCheckOut} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class CheckInCheckOutDTO implements Serializable {

    private Long id;

    @NotNull
    private ZonedDateTime fechaHoraCheckIn;

    private ZonedDateTime fechaHoraCheckOut;

    @NotNull
    private EstadoCheckInCheckOut estado;

    @NotNull
    private Boolean activo;

    private ReservaDetalleDTO reservaDetalle;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ZonedDateTime getFechaHoraCheckIn() {
        return fechaHoraCheckIn;
    }

    public void setFechaHoraCheckIn(ZonedDateTime fechaHoraCheckIn) {
        this.fechaHoraCheckIn = fechaHoraCheckIn;
    }

    public ZonedDateTime getFechaHoraCheckOut() {
        return fechaHoraCheckOut;
    }

    public void setFechaHoraCheckOut(ZonedDateTime fechaHoraCheckOut) {
        this.fechaHoraCheckOut = fechaHoraCheckOut;
    }

    public EstadoCheckInCheckOut getEstado() {
        return estado;
    }

    public void setEstado(EstadoCheckInCheckOut estado) {
        this.estado = estado;
    }

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }

    public ReservaDetalleDTO getReservaDetalle() {
        return reservaDetalle;
    }

    public void setReservaDetalle(ReservaDetalleDTO reservaDetalle) {
        this.reservaDetalle = reservaDetalle;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof CheckInCheckOutDTO)) {
            return false;
        }

        CheckInCheckOutDTO checkInCheckOutDTO = (CheckInCheckOutDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, checkInCheckOutDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "CheckInCheckOutDTO{" +
            "id=" + getId() +
            ", fechaHoraCheckIn='" + getFechaHoraCheckIn() + "'" +
            ", fechaHoraCheckOut='" + getFechaHoraCheckOut() + "'" +
            ", estado='" + getEstado() + "'" +
            ", activo='" + getActivo() + "'" +
            ", reservaDetalle=" + getReservaDetalle() +
            "}";
    }
}
