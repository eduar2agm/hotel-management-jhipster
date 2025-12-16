package com.hotel.app.repository;

import com.hotel.app.domain.CategoriaHabitacion;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Spring Data JPA repository for the CategoriaHabitacion entity.
 */
@SuppressWarnings("unused")
@Repository
public interface CategoriaHabitacionRepository extends JpaRepository<CategoriaHabitacion, Long> {
    Page<CategoriaHabitacion> findByActivo(Boolean activo, Pageable pageable);
}
