package com.hotel.app.repository;

import com.hotel.app.domain.Habitacion;
import java.util.List;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Spring Data JPA repository for the Habitacion entity.
 */
@SuppressWarnings("unused")
@Repository
public interface HabitacionRepository extends JpaRepository<Habitacion, Long> {
    Page<Habitacion> findByActivo(Boolean activo, Pageable pageable);

    Page<Habitacion> findByIdNotIn(List<Long> ids, Pageable pageable);
}
