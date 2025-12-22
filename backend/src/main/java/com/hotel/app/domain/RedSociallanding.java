package com.hotel.app.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;

/**
 * A RedSociallanding.
 */
@Entity
@Table(name = "red_social")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class RedSociallanding implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Size(max = 50)
    @Column(name = "nombre", length = 50, nullable = false)
    private String nombre;

    @NotNull
    @Size(max = 255)
    @Column(name = "url_enlace", length = 255, nullable = false)
    private String urlEnlace;

    @NotNull
    @Size(max = 500)
    @Column(name = "icono_url", length = 500, nullable = false)
    private String iconoUrl;

    @Size(max = 7)
    @Column(name = "color_hex", length = 7)
    private String colorHex;

    @NotNull
    @Column(name = "activo", nullable = false)
    private Boolean activo;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public RedSociallanding id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNombre() {
        return this.nombre;
    }

    public RedSociallanding nombre(String nombre) {
        this.setNombre(nombre);
        return this;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getUrlEnlace() {
        return this.urlEnlace;
    }

    public RedSociallanding urlEnlace(String urlEnlace) {
        this.setUrlEnlace(urlEnlace);
        return this;
    }

    public void setUrlEnlace(String urlEnlace) {
        this.urlEnlace = urlEnlace;
    }

    public String getIconoUrl() {
        return this.iconoUrl;
    }

    public RedSociallanding iconoUrl(String iconoUrl) {
        this.setIconoUrl(iconoUrl);
        return this;
    }

    public void setIconoUrl(String iconoUrl) {
        this.iconoUrl = iconoUrl;
    }

    public String getColorHex() {
        return this.colorHex;
    }

    public RedSociallanding colorHex(String colorHex) {
        this.setColorHex(colorHex);
        return this;
    }

    public void setColorHex(String colorHex) {
        this.colorHex = colorHex;
    }

    public Boolean getActivo() {
        return this.activo;
    }

    public RedSociallanding activo(Boolean activo) {
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
        if (!(o instanceof RedSociallanding)) {
            return false;
        }
        return getId() != null && getId().equals(((RedSociallanding) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "RedSociallanding{" +
            "id=" + getId() +
            ", nombre='" + getNombre() + "'" +
            ", urlEnlace='" + getUrlEnlace() + "'" +
            ", iconoUrl='" + getIconoUrl() + "'" +
            ", colorHex='" + getColorHex() + "'" +
            ", activo='" + getActivo() + "'" +
            "}";
    }
}
