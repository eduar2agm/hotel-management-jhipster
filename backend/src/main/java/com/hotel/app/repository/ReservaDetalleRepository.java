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

    @Query(value = "select reservaDetalle from ReservaDetalle reservaDetalle left join fetch reservaDetalle.habitacion h left join fetch h.categoriaHabitacion", countQuery = "select count(reservaDetalle) from ReservaDetalle reservaDetalle")
    Page<ReservaDetalle> findAllWithToOneRelationships(Pageable pageable);

    @Query("select reservaDetalle from ReservaDetalle reservaDetalle left join fetch reservaDetalle.habitacion h left join fetch h.categoriaHabitacion")
    List<ReservaDetalle> findAllWithToOneRelationships();

    @Query("select reservaDetalle from ReservaDetalle reservaDetalle left join fetch reservaDetalle.habitacion h left join fetch h.categoriaHabitacion where reservaDetalle.id = :id")
    Optional<ReservaDetalle> findOneWithToOneRelationships(@Param("id") Long id);

    @Query("select reservaDetalle from ReservaDetalle reservaDetalle left join fetch reservaDetalle.habitacion h left join fetch h.categoriaHabitacion where reservaDetalle.reserva.id = :reservaId")
    Page<ReservaDetalle> findAllByReservaId(@Param("reservaId") Long reservaId, Pageable pageable);

    Page<ReservaDetalle> findByActivo(Boolean activo, Pageable pageable);

    @Query("select reservaDetalle from ReservaDetalle reservaDetalle where reservaDetalle.reserva.id = :reservaId")
    List<ReservaDetalle> findAllByReservaId(@Param("reservaId") Long reservaId);

    @Query(value = "select reservaDetalle from ReservaDetalle reservaDetalle left join fetch reservaDetalle.habitacion h left join fetch h.categoriaHabitacion where reservaDetalle.activo = :activo", countQuery = "select count(reservaDetalle) from ReservaDetalle reservaDetalle where reservaDetalle.activo = :activo")
    Page<ReservaDetalle> findByActivoWithEagerRelationships(@Param("activo") Boolean activo, Pageable pageable);

    /**
     * Verifica si existe algún detalle de reserva asociado a una habitación.
     *
     * @param habitacionId ID de la habitación
     * @return true si hay al menos un detalle de reserva que referencia esta
     *         habitación
     */
    boolean existsByHabitacion_Id(Long habitacionId);

    @Query("select distinct rd.habitacion.id from ReservaDetalle rd " +
            "where rd.reserva.activo = true " +
            "and rd.activo = true " +
            "and rd.reserva.estado <> 'CANCELADA' " +
            "and rd.reserva.fechaInicio <= :fechaFin " +
            "and rd.reserva.fechaFin >= :fechaInicio")
    List<Long> findOccupiedHabitacionIds(@Param("fechaInicio") java.time.Instant fechaInicio,
            @Param("fechaFin") java.time.Instant fechaFin);
}
