package com.hotel.app.web.rest;

import com.hotel.app.domain.CheckInCheckOut;
import com.hotel.app.repository.CheckInCheckOutRepository;
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
 * REST controller for managing {@link com.hotel.app.domain.CheckInCheckOut}.
 */
@RestController
@RequestMapping("/api/check-in-check-outs")
@Transactional
public class CheckInCheckOutResource {

    private static final Logger LOG = LoggerFactory.getLogger(CheckInCheckOutResource.class);

    private static final String ENTITY_NAME = "hotelAppCheckInCheckOut";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final CheckInCheckOutRepository checkInCheckOutRepository;

    public CheckInCheckOutResource(CheckInCheckOutRepository checkInCheckOutRepository) {
        this.checkInCheckOutRepository = checkInCheckOutRepository;
    }

    /**
     * {@code POST  /check-in-check-outs} : Create a new checkInCheckOut.
     *
     * @param checkInCheckOut the checkInCheckOut to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new checkInCheckOut, or with status {@code 400 (Bad Request)} if the checkInCheckOut has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<CheckInCheckOut> createCheckInCheckOut(@Valid @RequestBody CheckInCheckOut checkInCheckOut)
        throws URISyntaxException {
        LOG.debug("REST request to save CheckInCheckOut : {}", checkInCheckOut);
        if (checkInCheckOut.getId() != null) {
            throw new BadRequestAlertException("A new checkInCheckOut cannot already have an ID", ENTITY_NAME, "idexists");
        }
        checkInCheckOut = checkInCheckOutRepository.save(checkInCheckOut);
        return ResponseEntity.created(new URI("/api/check-in-check-outs/" + checkInCheckOut.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, checkInCheckOut.getId().toString()))
            .body(checkInCheckOut);
    }

    /**
     * {@code PUT  /check-in-check-outs/:id} : Updates an existing checkInCheckOut.
     *
     * @param id the id of the checkInCheckOut to save.
     * @param checkInCheckOut the checkInCheckOut to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated checkInCheckOut,
     * or with status {@code 400 (Bad Request)} if the checkInCheckOut is not valid,
     * or with status {@code 500 (Internal Server Error)} if the checkInCheckOut couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<CheckInCheckOut> updateCheckInCheckOut(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody CheckInCheckOut checkInCheckOut
    ) throws URISyntaxException {
        LOG.debug("REST request to update CheckInCheckOut : {}, {}", id, checkInCheckOut);
        if (checkInCheckOut.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, checkInCheckOut.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!checkInCheckOutRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        checkInCheckOut = checkInCheckOutRepository.save(checkInCheckOut);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, checkInCheckOut.getId().toString()))
            .body(checkInCheckOut);
    }

    /**
     * {@code PATCH  /check-in-check-outs/:id} : Partial updates given fields of an existing checkInCheckOut, field will ignore if it is null
     *
     * @param id the id of the checkInCheckOut to save.
     * @param checkInCheckOut the checkInCheckOut to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated checkInCheckOut,
     * or with status {@code 400 (Bad Request)} if the checkInCheckOut is not valid,
     * or with status {@code 404 (Not Found)} if the checkInCheckOut is not found,
     * or with status {@code 500 (Internal Server Error)} if the checkInCheckOut couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<CheckInCheckOut> partialUpdateCheckInCheckOut(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody CheckInCheckOut checkInCheckOut
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update CheckInCheckOut partially : {}, {}", id, checkInCheckOut);
        if (checkInCheckOut.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, checkInCheckOut.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!checkInCheckOutRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<CheckInCheckOut> result = checkInCheckOutRepository
            .findById(checkInCheckOut.getId())
            .map(existingCheckInCheckOut -> {
                if (checkInCheckOut.getFechaCheckIn() != null) {
                    existingCheckInCheckOut.setFechaCheckIn(checkInCheckOut.getFechaCheckIn());
                }
                if (checkInCheckOut.getHoraCheckIn() != null) {
                    existingCheckInCheckOut.setHoraCheckIn(checkInCheckOut.getHoraCheckIn());
                }
                if (checkInCheckOut.getFechaCheckOut() != null) {
                    existingCheckInCheckOut.setFechaCheckOut(checkInCheckOut.getFechaCheckOut());
                }
                if (checkInCheckOut.getHoraCheckOut() != null) {
                    existingCheckInCheckOut.setHoraCheckOut(checkInCheckOut.getHoraCheckOut());
                }
                if (checkInCheckOut.getEstado() != null) {
                    existingCheckInCheckOut.setEstado(checkInCheckOut.getEstado());
                }

                return existingCheckInCheckOut;
            })
            .map(checkInCheckOutRepository::save);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, checkInCheckOut.getId().toString())
        );
    }

    /**
     * {@code GET  /check-in-check-outs} : get all the checkInCheckOuts.
     *
     * @param pageable the pagination information.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of checkInCheckOuts in body.
     */
    @GetMapping("")
    public ResponseEntity<List<CheckInCheckOut>> getAllCheckInCheckOuts(@org.springdoc.core.annotations.ParameterObject Pageable pageable) {
        LOG.debug("REST request to get a page of CheckInCheckOuts");
        Page<CheckInCheckOut> page = checkInCheckOutRepository.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /check-in-check-outs/:id} : get the "id" checkInCheckOut.
     *
     * @param id the id of the checkInCheckOut to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the checkInCheckOut, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<CheckInCheckOut> getCheckInCheckOut(@PathVariable("id") Long id) {
        LOG.debug("REST request to get CheckInCheckOut : {}", id);
        Optional<CheckInCheckOut> checkInCheckOut = checkInCheckOutRepository.findById(id);
        return ResponseUtil.wrapOrNotFound(checkInCheckOut);
    }

    /**
     * {@code DELETE  /check-in-check-outs/:id} : delete the "id" checkInCheckOut.
     *
     * @param id the id of the checkInCheckOut to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCheckInCheckOut(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete CheckInCheckOut : {}", id);
        checkInCheckOutRepository.deleteById(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
