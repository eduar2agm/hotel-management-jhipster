package com.hotel.app.repository;

import com.hotel.app.domain.CheckInCheckOut;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the CheckInCheckOut entity.
 */
@SuppressWarnings("unused")
@Repository
public interface CheckInCheckOutRepository extends JpaRepository<CheckInCheckOut, Long> {}
