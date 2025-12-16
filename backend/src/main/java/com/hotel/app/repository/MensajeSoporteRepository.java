package com.hotel.app.repository;

import com.hotel.app.domain.MensajeSoporte;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the MensajeSoporte entity.
 */
@SuppressWarnings("unused")
@Repository
public interface MensajeSoporteRepository extends JpaRepository<MensajeSoporte, Long> {
        org.springframework.data.domain.Page<MensajeSoporte> findByUserIdOrDestinatarioId(
                        String userId, String destinatarioId, org.springframework.data.domain.Pageable pageable);

        @Query("SELECT m FROM MensajeSoporte m WHERE m.userId = :userId OR m.destinatarioId = :userId OR (m.destinatarioId IS NULL AND m.userId <> :userId)")
        org.springframework.data.domain.Page<MensajeSoporte> findByUserIdOrDestinatarioIdOrNoDestinatario(
                        @Param("userId") String userId, org.springframework.data.domain.Pageable pageable);

        // For clients - only their sent and received messages (no unassigned messages)
        @Query("SELECT m FROM MensajeSoporte m WHERE m.userId = :userId OR m.destinatarioId = :userId")
        org.springframework.data.domain.Page<MensajeSoporte> findByUserIdOrDestinatarioIdOnly(
                        @Param("userId") String userId, org.springframework.data.domain.Pageable pageable);

        org.springframework.data.domain.Page<MensajeSoporte> findByActivo(Boolean activo,
                        org.springframework.data.domain.Pageable pageable);
}
