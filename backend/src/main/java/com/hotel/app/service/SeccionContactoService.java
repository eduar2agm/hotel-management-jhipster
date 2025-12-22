package com.hotel.app.service;

import com.hotel.app.service.dto.SeccionContactoDTO;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Service Interface for managing {@link com.hotel.app.domain.SeccionContacto}.
 */
public interface SeccionContactoService {
    /**
     * Save a seccionContacto.
     *
     * @param seccionContactoDTO the entity to save.
     * @return the persisted entity.
     */
    SeccionContactoDTO save(SeccionContactoDTO seccionContactoDTO);

    /**
     * Updates a seccionContacto.
     *
     * @param seccionContactoDTO the entity to update.
     * @return the persisted entity.
     */
    SeccionContactoDTO update(SeccionContactoDTO seccionContactoDTO);

    /**
     * Partially updates a seccionContacto.
     *
     * @param seccionContactoDTO the entity to update partially.
     * @return the persisted entity.
     */
    Optional<SeccionContactoDTO> partialUpdate(SeccionContactoDTO seccionContactoDTO);

    /**
     * Get all the seccionContactos.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    Page<SeccionContactoDTO> findAll(Pageable pageable);

    /**
     * Get the "id" seccionContacto.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    Optional<SeccionContactoDTO> findOne(Long id);

    /**
     * Delete the "id" seccionContacto.
     *
     * @param id the id of the entity.
     */
    void delete(Long id);
}
