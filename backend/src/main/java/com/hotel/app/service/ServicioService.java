package com.hotel.app.service;

import com.hotel.app.service.dto.ServicioDTO;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Service Interface for managing {@link com.hotel.app.domain.Servicio}.
 */
public interface ServicioService {
    /**
     * Save a servicio.
     *
     * @param servicioDTO the entity to save.
     * @return the persisted entity.
     */
    ServicioDTO save(ServicioDTO servicioDTO);

    /**
     * Updates a servicio.
     *
     * @param servicioDTO the entity to update.
     * @return the persisted entity.
     */
    ServicioDTO update(ServicioDTO servicioDTO);

    /**
     * Partially updates a servicio.
     *
     * @param servicioDTO the entity to update partially.
     * @return the persisted entity.
     */
    Optional<ServicioDTO> partialUpdate(ServicioDTO servicioDTO);

    /**
     * Get all the servicios.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    Page<ServicioDTO> findAll(Pageable pageable);

    /**
     * Get the "id" servicio.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    Optional<ServicioDTO> findOne(Long id);

    /**
     * Delete the "id" servicio.
     *
     * @param id the id of the entity.
     */
    void delete(Long id);

    /**
     * Get all available servicios.
     *
     * @param pageable the pagination information.
     * @return the list of available entities.
     */
    Page<ServicioDTO> findAllByDisponible(Pageable pageable);

    /**
     * Get all servicios by type and availability.
     *
     * @param tipo       the type of service.
     * @param disponible availability status.
     * @param pageable   the pagination information.
     * @return the list of entities.
     */
    Page<ServicioDTO> findAllByTipoAndDisponible(com.hotel.app.domain.enumeration.TipoServicio tipo, Boolean disponible,
            Pageable pageable);

    /**
     * Get all servicios by type.
     *
     * @param tipo     the type of service.
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    Page<ServicioDTO> findAllByTipo(com.hotel.app.domain.enumeration.TipoServicio tipo, Pageable pageable);
}
