package com.hotel.app.repository;

import com.hotel.app.domain.Servicio;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Servicio entity.
 */
@SuppressWarnings("unused")
@Repository
public interface ServicioRepository extends JpaRepository<Servicio, Long> {
    Page<Servicio> findAllByDisponible(Boolean disponible, Pageable pageable);

    Page<Servicio> findAllByTipoAndDisponible(com.hotel.app.domain.enumeration.TipoServicio tipo, Boolean disponible,
            Pageable pageable);

    Page<Servicio> findAllByTipo(com.hotel.app.domain.enumeration.TipoServicio tipo, Pageable pageable);
}
