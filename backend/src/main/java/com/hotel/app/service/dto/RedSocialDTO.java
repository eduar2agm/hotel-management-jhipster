package com.hotel.app.service.dto;

import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.util.Objects;

/**
 * A DTO for the {@link com.hotel.app.domain.RedSocial} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class RedSocialDTO implements Serializable {

    private Long id;

    @NotNull
    @Size(max = 50)
    private String nombre;

    @NotNull
    @Size(max = 255)
    private String urlEnlace;

    @NotNull
    @Size(max = 500)
    private String iconoUrl;

    @Size(max = 7)
    private String colorHex;

    @NotNull
    private Boolean activo;

    private String iconoMediaBase64;
    private String iconoMediaContentType;

    public String getIconoMediaBase64() {
        return iconoMediaBase64;
    }

    public void setIconoMediaBase64(String iconoMediaBase64) {
        this.iconoMediaBase64 = iconoMediaBase64;
    }

    public String getIconoMediaContentType() {
        return iconoMediaContentType;
    }

    public void setIconoMediaContentType(String iconoMediaContentType) {
        this.iconoMediaContentType = iconoMediaContentType;
    }

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

    public String getUrlEnlace() {
        return urlEnlace;
    }

    public void setUrlEnlace(String urlEnlace) {
        this.urlEnlace = urlEnlace;
    }

    public String getIconoUrl() {
        return iconoUrl;
    }

    public void setIconoUrl(String iconoUrl) {
        this.iconoUrl = iconoUrl;
    }

    public String getColorHex() {
        return colorHex;
    }

    public void setColorHex(String colorHex) {
        this.colorHex = colorHex;
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
        if (!(o instanceof RedSocialDTO)) {
            return false;
        }

        RedSocialDTO redSocialDTO = (RedSocialDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, redSocialDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "RedSocialDTO{" +
                "id=" + getId() +
                ", nombre='" + getNombre() + "'" +
                ", urlEnlace='" + getUrlEnlace() + "'" +
                ", iconoUrl='" + getIconoUrl() + "'" +
                ", colorHex='" + getColorHex() + "'" +
                ", activo='" + getActivo() + "'" +
                "}";
    }
}
