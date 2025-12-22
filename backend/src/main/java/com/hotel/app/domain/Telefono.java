package com.hotel.app.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;

/**
 * A Telefono.
 */
@Entity
@Table(name = "telefono")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class Telefono implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Size(max = 20)
    @Column(name = "numero_tel", length = 20, nullable = false)
    private String numeroTel;

    @NotNull
    @Column(name = "activo", nullable = false)
    private Boolean activo;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public Telefono id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNumeroTel() {
        return this.numeroTel;
    }

    public Telefono numeroTel(String numeroTel) {
        this.setNumeroTel(numeroTel);
        return this;
    }

    public void setNumeroTel(String numeroTel) {
        this.numeroTel = numeroTel;
    }

    public Boolean getActivo() {
        return this.activo;
    }

    public Telefono activo(Boolean activo) {
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
        if (!(o instanceof Telefono)) {
            return false;
        }
        return getId() != null && getId().equals(((Telefono) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Telefono{" +
            "id=" + getId() +
            ", numeroTel='" + getNumeroTel() + "'" +
            ", activo='" + getActivo() + "'" +
            "}";
    }
}
