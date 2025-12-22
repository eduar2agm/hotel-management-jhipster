package com.hotel.app.service.dto;

import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.util.Objects;

/**
 * A DTO for the {@link com.hotel.app.domain.Telefono} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class TelefonoDTO implements Serializable {

    private Long id;

    @NotNull
    @Size(max = 20)
    private String numeroTel;

    @NotNull
    private Boolean activo;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNumeroTel() {
        return numeroTel;
    }

    public void setNumeroTel(String numeroTel) {
        this.numeroTel = numeroTel;
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
        if (!(o instanceof TelefonoDTO)) {
            return false;
        }

        TelefonoDTO telefonoDTO = (TelefonoDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, telefonoDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "TelefonoDTO{" +
            "id=" + getId() +
            ", numeroTel='" + getNumeroTel() + "'" +
            ", activo='" + getActivo() + "'" +
            "}";
    }
}
