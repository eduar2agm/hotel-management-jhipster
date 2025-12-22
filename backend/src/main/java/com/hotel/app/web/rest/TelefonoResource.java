package com.hotel.app.web.rest;

import com.hotel.app.repository.TelefonoRepository;
import com.hotel.app.service.TelefonoService;
import com.hotel.app.service.dto.TelefonoDTO;
import com.hotel.app.security.AuthoritiesConstants;
import com.hotel.app.web.rest.errors.BadRequestAlertException;
import org.springframework.security.access.prepost.PreAuthorize;
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
 * REST controller for managing {@link com.hotel.app.domain.Telefono}.
 */
@RestController
@RequestMapping("/api/telefonos")
public class TelefonoResource {

    private static final Logger LOG = LoggerFactory.getLogger(TelefonoResource.class);

    private static final String ENTITY_NAME = "hotelAppTelefono";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final TelefonoService telefonoService;

    private final TelefonoRepository telefonoRepository;

    public TelefonoResource(TelefonoService telefonoService, TelefonoRepository telefonoRepository) {
        this.telefonoService = telefonoService;
        this.telefonoRepository = telefonoRepository;
    }

    /**
     * {@code POST  /telefonos} : Create a new telefono.
     *
     * @param telefonoDTO the telefonoDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with
     *         body the new telefonoDTO, or with status {@code 400 (Bad Request)} if
     *         the telefono has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    @PreAuthorize("hasAuthority(\"" + AuthoritiesConstants.ADMIN + "\")")
    public ResponseEntity<TelefonoDTO> createTelefono(@Valid @RequestBody TelefonoDTO telefonoDTO)
            throws URISyntaxException {
        LOG.debug("REST request to save Telefono : {}", telefonoDTO);
        if (telefonoDTO.getId() != null) {
            throw new BadRequestAlertException("A new telefono cannot already have an ID", ENTITY_NAME, "idexists");
        }
        telefonoDTO = telefonoService.save(telefonoDTO);
        return ResponseEntity.created(new URI("/api/telefonos/" + telefonoDTO.getId()))
                .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME,
                        telefonoDTO.getId().toString()))
                .body(telefonoDTO);
    }

    /**
     * {@code PUT  /telefonos/:id} : Updates an existing telefono.
     *
     * @param id          the id of the telefonoDTO to save.
     * @param telefonoDTO the telefonoDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body
     *         the updated telefonoDTO,
     *         or with status {@code 400 (Bad Request)} if the telefonoDTO is not
     *         valid,
     *         or with status {@code 500 (Internal Server Error)} if the telefonoDTO
     *         couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority(\"" + AuthoritiesConstants.ADMIN + "\")")
    public ResponseEntity<TelefonoDTO> updateTelefono(
            @PathVariable(value = "id", required = false) final Long id,
            @Valid @RequestBody TelefonoDTO telefonoDTO) throws URISyntaxException {
        LOG.debug("REST request to update Telefono : {}, {}", id, telefonoDTO);
        if (telefonoDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, telefonoDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!telefonoRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        telefonoDTO = telefonoService.update(telefonoDTO);
        return ResponseEntity.ok()
                .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME,
                        telefonoDTO.getId().toString()))
                .body(telefonoDTO);
    }

    /**
     * {@code PATCH  /telefonos/:id} : Partial updates given fields of an existing
     * telefono, field will ignore if it is null
     *
     * @param id          the id of the telefonoDTO to save.
     * @param telefonoDTO the telefonoDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body
     *         the updated telefonoDTO,
     *         or with status {@code 400 (Bad Request)} if the telefonoDTO is not
     *         valid,
     *         or with status {@code 404 (Not Found)} if the telefonoDTO is not
     *         found,
     *         or with status {@code 500 (Internal Server Error)} if the telefonoDTO
     *         couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    @PreAuthorize("hasAuthority(\"" + AuthoritiesConstants.ADMIN + "\")")
    public ResponseEntity<TelefonoDTO> partialUpdateTelefono(
            @PathVariable(value = "id", required = false) final Long id,
            @NotNull @RequestBody TelefonoDTO telefonoDTO) throws URISyntaxException {
        LOG.debug("REST request to partial update Telefono partially : {}, {}", id, telefonoDTO);
        if (telefonoDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, telefonoDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!telefonoRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<TelefonoDTO> result = telefonoService.partialUpdate(telefonoDTO);

        return ResponseUtil.wrapOrNotFound(
                result,
                HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME,
                        telefonoDTO.getId().toString()));
    }

    /**
     * {@code GET  /telefonos} : get all the telefonos.
     *
     * @param pageable the pagination information.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list
     *         of telefonos in body.
     */
    @GetMapping("")
    public ResponseEntity<List<TelefonoDTO>> getAllTelefonos(
            @org.springdoc.core.annotations.ParameterObject Pageable pageable) {
        LOG.debug("REST request to get a page of Telefonos");
        Page<TelefonoDTO> page = telefonoService.findAll(pageable);
        HttpHeaders headers = PaginationUtil
                .generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /telefonos/:id} : get the "id" telefono.
     *
     * @param id the id of the telefonoDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body
     *         the telefonoDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<TelefonoDTO> getTelefono(@PathVariable("id") Long id) {
        LOG.debug("REST request to get Telefono : {}", id);
        Optional<TelefonoDTO> telefonoDTO = telefonoService.findOne(id);
        return ResponseUtil.wrapOrNotFound(telefonoDTO);
    }

    /**
     * {@code DELETE  /telefonos/:id} : delete the "id" telefono.
     *
     * @param id the id of the telefonoDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority(\"" + AuthoritiesConstants.ADMIN + "\")")
    public ResponseEntity<Void> deleteTelefono(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete Telefono : {}", id);
        telefonoService.delete(id);
        return ResponseEntity.noContent()
                .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
                .build();
    }
}
