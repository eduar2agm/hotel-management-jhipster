package com.hotel.app.repository;

import com.hotel.app.domain.SeccionContacto;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the SeccionContacto entity.
 */
@SuppressWarnings("unused")
@Repository
public interface SeccionContactoRepository extends JpaRepository<SeccionContacto, Long> {}
