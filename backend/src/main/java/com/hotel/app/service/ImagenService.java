package com.hotel.app.service;

import com.hotel.app.service.dto.ImagenDTO;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Service Interface for managing {@link com.hotel.app.domain.Imagen}.
 */
public interface ImagenService {
    /**
     * Save a imagen.
     *
     * @param imagenDTO the entity to save.
     * @return the persisted entity.
     */
    ImagenDTO save(ImagenDTO imagenDTO);

    /**
     * Updates a imagen.
     *
     * @param imagenDTO the entity to update.
     * @return the persisted entity.
     */
    ImagenDTO update(ImagenDTO imagenDTO);

    /**
     * Partially updates a imagen.
     *
     * @param imagenDTO the entity to update partially.
     * @return the persisted entity.
     */
    Optional<ImagenDTO> partialUpdate(ImagenDTO imagenDTO);

    /**
     * Get all the imagens.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    Page<ImagenDTO> findAll(Pageable pageable);

    /**
     * Get all the imagens with eager load of many-to-many relationships.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    Page<ImagenDTO> findAllWithEagerRelationships(Pageable pageable);

    /**
     * Get the "id" imagen.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    Optional<ImagenDTO> findOne(Long id);

    /**
     * Delete the "id" imagen.
     *
     * @param id the id of the entity.
     */
    void delete(Long id);
}
