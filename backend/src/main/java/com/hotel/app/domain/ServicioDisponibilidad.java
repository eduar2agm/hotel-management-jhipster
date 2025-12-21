package com.hotel.app.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.hotel.app.domain.enumeration.DiaSemana;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.LocalTime;

/**
 * A ServicioDisponibilidad.
 */
@Entity
@Table(name = "servicio_disponibilidad")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class ServicioDisponibilidad implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "dia_semana", nullable = false)
    private DiaSemana diaSemana;

    @NotNull
    @Column(name = "hora_inicio", nullable = false)
    private LocalTime horaInicio;

    @Column(name = "hora_fin")
    private LocalTime horaFin;

    @NotNull
    @Min(value = 1)
    @Column(name = "cupo_maximo", nullable = false)
    private Integer cupoMaximo;

    @NotNull
    @Column(name = "hora_fija", nullable = false)
    private Boolean horaFija;

    @NotNull
    @Column(name = "activo", nullable = false)
    private Boolean activo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "servicioDisponibilidads" }, allowSetters = true)
    private Servicio servicio;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public ServicioDisponibilidad id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public DiaSemana getDiaSemana() {
        return this.diaSemana;
    }

    public ServicioDisponibilidad diaSemana(DiaSemana diaSemana) {
        this.setDiaSemana(diaSemana);
        return this;
    }

    public void setDiaSemana(DiaSemana diaSemana) {
        this.diaSemana = diaSemana;
    }

    public LocalTime getHoraInicio() {
        return this.horaInicio;
    }

    public ServicioDisponibilidad horaInicio(LocalTime horaInicio) {
        this.setHoraInicio(horaInicio);
        return this;
    }

    public void setHoraInicio(LocalTime horaInicio) {
        this.horaInicio = horaInicio;
    }

    public LocalTime getHoraFin() {
        return this.horaFin;
    }

    public ServicioDisponibilidad horaFin(LocalTime horaFin) {
        this.setHoraFin(horaFin);
        return this;
    }

    public void setHoraFin(LocalTime horaFin) {
        this.horaFin = horaFin;
    }

    public Integer getCupoMaximo() {
        return this.cupoMaximo;
    }

    public ServicioDisponibilidad cupoMaximo(Integer cupoMaximo) {
        this.setCupoMaximo(cupoMaximo);
        return this;
    }

    public void setCupoMaximo(Integer cupoMaximo) {
        this.cupoMaximo = cupoMaximo;
    }

    public Boolean getHoraFija() {
        return this.horaFija;
    }

    public ServicioDisponibilidad horaFija(Boolean horaFija) {
        this.setHoraFija(horaFija);
        return this;
    }

    public void setHoraFija(Boolean horaFija) {
        this.horaFija = horaFija;
    }

    public Boolean getActivo() {
        return this.activo;
    }

    public ServicioDisponibilidad activo(Boolean activo) {
        this.setActivo(activo);
        return this;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }

    public Servicio getServicio() {
        return this.servicio;
    }

    public void setServicio(Servicio servicio) {
        this.servicio = servicio;
    }

    public ServicioDisponibilidad servicio(Servicio servicio) {
        this.setServicio(servicio);
        return this;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof ServicioDisponibilidad)) {
            return false;
        }
        return getId() != null && getId().equals(((ServicioDisponibilidad) o).getId());
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public String toString() {
        return "ServicioDisponibilidad{" +
                "id=" + getId() +
                ", diaSemana='" + getDiaSemana() + "'" +
                ", horaInicio='" + getHoraInicio() + "'" +
                ", horaFin='" + getHoraFin() + "'" +
                ", cupoMaximo=" + getCupoMaximo() +
                ", horaFija='" + getHoraFija() + "'" +
                ", activo='" + getActivo() + "'" +
                "}";
    }
}
