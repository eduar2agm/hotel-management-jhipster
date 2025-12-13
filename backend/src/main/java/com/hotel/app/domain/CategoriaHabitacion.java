package com.hotel.app.domain;

import com.hotel.app.domain.enumeration.CategoriaHabitacionNombre;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.math.BigDecimal;

/**
 * A CategoriaHabitacion.
 */
@Entity
@Table(name = "categoria_habitacion")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class CategoriaHabitacion implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "nombre", nullable = false)
    private CategoriaHabitacionNombre nombre;

    @Column(name = "descripcion")
    private String descripcion;

    @NotNull
    @Column(name = "precio_base", precision = 21, scale = 2, nullable = false)
    private BigDecimal precioBase;

    @NotNull
    @Column(name = "activo", nullable = false)
    private Boolean activo;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public CategoriaHabitacion id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public CategoriaHabitacionNombre getNombre() {
        return this.nombre;
    }

    public CategoriaHabitacion nombre(CategoriaHabitacionNombre nombre) {
        this.setNombre(nombre);
        return this;
    }

    public void setNombre(CategoriaHabitacionNombre nombre) {
        this.nombre = nombre;
    }

    public String getDescripcion() {
        return this.descripcion;
    }

    public CategoriaHabitacion descripcion(String descripcion) {
        this.setDescripcion(descripcion);
        return this;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public BigDecimal getPrecioBase() {
        return this.precioBase;
    }

    public CategoriaHabitacion precioBase(BigDecimal precioBase) {
        this.setPrecioBase(precioBase);
        return this;
    }

    public void setPrecioBase(BigDecimal precioBase) {
        this.precioBase = precioBase;
    }

    public Boolean getActivo() {
        return this.activo;
    }

    public CategoriaHabitacion activo(Boolean activo) {
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
        if (!(o instanceof CategoriaHabitacion)) {
            return false;
        }
        return getId() != null && getId().equals(((CategoriaHabitacion) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "CategoriaHabitacion{" +
            "id=" + getId() +
            ", nombre='" + getNombre() + "'" +
            ", descripcion='" + getDescripcion() + "'" +
            ", precioBase=" + getPrecioBase() +
            ", activo='" + getActivo() + "'" +
            "}";
    }
}
