package com.hotel.app.service;

import com.hotel.app.service.dto.ReservaDTO;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Service Interface for managing {@link com.hotel.app.domain.Reserva}.
 */
public interface ReservaService {
    /**
     * Save a reserva.
     *
     * @param reservaDTO the entity to save.
     * @return the persisted entity.
     */
    ReservaDTO save(ReservaDTO reservaDTO);

    /**
     * Updates a reserva.
     *
     * @param reservaDTO the entity to update.
     * @return the persisted entity.
     */
    ReservaDTO update(ReservaDTO reservaDTO);

    /**
     * Partially updates a reserva.
     *
     * @param reservaDTO the entity to update partially.
     * @return the persisted entity.
     */
    Optional<ReservaDTO> partialUpdate(ReservaDTO reservaDTO);

    /**
     * Get all the reservas.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    Page<ReservaDTO> findAll(Pageable pageable);

    /**
     * Get all the reservas with eager load of many-to-many relationships.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    Page<ReservaDTO> findAllWithEagerRelationships(Pageable pageable);

    /**
     * Get the "id" reserva.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    Optional<ReservaDTO> findOne(Long id);

    /**
     * Delete the "id" reserva.
     *
     * @param id the id of the entity.
     */
    void delete(Long id);

    /**
     * Get all the reservas by clienteId.
     *
     * @param clienteId the id of the client.
     * @param pageable  the pagination information.
     * @return the list of entities.
     */
    Page<ReservaDTO> findAllByClienteId(Long clienteId, Pageable pageable);

    /**
     * Get all the reservas by activo status.
     *
     * @param activo   the active status to filter by.
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    Page<ReservaDTO> findByActivo(Boolean activo, Pageable pageable);

    /**
     * Get all the reservas by activo status with eager load of many-to-many
     * relationships.
     *
     * @param activo   the active status to filter by.
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    Page<ReservaDTO> findByActivoWithEagerRelationships(Boolean activo, Pageable pageable);

    /**
     * Activate the "id" reserva.
     *
     * @param id the id of the entity.
     */
    void activate(Long id);

    /**
     * Deactivate the "id" reserva.
     *
     * @param id the id of the entity.
     */
    void deactivate(Long id);
}
