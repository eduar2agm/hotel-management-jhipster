package com.hotel.app.web.rest;

import com.hotel.app.domain.Reserva;
import com.hotel.app.repository.ReservaRepository;
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
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link com.hotel.app.domain.Reserva}.
 */
@RestController
@RequestMapping("/api/reservas")
@Transactional
public class ReservaResource {

    private static final Logger LOG = LoggerFactory.getLogger(ReservaResource.class);

    private static final String ENTITY_NAME = "hotelAppReserva";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final ReservaRepository reservaRepository;

    public ReservaResource(ReservaRepository reservaRepository) {
        this.reservaRepository = reservaRepository;
    }

    /**
     * {@code POST  /reservas} : Create a new reserva.
     *
     * @param reserva the reserva to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new reserva, or with status {@code 400 (Bad Request)} if the reserva has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<Reserva> createReserva(@Valid @RequestBody Reserva reserva) throws URISyntaxException {
        LOG.debug("REST request to save Reserva : {}", reserva);
        if (reserva.getId() != null) {
            throw new BadRequestAlertException("A new reserva cannot already have an ID", ENTITY_NAME, "idexists");
        }
        reserva = reservaRepository.save(reserva);
        return ResponseEntity.created(new URI("/api/reservas/" + reserva.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, reserva.getId().toString()))
            .body(reserva);
    }

    /**
     * {@code PUT  /reservas/:id} : Updates an existing reserva.
     *
     * @param id the id of the reserva to save.
     * @param reserva the reserva to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated reserva,
     * or with status {@code 400 (Bad Request)} if the reserva is not valid,
     * or with status {@code 500 (Internal Server Error)} if the reserva couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Reserva> updateReserva(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody Reserva reserva
    ) throws URISyntaxException {
        LOG.debug("REST request to update Reserva : {}, {}", id, reserva);
        if (reserva.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, reserva.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!reservaRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        reserva = reservaRepository.save(reserva);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, reserva.getId().toString()))
            .body(reserva);
    }

    /**
     * {@code PATCH  /reservas/:id} : Partial updates given fields of an existing reserva, field will ignore if it is null
     *
     * @param id the id of the reserva to save.
     * @param reserva the reserva to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated reserva,
     * or with status {@code 400 (Bad Request)} if the reserva is not valid,
     * or with status {@code 404 (Not Found)} if the reserva is not found,
     * or with status {@code 500 (Internal Server Error)} if the reserva couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<Reserva> partialUpdateReserva(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody Reserva reserva
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update Reserva partially : {}, {}", id, reserva);
        if (reserva.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, reserva.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!reservaRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<Reserva> result = reservaRepository
            .findById(reserva.getId())
            .map(existingReserva -> {
                if (reserva.getFechaReserva() != null) {
                    existingReserva.setFechaReserva(reserva.getFechaReserva());
                }
                if (reserva.getFechaInicio() != null) {
                    existingReserva.setFechaInicio(reserva.getFechaInicio());
                }
                if (reserva.getFechaFin() != null) {
                    existingReserva.setFechaFin(reserva.getFechaFin());
                }
                if (reserva.getEstado() != null) {
                    existingReserva.setEstado(reserva.getEstado());
                }

                return existingReserva;
            })
            .map(reservaRepository::save);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, reserva.getId().toString())
        );
    }

    /**
     * {@code GET  /reservas} : get all the reservas.
     *
     * @param pageable the pagination information.
     * @param eagerload flag to eager load entities from relationships (This is applicable for many-to-many).
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of reservas in body.
     */
    @GetMapping("")
    public ResponseEntity<List<Reserva>> getAllReservas(
        @org.springdoc.core.annotations.ParameterObject Pageable pageable,
        @RequestParam(name = "eagerload", required = false, defaultValue = "true") boolean eagerload
    ) {
        LOG.debug("REST request to get a page of Reservas");
        Page<Reserva> page;
        if (eagerload) {
            page = reservaRepository.findAllWithEagerRelationships(pageable);
        } else {
            page = reservaRepository.findAll(pageable);
        }
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /reservas/:id} : get the "id" reserva.
     *
     * @param id the id of the reserva to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the reserva, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Reserva> getReserva(@PathVariable("id") Long id) {
        LOG.debug("REST request to get Reserva : {}", id);
        Optional<Reserva> reserva = reservaRepository.findOneWithEagerRelationships(id);
        return ResponseUtil.wrapOrNotFound(reserva);
    }

    /**
     * {@code DELETE  /reservas/:id} : delete the "id" reserva.
     *
     * @param id the id of the reserva to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReserva(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete Reserva : {}", id);
        reservaRepository.deleteById(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
