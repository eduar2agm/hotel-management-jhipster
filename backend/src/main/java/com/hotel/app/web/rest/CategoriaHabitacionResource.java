package com.hotel.app.web.rest;

import com.hotel.app.repository.CategoriaHabitacionRepository;
import com.hotel.app.service.CategoriaHabitacionService;
import com.hotel.app.service.dto.CategoriaHabitacionDTO;
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
 * REST controller for managing {@link com.hotel.app.domain.CategoriaHabitacion}.
 */
@RestController
@RequestMapping("/api/categoria-habitacions")
public class CategoriaHabitacionResource {

    private static final Logger LOG = LoggerFactory.getLogger(CategoriaHabitacionResource.class);

    private static final String ENTITY_NAME = "hotelAppCategoriaHabitacion";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final CategoriaHabitacionService categoriaHabitacionService;

    private final CategoriaHabitacionRepository categoriaHabitacionRepository;

    public CategoriaHabitacionResource(
        CategoriaHabitacionService categoriaHabitacionService,
        CategoriaHabitacionRepository categoriaHabitacionRepository
    ) {
        this.categoriaHabitacionService = categoriaHabitacionService;
        this.categoriaHabitacionRepository = categoriaHabitacionRepository;
    }

    /**
     * {@code POST  /categoria-habitacions} : Create a new categoriaHabitacion.
     *
     * @param categoriaHabitacionDTO the categoriaHabitacionDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new categoriaHabitacionDTO, or with status {@code 400 (Bad Request)} if the categoriaHabitacion has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PostMapping("")
    public ResponseEntity<CategoriaHabitacionDTO> createCategoriaHabitacion(
        @Valid @RequestBody CategoriaHabitacionDTO categoriaHabitacionDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to save CategoriaHabitacion : {}", categoriaHabitacionDTO);
        if (categoriaHabitacionDTO.getId() != null) {
            throw new BadRequestAlertException("A new categoriaHabitacion cannot already have an ID", ENTITY_NAME, "idexists");
        }
        categoriaHabitacionDTO = categoriaHabitacionService.save(categoriaHabitacionDTO);
        return ResponseEntity.created(new URI("/api/categoria-habitacions/" + categoriaHabitacionDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, categoriaHabitacionDTO.getId().toString()))
            .body(categoriaHabitacionDTO);
    }

    /**
     * {@code PUT  /categoria-habitacions/:id} : Updates an existing categoriaHabitacion.
     *
     * @param id the id of the categoriaHabitacionDTO to save.
     * @param categoriaHabitacionDTO the categoriaHabitacionDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated categoriaHabitacionDTO,
     * or with status {@code 400 (Bad Request)} if the categoriaHabitacionDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the categoriaHabitacionDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<CategoriaHabitacionDTO> updateCategoriaHabitacion(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody CategoriaHabitacionDTO categoriaHabitacionDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update CategoriaHabitacion : {}, {}", id, categoriaHabitacionDTO);
        if (categoriaHabitacionDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, categoriaHabitacionDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!categoriaHabitacionRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        categoriaHabitacionDTO = categoriaHabitacionService.update(categoriaHabitacionDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, categoriaHabitacionDTO.getId().toString()))
            .body(categoriaHabitacionDTO);
    }

    /**
     * {@code PATCH  /categoria-habitacions/:id} : Partial updates given fields of an existing categoriaHabitacion, field will ignore if it is null
     *
     * @param id the id of the categoriaHabitacionDTO to save.
     * @param categoriaHabitacionDTO the categoriaHabitacionDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated categoriaHabitacionDTO,
     * or with status {@code 400 (Bad Request)} if the categoriaHabitacionDTO is not valid,
     * or with status {@code 404 (Not Found)} if the categoriaHabitacionDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the categoriaHabitacionDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_EMPLOYEE')")
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<CategoriaHabitacionDTO> partialUpdateCategoriaHabitacion(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody CategoriaHabitacionDTO categoriaHabitacionDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update CategoriaHabitacion partially : {}, {}", id, categoriaHabitacionDTO);
        if (categoriaHabitacionDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, categoriaHabitacionDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!categoriaHabitacionRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<CategoriaHabitacionDTO> result = categoriaHabitacionService.partialUpdate(categoriaHabitacionDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, categoriaHabitacionDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /categoria-habitacions} : get all the categoriaHabitacions.
     *
     * @param pageable the pagination information.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of categoriaHabitacions in body.
     */
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_EMPLOYEE', 'ROLE_CLIENT')")
    @GetMapping("")
    public ResponseEntity<List<CategoriaHabitacionDTO>> getAllCategoriaHabitacions(
        @org.springdoc.core.annotations.ParameterObject Pageable pageable
    ) {
        LOG.debug("REST request to get a page of CategoriaHabitacions");
        Page<CategoriaHabitacionDTO> page = categoriaHabitacionService.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /categoria-habitacions/:id} : get the "id" categoriaHabitacion.
     *
     * @param id the id of the categoriaHabitacionDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the categoriaHabitacionDTO, or with status {@code 404 (Not Found)}.
     */
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_EMPLOYEE', 'ROLE_CLIENT')")
    @GetMapping("/{id}")
    public ResponseEntity<CategoriaHabitacionDTO> getCategoriaHabitacion(@PathVariable("id") Long id) {
        LOG.debug("REST request to get CategoriaHabitacion : {}", id);
        Optional<CategoriaHabitacionDTO> categoriaHabitacionDTO = categoriaHabitacionService.findOne(id);
        return ResponseUtil.wrapOrNotFound(categoriaHabitacionDTO);
    }

    /**
     * {@code DELETE  /categoria-habitacions/:id} : delete the "id" categoriaHabitacion.
     *
     * @param id the id of the categoriaHabitacionDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategoriaHabitacion(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete CategoriaHabitacion : {}", id);
        categoriaHabitacionService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
