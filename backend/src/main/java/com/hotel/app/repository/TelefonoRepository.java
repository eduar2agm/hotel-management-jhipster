package com.hotel.app.repository;

import com.hotel.app.domain.Telefono;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Telefono entity.
 */
@SuppressWarnings("unused")
@Repository
public interface TelefonoRepository extends JpaRepository<Telefono, Long> {}
