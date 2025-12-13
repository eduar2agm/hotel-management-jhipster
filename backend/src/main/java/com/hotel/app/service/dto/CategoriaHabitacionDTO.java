package com.hotel.app.service.dto;

import com.hotel.app.domain.enumeration.CategoriaHabitacionNombre;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Objects;

/**
 * A DTO for the {@link com.hotel.app.domain.CategoriaHabitacion} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class CategoriaHabitacionDTO implements Serializable {

    private Long id;

    @NotNull
    private CategoriaHabitacionNombre nombre;

    private String descripcion;

    @NotNull
    private BigDecimal precioBase;

    @NotNull
    private Boolean activo;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public CategoriaHabitacionNombre getNombre() {
        return nombre;
    }

    public void setNombre(CategoriaHabitacionNombre nombre) {
        this.nombre = nombre;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public BigDecimal getPrecioBase() {
        return precioBase;
    }

    public void setPrecioBase(BigDecimal precioBase) {
        this.precioBase = precioBase;
    }

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof CategoriaHabitacionDTO)) {
            return false;
        }

        CategoriaHabitacionDTO categoriaHabitacionDTO = (CategoriaHabitacionDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, categoriaHabitacionDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "CategoriaHabitacionDTO{" +
            "id=" + getId() +
            ", nombre='" + getNombre() + "'" +
            ", descripcion='" + getDescripcion() + "'" +
            ", precioBase=" + getPrecioBase() +
            ", activo='" + getActivo() + "'" +
            "}";
    }
}
