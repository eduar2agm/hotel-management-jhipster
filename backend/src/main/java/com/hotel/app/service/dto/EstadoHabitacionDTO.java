package com.hotel.app.service.dto;

import com.hotel.app.domain.enumeration.EstadoHabitacionNombre;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.util.Objects;

/**
 * A DTO for the {@link com.hotel.app.domain.EstadoHabitacion} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class EstadoHabitacionDTO implements Serializable {

    private Long id;

    @NotNull
    private EstadoHabitacionNombre nombre;

    private String descripcion;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public EstadoHabitacionNombre getNombre() {
        return nombre;
    }

    public void setNombre(EstadoHabitacionNombre nombre) {
        this.nombre = nombre;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof EstadoHabitacionDTO)) {
            return false;
        }

        EstadoHabitacionDTO estadoHabitacionDTO = (EstadoHabitacionDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, estadoHabitacionDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "EstadoHabitacionDTO{" +
            "id=" + getId() +
            ", nombre='" + getNombre() + "'" +
            ", descripcion='" + getDescripcion() + "'" +
            "}";
    }
}
