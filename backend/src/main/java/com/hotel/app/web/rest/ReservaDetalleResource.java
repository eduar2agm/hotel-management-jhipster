package com.hotel.app.web.rest;

import com.hotel.app.domain.ReservaDetalle;
import com.hotel.app.repository.ReservaDetalleRepository;
import com.hotel.app.web.rest.errors.BadRequestAlertException;
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
import org.springframework.transaction.annotation.Transactional;
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
@Transactional
public class ReservaDetalleResource {

    private static final Logger LOG = LoggerFactory.getLogger(ReservaDetalleResource.class);

    private static final String ENTITY_NAME = "hotelAppReservaDetalle";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final ReservaDetalleRepository reservaDetalleRepository;

    public ReservaDetalleResource(ReservaDetalleRepository reservaDetalleRepository) {
        this.reservaDetalleRepository = reservaDetalleRepository;
    }

    /**
     * {@code POST  /reserva-detalles} : Create a new reservaDetalle.
     *
     * @param reservaDetalle the reservaDetalle to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new reservaDetalle, or with status {@code 400 (Bad Request)} if the reservaDetalle has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<ReservaDetalle> createReservaDetalle(@RequestBody ReservaDetalle reservaDetalle) throws URISyntaxException {
        LOG.debug("REST request to save ReservaDetalle : {}", reservaDetalle);
        if (reservaDetalle.getId() != null) {
            throw new BadRequestAlertException("A new reservaDetalle cannot already have an ID", ENTITY_NAME, "idexists");
        }
        reservaDetalle = reservaDetalleRepository.save(reservaDetalle);
        return ResponseEntity.created(new URI("/api/reserva-detalles/" + reservaDetalle.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, reservaDetalle.getId().toString()))
            .body(reservaDetalle);
    }

    /**
     * {@code PUT  /reserva-detalles/:id} : Updates an existing reservaDetalle.
     *
     * @param id the id of the reservaDetalle to save.
     * @param reservaDetalle the reservaDetalle to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated reservaDetalle,
     * or with status {@code 400 (Bad Request)} if the reservaDetalle is not valid,
     * or with status {@code 500 (Internal Server Error)} if the reservaDetalle couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<ReservaDetalle> updateReservaDetalle(
        @PathVariable(value = "id", required = false) final Long id,
        @RequestBody ReservaDetalle reservaDetalle
    ) throws URISyntaxException {
        LOG.debug("REST request to update ReservaDetalle : {}, {}", id, reservaDetalle);
        if (reservaDetalle.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, reservaDetalle.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!reservaDetalleRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        reservaDetalle = reservaDetalleRepository.save(reservaDetalle);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, reservaDetalle.getId().toString()))
            .body(reservaDetalle);
    }

    /**
     * {@code PATCH  /reserva-detalles/:id} : Partial updates given fields of an existing reservaDetalle, field will ignore if it is null
     *
     * @param id the id of the reservaDetalle to save.
     * @param reservaDetalle the reservaDetalle to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated reservaDetalle,
     * or with status {@code 400 (Bad Request)} if the reservaDetalle is not valid,
     * or with status {@code 404 (Not Found)} if the reservaDetalle is not found,
     * or with status {@code 500 (Internal Server Error)} if the reservaDetalle couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<ReservaDetalle> partialUpdateReservaDetalle(
        @PathVariable(value = "id", required = false) final Long id,
        @RequestBody ReservaDetalle reservaDetalle
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update ReservaDetalle partially : {}, {}", id, reservaDetalle);
        if (reservaDetalle.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, reservaDetalle.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!reservaDetalleRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<ReservaDetalle> result = reservaDetalleRepository
            .findById(reservaDetalle.getId())
            .map(existingReservaDetalle -> {
                if (reservaDetalle.getNota() != null) {
                    existingReservaDetalle.setNota(reservaDetalle.getNota());
                }

                return existingReservaDetalle;
            })
            .map(reservaDetalleRepository::save);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, reservaDetalle.getId().toString())
        );
    }

    /**
     * {@code GET  /reserva-detalles} : get all the reservaDetalles.
     *
     * @param pageable the pagination information.
     * @param eagerload flag to eager load entities from relationships (This is applicable for many-to-many).
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of reservaDetalles in body.
     */
    @GetMapping("")
    public ResponseEntity<List<ReservaDetalle>> getAllReservaDetalles(
        @org.springdoc.core.annotations.ParameterObject Pageable pageable,
        @RequestParam(name = "eagerload", required = false, defaultValue = "true") boolean eagerload
    ) {
        LOG.debug("REST request to get a page of ReservaDetalles");
        Page<ReservaDetalle> page;
        if (eagerload) {
            page = reservaDetalleRepository.findAllWithEagerRelationships(pageable);
        } else {
            page = reservaDetalleRepository.findAll(pageable);
        }
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /reserva-detalles/:id} : get the "id" reservaDetalle.
     *
     * @param id the id of the reservaDetalle to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the reservaDetalle, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ReservaDetalle> getReservaDetalle(@PathVariable("id") Long id) {
        LOG.debug("REST request to get ReservaDetalle : {}", id);
        Optional<ReservaDetalle> reservaDetalle = reservaDetalleRepository.findOneWithEagerRelationships(id);
        return ResponseUtil.wrapOrNotFound(reservaDetalle);
    }

    /**
     * {@code DELETE  /reserva-detalles/:id} : delete the "id" reservaDetalle.
     *
     * @param id the id of the reservaDetalle to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReservaDetalle(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete ReservaDetalle : {}", id);
        reservaDetalleRepository.deleteById(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
