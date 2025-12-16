package com.hotel.app.service;

import com.hotel.app.service.dto.ReservaDetalleDTO;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Service Interface for managing {@link com.hotel.app.domain.ReservaDetalle}.
 */
public interface ReservaDetalleService {
    /**
     * Save a reservaDetalle.
     *
     * @param reservaDetalleDTO the entity to save.
     * @return the persisted entity.
     */
    ReservaDetalleDTO save(ReservaDetalleDTO reservaDetalleDTO);

    /**
     * Updates a reservaDetalle.
     *
     * @param reservaDetalleDTO the entity to update.
     * @return the persisted entity.
     */
    ReservaDetalleDTO update(ReservaDetalleDTO reservaDetalleDTO);

    /**
     * Partially updates a reservaDetalle.
     *
     * @param reservaDetalleDTO the entity to update partially.
     * @return the persisted entity.
     */
    Optional<ReservaDetalleDTO> partialUpdate(ReservaDetalleDTO reservaDetalleDTO);

    /**
     * Get all the reservaDetalles.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    Page<ReservaDetalleDTO> findAll(Pageable pageable);

    /**
     * Get all the reservaDetalles with eager load of many-to-many relationships.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    Page<ReservaDetalleDTO> findAllWithEagerRelationships(Pageable pageable);

    /**
     * Get all the reservaDetalles by reservaId.
     *
     * @param reservaId the reserva id.
     * @param pageable  the pagination information.
     * @return the list of entities.
     */
    Page<ReservaDetalleDTO> findAllByReservaId(Long reservaId, Pageable pageable);

    /**
     * Get the "id" reservaDetalle.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    Optional<ReservaDetalleDTO> findOne(Long id);

    /**
     * Delete the "id" reservaDetalle.
     *
     * @param id the id of the entity.
     */
    void delete(Long id);

    /**
     * Get all the reservaDetalles by activo status.
     *
     * @param activo   the active status to filter by.
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    Page<ReservaDetalleDTO> findByActivo(Boolean activo, Pageable pageable);

    /**
     * Get all the reservaDetalles by activo status with eager load of many-to-many
     * relationships.
     *
     * @param activo   the active status to filter by.
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    Page<ReservaDetalleDTO> findByActivoWithEagerRelationships(Boolean activo, Pageable pageable);
}
