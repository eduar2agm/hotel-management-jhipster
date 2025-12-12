package com.hotel.app.web.rest;

import com.hotel.app.repository.MensajeSoporteRepository;
import com.hotel.app.service.MensajeSoporteService;
import com.hotel.app.service.dto.MensajeSoporteDTO;
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
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link com.hotel.app.domain.MensajeSoporte}.
 */
@RestController
@RequestMapping("/api/mensaje-soportes")
public class MensajeSoporteResource {

    private static final Logger LOG = LoggerFactory.getLogger(MensajeSoporteResource.class);

    private static final String ENTITY_NAME = "hotelAppMensajeSoporte";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final MensajeSoporteService mensajeSoporteService;

    private final MensajeSoporteRepository mensajeSoporteRepository;

    public MensajeSoporteResource(MensajeSoporteService mensajeSoporteService, MensajeSoporteRepository mensajeSoporteRepository) {
        this.mensajeSoporteService = mensajeSoporteService;
        this.mensajeSoporteRepository = mensajeSoporteRepository;
    }

    /**
     * {@code POST  /mensaje-soportes} : Create a new mensajeSoporte.
     *
     * @param mensajeSoporteDTO the mensajeSoporteDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new mensajeSoporteDTO, or with status {@code 400 (Bad Request)} if the mensajeSoporte has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<MensajeSoporteDTO> createMensajeSoporte(@Valid @RequestBody MensajeSoporteDTO mensajeSoporteDTO)
        throws URISyntaxException {
        LOG.debug("REST request to save MensajeSoporte : {}", mensajeSoporteDTO);
        if (mensajeSoporteDTO.getId() != null) {
            throw new BadRequestAlertException("A new mensajeSoporte cannot already have an ID", ENTITY_NAME, "idexists");
        }
        mensajeSoporteDTO = mensajeSoporteService.save(mensajeSoporteDTO);
        return ResponseEntity.created(new URI("/api/mensaje-soportes/" + mensajeSoporteDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, mensajeSoporteDTO.getId().toString()))
            .body(mensajeSoporteDTO);
    }

    /**
     * {@code PUT  /mensaje-soportes/:id} : Updates an existing mensajeSoporte.
     *
     * @param id the id of the mensajeSoporteDTO to save.
     * @param mensajeSoporteDTO the mensajeSoporteDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated mensajeSoporteDTO,
     * or with status {@code 400 (Bad Request)} if the mensajeSoporteDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the mensajeSoporteDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<MensajeSoporteDTO> updateMensajeSoporte(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody MensajeSoporteDTO mensajeSoporteDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update MensajeSoporte : {}, {}", id, mensajeSoporteDTO);
        if (mensajeSoporteDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, mensajeSoporteDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!mensajeSoporteRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        mensajeSoporteDTO = mensajeSoporteService.update(mensajeSoporteDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, mensajeSoporteDTO.getId().toString()))
            .body(mensajeSoporteDTO);
    }

    /**
     * {@code PATCH  /mensaje-soportes/:id} : Partial updates given fields of an existing mensajeSoporte, field will ignore if it is null
     *
     * @param id the id of the mensajeSoporteDTO to save.
     * @param mensajeSoporteDTO the mensajeSoporteDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated mensajeSoporteDTO,
     * or with status {@code 400 (Bad Request)} if the mensajeSoporteDTO is not valid,
     * or with status {@code 404 (Not Found)} if the mensajeSoporteDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the mensajeSoporteDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<MensajeSoporteDTO> partialUpdateMensajeSoporte(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody MensajeSoporteDTO mensajeSoporteDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update MensajeSoporte partially : {}, {}", id, mensajeSoporteDTO);
        if (mensajeSoporteDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, mensajeSoporteDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!mensajeSoporteRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<MensajeSoporteDTO> result = mensajeSoporteService.partialUpdate(mensajeSoporteDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, mensajeSoporteDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /mensaje-soportes} : get all the mensajeSoportes.
     *
     * @param pageable the pagination information.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of mensajeSoportes in body.
     */
    @GetMapping("")
    public ResponseEntity<List<MensajeSoporteDTO>> getAllMensajeSoportes(
        @org.springdoc.core.annotations.ParameterObject Pageable pageable
    ) {
        LOG.debug("REST request to get a page of MensajeSoportes");
        Page<MensajeSoporteDTO> page = mensajeSoporteService.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /mensaje-soportes/:id} : get the "id" mensajeSoporte.
     *
     * @param id the id of the mensajeSoporteDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the mensajeSoporteDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<MensajeSoporteDTO> getMensajeSoporte(@PathVariable("id") Long id) {
        LOG.debug("REST request to get MensajeSoporte : {}", id);
        Optional<MensajeSoporteDTO> mensajeSoporteDTO = mensajeSoporteService.findOne(id);
        return ResponseUtil.wrapOrNotFound(mensajeSoporteDTO);
    }

    /**
     * {@code DELETE  /mensaje-soportes/:id} : delete the "id" mensajeSoporte.
     *
     * @param id the id of the mensajeSoporteDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMensajeSoporte(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete MensajeSoporte : {}", id);
        mensajeSoporteService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
