package com.hotel.app.web.rest;

import com.hotel.app.repository.SeccionContactoRepository;
import com.hotel.app.service.SeccionContactoService;
import com.hotel.app.service.dto.SeccionContactoDTO;
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
 * REST controller for managing {@link com.hotel.app.domain.SeccionContacto}.
 */
@RestController
@RequestMapping("/api/seccion-contactos")
public class SeccionContactoResource {

    private static final Logger LOG = LoggerFactory.getLogger(SeccionContactoResource.class);

    private static final String ENTITY_NAME = "hotelAppSeccionContacto";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final SeccionContactoService seccionContactoService;

    private final SeccionContactoRepository seccionContactoRepository;

    public SeccionContactoResource(SeccionContactoService seccionContactoService, SeccionContactoRepository seccionContactoRepository) {
        this.seccionContactoService = seccionContactoService;
        this.seccionContactoRepository = seccionContactoRepository;
    }

    /**
     * {@code POST  /seccion-contactos} : Create a new seccionContacto.
     *
     * @param seccionContactoDTO the seccionContactoDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new seccionContactoDTO, or with status {@code 400 (Bad Request)} if the seccionContacto has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<SeccionContactoDTO> createSeccionContacto(@Valid @RequestBody SeccionContactoDTO seccionContactoDTO)
        throws URISyntaxException {
        LOG.debug("REST request to save SeccionContacto : {}", seccionContactoDTO);
        if (seccionContactoDTO.getId() != null) {
            throw new BadRequestAlertException("A new seccionContacto cannot already have an ID", ENTITY_NAME, "idexists");
        }
        seccionContactoDTO = seccionContactoService.save(seccionContactoDTO);
        return ResponseEntity.created(new URI("/api/seccion-contactos/" + seccionContactoDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, seccionContactoDTO.getId().toString()))
            .body(seccionContactoDTO);
    }

    /**
     * {@code PUT  /seccion-contactos/:id} : Updates an existing seccionContacto.
     *
     * @param id the id of the seccionContactoDTO to save.
     * @param seccionContactoDTO the seccionContactoDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated seccionContactoDTO,
     * or with status {@code 400 (Bad Request)} if the seccionContactoDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the seccionContactoDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<SeccionContactoDTO> updateSeccionContacto(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody SeccionContactoDTO seccionContactoDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update SeccionContacto : {}, {}", id, seccionContactoDTO);
        if (seccionContactoDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, seccionContactoDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!seccionContactoRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        seccionContactoDTO = seccionContactoService.update(seccionContactoDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, seccionContactoDTO.getId().toString()))
            .body(seccionContactoDTO);
    }

    /**
     * {@code PATCH  /seccion-contactos/:id} : Partial updates given fields of an existing seccionContacto, field will ignore if it is null
     *
     * @param id the id of the seccionContactoDTO to save.
     * @param seccionContactoDTO the seccionContactoDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated seccionContactoDTO,
     * or with status {@code 400 (Bad Request)} if the seccionContactoDTO is not valid,
     * or with status {@code 404 (Not Found)} if the seccionContactoDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the seccionContactoDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<SeccionContactoDTO> partialUpdateSeccionContacto(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody SeccionContactoDTO seccionContactoDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update SeccionContacto partially : {}, {}", id, seccionContactoDTO);
        if (seccionContactoDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, seccionContactoDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!seccionContactoRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<SeccionContactoDTO> result = seccionContactoService.partialUpdate(seccionContactoDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, seccionContactoDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /seccion-contactos} : get all the seccionContactos.
     *
     * @param pageable the pagination information.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of seccionContactos in body.
     */
    @GetMapping("")
    public ResponseEntity<List<SeccionContactoDTO>> getAllSeccionContactos(
        @org.springdoc.core.annotations.ParameterObject Pageable pageable
    ) {
        LOG.debug("REST request to get a page of SeccionContactos");
        Page<SeccionContactoDTO> page = seccionContactoService.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /seccion-contactos/:id} : get the "id" seccionContacto.
     *
     * @param id the id of the seccionContactoDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the seccionContactoDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<SeccionContactoDTO> getSeccionContacto(@PathVariable("id") Long id) {
        LOG.debug("REST request to get SeccionContacto : {}", id);
        Optional<SeccionContactoDTO> seccionContactoDTO = seccionContactoService.findOne(id);
        return ResponseUtil.wrapOrNotFound(seccionContactoDTO);
    }

    /**
     * {@code DELETE  /seccion-contactos/:id} : delete the "id" seccionContacto.
     *
     * @param id the id of the seccionContactoDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSeccionContacto(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete SeccionContacto : {}", id);
        seccionContactoService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
