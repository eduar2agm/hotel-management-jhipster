package com.hotel.app.service;

import com.hotel.app.service.dto.EstadoHabitacionDTO;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Service Interface for managing {@link com.hotel.app.domain.EstadoHabitacion}.
 */
public interface EstadoHabitacionService {
    /**
     * Save a estadoHabitacion.
     *
     * @param estadoHabitacionDTO the entity to save.
     * @return the persisted entity.
     */
    EstadoHabitacionDTO save(EstadoHabitacionDTO estadoHabitacionDTO);

    /**
     * Updates a estadoHabitacion.
     *
     * @param estadoHabitacionDTO the entity to update.
     * @return the persisted entity.
     */
    EstadoHabitacionDTO update(EstadoHabitacionDTO estadoHabitacionDTO);

    /**
     * Partially updates a estadoHabitacion.
     *
     * @param estadoHabitacionDTO the entity to update partially.
     * @return the persisted entity.
     */
    Optional<EstadoHabitacionDTO> partialUpdate(EstadoHabitacionDTO estadoHabitacionDTO);

    /**
     * Get all the estadoHabitacions.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    Page<EstadoHabitacionDTO> findAll(Pageable pageable);

    /**
     * Get the "id" estadoHabitacion.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    Optional<EstadoHabitacionDTO> findOne(Long id);

    /**
     * Delete the "id" estadoHabitacion.
     *
     * @param id the id of the entity.
     */
    void delete(Long id);

    /**
     * Activate the "id" estadoHabitacion.
     *
     * @param id the id of the entity.
     */
    void activate(Long id);

    /**
     * Deactivate the "id" estadoHabitacion.
     *
     * @param id the id of the entity.
     */
    void deactivate(Long id);
}
