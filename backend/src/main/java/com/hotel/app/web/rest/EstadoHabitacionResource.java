package com.hotel.app.web.rest;

import com.hotel.app.repository.EstadoHabitacionRepository;
import com.hotel.app.service.EstadoHabitacionService;
import com.hotel.app.service.dto.EstadoHabitacionDTO;
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
 * REST controller for managing {@link com.hotel.app.domain.EstadoHabitacion}.
 */
@RestController
@RequestMapping("/api/estado-habitacions")
public class EstadoHabitacionResource {

    private static final Logger LOG = LoggerFactory.getLogger(EstadoHabitacionResource.class);

    private static final String ENTITY_NAME = "hotelAppEstadoHabitacion";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final EstadoHabitacionService estadoHabitacionService;

    private final EstadoHabitacionRepository estadoHabitacionRepository;

    public EstadoHabitacionResource(
            EstadoHabitacionService estadoHabitacionService,
            EstadoHabitacionRepository estadoHabitacionRepository) {
        this.estadoHabitacionService = estadoHabitacionService;
        this.estadoHabitacionRepository = estadoHabitacionRepository;
    }

    /**
     * {@code POST  /estado-habitacions} : Create a new estadoHabitacion.
     *
     * @param estadoHabitacionDTO the estadoHabitacionDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with
     *         body the new estadoHabitacionDTO, or with status
     *         {@code 400 (Bad Request)} if the estadoHabitacion has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN')")
    @PostMapping("")
    public ResponseEntity<EstadoHabitacionDTO> createEstadoHabitacion(
            @Valid @RequestBody EstadoHabitacionDTO estadoHabitacionDTO)
            throws URISyntaxException {
        LOG.debug("REST request to save EstadoHabitacion : {}", estadoHabitacionDTO);
        if (estadoHabitacionDTO.getId() != null) {
            throw new BadRequestAlertException("A new estadoHabitacion cannot already have an ID", ENTITY_NAME,
                    "idexists");
        }
        estadoHabitacionDTO = estadoHabitacionService.save(estadoHabitacionDTO);
        return ResponseEntity.created(new URI("/api/estado-habitacions/" + estadoHabitacionDTO.getId()))
                .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME,
                        estadoHabitacionDTO.getId().toString()))
                .body(estadoHabitacionDTO);
    }

    /**
     * {@code PUT  /estado-habitacions/:id} : Updates an existing estadoHabitacion.
     *
     * @param id                  the id of the estadoHabitacionDTO to save.
     * @param estadoHabitacionDTO the estadoHabitacionDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body
     *         the updated estadoHabitacionDTO,
     *         or with status {@code 400 (Bad Request)} if the estadoHabitacionDTO
     *         is not valid,
     *         or with status {@code 500 (Internal Server Error)} if the
     *         estadoHabitacionDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<EstadoHabitacionDTO> updateEstadoHabitacion(
            @PathVariable(value = "id", required = false) final Long id,
            @Valid @RequestBody EstadoHabitacionDTO estadoHabitacionDTO) throws URISyntaxException {
        LOG.debug("REST request to update EstadoHabitacion : {}, {}", id, estadoHabitacionDTO);
        if (estadoHabitacionDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, estadoHabitacionDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!estadoHabitacionRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        // Check if the entity is active
        estadoHabitacionRepository.findById(id).ifPresent(existing -> {
            if (Boolean.FALSE.equals(existing.getActivo())) {
                throw new BadRequestAlertException("Cannot update inactive entity", ENTITY_NAME, "inactive");
            }
        });

        estadoHabitacionDTO = estadoHabitacionService.update(estadoHabitacionDTO);
        return ResponseEntity.ok()
                .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME,
                        estadoHabitacionDTO.getId().toString()))
                .body(estadoHabitacionDTO);
    }

    /**
     * {@code PATCH  /estado-habitacions/:id} : Partial updates given fields of an
     * existing estadoHabitacion, field will ignore if it is null
     *
     * @param id                  the id of the estadoHabitacionDTO to save.
     * @param estadoHabitacionDTO the estadoHabitacionDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body
     *         the updated estadoHabitacionDTO,
     *         or with status {@code 400 (Bad Request)} if the estadoHabitacionDTO
     *         is not valid,
     *         or with status {@code 404 (Not Found)} if the estadoHabitacionDTO is
     *         not found,
     *         or with status {@code 500 (Internal Server Error)} if the
     *         estadoHabitacionDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_EMPLOYEE')")
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<EstadoHabitacionDTO> partialUpdateEstadoHabitacion(
            @PathVariable(value = "id", required = false) final Long id,
            @NotNull @RequestBody EstadoHabitacionDTO estadoHabitacionDTO) throws URISyntaxException {
        LOG.debug("REST request to partial update EstadoHabitacion partially : {}, {}", id, estadoHabitacionDTO);
        if (estadoHabitacionDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, estadoHabitacionDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!estadoHabitacionRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        // Check if the entity is active
        estadoHabitacionRepository.findById(id).ifPresent(existing -> {
            if (Boolean.FALSE.equals(existing.getActivo())) {
                throw new BadRequestAlertException("Cannot update inactive entity", ENTITY_NAME, "inactive");
            }
        });

        Optional<EstadoHabitacionDTO> result = estadoHabitacionService.partialUpdate(estadoHabitacionDTO);

        return ResponseUtil.wrapOrNotFound(
                result,
                HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME,
                        estadoHabitacionDTO.getId().toString()));
    }

    /**
     * {@code GET  /estado-habitacions} : get all the estadoHabitacions.
     *
     * @param pageable the pagination information.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list
     *         of estadoHabitacions in body.
     */

    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_EMPLOYEE', 'ROLE_CLIENT')")
    @GetMapping("")
    public ResponseEntity<List<EstadoHabitacionDTO>> getAllEstadoHabitacions(
            @org.springdoc.core.annotations.ParameterObject Pageable pageable,
            @RequestParam(name = "activo", required = false) Boolean activo) {
        LOG.debug("REST request to get a page of EstadoHabitacions");
        Page<EstadoHabitacionDTO> page;
        if (activo != null) {
            page = estadoHabitacionService.findByActivo(activo, pageable);
        } else {
            page = estadoHabitacionService.findByActivo(true, pageable);
        }
        HttpHeaders headers = PaginationUtil
                .generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /estado-habitacions/:id} : get the "id" estadoHabitacion.
     *
     * @param id the id of the estadoHabitacionDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body
     *         the estadoHabitacionDTO, or with status {@code 404 (Not Found)}.
     */
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_EMPLOYEE', 'ROLE_CLIENT')")
    @GetMapping("/{id}")
    public ResponseEntity<EstadoHabitacionDTO> getEstadoHabitacion(@PathVariable("id") Long id) {
        LOG.debug("REST request to get EstadoHabitacion : {}", id);
        Optional<EstadoHabitacionDTO> estadoHabitacionDTO = estadoHabitacionService.findOne(id);

        if (estadoHabitacionDTO.isPresent() && Boolean.FALSE.equals(estadoHabitacionDTO.get().getActivo())) {
            throw new BadRequestAlertException("The room status is inactive", ENTITY_NAME, "inactive");
        }

        return ResponseUtil.wrapOrNotFound(estadoHabitacionDTO);
    }

    /**
     * {@code DELETE  /estado-habitacions/:id} : delete the "id" estadoHabitacion.
     *
     * @param id the id of the estadoHabitacionDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEstadoHabitacion(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete EstadoHabitacion : {}", id);
        estadoHabitacionService.delete(id);
        return ResponseEntity.noContent()
                .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
                .build();
    }

}
