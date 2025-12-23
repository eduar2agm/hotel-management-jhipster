package com.hotel.app.service.dto;

import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.util.Objects;

/**
 * A DTO for the {@link com.hotel.app.domain.SeccionHero} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class SeccionHeroDTO implements Serializable {

    private Long id;

    @NotNull
    @Size(max = 100)
    private String titulo;

    private String descripcion;

    @NotNull
    @Size(max = 500)
    private String imagenFondoUrl;

    @Size(max = 50)
    private String textoBoton;

    @Size(max = 255)
    private String enlaceBoton;

    @NotNull
    private Integer orden;

    @NotNull
    private Boolean activo;

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

    public String getImagenFondoUrl() {
        return imagenFondoUrl;
    }

    public void setImagenFondoUrl(String imagenFondoUrl) {
        this.imagenFondoUrl = imagenFondoUrl;
    }

    public String getTextoBoton() {
        return textoBoton;
    }

    public void setTextoBoton(String textoBoton) {
        this.textoBoton = textoBoton;
    }

    public String getEnlaceBoton() {
        return enlaceBoton;
    }

    public void setEnlaceBoton(String enlaceBoton) {
        this.enlaceBoton = enlaceBoton;
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

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof SeccionHeroDTO)) {
            return false;
        }

        SeccionHeroDTO seccionHeroDTO = (SeccionHeroDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, seccionHeroDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "SeccionHeroDTO{" +
                "id=" + getId() +
                ", titulo='" + getTitulo() + "'" +
                ", descripcion='" + getDescripcion() + "'" +
                ", imagenFondoUrl='" + getImagenFondoUrl() + "'" +
                ", textoBoton='" + getTextoBoton() + "'" +
                ", enlaceBoton='" + getEnlaceBoton() + "'" +
                ", orden=" + getOrden() +
                ", activo='" + getActivo() + "'" +
                "}";
    }
}
