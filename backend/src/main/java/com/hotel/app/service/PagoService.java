package com.hotel.app.service;

import com.hotel.app.service.dto.PagoDTO;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Service Interface for managing {@link com.hotel.app.domain.Pago}.
 */
public interface PagoService {
    /**
     * Save a pago.
     *
     * @param pagoDTO the entity to save.
     * @return the persisted entity.
     */
    PagoDTO save(PagoDTO pagoDTO);

    /**
     * Updates a pago.
     *
     * @param pagoDTO the entity to update.
     * @return the persisted entity.
     */
    PagoDTO update(PagoDTO pagoDTO);

    /**
     * Partially updates a pago.
     *
     * @param pagoDTO the entity to update partially.
     * @return the persisted entity.
     */
    Optional<PagoDTO> partialUpdate(PagoDTO pagoDTO);

    /**
     * Get all the pagos.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    Page<PagoDTO> findAll(Pageable pageable);

    /**
     * Get the "id" pago.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    Optional<PagoDTO> findOne(Long id);

    /**
     * Delete the "id" pago.
     *
     * @param id the id of the entity.
     */
    void delete(Long id);
}
