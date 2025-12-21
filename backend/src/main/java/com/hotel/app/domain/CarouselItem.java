package com.hotel.app.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;

/**
 * A CarouselItem.
 */
@Entity
@Table(name = "carousel_item")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class CarouselItem implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @Size(max = 150)
    @Column(name = "titulo", length = 150)
    private String titulo;

    @Size(max = 500)
    @Column(name = "descripcion", length = 500)
    private String descripcion;

    @NotNull
    @Column(name = "orden", nullable = false)
    private Integer orden;

    @NotNull
    @Column(name = "activo", nullable = false)
    private Boolean activo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "habitacion", "servicio" }, allowSetters = true)
    private Imagen imagen;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "imagen" }, allowSetters = true)
    private ConfiguracionSistema configuracion;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public CarouselItem id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitulo() {
        return this.titulo;
    }

    public CarouselItem titulo(String titulo) {
        this.setTitulo(titulo);
        return this;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getDescripcion() {
        return this.descripcion;
    }

    public CarouselItem descripcion(String descripcion) {
        this.setDescripcion(descripcion);
        return this;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public Integer getOrden() {
        return this.orden;
    }

    public CarouselItem orden(Integer orden) {
        this.setOrden(orden);
        return this;
    }

    public void setOrden(Integer orden) {
        this.orden = orden;
    }

    public Boolean getActivo() {
        return this.activo;
    }

    public CarouselItem activo(Boolean activo) {
        this.setActivo(activo);
        return this;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }

    public Imagen getImagen() {
        return this.imagen;
    }

    public void setImagen(Imagen imagen) {
        this.imagen = imagen;
    }

    public CarouselItem imagen(Imagen imagen) {
        this.setImagen(imagen);
        return this;
    }

    public ConfiguracionSistema getConfiguracion() {
        return this.configuracion;
    }

    public void setConfiguracion(ConfiguracionSistema configuracionSistema) {
        this.configuracion = configuracionSistema;
    }

    public CarouselItem configuracion(ConfiguracionSistema configuracionSistema) {
        this.setConfiguracion(configuracionSistema);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof CarouselItem)) {
            return false;
        }
        return getId() != null && getId().equals(((CarouselItem) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "CarouselItem{" +
            "id=" + getId() +
            ", titulo='" + getTitulo() + "'" +
            ", descripcion='" + getDescripcion() + "'" +
            ", orden=" + getOrden() +
            ", activo='" + getActivo() + "'" +
            "}";
    }
}
