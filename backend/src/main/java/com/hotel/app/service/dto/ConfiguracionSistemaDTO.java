package com.hotel.app.service.dto;

import com.hotel.app.domain.enumeration.TipoConfiguracion;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import java.util.Objects;

/**
 * A DTO for the {@link com.hotel.app.domain.ConfiguracionSistema} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class ConfiguracionSistemaDTO implements Serializable {

    private Long id;

    @NotNull
    @Size(max = 100)
    private String clave;

    @Size(max = 2000)
    private String valor;

    @NotNull
    private TipoConfiguracion tipo;

    @Size(max = 50)
    private String categoria;

    @Size(max = 500)
    private String descripcion;

    @NotNull
    private Boolean activo;

    private Instant fechaModificacion;

    private ImagenDTO imagen;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getClave() {
        return clave;
    }

    public void setClave(String clave) {
        this.clave = clave;
    }

    public String getValor() {
        return valor;
    }

    public void setValor(String valor) {
        this.valor = valor;
    }

    public TipoConfiguracion getTipo() {
        return tipo;
    }

    public void setTipo(TipoConfiguracion tipo) {
        this.tipo = tipo;
    }

    public String getCategoria() {
        return categoria;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }

    public Instant getFechaModificacion() {
        return fechaModificacion;
    }

    public void setFechaModificacion(Instant fechaModificacion) {
        this.fechaModificacion = fechaModificacion;
    }

    public ImagenDTO getImagen() {
        return imagen;
    }

    public void setImagen(ImagenDTO imagen) {
        this.imagen = imagen;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof ConfiguracionSistemaDTO)) {
            return false;
        }

        ConfiguracionSistemaDTO configuracionSistemaDTO = (ConfiguracionSistemaDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, configuracionSistemaDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "ConfiguracionSistemaDTO{" +
            "id=" + getId() +
            ", clave='" + getClave() + "'" +
            ", valor='" + getValor() + "'" +
            ", tipo='" + getTipo() + "'" +
            ", categoria='" + getCategoria() + "'" +
            ", descripcion='" + getDescripcion() + "'" +
            ", activo='" + getActivo() + "'" +
            ", fechaModificacion='" + getFechaModificacion() + "'" +
            ", imagen=" + getImagen() +
            "}";
    }
}
