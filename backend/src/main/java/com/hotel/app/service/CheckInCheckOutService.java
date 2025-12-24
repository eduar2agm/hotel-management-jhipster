package com.hotel.app.service;

import com.hotel.app.service.dto.CheckInCheckOutDTO;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Service Interface for managing {@link com.hotel.app.domain.CheckInCheckOut}.
 */
public interface CheckInCheckOutService {
    /**
     * Save a checkInCheckOut.
     *
     * @param checkInCheckOutDTO the entity to save.
     * @return the persisted entity.
     */
    CheckInCheckOutDTO save(CheckInCheckOutDTO checkInCheckOutDTO);

    /**
     * Updates a checkInCheckOut.
     *
     * @param checkInCheckOutDTO the entity to update.
     * @return the persisted entity.
     */
    CheckInCheckOutDTO update(CheckInCheckOutDTO checkInCheckOutDTO);

    /**
     * Partially updates a checkInCheckOut.
     *
     * @param checkInCheckOutDTO the entity to update partially.
     * @return the persisted entity.
     */
    Optional<CheckInCheckOutDTO> partialUpdate(CheckInCheckOutDTO checkInCheckOutDTO);

    /**
     * Get all the checkInCheckOuts.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    Page<CheckInCheckOutDTO> findAll(Pageable pageable);

    /**
     * Get the "id" checkInCheckOut.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    Optional<CheckInCheckOutDTO> findOne(Long id);

    /**
     * Delete the "id" checkInCheckOut.
     *
     * @param id the id of the entity.
     */
    void delete(Long id);

    /**
     * Get the checkInCheckOut by reservaDetalleId.
     *
     * @param reservaDetalleId the id of the reservaDetalle.
     * @return the entity.
     */
    Optional<CheckInCheckOutDTO> findOneByReservaDetalleId(Long reservaDetalleId);
}
