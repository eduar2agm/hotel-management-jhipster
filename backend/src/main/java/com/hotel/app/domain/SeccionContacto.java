package com.hotel.app.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;

/**
 * A SeccionContacto.
 */
@Entity
@Table(name = "seccion_contacto")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class SeccionContacto implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Size(max = 255)
    @Column(name = "titulo", length = 255, nullable = false)
    private String titulo;

    @Column(name = "descripcion", length = 5000, nullable = false)
    private String descripcion;

    @NotNull
    @Size(max = 500)
    @Column(name = "imagen_fondo_url", length = 500, nullable = false)
    private String imagenFondoUrl;

    @Size(max = 255)
    @Column(name = "correo", length = 255)
    private String correo;

    @NotNull
    @Column(name = "activo", nullable = false)
    private Boolean activo;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public SeccionContacto id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitulo() {
        return this.titulo;
    }

    public SeccionContacto titulo(String titulo) {
        this.setTitulo(titulo);
        return this;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getDescripcion() {
        return this.descripcion;
    }

    public SeccionContacto descripcion(String descripcion) {
        this.setDescripcion(descripcion);
        return this;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getImagenFondoUrl() {
        return this.imagenFondoUrl;
    }

    public SeccionContacto imagenFondoUrl(String imagenFondoUrl) {
        this.setImagenFondoUrl(imagenFondoUrl);
        return this;
    }

    public void setImagenFondoUrl(String imagenFondoUrl) {
        this.imagenFondoUrl = imagenFondoUrl;
    }

    public String getCorreo() {
        return this.correo;
    }

    public SeccionContacto correo(String correo) {
        this.setCorreo(correo);
        return this;
    }

    public void setCorreo(String correo) {
        this.correo = correo;
    }

    public Boolean getActivo() {
        return this.activo;
    }

    public SeccionContacto activo(Boolean activo) {
        this.setActivo(activo);
        return this;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and
    // setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof SeccionContacto)) {
            return false;
        }
        return getId() != null && getId().equals(((SeccionContacto) o).getId());
    }

    @Override
    public int hashCode() {
        // see
        // https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "SeccionContacto{" +
                "id=" + getId() +
                ", titulo='" + getTitulo() + "'" +
                ", descripcion='" + getDescripcion() + "'" +
                ", imagenFondoUrl='" + getImagenFondoUrl() + "'" +
                ", correo='" + getCorreo() + "'" +
                ", activo='" + getActivo() + "'" +
                "}";
    }
}
