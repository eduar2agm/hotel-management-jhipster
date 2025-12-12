package com.hotel.app.repository;

import com.hotel.app.domain.MensajeSoporte;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the MensajeSoporte entity.
 */
@SuppressWarnings("unused")
@Repository
public interface MensajeSoporteRepository extends JpaRepository<MensajeSoporte, Long> {}
