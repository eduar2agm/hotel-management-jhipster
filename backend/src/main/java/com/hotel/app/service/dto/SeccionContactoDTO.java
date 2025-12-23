package com.hotel.app.service.dto;

import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.util.Objects;

/**
 * A DTO for the {@link com.hotel.app.domain.SeccionContacto} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class SeccionContactoDTO implements Serializable {

    private Long id;

    @NotNull
    @Size(max = 255)
    private String titulo;

    private String descripcion;

    @NotNull
    @Size(max = 500)
    private String imagenFondoUrl;

    @Size(max = 255)
    private String correo;

    @NotNull
    private Boolean activo;

    // Transient fields for image upload
    private String imagenFondoBase64;
    private String imagenFondoContentType;

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

    public String getCorreo() {
        return correo;
    }

    public void setCorreo(String correo) {
        this.correo = correo;
    }

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }

    public String getImagenFondoBase64() {
        return imagenFondoBase64;
    }

    public void setImagenFondoBase64(String imagenFondoBase64) {
        this.imagenFondoBase64 = imagenFondoBase64;
    }

    public String getImagenFondoContentType() {
        return imagenFondoContentType;
    }

    public void setImagenFondoContentType(String imagenFondoContentType) {
        this.imagenFondoContentType = imagenFondoContentType;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof SeccionContactoDTO)) {
            return false;
        }

        SeccionContactoDTO seccionContactoDTO = (SeccionContactoDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, seccionContactoDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "SeccionContactoDTO{" +
                "id=" + getId() +
                ", titulo='" + getTitulo() + "'" +
                ", descripcion='" + getDescripcion() + "'" +
                ", imagenFondoUrl='" + getImagenFondoUrl() + "'" +
                ", correo='" + getCorreo() + "'" +
                ", activo='" + getActivo() + "'" +
                "}";
    }
}
