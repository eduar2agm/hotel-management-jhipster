package com.hotel.app.service.dto;

import jakarta.persistence.Lob;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import java.util.Objects;

/**
 * A DTO for the {@link com.hotel.app.domain.Imagen} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class ImagenDTO implements Serializable {

    private Long id;

    @NotNull
    private String nombre;

    @Size(max = 500)
    private String descripcion;

    @Lob
    private byte[] fichero;

    private String ficheroContentType;

    private String nombreArchivo;

    @NotNull
    private Boolean activo;

    private Instant fechaCreacion;

    private HabitacionDTO habitacion;

    private ServicioDTO servicio;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public byte[] getFichero() {
        return fichero;
    }

    public void setFichero(byte[] fichero) {
        this.fichero = fichero;
    }

    public String getFicheroContentType() {
        return ficheroContentType;
    }

    public void setFicheroContentType(String ficheroContentType) {
        this.ficheroContentType = ficheroContentType;
    }

    public String getNombreArchivo() {
        return nombreArchivo;
    }

    public void setNombreArchivo(String nombreArchivo) {
        this.nombreArchivo = nombreArchivo;
    }

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }

    public Instant getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(Instant fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }

    public HabitacionDTO getHabitacion() {
        return habitacion;
    }

    public void setHabitacion(HabitacionDTO habitacion) {
        this.habitacion = habitacion;
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
        if (!(o instanceof ImagenDTO)) {
            return false;
        }

        ImagenDTO imagenDTO = (ImagenDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, imagenDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "ImagenDTO{" +
            "id=" + getId() +
            ", nombre='" + getNombre() + "'" +
            ", descripcion='" + getDescripcion() + "'" +
            ", fichero='" + getFichero() + "'" +
            ", nombreArchivo='" + getNombreArchivo() + "'" +
            ", activo='" + getActivo() + "'" +
            ", fechaCreacion='" + getFechaCreacion() + "'" +
            ", habitacion=" + getHabitacion() +
            ", servicio=" + getServicio() +
            "}";
    }
}
