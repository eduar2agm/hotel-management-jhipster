package com.hotel.app.service;

import com.hotel.app.service.dto.CategoriaHabitacionDTO;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Service Interface for managing
 * {@link com.hotel.app.domain.CategoriaHabitacion}.
 */
public interface CategoriaHabitacionService {
    /**
     * Save a categoriaHabitacion.
     *
     * @param categoriaHabitacionDTO the entity to save.
     * @return the persisted entity.
     */
    CategoriaHabitacionDTO save(CategoriaHabitacionDTO categoriaHabitacionDTO);

    /**
     * Updates a categoriaHabitacion.
     *
     * @param categoriaHabitacionDTO the entity to update.
     * @return the persisted entity.
     */
    CategoriaHabitacionDTO update(CategoriaHabitacionDTO categoriaHabitacionDTO);

    /**
     * Partially updates a categoriaHabitacion.
     *
     * @param categoriaHabitacionDTO the entity to update partially.
     * @return the persisted entity.
     */
    Optional<CategoriaHabitacionDTO> partialUpdate(CategoriaHabitacionDTO categoriaHabitacionDTO);

    /**
     * Get all the categoriaHabitacions.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    Page<CategoriaHabitacionDTO> findAll(Pageable pageable);

    /**
     * Get the "id" categoriaHabitacion.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    Optional<CategoriaHabitacionDTO> findOne(Long id);

    /**
     * Delete the "id" categoriaHabitacion.
     *
     * @param id the id of the entity.
     */
    void delete(Long id);

    /**
     * Activate the "id" categoriaHabitacion.
     *
     * @param id the id of the entity.
     */
    void activate(Long id);

    /**
     * Deactivate the "id" categoriaHabitacion.
     *
     * @param id the id of the entity.
     */
    void deactivate(Long id);

    /**
     * Get all the categoriaHabitacions by activo status.
     *
     * @param activo   the active status to filter by.
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    Page<CategoriaHabitacionDTO> findByActivo(Boolean activo, Pageable pageable);
}
