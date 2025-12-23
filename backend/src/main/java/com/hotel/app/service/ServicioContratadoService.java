package com.hotel.app.service;

import com.hotel.app.service.dto.ServicioContratadoDTO;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Service Interface for managing
 * {@link com.hotel.app.domain.ServicioContratado}.
 */
public interface ServicioContratadoService {
    /**
     * Save a servicioContratado.
     *
     * @param servicioContratadoDTO the entity to save.
     * @return the persisted entity.
     */
    ServicioContratadoDTO save(ServicioContratadoDTO servicioContratadoDTO);

    /**
     * Updates a servicioContratado.
     *
     * @param servicioContratadoDTO the entity to update.
     * @return the persisted entity.
     */
    ServicioContratadoDTO update(ServicioContratadoDTO servicioContratadoDTO);

    /**
     * Partially updates a servicioContratado.
     *
     * @param servicioContratadoDTO the entity to update partially.
     * @return the persisted entity.
     */
    Optional<ServicioContratadoDTO> partialUpdate(ServicioContratadoDTO servicioContratadoDTO);

    /**
     * Get all the servicioContratados.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    Page<ServicioContratadoDTO> findAll(Pageable pageable);

    /**
     * Get all the servicioContratados with eager load of many-to-many
     * relationships.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    Page<ServicioContratadoDTO> findAllWithEagerRelationships(Pageable pageable);

    /**
     * Get the "id" servicioContratado.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    Optional<ServicioContratadoDTO> findOne(Long id);

    /**
     * Delete the "id" servicioContratado.
     *
     * @param id the id of the entity.
     */
    void delete(Long id);

    /**
     * Get all the servicioContratados by reserva id.
     *
     * @param reservaId the id of the reserva.
     * @return the list of entities.
     */
    java.util.List<ServicioContratadoDTO> findByReservaId(Long reservaId);

    /**
     * Get all the servicioContratados by cliente id.
     *
     * @param clienteId the id of the cliente.
     * @return the list of entities.
     */
    java.util.List<ServicioContratadoDTO> findByClienteId(Long clienteId);

    /**
     * Confirm a servicioContratado.
     *
     * @param id the id of the entity.
     */
    void confirmar(Long id);

    /**
     * Complete a servicioContratado.
     *
     * @param id the id of the entity.
     */
    void completar(Long id);

    /**
     * Complete a servicioContratado with a specific notification message.
     *
     * @param id              the id of the entity.
     * @param notificationKey the key of the message template to send.
     */
    void completar(Long id, String notificationKey);

    /**
     * Cancel a servicioContratado.
     *
     * @param id the id of the entity.
     */
    void cancelar(Long id);

    /**
     * Get all servicios contratados by cliente and servicio in a date range.
     * Excludes cancelled services.
     *
     * @param clienteId   the id of the cliente.
     * @param servicioId  the id of the servicio.
     * @param fechaInicio start date.
     * @param fechaFin    end date.
     * @return the list of entities.
     */
    java.util.List<ServicioContratadoDTO> findByClienteAndServicioAndFechaRange(
            Long clienteId,
            Long servicioId,
            java.time.ZonedDateTime fechaInicio,
            java.time.ZonedDateTime fechaFin);
}
