package com.hotel.app.repository;

import com.hotel.app.domain.Cliente;
import java.util.Optional;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Spring Data JPA repository for the Cliente entity.
 */
@SuppressWarnings("unused")
@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Long> {
    Optional<Cliente> findOneByCorreo(String correo);

    Optional<Cliente> findOneByKeycloakId(String keycloakId);

    Page<Cliente> findByActivo(Boolean activo, Pageable pageable);
}
