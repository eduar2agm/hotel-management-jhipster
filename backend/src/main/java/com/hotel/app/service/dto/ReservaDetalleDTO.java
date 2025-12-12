package com.hotel.app.service.dto;

import java.io.Serializable;
import java.util.Objects;

/**
 * A DTO for the {@link com.hotel.app.domain.ReservaDetalle} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class ReservaDetalleDTO implements Serializable {

    private Long id;

    private String nota;

    private ReservaDTO reserva;

    private HabitacionDTO habitacion;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNota() {
        return nota;
    }

    public void setNota(String nota) {
        this.nota = nota;
    }

    public ReservaDTO getReserva() {
        return reserva;
    }

    public void setReserva(ReservaDTO reserva) {
        this.reserva = reserva;
    }

    public HabitacionDTO getHabitacion() {
        return habitacion;
    }

    public void setHabitacion(HabitacionDTO habitacion) {
        this.habitacion = habitacion;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof ReservaDetalleDTO)) {
            return false;
        }

        ReservaDetalleDTO reservaDetalleDTO = (ReservaDetalleDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, reservaDetalleDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "ReservaDetalleDTO{" +
            "id=" + getId() +
            ", nota='" + getNota() + "'" +
            ", reserva=" + getReserva() +
            ", habitacion=" + getHabitacion() +
            "}";
    }
}
