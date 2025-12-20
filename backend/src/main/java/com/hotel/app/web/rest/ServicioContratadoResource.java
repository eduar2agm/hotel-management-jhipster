package com.hotel.app.web.rest;

import com.hotel.app.repository.ServicioContratadoRepository;
import com.hotel.app.service.ServicioContratadoService;
import com.hotel.app.service.dto.ServicioContratadoDTO;
import com.hotel.app.web.rest.errors.BadRequestAlertException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.security.access.prepost.PreAuthorize;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link com.hotel.app.domain.ServicioContratado}.
 */
@RestController
@RequestMapping("/api/servicio-contratados")
public class ServicioContratadoResource {

    private static final Logger LOG = LoggerFactory.getLogger(ServicioContratadoResource.class);

    private static final String ENTITY_NAME = "hotelAppServicioContratado";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final ServicioContratadoService servicioContratadoService;

    private final ServicioContratadoRepository servicioContratadoRepository;

    public ServicioContratadoResource(
            ServicioContratadoService servicioContratadoService,
            ServicioContratadoRepository servicioContratadoRepository) {
        this.servicioContratadoService = servicioContratadoService;
        this.servicioContratadoRepository = servicioContratadoRepository;
    }

    /**
     * {@code POST  /servicio-contratados} : Create a new servicioContratado.
     *
     * @param servicioContratadoDTO the servicioContratadoDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with
     *         body the new servicioContratadoDTO, or with status
     *         {@code 400 (Bad Request)} if the servicioContratado has already an
     *         ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_EMPLOYEE', 'ROLE_CLIENT')")
    public ResponseEntity<ServicioContratadoDTO> createServicioContratado(
            @Valid @RequestBody ServicioContratadoDTO servicioContratadoDTO)
            throws URISyntaxException {
        LOG.debug("REST request to save ServicioContratado : {}", servicioContratadoDTO);
        if (servicioContratadoDTO.getId() != null) {
            throw new BadRequestAlertException("A new servicioContratado cannot already have an ID", ENTITY_NAME,
                    "idexists");
        }
        servicioContratadoDTO = servicioContratadoService.save(servicioContratadoDTO);
        return ResponseEntity.created(new URI("/api/servicio-contratados/" + servicioContratadoDTO.getId()))
                .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME,
                        servicioContratadoDTO.getId().toString()))
                .body(servicioContratadoDTO);
    }

    /**
     * {@code PUT  /servicio-contratados/:id} : Updates an existing
     * servicioContratado.
     *
     * @param id                    the id of the servicioContratadoDTO to save.
     * @param servicioContratadoDTO the servicioContratadoDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body
     *         the updated servicioContratadoDTO,
     *         or with status {@code 400 (Bad Request)} if the servicioContratadoDTO
     *         is not valid,
     *         or with status {@code 500 (Internal Server Error)} if the
     *         servicioContratadoDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_EMPLOYEE')")
    public ResponseEntity<ServicioContratadoDTO> updateServicioContratado(
            @PathVariable(value = "id", required = false) final Long id,
            @Valid @RequestBody ServicioContratadoDTO servicioContratadoDTO) throws URISyntaxException {
        LOG.debug("REST request to update ServicioContratado : {}, {}", id, servicioContratadoDTO);
        if (servicioContratadoDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, servicioContratadoDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!servicioContratadoRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        servicioContratadoDTO = servicioContratadoService.update(servicioContratadoDTO);
        return ResponseEntity.ok()
                .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME,
                        servicioContratadoDTO.getId().toString()))
                .body(servicioContratadoDTO);
    }

    /**
     * {@code PATCH  /servicio-contratados/:id} : Partial updates given fields of an
     * existing servicioContratado, field will ignore if it is null
     *
     * @param id                    the id of the servicioContratadoDTO to save.
     * @param servicioContratadoDTO the servicioContratadoDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body
     *         the updated servicioContratadoDTO,
     *         or with status {@code 400 (Bad Request)} if the servicioContratadoDTO
     *         is not valid,
     *         or with status {@code 404 (Not Found)} if the servicioContratadoDTO
     *         is not found,
     *         or with status {@code 500 (Internal Server Error)} if the
     *         servicioContratadoDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_EMPLOYEE')")
    public ResponseEntity<ServicioContratadoDTO> partialUpdateServicioContratado(
            @PathVariable(value = "id", required = false) final Long id,
            @NotNull @RequestBody ServicioContratadoDTO servicioContratadoDTO) throws URISyntaxException {
        LOG.debug("REST request to partial update ServicioContratado partially : {}, {}", id, servicioContratadoDTO);
        if (servicioContratadoDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, servicioContratadoDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!servicioContratadoRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<ServicioContratadoDTO> result = servicioContratadoService.partialUpdate(servicioContratadoDTO);

        return ResponseUtil.wrapOrNotFound(
                result,
                HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME,
                        servicioContratadoDTO.getId().toString()));
    }

    /**
     * {@code GET  /servicio-contratados} : get all the servicioContratados.
     *
     * @param pageable  the pagination information.
     * @param eagerload flag to eager load entities from relationships (This is
     *                  applicable for many-to-many).
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list
     *         of servicioContratados in body.
     */
    @GetMapping("")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_EMPLOYEE')")
    public ResponseEntity<List<ServicioContratadoDTO>> getAllServicioContratados(
            @org.springdoc.core.annotations.ParameterObject Pageable pageable,
            @RequestParam(name = "eagerload", required = false, defaultValue = "true") boolean eagerload) {
        LOG.debug("REST request to get a page of ServicioContratados");
        Page<ServicioContratadoDTO> page;
        if (eagerload) {
            page = servicioContratadoService.findAllWithEagerRelationships(pageable);
        } else {
            page = servicioContratadoService.findAll(pageable);
        }
        HttpHeaders headers = PaginationUtil
                .generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /servicio-contratados/:id} : get the "id" servicioContratado.
     *
     * @param id the id of the servicioContratadoDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body
     *         the servicioContratadoDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_EMPLOYEE', 'ROLE_CLIENT')")
    public ResponseEntity<ServicioContratadoDTO> getServicioContratado(@PathVariable("id") Long id) {
        LOG.debug("REST request to get ServicioContratado : {}", id);
        Optional<ServicioContratadoDTO> servicioContratadoDTO = servicioContratadoService.findOne(id);
        return ResponseUtil.wrapOrNotFound(servicioContratadoDTO);
    }

