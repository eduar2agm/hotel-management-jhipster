package com.hotel.app.service.dto;

import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.util.Objects;

/**
 * A DTO for the {@link com.hotel.app.domain.Habitacion} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class HabitacionDTO implements Serializable {

    private Long id;

    @NotNull
    private String numero;

    @NotNull
    private Integer capacidad;

    private String descripcion;

    private String imagen;

    @NotNull
    private Boolean activo;

    private CategoriaHabitacionDTO categoriaHabitacion;

    private EstadoHabitacionDTO estadoHabitacion;

    private java.util.List<ImagenDTO> imagenes;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNumero() {
        return numero;
    }

    public void setNumero(String numero) {
        this.numero = numero;
    }

    public Integer getCapacidad() {
        return capacidad;
    }

    public void setCapacidad(Integer capacidad) {
        this.capacidad = capacidad;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getImagen() {
        return imagen;
    }

    public void setImagen(String imagen) {
        this.imagen = imagen;
    }

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }

    public CategoriaHabitacionDTO getCategoriaHabitacion() {
        return categoriaHabitacion;
    }

    public void setCategoriaHabitacion(CategoriaHabitacionDTO categoriaHabitacion) {
        this.categoriaHabitacion = categoriaHabitacion;
    }

    public EstadoHabitacionDTO getEstadoHabitacion() {
        return estadoHabitacion;
    }

    public void setEstadoHabitacion(EstadoHabitacionDTO estadoHabitacion) {
        this.estadoHabitacion = estadoHabitacion;
    }

    public java.util.List<ImagenDTO> getImagenes() {
        return imagenes;
    }

    public void setImagenes(java.util.List<ImagenDTO> imagenes) {
        this.imagenes = imagenes;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof HabitacionDTO)) {
            return false;
        }

        HabitacionDTO habitacionDTO = (HabitacionDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, habitacionDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "HabitacionDTO{" +
                "id=" + getId() +
                ", numero='" + getNumero() + "'" +
                ", capacidad=" + getCapacidad() +
                ", descripcion='" + getDescripcion() + "'" +
                ", imagen='" + getImagen() + "'" +
                ", activo='" + getActivo() + "'" +
                ", categoriaHabitacion=" + getCategoriaHabitacion() +
                ", estadoHabitacion=" + getEstadoHabitacion() +
                "}";
    }
}
