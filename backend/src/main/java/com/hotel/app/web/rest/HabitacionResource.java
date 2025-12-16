package com.hotel.app.web.rest;

import com.hotel.app.repository.HabitacionRepository;
import com.hotel.app.service.HabitacionService;
import com.hotel.app.service.dto.HabitacionDTO;
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
 * REST controller for managing {@link com.hotel.app.domain.Habitacion}.
 */
@RestController
@RequestMapping("/api/habitacions")
public class HabitacionResource {

    private static final Logger LOG = LoggerFactory.getLogger(HabitacionResource.class);

    private static final String ENTITY_NAME = "hotelAppHabitacion";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final HabitacionService habitacionService;

    private final HabitacionRepository habitacionRepository;

    public HabitacionResource(HabitacionService habitacionService, HabitacionRepository habitacionRepository) {
        this.habitacionService = habitacionService;
        this.habitacionRepository = habitacionRepository;
    }

    /**
     * {@code POST  /habitacions} : Create a new habitacion.
     *
     * @param habitacionDTO the habitacionDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with
     *         body the new habitacionDTO, or with status {@code 400 (Bad Request)}
     *         if the habitacion has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN')")
    @PostMapping("")
    public ResponseEntity<HabitacionDTO> createHabitacion(@Valid @RequestBody HabitacionDTO habitacionDTO)
            throws URISyntaxException {
        LOG.debug("REST request to save Habitacion : {}", habitacionDTO);
        if (habitacionDTO.getId() != null) {
            throw new BadRequestAlertException("A new habitacion cannot already have an ID", ENTITY_NAME, "idexists");
        }
        habitacionDTO = habitacionService.save(habitacionDTO);
        return ResponseEntity.created(new URI("/api/habitacions/" + habitacionDTO.getId()))
                .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME,
                        habitacionDTO.getId().toString()))
                .body(habitacionDTO);
    }

    /**
     * {@code PUT  /habitacions/:id} : Updates an existing habitacion.
     *
     * @param id            the id of the habitacionDTO to save.
     * @param habitacionDTO the habitacionDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body
     *         the updated habitacionDTO,
     *         or with status {@code 400 (Bad Request)} if the habitacionDTO is not
     *         valid,
     *         or with status {@code 500 (Internal Server Error)} if the
     *         habitacionDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_EMPLOYEE')")
    @PutMapping("/{id}")
    public ResponseEntity<HabitacionDTO> updateHabitacion(
            @PathVariable(value = "id", required = false) final Long id,
            @Valid @RequestBody HabitacionDTO habitacionDTO) throws URISyntaxException {
        LOG.debug("REST request to update Habitacion : {}, {}", id, habitacionDTO);
        if (habitacionDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, habitacionDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!habitacionRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        habitacionDTO = habitacionService.update(habitacionDTO);
        return ResponseEntity.ok()
                .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME,
                        habitacionDTO.getId().toString()))
                .body(habitacionDTO);
    }

    /**
     * {@code PATCH  /habitacions/:id} : Partial updates given fields of an existing
     * habitacion, field will ignore if it is null
     *
     * @param id            the id of the habitacionDTO to save.
     * @param habitacionDTO the habitacionDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body
     *         the updated habitacionDTO,
     *         or with status {@code 400 (Bad Request)} if the habitacionDTO is not
     *         valid,
     *         or with status {@code 404 (Not Found)} if the habitacionDTO is not
     *         found,
     *         or with status {@code 500 (Internal Server Error)} if the
     *         habitacionDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_EMPLOYEE')")
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<HabitacionDTO> partialUpdateHabitacion(
            @PathVariable(value = "id", required = false) final Long id,
            @NotNull @RequestBody HabitacionDTO habitacionDTO) throws URISyntaxException {
        LOG.debug("REST request to partial update Habitacion partially : {}, {}", id, habitacionDTO);
        if (habitacionDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, habitacionDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!habitacionRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<HabitacionDTO> result = habitacionService.partialUpdate(habitacionDTO);

        return ResponseUtil.wrapOrNotFound(
                result,
                HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME,
                        habitacionDTO.getId().toString()));
    }

    /**
     * {@code GET  /habitacions} : get all the habitacions.
     *
     * @param pageable the pagination information.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list
     *         of habitacions in body.
     */
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_EMPLOYEE', 'ROLE_CLIENT')")
    @GetMapping("")
    public ResponseEntity<List<HabitacionDTO>> getAllHabitacions(
            @org.springdoc.core.annotations.ParameterObject Pageable pageable,
            @RequestParam(name = "activo", required = false) Boolean activo) {
        LOG.debug("REST request to get a page of Habitacions");
        Page<HabitacionDTO> page;
        if (activo != null) {
            page = habitacionService.findByActivo(activo, pageable);
        } else {
            page = habitacionService.findAll(pageable);
        }
        HttpHeaders headers = PaginationUtil
                .generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /habitacions/inactive} : get all the inactive habitacions.
     *
     * @param pageable the pagination information.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list
     *         of habitacions in body.
     */
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_EMPLOYEE')")
    @GetMapping("/inactive")
    public ResponseEntity<List<HabitacionDTO>> getInactiveHabitacions(
            @org.springdoc.core.annotations.ParameterObject Pageable pageable) {
        LOG.debug("REST request to get a page of inactive Habitacions");
        Page<HabitacionDTO> page = habitacionService.findByActivo(false, pageable);
        HttpHeaders headers = PaginationUtil
                .generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /habitacions/:id} : get the "id" habitacion.
     *
     * @param id the id of the habitacionDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body
     *         the habitacionDTO, or with status {@code 404 (Not Found)}.
     */
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_EMPLOYEE', 'ROLE_CLIENT')")
    @GetMapping("/{id}")
    public ResponseEntity<HabitacionDTO> getHabitacion(@PathVariable("id") Long id) {
        LOG.debug("REST request to get Habitacion : {}", id);
        Optional<HabitacionDTO> habitacionDTO = habitacionService.findOne(id);
        return ResponseUtil.wrapOrNotFound(habitacionDTO);
    }

    /**
     * {@code DELETE  /habitacions/:id} : delete the "id" habitacion.
     *
     * @param id the id of the habitacionDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHabitacion(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete Habitacion : {}", id);
        habitacionService.delete(id);
        return ResponseEntity.noContent()
                .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
                .build();
    }

    /**
     * {@code PUT  /habitacions/:id/activate} : activate the "id" habitacion.
     *
     * @param id the id of the habitacionDTO to activate.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)}.
     */
    @PutMapping("/{id}/activate")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> activateHabitacion(@PathVariable Long id) {
        LOG.debug("REST request to activate Habitacion : {}", id);
        habitacionService.activate(id);
        return ResponseEntity.ok().build();
    }

    /**
     * {@code PUT  /habitacions/:id/deactivate} : deactivate the "id" habitacion.
     *
     * @param id the id of the habitacionDTO to deactivate.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)}.
     */
    @PutMapping("/{id}/deactivate")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> deactivateHabitacion(@PathVariable Long id) {
        LOG.debug("REST request to deactivate Habitacion : {}", id);
        habitacionService.deactivate(id);
        return ResponseEntity.ok().build();
    }
}
