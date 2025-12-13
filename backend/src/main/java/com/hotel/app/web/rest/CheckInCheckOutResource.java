package com.hotel.app.web.rest;

import com.hotel.app.repository.CheckInCheckOutRepository;
import com.hotel.app.service.CheckInCheckOutService;
import com.hotel.app.service.dto.CheckInCheckOutDTO;
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
 * REST controller for managing {@link com.hotel.app.domain.CheckInCheckOut}.
 */
@RestController
@RequestMapping("/api/check-in-check-outs")
public class CheckInCheckOutResource {

    private static final Logger LOG = LoggerFactory.getLogger(CheckInCheckOutResource.class);

    private static final String ENTITY_NAME = "hotelAppCheckInCheckOut";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final CheckInCheckOutService checkInCheckOutService;

    private final CheckInCheckOutRepository checkInCheckOutRepository;

    public CheckInCheckOutResource(CheckInCheckOutService checkInCheckOutService, CheckInCheckOutRepository checkInCheckOutRepository) {
        this.checkInCheckOutService = checkInCheckOutService;
        this.checkInCheckOutRepository = checkInCheckOutRepository;
    }

    /**
     * {@code POST  /check-in-check-outs} : Create a new checkInCheckOut.
     *
     * @param checkInCheckOutDTO the checkInCheckOutDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new checkInCheckOutDTO, or with status {@code 400 (Bad Request)} if the checkInCheckOut has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_EMPLOYEE')")
    @PostMapping("")
    public ResponseEntity<CheckInCheckOutDTO> createCheckInCheckOut(@Valid @RequestBody CheckInCheckOutDTO checkInCheckOutDTO)
        throws URISyntaxException {
        LOG.debug("REST request to save CheckInCheckOut : {}", checkInCheckOutDTO);
        if (checkInCheckOutDTO.getId() != null) {
            throw new BadRequestAlertException("A new checkInCheckOut cannot already have an ID", ENTITY_NAME, "idexists");
        }
        checkInCheckOutDTO = checkInCheckOutService.save(checkInCheckOutDTO);
        return ResponseEntity.created(new URI("/api/check-in-check-outs/" + checkInCheckOutDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, checkInCheckOutDTO.getId().toString()))
            .body(checkInCheckOutDTO);
    }

    /**
     * {@code PUT  /check-in-check-outs/:id} : Updates an existing checkInCheckOut.
     *
     * @param id the id of the checkInCheckOutDTO to save.
     * @param checkInCheckOutDTO the checkInCheckOutDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated checkInCheckOutDTO,
     * or with status {@code 400 (Bad Request)} if the checkInCheckOutDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the checkInCheckOutDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_EMPLOYEE')")
    @PutMapping("/{id}")
    public ResponseEntity<CheckInCheckOutDTO> updateCheckInCheckOut(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody CheckInCheckOutDTO checkInCheckOutDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update CheckInCheckOut : {}, {}", id, checkInCheckOutDTO);
        if (checkInCheckOutDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, checkInCheckOutDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!checkInCheckOutRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        checkInCheckOutDTO = checkInCheckOutService.update(checkInCheckOutDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, checkInCheckOutDTO.getId().toString()))
            .body(checkInCheckOutDTO);
    }

    /**
     * {@code PATCH  /check-in-check-outs/:id} : Partial updates given fields of an existing checkInCheckOut, field will ignore if it is null
     *
     * @param id the id of the checkInCheckOutDTO to save.
     * @param checkInCheckOutDTO the checkInCheckOutDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated checkInCheckOutDTO,
     * or with status {@code 400 (Bad Request)} if the checkInCheckOutDTO is not valid,
     * or with status {@code 404 (Not Found)} if the checkInCheckOutDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the checkInCheckOutDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_EMPLOYEE')")
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<CheckInCheckOutDTO> partialUpdateCheckInCheckOut(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody CheckInCheckOutDTO checkInCheckOutDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update CheckInCheckOut partially : {}, {}", id, checkInCheckOutDTO);
        if (checkInCheckOutDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, checkInCheckOutDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!checkInCheckOutRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<CheckInCheckOutDTO> result = checkInCheckOutService.partialUpdate(checkInCheckOutDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, checkInCheckOutDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /check-in-check-outs} : get all the checkInCheckOuts.
     *
     * @param pageable the pagination information.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of checkInCheckOuts in body.
     */
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_EMPLOYEE', 'ROLE_CLIENT')")
    @GetMapping("")
    public ResponseEntity<List<CheckInCheckOutDTO>> getAllCheckInCheckOuts(
        @org.springdoc.core.annotations.ParameterObject Pageable pageable
    ) {
        LOG.debug("REST request to get a page of CheckInCheckOuts");
        Page<CheckInCheckOutDTO> page = checkInCheckOutService.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /check-in-check-outs/:id} : get the "id" checkInCheckOut.
     *
     * @param id the id of the checkInCheckOutDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the checkInCheckOutDTO, or with status {@code 404 (Not Found)}.
     */
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_EMPLOYEE', 'ROLE_CLIENT')")
    @GetMapping("/{id}")
    public ResponseEntity<CheckInCheckOutDTO> getCheckInCheckOut(@PathVariable("id") Long id) {
        LOG.debug("REST request to get CheckInCheckOut : {}", id);
        Optional<CheckInCheckOutDTO> checkInCheckOutDTO = checkInCheckOutService.findOne(id);
        return ResponseUtil.wrapOrNotFound(checkInCheckOutDTO);
    }

    /**
     * {@code DELETE  /check-in-check-outs/:id} : delete the "id" checkInCheckOut.
     *
     * @param id the id of the checkInCheckOutDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCheckInCheckOut(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete CheckInCheckOut : {}", id);
        checkInCheckOutService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
