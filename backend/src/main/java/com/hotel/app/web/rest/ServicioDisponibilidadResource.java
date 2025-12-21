package com.hotel.app.web.rest;

import com.hotel.app.repository.ServicioDisponibilidadRepository;
import com.hotel.app.service.ServicioDisponibilidadService;
import com.hotel.app.service.dto.ServicioDisponibilidadDTO;
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
 * REST controller for managing
 * {@link com.hotel.app.domain.ServicioDisponibilidad}.
 */
@RestController
@RequestMapping("/api/servicio-disponibilidads")
public class ServicioDisponibilidadResource {

    private final Logger log = LoggerFactory.getLogger(ServicioDisponibilidadResource.class);

    private static final String ENTITY_NAME = "servicioDisponibilidad";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final ServicioDisponibilidadService servicioDisponibilidadService;

    private final ServicioDisponibilidadRepository servicioDisponibilidadRepository;

    public ServicioDisponibilidadResource(
            ServicioDisponibilidadService servicioDisponibilidadService,
            ServicioDisponibilidadRepository servicioDisponibilidadRepository) {
        this.servicioDisponibilidadService = servicioDisponibilidadService;
        this.servicioDisponibilidadRepository = servicioDisponibilidadRepository;
    }

    /**
     * {@code POST  /servicio-disponibilidads} : Create a new
     * servicioDisponibilidad.
     *
     * @param servicioDisponibilidadDTO the servicioDisponibilidadDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with
     *         body the new servicioDisponibilidadDTO, or with status
     *         {@code 400 (Bad Request)} if the servicioDisponibilidad has already
     *         an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<ServicioDisponibilidadDTO> createServicioDisponibilidad(
            @Valid @RequestBody ServicioDisponibilidadDTO servicioDisponibilidadDTO) throws URISyntaxException {
        log.debug("REST request to save ServicioDisponibilidad : {}", servicioDisponibilidadDTO);
        if (servicioDisponibilidadDTO.getId() != null) {
            throw new BadRequestAlertException("A new servicioDisponibilidad cannot already have an ID", ENTITY_NAME,
                    "idexists");
        }
        ServicioDisponibilidadDTO result = servicioDisponibilidadService.save(servicioDisponibilidadDTO);
        return ResponseEntity
                .created(new URI("/api/servicio-disponibilidads/" + result.getId()))
                .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME,
                        result.getId().toString()))
                .body(result);
    }

    /**
     * {@code PUT  /servicio-disponibilidads/:id} : Updates an existing
     * servicioDisponibilidad.
     *
     * @param id                        the id of the servicioDisponibilidadDTO to
     *                                  save.
     * @param servicioDisponibilidadDTO the servicioDisponibilidadDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body
     *         the updated servicioDisponibilidadDTO,
     *         or with status {@code 400 (Bad Request)} if the
     *         servicioDisponibilidadDTO is not valid,
     *         or with status {@code 500 (Internal Server Error)} if the
     *         servicioDisponibilidadDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<ServicioDisponibilidadDTO> updateServicioDisponibilidad(
            @PathVariable(value = "id", required = false) final Long id,
            @Valid @RequestBody ServicioDisponibilidadDTO servicioDisponibilidadDTO) throws URISyntaxException {
        log.debug("REST request to update ServicioDisponibilidad : {}, {}", id, servicioDisponibilidadDTO);
        if (servicioDisponibilidadDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, servicioDisponibilidadDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!servicioDisponibilidadRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        ServicioDisponibilidadDTO result = servicioDisponibilidadService.update(servicioDisponibilidadDTO);
        return ResponseEntity
                .ok()
                .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME,
                        servicioDisponibilidadDTO.getId().toString()))
                .body(result);
    }

    /**
     * {@code PATCH  /servicio-disponibilidads/:id} : Partial updates given fields
     * of an existing servicioDisponibilidad, field will ignore if it is null
     *
     * @param id                        the id of the servicioDisponibilidadDTO to
     *                                  save.
     * @param servicioDisponibilidadDTO the servicioDisponibilidadDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body
     *         the updated servicioDisponibilidadDTO,
     *         or with status {@code 400 (Bad Request)} if the
     *         servicioDisponibilidadDTO is not valid,
     *         or with status {@code 404 (Not Found)} if the
     *         servicioDisponibilidadDTO is not found,
     *         or with status {@code 500 (Internal Server Error)} if the
     *         servicioDisponibilidadDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<ServicioDisponibilidadDTO> partialUpdateServicioDisponibilidad(
            @PathVariable(value = "id", required = false) final Long id,
            @NotNull @RequestBody ServicioDisponibilidadDTO servicioDisponibilidadDTO) throws URISyntaxException {
        log.debug("REST request to partial update ServicioDisponibilidad partially : {}, {}", id,
                servicioDisponibilidadDTO);
        if (servicioDisponibilidadDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, servicioDisponibilidadDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!servicioDisponibilidadRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<ServicioDisponibilidadDTO> result = servicioDisponibilidadService
                .partialUpdate(servicioDisponibilidadDTO);

        return ResponseUtil.wrapOrNotFound(
                result,
                HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME,
                        servicioDisponibilidadDTO.getId().toString()));
    }

    /**
     * {@code GET  /servicio-disponibilidads} : get all the servicioDisponibilidads.
     *
     * @param pageable the pagination information.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list
     *         of servicioDisponibilidads in body.
     */
    @GetMapping("")
    public ResponseEntity<List<ServicioDisponibilidadDTO>> getAllServicioDisponibilidads(
            @org.springdoc.core.annotations.ParameterObject Pageable pageable) {
        log.debug("REST request to get a page of ServicioDisponibilidads");
        Page<ServicioDisponibilidadDTO> page = servicioDisponibilidadService.findAll(pageable);
        HttpHeaders headers = PaginationUtil
                .generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /servicio-disponibilidads/:id} : get the "id"
     * servicioDisponibilidad.
     *
     * @param id the id of the servicioDisponibilidadDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body
     *         the servicioDisponibilidadDTO, or with status
     *         {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ServicioDisponibilidadDTO> getServicioDisponibilidad(@PathVariable("id") Long id) {
        log.debug("REST request to get ServicioDisponibilidad : {}", id);
        Optional<ServicioDisponibilidadDTO> servicioDisponibilidadDTO = servicioDisponibilidadService.findOne(id);
        return ResponseUtil.wrapOrNotFound(servicioDisponibilidadDTO);
    }

    /**
     * {@code DELETE  /servicio-disponibilidads/:id} : delete the "id"
     * servicioDisponibilidad.
     *
     * @param id the id of the servicioDisponibilidadDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteServicioDisponibilidad(@PathVariable("id") Long id) {
        log.debug("REST request to delete ServicioDisponibilidad : {}", id);
        servicioDisponibilidadService.delete(id);
        return ResponseEntity
                .noContent()
                .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
                .build();
    }

    /**
     * {@code GET  /servicio-disponibilidads/servicio/:id} : get all
     * disponibilidades for a service.
     */
    @GetMapping("/servicio/{id}")
    public ResponseEntity<List<ServicioDisponibilidadDTO>> getServicioDisponibilidadByServicio(
            @PathVariable("id") Long id) {
        log.debug("REST request to get ServicioDisponibilidad by servicio : {}", id);
        List<ServicioDisponibilidadDTO> list = servicioDisponibilidadService.findByServicioId(id);
        return ResponseEntity.ok().body(list);
    }
}