    /**
     * {@code DELETE  /servicio-contratados/:id} : delete the "id"
     * servicioContratado.
     *
     * @param id the id of the servicioContratadoDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> deleteServicioContratado(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete ServicioContratado : {}", id);
        servicioContratadoService.delete(id);
        return ResponseEntity.noContent()
                .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
                .build();
    }

    /**
     * {@code GET  /servicio-contratados/reserva/:reservaId} : get all the
     * servicioContratados by reservaId.
     *
     * @param reservaId the id of the reserva.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list
     *         of servicioContratados in body.
     */
    @GetMapping("/reserva/{reservaId}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_EMPLOYEE', 'ROLE_CLIENT')")
    public ResponseEntity<List<ServicioContratadoDTO>> getServicioContratadosByReserva(
            @PathVariable("reservaId") Long reservaId) {
        LOG.debug("REST request to get ServicioContratados by Reserva : {}", reservaId);
        List<ServicioContratadoDTO> list = servicioContratadoService.findByReservaId(reservaId);
        return ResponseEntity.ok().body(list);
    }

    /**
     * {@code PUT  /servicio-contratados/:id/confirmar} : Confirm the "id"
     * servicioContratado.
     *
     * @param id the id of the servicioContratado to confirm.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)}.
     */
    @PutMapping("/{id}/confirmar")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_EMPLOYEE')")
    public ResponseEntity<Void> confirmServicioContratado(@PathVariable("id") Long id) {
        LOG.debug("REST request to confirm ServicioContratado : {}", id);
        servicioContratadoService.confirmar(id);
        return ResponseEntity.ok().build();
    }

    /**
     * {@code PUT  /servicio-contratados/:id/completar} : Complete the "id"
     * servicioContratado.
     *
     * @param id the id of the servicioContratado to complete.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)}.
     */
    @PutMapping("/{id}/completar")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_EMPLOYEE')")
    public ResponseEntity<Void> completeServicioContratado(@PathVariable("id") Long id) {
        LOG.debug("REST request to complete ServicioContratado : {}", id);
        servicioContratadoService.completar(id);
        return ResponseEntity.ok().build();
    }

    /**
     * {@code PUT  /servicio-contratados/:id/cancelar} : Cancel the "id"
     * servicioContratado.
     *
     * @param id the id of the servicioContratado to cancel.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)}.
     */
    @PutMapping("/{id}/cancelar")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_EMPLOYEE', 'ROLE_CLIENT')")
    public ResponseEntity<Void> cancelServicioContratado(@PathVariable("id") Long id) {
        LOG.debug("REST request to cancel ServicioContratado : {}", id);
        servicioContratadoService.cancelar(id);
        return ResponseEntity.ok().build();
    }
}
