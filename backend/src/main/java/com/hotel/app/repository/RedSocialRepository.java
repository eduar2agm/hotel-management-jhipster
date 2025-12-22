package com.hotel.app.repository;

import com.hotel.app.domain.RedSocial;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the RedSocial entity.
 */
@SuppressWarnings("unused")
@Repository
public interface RedSocialRepository extends JpaRepository<RedSocial, Long> {}
