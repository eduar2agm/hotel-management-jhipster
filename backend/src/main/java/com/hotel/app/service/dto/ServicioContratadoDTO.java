package com.hotel.app.service.dto;

import com.hotel.app.domain.enumeration.EstadoServicioContratado;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.ZonedDateTime;
import java.util.Objects;

/**
 * A DTO for the {@link com.hotel.app.domain.ServicioContratado} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class ServicioContratadoDTO implements Serializable {

    private Long id;

    @NotNull
    private Instant fechaContratacion;

    @NotNull
    private ZonedDateTime fechaServicio;

    @NotNull
    @Min(value = 1)
    private Integer numeroPersonas;

    @NotNull
    @Min(value = 1)
    private Integer cantidad;

    @NotNull
    @DecimalMin(value = "0")
    private BigDecimal precioUnitario;

    @NotNull
    private EstadoServicioContratado estado;

    @Size(max = 500)
    private String observaciones;

    private ServicioDTO servicio;

    private ReservaDTO reserva;

    private ClienteDTO cliente;

    private PagoDTO pago;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Instant getFechaContratacion() {
        return fechaContratacion;
    }

    public void setFechaContratacion(Instant fechaContratacion) {
        this.fechaContratacion = fechaContratacion;
    }

    public ZonedDateTime getFechaServicio() {
        return fechaServicio;
    }

    public void setFechaServicio(ZonedDateTime fechaServicio) {
        this.fechaServicio = fechaServicio;
    }

    public Integer getNumeroPersonas() {
        return numeroPersonas;
    }

    public void setNumeroPersonas(Integer numeroPersonas) {
        this.numeroPersonas = numeroPersonas;
    }

    public Integer getCantidad() {
        return cantidad;
    }

    public void setCantidad(Integer cantidad) {
        this.cantidad = cantidad;
    }

    public BigDecimal getPrecioUnitario() {
        return precioUnitario;
    }

    public void setPrecioUnitario(BigDecimal precioUnitario) {
        this.precioUnitario = precioUnitario;
    }

    public EstadoServicioContratado getEstado() {
        return estado;
    }

    public void setEstado(EstadoServicioContratado estado) {
        this.estado = estado;
    }

    public String getObservaciones() {
        return observaciones;
    }

    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }

    public ServicioDTO getServicio() {
        return servicio;
    }

    public void setServicio(ServicioDTO servicio) {
        this.servicio = servicio;
    }

    public ReservaDTO getReserva() {
        return reserva;
    }

    public void setReserva(ReservaDTO reserva) {
        this.reserva = reserva;
    }

    public ClienteDTO getCliente() {
        return cliente;
    }

    public void setCliente(ClienteDTO cliente) {
        this.cliente = cliente;
    }

    public PagoDTO getPago() {
        return pago;
    }

    public void setPago(PagoDTO pago) {
        this.pago = pago;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof ServicioContratadoDTO)) {
            return false;
        }

        ServicioContratadoDTO servicioContratadoDTO = (ServicioContratadoDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, servicioContratadoDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "ServicioContratadoDTO{" +
                "id=" + getId() +
                ", fechaContratacion='" + getFechaContratacion() + "'" +
                ", fechaServicio='" + getFechaServicio() + "'" +
                ", numeroPersonas=" + getNumeroPersonas() +
                ", cantidad=" + getCantidad() +
                ", precioUnitario=" + getPrecioUnitario() +
                ", estado='" + getEstado() + "'" +
                ", observaciones='" + getObservaciones() + "'" +
                ", servicio=" + getServicio() +
                ", reserva=" + getReserva() +
                ", cliente=" + getCliente() +
                ", pago=" + getPago() +
                "}";
    }
}
