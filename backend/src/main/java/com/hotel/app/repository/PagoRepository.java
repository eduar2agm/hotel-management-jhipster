package com.hotel.app.repository;

import com.hotel.app.domain.Pago;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import java.util.Optional;

/**
 * Spring Data JPA repository for the Pago entity.
 */
@SuppressWarnings("unused")
@Repository
public interface PagoRepository extends JpaRepository<Pago, Long> {
    Optional<Pago> findByTransactionId(String transactionId);
}
