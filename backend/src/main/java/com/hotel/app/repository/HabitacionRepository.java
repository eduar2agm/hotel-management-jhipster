package com.hotel.app.repository;

import com.hotel.app.domain.Habitacion;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Habitacion entity.
 */
@SuppressWarnings("unused")
@Repository
public interface HabitacionRepository extends JpaRepository<Habitacion, Long> {}
