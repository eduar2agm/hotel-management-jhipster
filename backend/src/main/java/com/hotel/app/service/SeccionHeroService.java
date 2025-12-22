package com.hotel.app.service;

import com.hotel.app.service.dto.SeccionHeroDTO;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Service Interface for managing {@link com.hotel.app.domain.SeccionHero}.
 */
public interface SeccionHeroService {
    /**
     * Save a seccionHero.
     *
     * @param seccionHeroDTO the entity to save.
     * @return the persisted entity.
     */
    SeccionHeroDTO save(SeccionHeroDTO seccionHeroDTO);

    /**
     * Updates a seccionHero.
     *
     * @param seccionHeroDTO the entity to update.
     * @return the persisted entity.
     */
    SeccionHeroDTO update(SeccionHeroDTO seccionHeroDTO);

    /**
     * Partially updates a seccionHero.
     *
     * @param seccionHeroDTO the entity to update partially.
     * @return the persisted entity.
     */
    Optional<SeccionHeroDTO> partialUpdate(SeccionHeroDTO seccionHeroDTO);

    /**
     * Get all the seccionHeroes.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    Page<SeccionHeroDTO> findAll(Pageable pageable);

    /**
     * Get the "id" seccionHero.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    Optional<SeccionHeroDTO> findOne(Long id);

    /**
     * Delete the "id" seccionHero.
     *
     * @param id the id of the entity.
     */
    void delete(Long id);
}
