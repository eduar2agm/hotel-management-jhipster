package com.hotel.app.repository;

import com.hotel.app.domain.SeccionHero;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the SeccionHero entity.
 */
@SuppressWarnings("unused")
@Repository
public interface SeccionHeroRepository extends JpaRepository<SeccionHero, Long> {}
