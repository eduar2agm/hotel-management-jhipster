package com.hotel.app.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;

/**
 * A Habitacion.
 */
@Entity
@Table(name = "habitacion")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class Habitacion implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "numero", nullable = false, unique = true)
    private String numero;

    @NotNull
    @Column(name = "capacidad", nullable = false)
    private Integer capacidad;

    @Column(name = "descripcion")
    private String descripcion;

    @Column(name = "imagen")
    private String imagen;

    @NotNull
    @Column(name = "activo", nullable = false)
    private Boolean activo;

    @ManyToOne(fetch = FetchType.LAZY)
    private CategoriaHabitacion categoriaHabitacion;

    @ManyToOne(fetch = FetchType.LAZY)
    private EstadoHabitacion estadoHabitacion;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public Habitacion id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNumero() {
        return this.numero;
    }

    public Habitacion numero(String numero) {
        this.setNumero(numero);
        return this;
    }

    public void setNumero(String numero) {
        this.numero = numero;
    }

    public Integer getCapacidad() {
        return this.capacidad;
    }

    public Habitacion capacidad(Integer capacidad) {
        this.setCapacidad(capacidad);
        return this;
    }

    public void setCapacidad(Integer capacidad) {
        this.capacidad = capacidad;
    }

    public String getDescripcion() {
        return this.descripcion;
    }

    public Habitacion descripcion(String descripcion) {
        this.setDescripcion(descripcion);
        return this;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getImagen() {
        return this.imagen;
    }

    public Habitacion imagen(String imagen) {
        this.setImagen(imagen);
        return this;
    }

    public void setImagen(String imagen) {
        this.imagen = imagen;
    }

    public Boolean getActivo() {
        return this.activo;
    }

    public Habitacion activo(Boolean activo) {
        this.setActivo(activo);
        return this;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }

    public CategoriaHabitacion getCategoriaHabitacion() {
        return this.categoriaHabitacion;
    }

    public void setCategoriaHabitacion(CategoriaHabitacion categoriaHabitacion) {
        this.categoriaHabitacion = categoriaHabitacion;
    }

    public Habitacion categoriaHabitacion(CategoriaHabitacion categoriaHabitacion) {
        this.setCategoriaHabitacion(categoriaHabitacion);
        return this;
    }

    public EstadoHabitacion getEstadoHabitacion() {
        return this.estadoHabitacion;
    }

    public void setEstadoHabitacion(EstadoHabitacion estadoHabitacion) {
        this.estadoHabitacion = estadoHabitacion;
    }

    public Habitacion estadoHabitacion(EstadoHabitacion estadoHabitacion) {
        this.setEstadoHabitacion(estadoHabitacion);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Habitacion)) {
            return false;
        }
        return getId() != null && getId().equals(((Habitacion) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Habitacion{" +
            "id=" + getId() +
            ", numero='" + getNumero() + "'" +
            ", capacidad=" + getCapacidad() +
            ", descripcion='" + getDescripcion() + "'" +
            ", imagen='" + getImagen() + "'" +
            ", activo='" + getActivo() + "'" +
            "}";
    }
}
