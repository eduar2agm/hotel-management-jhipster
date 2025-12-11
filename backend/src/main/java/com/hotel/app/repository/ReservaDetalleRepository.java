package com.hotel.app.repository;

import com.hotel.app.domain.ReservaDetalle;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the ReservaDetalle entity.
 */
@Repository
public interface ReservaDetalleRepository extends JpaRepository<ReservaDetalle, Long> {
    default Optional<ReservaDetalle> findOneWithEagerRelationships(Long id) {
        return this.findOneWithToOneRelationships(id);
    }

    default List<ReservaDetalle> findAllWithEagerRelationships() {
        return this.findAllWithToOneRelationships();
    }

    default Page<ReservaDetalle> findAllWithEagerRelationships(Pageable pageable) {
        return this.findAllWithToOneRelationships(pageable);
    }

    @Query(
        value = "select reservaDetalle from ReservaDetalle reservaDetalle left join fetch reservaDetalle.habitacion",
        countQuery = "select count(reservaDetalle) from ReservaDetalle reservaDetalle"
    )
    Page<ReservaDetalle> findAllWithToOneRelationships(Pageable pageable);

    @Query("select reservaDetalle from ReservaDetalle reservaDetalle left join fetch reservaDetalle.habitacion")
    List<ReservaDetalle> findAllWithToOneRelationships();

    @Query(
        "select reservaDetalle from ReservaDetalle reservaDetalle left join fetch reservaDetalle.habitacion where reservaDetalle.id =:id"
    )
    Optional<ReservaDetalle> findOneWithToOneRelationships(@Param("id") Long id);
}
