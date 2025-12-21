package com.hotel.app.repository;

import com.hotel.app.domain.ServicioDisponibilidad;
import com.hotel.app.domain.enumeration.DiaSemana;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data JPA repository for the ServicioDisponibilidad entity.
 */
@SuppressWarnings("unused")
@Repository
public interface ServicioDisponibilidadRepository extends JpaRepository<ServicioDisponibilidad, Long> {

    Page<ServicioDisponibilidad> findByActivo(Boolean activo, Pageable pageable);

    List<ServicioDisponibilidad> findByServicioIdAndActivoTrue(Long servicioId);

    List<ServicioDisponibilidad> findByServicioIdAndDiaSemanaAndActivoTrue(
            Long servicioId, DiaSemana diaSemana);
}
