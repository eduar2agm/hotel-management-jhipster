package com.hotel.app.repository;

import com.hotel.app.domain.CheckInCheckOut;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the CheckInCheckOut entity.
 */
@SuppressWarnings("unused")
@Repository
public interface CheckInCheckOutRepository extends JpaRepository<CheckInCheckOut, Long> {

    /**
     * Verifica si existe un check-in activo sin check-out para una habitación
     * específica.
     * Esto indica que la habitación está actualmente ocupada por un huésped.
     *
     * @param habitacionId ID de la habitación a verificar
     * @return true si hay un huésped ocupando la habitación, false en caso
     *         contrario
     */
    boolean existsByReservaDetalle_Habitacion_IdAndFechaHoraCheckOutIsNullAndActivoTrue(Long habitacionId);

    java.util.Optional<CheckInCheckOut> findByReservaDetalleId(Long reservaDetalleId);
}
