package com.hotel.app.service.dto;

import com.hotel.app.domain.enumeration.DiaSemana;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.LocalTime;
import java.util.Objects;

/**
 * A DTO for the {@link com.hotel.app.domain.ServicioDisponibilidad} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class ServicioDisponibilidadDTO implements Serializable {

    private Long id;

    @NotNull
    private DiaSemana diaSemana;

    @NotNull
    private LocalTime horaInicio;

    private LocalTime horaFin;

    @NotNull
    @Min(value = 1)
    private Integer cupoMaximo;

    @NotNull
    private Boolean horaFija;

    @NotNull
    private Boolean activo;

    private ServicioDTO servicio;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public DiaSemana getDiaSemana() {
        return diaSemana;
    }

    public void setDiaSemana(DiaSemana diaSemana) {
        this.diaSemana = diaSemana;
    }

    public LocalTime getHoraInicio() {
        return horaInicio;
    }

    public void setHoraInicio(LocalTime horaInicio) {
        this.horaInicio = horaInicio;
    }

    public LocalTime getHoraFin() {
        return horaFin;
    }

    public void setHoraFin(LocalTime horaFin) {
        this.horaFin = horaFin;
    }

    public Integer getCupoMaximo() {
        return cupoMaximo;
    }

    public void setCupoMaximo(Integer cupoMaximo) {
        this.cupoMaximo = cupoMaximo;
    }

    public Boolean getHoraFija() {
        return horaFija;
    }

    public void setHoraFija(Boolean horaFija) {
        this.horaFija = horaFija;
    }

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }

    public ServicioDTO getServicio() {
        return servicio;
    }

    public void setServicio(ServicioDTO servicio) {
        this.servicio = servicio;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof ServicioDisponibilidadDTO)) {
            return false;
        }
        ServicioDisponibilidadDTO servicioDisponibilidadDTO = (ServicioDisponibilidadDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, servicioDisponibilidadDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "ServicioDisponibilidadDTO{" +
                "id=" + getId() +
                ", diaSemana='" + getDiaSemana() + "'" +
                ", horaInicio='" + getHoraInicio() + "'" +
                ", horaFin='" + getHoraFin() + "'" +
                ", cupoMaximo=" + getCupoMaximo() +
                ", horaFija='" + getHoraFija() + "'" +
                ", activo='" + getActivo() + "'" +
                ", servicio=" + getServicio() +
                "}";
    }
}
