package com.hotel.app.web.rest;

import com.hotel.app.repository.ReservaDetalleRepository;
import com.hotel.app.service.ReservaDetalleService;
import com.hotel.app.service.dto.ReservaDetalleDTO;
import com.hotel.app.web.rest.errors.BadRequestAlertException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link com.hotel.app.domain.ReservaDetalle}.
 */
@RestController
@RequestMapping("/api/reserva-detalles")
public class ReservaDetalleResource {

    private static final Logger LOG = LoggerFactory.getLogger(ReservaDetalleResource.class);

    private static final String ENTITY_NAME = "hotelAppReservaDetalle";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final ReservaDetalleService reservaDetalleService;

    private final ReservaDetalleRepository reservaDetalleRepository;

    public ReservaDetalleResource(ReservaDetalleService reservaDetalleService,
            ReservaDetalleRepository reservaDetalleRepository) {
        this.reservaDetalleService = reservaDetalleService;
        this.reservaDetalleRepository = reservaDetalleRepository;
    }

    /**
     * {@code POST  /reserva-detalles} : Create a new reservaDetalle.
     *
     * @param reservaDetalleDTO the reservaDetalleDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with
     *         body the new reservaDetalleDTO, or with status
     *         {@code 400 (Bad Request)} if the reservaDetalle has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_EMPLOYEE', 'ROLE_CLIENT')")
    @PostMapping("")
    public ResponseEntity<ReservaDetalleDTO> createReservaDetalle(
            @Valid @RequestBody ReservaDetalleDTO reservaDetalleDTO)
            throws URISyntaxException {
        LOG.debug("REST request to save ReservaDetalle : {}", reservaDetalleDTO);
        if (reservaDetalleDTO.getId() != null) {
            throw new BadRequestAlertException("A new reservaDetalle cannot already have an ID", ENTITY_NAME,
                    "idexists");
        }
        reservaDetalleDTO = reservaDetalleService.save(reservaDetalleDTO);
        return ResponseEntity.created(new URI("/api/reserva-detalles/" + reservaDetalleDTO.getId()))
                .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME,
                        reservaDetalleDTO.getId().toString()))
                .body(reservaDetalleDTO);
    }

    /**
     * {@code PUT  /reserva-detalles/:id} : Updates an existing reservaDetalle.
     *
     * @param id                the id of the reservaDetalleDTO to save.
     * @param reservaDetalleDTO the reservaDetalleDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body
     *         the updated reservaDetalleDTO,
     *         or with status {@code 400 (Bad Request)} if the reservaDetalleDTO is
     *         not valid,
     *         or with status {@code 500 (Internal Server Error)} if the
     *         reservaDetalleDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_EMPLOYEE')")
    @PutMapping("/{id}")
    public ResponseEntity<ReservaDetalleDTO> updateReservaDetalle(
            @PathVariable(value = "id", required = false) final Long id,
            @Valid @RequestBody ReservaDetalleDTO reservaDetalleDTO) throws URISyntaxException {
        LOG.debug("REST request to update ReservaDetalle : {}, {}", id, reservaDetalleDTO);
        if (reservaDetalleDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, reservaDetalleDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!reservaDetalleRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        reservaDetalleDTO = reservaDetalleService.update(reservaDetalleDTO);
        return ResponseEntity.ok()
                .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME,
                        reservaDetalleDTO.getId().toString()))
                .body(reservaDetalleDTO);
    }

    /**
     * {@code PATCH  /reserva-detalles/:id} : Partial updates given fields of an
     * existing reservaDetalle, field will ignore if it is null
     *
     * @param id                the id of the reservaDetalleDTO to save.
     * @param reservaDetalleDTO the reservaDetalleDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body
     *         the updated reservaDetalleDTO,
     *         or with status {@code 400 (Bad Request)} if the reservaDetalleDTO is
     *         not valid,
     *         or with status {@code 404 (Not Found)} if the reservaDetalleDTO is
     *         not found,
     *         or with status {@code 500 (Internal Server Error)} if the
     *         reservaDetalleDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_EMPLOYEE', 'ROLE_CLIENT')")
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<ReservaDetalleDTO> partialUpdateReservaDetalle(
            @PathVariable(value = "id", required = false) final Long id,
            @NotNull @RequestBody ReservaDetalleDTO reservaDetalleDTO) throws URISyntaxException {
        LOG.debug("REST request to partial update ReservaDetalle partially : {}, {}", id, reservaDetalleDTO);
        if (reservaDetalleDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, reservaDetalleDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!reservaDetalleRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<ReservaDetalleDTO> result = reservaDetalleService.partialUpdate(reservaDetalleDTO);

        return ResponseUtil.wrapOrNotFound(
                result,
                HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME,
                        reservaDetalleDTO.getId().toString()));
    }

    /**
     * {@code GET  /reserva-detalles} : get all the reservaDetalles.
     *
     * @param pageable  the pagination information.
     * @param eagerload flag to eager load entities from relationships (This is
     *                  applicable for many-to-many).
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list
     *         of reservaDetalles in body.
     */
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_EMPLOYEE', 'ROLE_CLIENT')")
    @GetMapping("")
    public ResponseEntity<List<ReservaDetalleDTO>> getAllReservaDetalles(
            @org.springdoc.core.annotations.ParameterObject Pageable pageable,
            @RequestParam(name = "eagerload", required = false, defaultValue = "true") boolean eagerload) {
        LOG.debug("REST request to get a page of ReservaDetalles");
        Page<ReservaDetalleDTO> page;
        if (eagerload) {
            page = reservaDetalleService.findAllWithEagerRelationships(pageable);
        } else {
            page = reservaDetalleService.findAll(pageable);
        }
        HttpHeaders headers = PaginationUtil
                .generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /reserva-detalles/:id} : get the "id" reservaDetalle.
     *
     * @param id the id of the reservaDetalleDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body
     *         the reservaDetalleDTO, or with status {@code 404 (Not Found)}.
     */
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_EMPLOYEE', 'ROLE_CLIENT')")
    @GetMapping("/{id}")
    public ResponseEntity<ReservaDetalleDTO> getReservaDetalle(@PathVariable("id") Long id) {
        LOG.debug("REST request to get ReservaDetalle : {}", id);
        Optional<ReservaDetalleDTO> reservaDetalleDTO = reservaDetalleService.findOne(id);
        return ResponseUtil.wrapOrNotFound(reservaDetalleDTO);
    }

    /**
     * {@code DELETE  /reserva-detalles/:id} : delete the "id" reservaDetalle.
     *
     * @param id the id of the reservaDetalleDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReservaDetalle(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete ReservaDetalle : {}", id);
        reservaDetalleService.delete(id);
        return ResponseEntity.noContent()
                .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
                .build();
    }
}
