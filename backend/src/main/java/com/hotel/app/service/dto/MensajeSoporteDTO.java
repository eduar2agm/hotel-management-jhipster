package com.hotel.app.service.dto;

import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import java.util.Objects;

/**
 * A DTO for the {@link com.hotel.app.domain.MensajeSoporte} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class MensajeSoporteDTO implements Serializable {

    private Long id;

    @NotNull
    private String mensaje;

    @NotNull
    private Instant fechaMensaje;

    @NotNull
    private String userId;

    private String userName;

    @NotNull
    private Boolean leido;

    @NotNull
    private Boolean activo;

    private String remitente;

    private String destinatarioId;

    private String destinatarioName;

    private ReservaDTO reserva;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getMensaje() {
        return mensaje;
    }

    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }

    public Instant getFechaMensaje() {
        return fechaMensaje;
    }

    public void setFechaMensaje(Instant fechaMensaje) {
        this.fechaMensaje = fechaMensaje;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public Boolean getLeido() {
        return leido;
    }

    public void setLeido(Boolean leido) {
        this.leido = leido;
    }

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }

    public String getRemitente() {
        return remitente;
    }

    public void setRemitente(String remitente) {
        this.remitente = remitente;
    }

    public String getDestinatarioId() {
        return destinatarioId;
    }

    public void setDestinatarioId(String destinatarioId) {
        this.destinatarioId = destinatarioId;
    }

    public String getDestinatarioName() {
        return destinatarioName;
    }

    public void setDestinatarioName(String destinatarioName) {
        this.destinatarioName = destinatarioName;
    }

    public ReservaDTO getReserva() {
        return reserva;
    }

    public void setReserva(ReservaDTO reserva) {
        this.reserva = reserva;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof MensajeSoporteDTO)) {
            return false;
        }

        MensajeSoporteDTO mensajeSoporteDTO = (MensajeSoporteDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, mensajeSoporteDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "MensajeSoporteDTO{" +
                "id=" + getId() +
                ", mensaje='" + getMensaje() + "'" +
                ", fechaMensaje='" + getFechaMensaje() + "'" +
                ", userId='" + getUserId() + "'" +
                ", userName='" + getUserName() + "'" +
                ", leido='" + getLeido() + "'" +
                ", activo='" + getActivo() + "'" +
                ", reserva=" + getReserva() +
                "}";
    }
}
