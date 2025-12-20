package com.hotel.app.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;

/**
 * A Imagen.
 */
@Entity
@Table(name = "imagen")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class Imagen implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "nombre", nullable = false)
    private String nombre;

    @Size(max = 500)
    @Column(name = "descripcion", length = 500)
    private String descripcion;

    @Lob
    @Column(name = "fichero", nullable = false)
    private byte[] fichero;

    @NotNull
    @Column(name = "fichero_content_type", nullable = false)
    private String ficheroContentType;

    @Column(name = "nombre_archivo")
    private String nombreArchivo;

    @NotNull
    @Column(name = "activo", nullable = false)
    private Boolean activo;

    @Column(name = "fecha_creacion")
    private Instant fechaCreacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "categoriaHabitacion", "estadoHabitacion" }, allowSetters = true)
    @org.hibernate.annotations.OnDelete(action = org.hibernate.annotations.OnDeleteAction.CASCADE)
    private Habitacion habitacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @org.hibernate.annotations.OnDelete(action = org.hibernate.annotations.OnDeleteAction.CASCADE)
    private Servicio servicio;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public Imagen id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNombre() {
        return this.nombre;
    }

    public Imagen nombre(String nombre) {
        this.setNombre(nombre);
        return this;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getDescripcion() {
        return this.descripcion;
    }

    public Imagen descripcion(String descripcion) {
        this.setDescripcion(descripcion);
        return this;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public byte[] getFichero() {
        return this.fichero;
    }

    public Imagen fichero(byte[] fichero) {
        this.setFichero(fichero);
        return this;
    }

    public void setFichero(byte[] fichero) {
        this.fichero = fichero;
    }

    public String getFicheroContentType() {
        return this.ficheroContentType;
    }

    public Imagen ficheroContentType(String ficheroContentType) {
        this.ficheroContentType = ficheroContentType;
        return this;
    }

    public void setFicheroContentType(String ficheroContentType) {
        this.ficheroContentType = ficheroContentType;
    }

    public String getNombreArchivo() {
        return this.nombreArchivo;
    }

    public Imagen nombreArchivo(String nombreArchivo) {
        this.setNombreArchivo(nombreArchivo);
        return this;
    }

    public void setNombreArchivo(String nombreArchivo) {
        this.nombreArchivo = nombreArchivo;
    }

    public Boolean getActivo() {
        return this.activo;
    }

    public Imagen activo(Boolean activo) {
        this.setActivo(activo);
        return this;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }

    public Instant getFechaCreacion() {
        return this.fechaCreacion;
    }

    public Imagen fechaCreacion(Instant fechaCreacion) {
        this.setFechaCreacion(fechaCreacion);
        return this;
    }

    public void setFechaCreacion(Instant fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }

    public Habitacion getHabitacion() {
        return this.habitacion;
    }

    public void setHabitacion(Habitacion habitacion) {
        this.habitacion = habitacion;
    }

    public Imagen habitacion(Habitacion habitacion) {
        this.setHabitacion(habitacion);
        return this;
    }

    public Servicio getServicio() {
        return this.servicio;
    }

    public void setServicio(Servicio servicio) {
        this.servicio = servicio;
    }

    public Imagen servicio(Servicio servicio) {
        this.setServicio(servicio);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and
    // setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Imagen)) {
            return false;
        }
        return getId() != null && getId().equals(((Imagen) o).getId());
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
        return "Imagen{" +
                "id=" + getId() +
                ", nombre='" + getNombre() + "'" +
                ", descripcion='" + getDescripcion() + "'" +
                ", fichero='" + getFichero() + "'" +
                ", ficheroContentType='" + getFicheroContentType() + "'" +
                ", nombreArchivo='" + getNombreArchivo() + "'" +
                ", activo='" + getActivo() + "'" +
                ", fechaCreacion='" + getFechaCreacion() + "'" +
                "}";
    }
}
