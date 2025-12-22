package com.hotel.app.service;

import com.hotel.app.service.dto.TelefonoDTO;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Service Interface for managing {@link com.hotel.app.domain.Telefono}.
 */
public interface TelefonoService {
    /**
     * Save a telefono.
     *
     * @param telefonoDTO the entity to save.
     * @return the persisted entity.
     */
    TelefonoDTO save(TelefonoDTO telefonoDTO);

    /**
     * Updates a telefono.
     *
     * @param telefonoDTO the entity to update.
     * @return the persisted entity.
     */
    TelefonoDTO update(TelefonoDTO telefonoDTO);

    /**
     * Partially updates a telefono.
     *
     * @param telefonoDTO the entity to update partially.
     * @return the persisted entity.
     */
    Optional<TelefonoDTO> partialUpdate(TelefonoDTO telefonoDTO);

    /**
     * Get all the telefonos.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    Page<TelefonoDTO> findAll(Pageable pageable);

    /**
     * Get the "id" telefono.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    Optional<TelefonoDTO> findOne(Long id);

    /**
     * Delete the "id" telefono.
     *
     * @param id the id of the entity.
     */
    void delete(Long id);
}
