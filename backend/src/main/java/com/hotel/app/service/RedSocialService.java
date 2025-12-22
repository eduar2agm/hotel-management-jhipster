package com.hotel.app.service;

import com.hotel.app.service.dto.RedSocialDTO;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Service Interface for managing {@link com.hotel.app.domain.RedSocial}.
 */
public interface RedSocialService {
    /**
     * Save a redSocial.
     *
     * @param redSocialDTO the entity to save.
     * @return the persisted entity.
     */
    RedSocialDTO save(RedSocialDTO redSocialDTO);

    /**
     * Updates a redSocial.
     *
     * @param redSocialDTO the entity to update.
     * @return the persisted entity.
     */
    RedSocialDTO update(RedSocialDTO redSocialDTO);

    /**
     * Partially updates a redSocial.
     *
     * @param redSocialDTO the entity to update partially.
     * @return the persisted entity.
     */
    Optional<RedSocialDTO> partialUpdate(RedSocialDTO redSocialDTO);

    /**
     * Get all the redSocials.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    Page<RedSocialDTO> findAll(Pageable pageable);

    /**
     * Get the "id" redSocial.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    Optional<RedSocialDTO> findOne(Long id);

    /**
     * Delete the "id" redSocial.
     *
     * @param id the id of the entity.
     */
    void delete(Long id);
}
