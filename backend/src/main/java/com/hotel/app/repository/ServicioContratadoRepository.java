package com.hotel.app.repository;

import com.hotel.app.domain.ServicioContratado;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the ServicioContratado entity.
 */
@Repository
public interface ServicioContratadoRepository extends JpaRepository<ServicioContratado, Long> {
    default Optional<ServicioContratado> findOneWithEagerRelationships(Long id) {
        return this.findOneWithToOneRelationships(id);
    }

    default List<ServicioContratado> findAllWithEagerRelationships() {
        return this.findAllWithToOneRelationships();
    }

    default Page<ServicioContratado> findAllWithEagerRelationships(Pageable pageable) {
        return this.findAllWithToOneRelationships(pageable);
    }

    @Query(value = "select servicioContratado from ServicioContratado servicioContratado left join fetch servicioContratado.servicio left join fetch servicioContratado.cliente", countQuery = "select count(servicioContratado) from ServicioContratado servicioContratado")
    Page<ServicioContratado> findAllWithToOneRelationships(Pageable pageable);

    @Query("select servicioContratado from ServicioContratado servicioContratado left join fetch servicioContratado.servicio left join fetch servicioContratado.cliente")
    List<ServicioContratado> findAllWithToOneRelationships();

    @Query("select servicioContratado from ServicioContratado servicioContratado left join fetch servicioContratado.servicio left join fetch servicioContratado.cliente where servicioContratado.id =:id")
    Optional<ServicioContratado> findOneWithToOneRelationships(@Param("id") Long id);

    List<ServicioContratado> findByReservaId(Long reservaId);

    List<ServicioContratado> findByClienteId(Long clienteId);

    List<ServicioContratado> findByEstado(com.hotel.app.domain.enumeration.EstadoServicioContratado estado);

    List<ServicioContratado> findByEstadoAndFechaServicioBefore(
            com.hotel.app.domain.enumeration.EstadoServicioContratado estado,
            java.time.ZonedDateTime date);

    long countByServicioIdAndFechaServicioAndEstadoIn(
            Long servicioId,
            java.time.ZonedDateTime fechaServicio,
            List<com.hotel.app.domain.enumeration.EstadoServicioContratado> estados);
}
