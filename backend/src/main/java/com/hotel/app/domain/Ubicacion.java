package com.hotel.app.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;

/**
 * A Ubicacion.
 */
@Entity
@Table(name = "ubicacion")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class Ubicacion implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "latitud", nullable = false)
    private Double latitud;

    @NotNull
    @Column(name = "longitud", nullable = false)
    private Double longitud;

    @NotNull
    @Column(name = "nombre", nullable = false)
    private String nombre;

    @Column(name = "direccion")
    private String direccion;

    @Column(name = "google_maps_url")
    private String googleMapsUrl;

    @Column(name = "activo")
    private Boolean activo;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public Ubicacion id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Double getLatitud() {
        return this.latitud;
    }

    public Ubicacion latitud(Double latitud) {
        this.setLatitud(latitud);
        return this;
    }

    public void setLatitud(Double latitud) {
        this.latitud = latitud;
    }

    public Double getLongitud() {
        return this.longitud;
    }

    public Ubicacion longitud(Double longitud) {
        this.setLongitud(longitud);
        return this;
    }

    public void setLongitud(Double longitud) {
        this.longitud = longitud;
    }

    public String getNombre() {
        return this.nombre;
    }

    public Ubicacion nombre(String nombre) {
        this.setNombre(nombre);
        return this;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getDireccion() {
        return this.direccion;
    }

    public Ubicacion direccion(String direccion) {
        this.setDireccion(direccion);
        return this;
    }

    public void setDireccion(String direccion) {
        this.direccion = direccion;
    }

    public String getGoogleMapsUrl() {
        return this.googleMapsUrl;
    }

    public Ubicacion googleMapsUrl(String googleMapsUrl) {
        this.setGoogleMapsUrl(googleMapsUrl);
        return this;
    }

    public void setGoogleMapsUrl(String googleMapsUrl) {
        this.googleMapsUrl = googleMapsUrl;
    }

    public Boolean getActivo() {
        return this.activo;
    }

    public Ubicacion activo(Boolean activo) {
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
        if (!(o instanceof Ubicacion)) {
            return false;
        }
        return getId() != null && getId().equals(((Ubicacion) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Ubicacion{" +
            "id=" + getId() +
            ", latitud=" + getLatitud() +
            ", longitud=" + getLongitud() +
            ", nombre='" + getNombre() + "'" +
            ", direccion='" + getDireccion() + "'" +
            ", googleMapsUrl='" + getGoogleMapsUrl() + "'" +
            ", activo='" + getActivo() + "'" +
            "}";
    }
}
