package com.hotel.app.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;

/**
 * A MensajeSoporte.
 */
@Entity
@Table(name = "mensaje_soporte")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class MensajeSoporte implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "mensaje", nullable = false)
    private String mensaje;

    @NotNull
    @Column(name = "fecha_mensaje", nullable = false)
    private Instant fechaMensaje;

    @NotNull
    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "user_name")
    private String userName;

    @NotNull
    @Column(name = "leido", nullable = false)
    private Boolean leido;

    @NotNull
    @Column(name = "activo", nullable = false)
    private Boolean activo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "cliente" }, allowSetters = true)
    private Reserva reserva;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public MensajeSoporte id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getMensaje() {
        return this.mensaje;
    }

    public MensajeSoporte mensaje(String mensaje) {
        this.setMensaje(mensaje);
        return this;
    }

    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }

    public Instant getFechaMensaje() {
        return this.fechaMensaje;
    }

    public MensajeSoporte fechaMensaje(Instant fechaMensaje) {
        this.setFechaMensaje(fechaMensaje);
        return this;
    }

    public void setFechaMensaje(Instant fechaMensaje) {
        this.fechaMensaje = fechaMensaje;
    }

    public String getUserId() {
        return this.userId;
    }

    public MensajeSoporte userId(String userId) {
        this.setUserId(userId);
        return this;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return this.userName;
    }

    public MensajeSoporte userName(String userName) {
        this.setUserName(userName);
        return this;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public Boolean getLeido() {
        return this.leido;
    }

    public MensajeSoporte leido(Boolean leido) {
        this.setLeido(leido);
        return this;
    }

    public void setLeido(Boolean leido) {
        this.leido = leido;
    }

    public Boolean getActivo() {
        return this.activo;
    }

    public MensajeSoporte activo(Boolean activo) {
        this.setActivo(activo);
        return this;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }

    public Reserva getReserva() {
        return this.reserva;
    }

    public void setReserva(Reserva reserva) {
        this.reserva = reserva;
    }

    public MensajeSoporte reserva(Reserva reserva) {
        this.setReserva(reserva);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof MensajeSoporte)) {
            return false;
        }
        return getId() != null && getId().equals(((MensajeSoporte) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "MensajeSoporte{" +
            "id=" + getId() +
            ", mensaje='" + getMensaje() + "'" +
            ", fechaMensaje='" + getFechaMensaje() + "'" +
            ", userId='" + getUserId() + "'" +
            ", userName='" + getUserName() + "'" +
            ", leido='" + getLeido() + "'" +
            ", activo='" + getActivo() + "'" +
            "}";
    }
}
