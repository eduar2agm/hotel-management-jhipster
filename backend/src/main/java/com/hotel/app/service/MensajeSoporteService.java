package com.hotel.app.service;

import com.hotel.app.service.dto.MensajeSoporteDTO;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Service Interface for managing {@link com.hotel.app.domain.MensajeSoporte}.
 */
public interface MensajeSoporteService {
    /**
     * Save a mensajeSoporte.
     *
     * @param mensajeSoporteDTO the entity to save.
     * @return the persisted entity.
     */
    MensajeSoporteDTO save(MensajeSoporteDTO mensajeSoporteDTO);

    /**
     * Updates a mensajeSoporte.
     *
     * @param mensajeSoporteDTO the entity to update.
     * @return the persisted entity.
     */
    MensajeSoporteDTO update(MensajeSoporteDTO mensajeSoporteDTO);

    /**
     * Partially updates a mensajeSoporte.
     *
     * @param mensajeSoporteDTO the entity to update partially.
     * @return the persisted entity.
     */
    Optional<MensajeSoporteDTO> partialUpdate(MensajeSoporteDTO mensajeSoporteDTO);

    /**
     * Get all the mensajeSoportes.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    Page<MensajeSoporteDTO> findAll(Pageable pageable);

    /**
     * Get the "id" mensajeSoporte.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    Optional<MensajeSoporteDTO> findOne(Long id);

    /**
     * Delete the "id" mensajeSoporte.
     *
     * @param id the id of the entity.
     */
    void delete(Long id);

    /**
     * Get all the mensajeSoportes by userId.
     *
     * @param userId   the userId to filter by.
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    Page<MensajeSoporteDTO> findByUserId(String userId, Pageable pageable);

    /**
     * Get all the mensajeSoportes by userId for clients (only sent/received, no
     * unassigned).
     *
     * @param userId   the userId to filter by.
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    Page<MensajeSoporteDTO> findByUserIdOnly(String userId, Pageable pageable);
}
