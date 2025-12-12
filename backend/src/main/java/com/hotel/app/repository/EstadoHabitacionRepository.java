package com.hotel.app.repository;

import com.hotel.app.domain.EstadoHabitacion;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the EstadoHabitacion entity.
 */
@SuppressWarnings("unused")
@Repository
public interface EstadoHabitacionRepository extends JpaRepository<EstadoHabitacion, Long> {}
