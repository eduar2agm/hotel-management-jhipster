package com.hotel.app.repository;

import com.hotel.app.domain.Habitacion;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Habitacion entity.
 */
@Repository
public interface HabitacionRepository extends JpaRepository<Habitacion, Long> {
    default Optional<Habitacion> findOneWithEagerRelationships(Long id) {
        return this.findOneWithToOneRelationships(id);
    }

    default List<Habitacion> findAllWithEagerRelationships() {
        return this.findAllWithToOneRelationships();
    }

    default Page<Habitacion> findAllWithEagerRelationships(Pageable pageable) {
        return this.findAllWithToOneRelationships(pageable);
    }

    @Query(
        value = "select habitacion from Habitacion habitacion left join fetch habitacion.categoriaHabitacion left join fetch habitacion.estadoHabitacion",
        countQuery = "select count(habitacion) from Habitacion habitacion"
    )
    Page<Habitacion> findAllWithToOneRelationships(Pageable pageable);

    @Query(
        "select habitacion from Habitacion habitacion left join fetch habitacion.categoriaHabitacion left join fetch habitacion.estadoHabitacion"
    )
    List<Habitacion> findAllWithToOneRelationships();

    @Query(
        "select habitacion from Habitacion habitacion left join fetch habitacion.categoriaHabitacion left join fetch habitacion.estadoHabitacion where habitacion.id =:id"
    )
    Optional<Habitacion> findOneWithToOneRelationships(@Param("id") Long id);
}
