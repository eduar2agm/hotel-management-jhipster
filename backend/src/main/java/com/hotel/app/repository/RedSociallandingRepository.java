package com.hotel.app.repository;

import com.hotel.app.domain.RedSociallanding;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the RedSociallanding entity.
 */
@SuppressWarnings("unused")
@Repository
public interface RedSociallandingRepository extends JpaRepository<RedSociallanding, Long> {}
