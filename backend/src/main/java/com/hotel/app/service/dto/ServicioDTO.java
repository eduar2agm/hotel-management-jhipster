package com.hotel.app.service.dto;

import com.hotel.app.domain.enumeration.TipoServicio;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Objects;

/**
 * A DTO for the {@link com.hotel.app.domain.Servicio} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class ServicioDTO implements Serializable {

    private Long id;

    @NotNull
    @Size(max = 100)
    private String nombre;

    @Size(max = 1000)
    private String descripcion;

    @NotNull
    private TipoServicio tipo;

    @NotNull
    @DecimalMin(value = "0")
    private BigDecimal precio;

    @NotNull
    private Boolean disponible;

    @Size(max = 255)
    private String urlImage;

    private java.util.List<ImagenDTO> imagenes;

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

    public TipoServicio getTipo() {
        return tipo;
    }

    public void setTipo(TipoServicio tipo) {
        this.tipo = tipo;
    }

    public BigDecimal getPrecio() {
        return precio;
    }

    public void setPrecio(BigDecimal precio) {
        this.precio = precio;
    }

    public Boolean getDisponible() {
        return disponible;
    }

    public void setDisponible(Boolean disponible) {
        this.disponible = disponible;
    }

    public String getUrlImage() {
        return urlImage;
    }

    public void setUrlImage(String urlImage) {
        this.urlImage = urlImage;
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
        if (!(o instanceof ServicioDTO)) {
            return false;
        }

        ServicioDTO servicioDTO = (ServicioDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, servicioDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "ServicioDTO{" +
                "id=" + getId() +
                ", nombre='" + getNombre() + "'" +
                ", descripcion='" + getDescripcion() + "'" +
                ", tipo='" + getTipo() + "'" +
                ", precio=" + getPrecio() +
                ", disponible='" + getDisponible() + "'" +
                ", urlImage='" + getUrlImage() + "'" +
                "}";
    }
}
