package com.hotel.app.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.hotel.app.domain.enumeration.EstadoCheckInCheckOut;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.ZonedDateTime;

/**
 * A CheckInCheckOut.
 */
@Entity
@Table(name = "check_in_check_out")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class CheckInCheckOut implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "fecha_hora_check_in", nullable = false)
    private ZonedDateTime fechaHoraCheckIn;

    @Column(name = "fecha_hora_check_out")
    private ZonedDateTime fechaHoraCheckOut;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false)
    private EstadoCheckInCheckOut estado;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "reserva", "habitacion" }, allowSetters = true)
    private ReservaDetalle reservaDetalle;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public CheckInCheckOut id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ZonedDateTime getFechaHoraCheckIn() {
        return this.fechaHoraCheckIn;
    }

    public CheckInCheckOut fechaHoraCheckIn(ZonedDateTime fechaHoraCheckIn) {
        this.setFechaHoraCheckIn(fechaHoraCheckIn);
        return this;
    }

    public void setFechaHoraCheckIn(ZonedDateTime fechaHoraCheckIn) {
        this.fechaHoraCheckIn = fechaHoraCheckIn;
    }

    public ZonedDateTime getFechaHoraCheckOut() {
        return this.fechaHoraCheckOut;
    }

    public CheckInCheckOut fechaHoraCheckOut(ZonedDateTime fechaHoraCheckOut) {
        this.setFechaHoraCheckOut(fechaHoraCheckOut);
        return this;
    }

    public void setFechaHoraCheckOut(ZonedDateTime fechaHoraCheckOut) {
        this.fechaHoraCheckOut = fechaHoraCheckOut;
    }

    public EstadoCheckInCheckOut getEstado() {
        return this.estado;
    }

    public CheckInCheckOut estado(EstadoCheckInCheckOut estado) {
        this.setEstado(estado);
        return this;
    }

    public void setEstado(EstadoCheckInCheckOut estado) {
        this.estado = estado;
    }

    public ReservaDetalle getReservaDetalle() {
        return this.reservaDetalle;
    }

    public void setReservaDetalle(ReservaDetalle reservaDetalle) {
        this.reservaDetalle = reservaDetalle;
    }

    public CheckInCheckOut reservaDetalle(ReservaDetalle reservaDetalle) {
        this.setReservaDetalle(reservaDetalle);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof CheckInCheckOut)) {
            return false;
        }
        return getId() != null && getId().equals(((CheckInCheckOut) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "CheckInCheckOut{" +
            "id=" + getId() +
            ", fechaHoraCheckIn='" + getFechaHoraCheckIn() + "'" +
            ", fechaHoraCheckOut='" + getFechaHoraCheckOut() + "'" +
            ", estado='" + getEstado() + "'" +
            "}";
    }
}
