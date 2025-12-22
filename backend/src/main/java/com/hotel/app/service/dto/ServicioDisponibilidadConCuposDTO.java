package com.hotel.app.service.dto;

import java.time.LocalDate;

/**
 * DTO que extiende ServicioDisponibilidadDTO para incluir información de cupos
 * disponibles
 */
public class ServicioDisponibilidadConCuposDTO extends ServicioDisponibilidadDTO {

    private Integer cuposOcupados;
    private Integer cuposDisponibles;
    private LocalDate fecha; // Para disponibilidad en fechas específicas

    public ServicioDisponibilidadConCuposDTO() {
        super();
    }

    public ServicioDisponibilidadConCuposDTO(ServicioDisponibilidadDTO base) {
        this.setId(base.getId());
        this.setDiaSemana(base.getDiaSemana());
        this.setHoraInicio(base.getHoraInicio());
        this.setHoraFin(base.getHoraFin());
        this.setCupoMaximo(base.getCupoMaximo());
        this.setHoraFija(base.getHoraFija());
        this.setActivo(base.getActivo());
        this.setServicio(base.getServicio());
    }

    public Integer getCuposOcupados() {
        return cuposOcupados;
    }

    public void setCuposOcupados(Integer cuposOcupados) {
        this.cuposOcupados = cuposOcupados;
        // Calcular cupos disponibles automáticamente
        if (this.getCupoMaximo() != null && cuposOcupados != null) {
            this.cuposDisponibles = this.getCupoMaximo() - cuposOcupados;
        }
    }

    public Integer getCuposDisponibles() {
        return cuposDisponibles;
    }

    public void setCuposDisponibles(Integer cuposDisponibles) {
        this.cuposDisponibles = cuposDisponibles;
    }

    public LocalDate getFecha() {
        return fecha;
    }

    public void setFecha(LocalDate fecha) {
        this.fecha = fecha;
    }

    @Override
    public String toString() {
        return "ServicioDisponibilidadConCuposDTO{" +
                "id=" + getId() +
                ", diaSemana=" + getDiaSemana() +
                ", horaInicio=" + getHoraInicio() +
                ", horaFin=" + getHoraFin() +
                ", cupoMaximo=" + getCupoMaximo() +
                ", cuposOcupados=" + cuposOcupados +
                ", cuposDisponibles=" + cuposDisponibles +
                ", fecha=" + fecha +
                ", horaFija=" + getHoraFija() +
                ", activo=" + getActivo() +
                '}';
    }
}
