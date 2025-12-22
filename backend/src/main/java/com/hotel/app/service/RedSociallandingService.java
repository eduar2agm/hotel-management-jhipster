package com.hotel.app.service;

import com.hotel.app.service.dto.RedSociallandingDTO;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Service Interface for managing {@link com.hotel.app.domain.RedSociallanding}.
 */
public interface RedSociallandingService {
    /**
     * Save a redSociallanding.
     *
     * @param redSociallandingDTO the entity to save.
     * @return the persisted entity.
     */
    RedSociallandingDTO save(RedSociallandingDTO redSociallandingDTO);

    /**
     * Updates a redSociallanding.
     *
     * @param redSociallandingDTO the entity to update.
     * @return the persisted entity.
     */
    RedSociallandingDTO update(RedSociallandingDTO redSociallandingDTO);

    /**
     * Partially updates a redSociallanding.
     *
     * @param redSociallandingDTO the entity to update partially.
     * @return the persisted entity.
     */
    Optional<RedSociallandingDTO> partialUpdate(RedSociallandingDTO redSociallandingDTO);

    /**
     * Get all the redSociallandings.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    Page<RedSociallandingDTO> findAll(Pageable pageable);

    /**
     * Get the "id" redSociallanding.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    Optional<RedSociallandingDTO> findOne(Long id);

    /**
     * Delete the "id" redSociallanding.
     *
     * @param id the id of the entity.
     */
    void delete(Long id);
}
