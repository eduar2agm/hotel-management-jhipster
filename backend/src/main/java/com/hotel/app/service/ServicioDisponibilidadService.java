package com.hotel.app.service;

import com.hotel.app.service.dto.ServicioDisponibilidadDTO;
import java.util.Optional;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Service Interface for managing
 * {@link com.hotel.app.domain.ServicioDisponibilidad}.
 */
public interface ServicioDisponibilidadService {

    /**
     * Save a servicioDisponibilidad.
     *
     * @param servicioDisponibilidadDTO the entity to save.
     * @return the persisted entity.
     */
    ServicioDisponibilidadDTO save(ServicioDisponibilidadDTO servicioDisponibilidadDTO);

    /**
     * Updates a servicioDisponibilidad.
     *
     * @param servicioDisponibilidadDTO the entity to update.
     * @return the persisted entity.
     */
    ServicioDisponibilidadDTO update(ServicioDisponibilidadDTO servicioDisponibilidadDTO);

    /**
     * Partially updates a servicioDisponibilidad.
     *
     * @param servicioDisponibilidadDTO the entity to update partially.
     * @return the persisted entity.
     */
    Optional<ServicioDisponibilidadDTO> partialUpdate(ServicioDisponibilidadDTO servicioDisponibilidadDTO);

    /**
     * Get all the servicioDisponibilidads.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    Page<ServicioDisponibilidadDTO> findAll(Pageable pageable);

    /**
     * Get the "id" servicioDisponibilidad.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    Optional<ServicioDisponibilidadDTO> findOne(Long id);

    /**
     * Delete the "id" servicioDisponibilidad.
     *
     * @param id the id of the entity.
     */
    void delete(Long id);

    /**
     * Get all disponibilidad for a specific service.
     *
     * @param servicioId the service id
     * @return list of availabilities
     */
    List<ServicioDisponibilidadDTO> findByServicioId(Long servicioId);
}
