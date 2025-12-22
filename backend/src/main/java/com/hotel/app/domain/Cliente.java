package com.hotel.app.domain;

import com.hotel.app.domain.enumeration.TipoIdentificacion;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;

/**
 * A Cliente.
 */
@Entity
@Table(name = "cliente")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class Cliente implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "nombre", nullable = false)
    private String nombre;

    @NotNull
    @Column(name = "apellido", nullable = false)
    private String apellido;

    @NotNull
    @Column(name = "correo", nullable = false, unique = true)
    private String correo;

    @NotNull
    @Column(name = "telefono", nullable = false)
    private String telefono;

    @Column(name = "direccion")
    private String direccion;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_identificacion", nullable = false)
    private TipoIdentificacion tipoIdentificacion;

    @NotNull
    @Column(name = "numero_identificacion", nullable = false)
    private String numeroIdentificacion;

    @NotNull
    @Column(name = "keycloak_id", nullable = false)
    private String keycloakId;

    @NotNull
    @Column(name = "activo", nullable = false)
    private Boolean activo;

    @NotNull
    @Column(name = "fecha_nacimiento", nullable = false)
    private java.time.LocalDate fechaNacimiento;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public Cliente id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNombre() {
        return this.nombre;
    }

    public Cliente nombre(String nombre) {
        this.setNombre(nombre);
        return this;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getApellido() {
        return this.apellido;
    }

    public Cliente apellido(String apellido) {
        this.setApellido(apellido);
        return this;
    }

    public void setApellido(String apellido) {
        this.apellido = apellido;
    }

    public String getCorreo() {
        return this.correo;
    }

    public Cliente correo(String correo) {
        this.setCorreo(correo);
        return this;
    }

    public void setCorreo(String correo) {
        this.correo = correo;
    }

    public String getTelefono() {
        return this.telefono;
    }

    public Cliente telefono(String telefono) {
        this.setTelefono(telefono);
        return this;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public String getDireccion() {
        return this.direccion;
    }

    public Cliente direccion(String direccion) {
        this.setDireccion(direccion);
        return this;
    }

    public void setDireccion(String direccion) {
        this.direccion = direccion;
    }

    public TipoIdentificacion getTipoIdentificacion() {
        return this.tipoIdentificacion;
    }

    public Cliente tipoIdentificacion(TipoIdentificacion tipoIdentificacion) {
        this.setTipoIdentificacion(tipoIdentificacion);
        return this;
    }

    public void setTipoIdentificacion(TipoIdentificacion tipoIdentificacion) {
        this.tipoIdentificacion = tipoIdentificacion;
    }

    public String getNumeroIdentificacion() {
        return this.numeroIdentificacion;
    }

    public Cliente numeroIdentificacion(String numeroIdentificacion) {
        this.setNumeroIdentificacion(numeroIdentificacion);
        return this;
    }

    public void setNumeroIdentificacion(String numeroIdentificacion) {
        this.numeroIdentificacion = numeroIdentificacion;
    }

    public String getKeycloakId() {
        return this.keycloakId;
    }

    public Cliente keycloakId(String keycloakId) {
        this.setKeycloakId(keycloakId);
        return this;
    }

    public void setKeycloakId(String keycloakId) {
        this.keycloakId = keycloakId;
    }

    public Boolean getActivo() {
        return this.activo;
    }

    public Cliente activo(Boolean activo) {
        this.setActivo(activo);
        return this;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }

    public java.time.LocalDate getFechaNacimiento() {
        return this.fechaNacimiento;
    }

    public Cliente fechaNacimiento(java.time.LocalDate fechaNacimiento) {
        this.setFechaNacimiento(fechaNacimiento);
        return this;
    }

    public void setFechaNacimiento(java.time.LocalDate fechaNacimiento) {
        this.fechaNacimiento = fechaNacimiento;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and
    // setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Cliente)) {
            return false;
        }
        return getId() != null && getId().equals(((Cliente) o).getId());
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
        return "Cliente{" +
                "id=" + getId() +
                ", nombre='" + getNombre() + "'" +
                ", apellido='" + getApellido() + "'" +
                ", correo='" + getCorreo() + "'" +
                ", telefono='" + getTelefono() + "'" +
                ", direccion='" + getDireccion() + "'" +
                ", tipoIdentificacion='" + getTipoIdentificacion() + "'" +
                ", numeroIdentificacion='" + getNumeroIdentificacion() + "'" +
                ", keycloakId='" + getKeycloakId() + "'" +
                ", activo='" + getActivo() + "'" +
                "}";
    }
}
