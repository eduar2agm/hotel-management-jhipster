package com.hotel.app.repository;

import com.hotel.app.domain.Reserva;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Reserva entity.
 */
@Repository
public interface ReservaRepository extends JpaRepository<Reserva, Long> {
    default Optional<Reserva> findOneWithEagerRelationships(Long id) {
        return this.findOneWithToOneRelationships(id);
    }

    default List<Reserva> findAllWithEagerRelationships() {
        return this.findAllWithToOneRelationships();
    }

    default Page<Reserva> findAllWithEagerRelationships(Pageable pageable) {
        return this.findAllWithToOneRelationships(pageable);
    }

    @Query(
        value = "select reserva from Reserva reserva left join fetch reserva.cliente",
        countQuery = "select count(reserva) from Reserva reserva"
    )
    Page<Reserva> findAllWithToOneRelationships(Pageable pageable);

    @Query("select reserva from Reserva reserva left join fetch reserva.cliente")
    List<Reserva> findAllWithToOneRelationships();

    @Query("select reserva from Reserva reserva left join fetch reserva.cliente where reserva.id =:id")
    Optional<Reserva> findOneWithToOneRelationships(@Param("id") Long id);
}
