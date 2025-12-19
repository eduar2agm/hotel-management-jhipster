package com.hotel.app.service.dto;

import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.util.Objects;

/**
 * A DTO for the {@link com.hotel.app.domain.CarouselItem} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class CarouselItemDTO implements Serializable {

    private Long id;

    @Size(max = 150)
    private String titulo;

    @Size(max = 500)
    private String descripcion;

    @NotNull
    private Integer orden;

    @NotNull
    private Boolean activo;

    private ImagenDTO imagen;

    private ConfiguracionSistemaDTO configuracion;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public Integer getOrden() {
        return orden;
    }

    public void setOrden(Integer orden) {
        this.orden = orden;
    }

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }

    public ImagenDTO getImagen() {
        return imagen;
    }

    public void setImagen(ImagenDTO imagen) {
        this.imagen = imagen;
    }

    public ConfiguracionSistemaDTO getConfiguracion() {
        return configuracion;
    }

    public void setConfiguracion(ConfiguracionSistemaDTO configuracion) {
        this.configuracion = configuracion;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof CarouselItemDTO)) {
            return false;
        }

        CarouselItemDTO carouselItemDTO = (CarouselItemDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, carouselItemDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "CarouselItemDTO{" +
            "id=" + getId() +
            ", titulo='" + getTitulo() + "'" +
            ", descripcion='" + getDescripcion() + "'" +
            ", orden=" + getOrden() +
            ", activo='" + getActivo() + "'" +
            ", imagen=" + getImagen() +
            ", configuracion=" + getConfiguracion() +
            "}";
    }
}
