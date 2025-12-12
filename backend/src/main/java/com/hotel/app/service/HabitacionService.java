package com.hotel.app.service;

import com.hotel.app.service.dto.HabitacionDTO;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Service Interface for managing {@link com.hotel.app.domain.Habitacion}.
 */
public interface HabitacionService {
    /**
     * Save a habitacion.
     *
     * @param habitacionDTO the entity to save.
     * @return the persisted entity.
     */
    HabitacionDTO save(HabitacionDTO habitacionDTO);

    /**
     * Updates a habitacion.
     *
     * @param habitacionDTO the entity to update.
     * @return the persisted entity.
     */
    HabitacionDTO update(HabitacionDTO habitacionDTO);

    /**
     * Partially updates a habitacion.
     *
     * @param habitacionDTO the entity to update partially.
     * @return the persisted entity.
     */
    Optional<HabitacionDTO> partialUpdate(HabitacionDTO habitacionDTO);

    /**
     * Get all the habitacions.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    Page<HabitacionDTO> findAll(Pageable pageable);

    /**
     * Get all the habitacions with eager load of many-to-many relationships.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    Page<HabitacionDTO> findAllWithEagerRelationships(Pageable pageable);

    /**
     * Get the "id" habitacion.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    Optional<HabitacionDTO> findOne(Long id);

    /**
     * Delete the "id" habitacion.
     *
     * @param id the id of the entity.
     */
    void delete(Long id);
}
