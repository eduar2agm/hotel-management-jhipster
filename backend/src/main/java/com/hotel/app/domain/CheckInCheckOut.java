package com.hotel.app.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.hotel.app.domain.enumeration.EstadoCheckInCheckOut;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import java.time.LocalTime;

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
    @Column(name = "fecha_check_in", nullable = false)
    private Instant fechaCheckIn;

    @NotNull
    @Column(name = "hora_check_in", nullable = false)
    private LocalTime horaCheckIn;

    @Column(name = "fecha_check_out")
    private Instant fechaCheckOut;

    @Column(name = "hora_check_out")
    private LocalTime horaCheckOut;

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

    public Instant getFechaCheckIn() {
        return this.fechaCheckIn;
    }

    public CheckInCheckOut fechaCheckIn(Instant fechaCheckIn) {
        this.setFechaCheckIn(fechaCheckIn);
        return this;
    }

    public void setFechaCheckIn(Instant fechaCheckIn) {
        this.fechaCheckIn = fechaCheckIn;
    }

    public LocalTime getHoraCheckIn() {
        return this.horaCheckIn;
    }

    public CheckInCheckOut horaCheckIn(LocalTime horaCheckIn) {
        this.setHoraCheckIn(horaCheckIn);
        return this;
    }

    public void setHoraCheckIn(LocalTime horaCheckIn) {
        this.horaCheckIn = horaCheckIn;
    }

    public Instant getFechaCheckOut() {
        return this.fechaCheckOut;
    }

    public CheckInCheckOut fechaCheckOut(Instant fechaCheckOut) {
        this.setFechaCheckOut(fechaCheckOut);
        return this;
    }

    public void setFechaCheckOut(Instant fechaCheckOut) {
        this.fechaCheckOut = fechaCheckOut;
    }

    public LocalTime getHoraCheckOut() {
        return this.horaCheckOut;
    }

    public CheckInCheckOut horaCheckOut(LocalTime horaCheckOut) {
        this.setHoraCheckOut(horaCheckOut);
        return this;
    }

    public void setHoraCheckOut(LocalTime horaCheckOut) {
        this.horaCheckOut = horaCheckOut;
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
            ", fechaCheckIn='" + getFechaCheckIn() + "'" +
            ", horaCheckIn='" + getHoraCheckIn() + "'" +
            ", fechaCheckOut='" + getFechaCheckOut() + "'" +
            ", horaCheckOut='" + getHoraCheckOut() + "'" +
            ", estado='" + getEstado() + "'" +
            "}";
    }
}
