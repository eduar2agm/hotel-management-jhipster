package com.hotel.app.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;

/**
 * A SeccionHero.
 */
@Entity
@Table(name = "seccion_hero")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class SeccionHero implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Size(max = 100)
    @Column(name = "titulo", length = 100, nullable = false)
    private String titulo;

    @Lob
    @Column(name = "descripcion")
    private String descripcion;

    @NotNull
    @Size(max = 500)
    @Column(name = "imagen_fondo_url", length = 500, nullable = false)
    private String imagenFondoUrl;

    @Size(max = 50)
    @Column(name = "texto_boton", length = 50)
    private String textoBoton;

    @Size(max = 255)
    @Column(name = "enlace_boton", length = 255)
    private String enlaceBoton;

    @NotNull
    @Column(name = "orden", nullable = false)
    private Integer orden;

    @NotNull
    @Column(name = "activo", nullable = false)
    private Boolean activo;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public SeccionHero id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitulo() {
        return this.titulo;
    }

    public SeccionHero titulo(String titulo) {
        this.setTitulo(titulo);
        return this;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getDescripcion() {
        return this.descripcion;
    }

    public SeccionHero descripcion(String descripcion) {
        this.setDescripcion(descripcion);
        return this;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getImagenFondoUrl() {
        return this.imagenFondoUrl;
    }

    public SeccionHero imagenFondoUrl(String imagenFondoUrl) {
        this.setImagenFondoUrl(imagenFondoUrl);
        return this;
    }

    public void setImagenFondoUrl(String imagenFondoUrl) {
        this.imagenFondoUrl = imagenFondoUrl;
    }

    public String getTextoBoton() {
        return this.textoBoton;
    }

    public SeccionHero textoBoton(String textoBoton) {
        this.setTextoBoton(textoBoton);
        return this;
    }

    public void setTextoBoton(String textoBoton) {
        this.textoBoton = textoBoton;
    }

    public String getEnlaceBoton() {
        return this.enlaceBoton;
    }

    public SeccionHero enlaceBoton(String enlaceBoton) {
        this.setEnlaceBoton(enlaceBoton);
        return this;
    }

    public void setEnlaceBoton(String enlaceBoton) {
        this.enlaceBoton = enlaceBoton;
    }

    public Integer getOrden() {
        return this.orden;
    }

    public SeccionHero orden(Integer orden) {
        this.setOrden(orden);
        return this;
    }

    public void setOrden(Integer orden) {
        this.orden = orden;
    }

    public Boolean getActivo() {
        return this.activo;
    }

    public SeccionHero activo(Boolean activo) {
        this.setActivo(activo);
        return this;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof SeccionHero)) {
            return false;
        }
        return getId() != null && getId().equals(((SeccionHero) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "SeccionHero{" +
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
