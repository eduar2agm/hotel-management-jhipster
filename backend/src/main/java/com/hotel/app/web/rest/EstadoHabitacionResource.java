package com.hotel.app.web.rest;

import com.hotel.app.domain.EstadoHabitacion;
import com.hotel.app.repository.EstadoHabitacionRepository;
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
 * REST controller for managing {@link com.hotel.app.domain.EstadoHabitacion}.
 */
@RestController
@RequestMapping("/api/estado-habitacions")
@Transactional
public class EstadoHabitacionResource {

    private static final Logger LOG = LoggerFactory.getLogger(EstadoHabitacionResource.class);

    private static final String ENTITY_NAME = "hotelAppEstadoHabitacion";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final EstadoHabitacionRepository estadoHabitacionRepository;

    public EstadoHabitacionResource(EstadoHabitacionRepository estadoHabitacionRepository) {
        this.estadoHabitacionRepository = estadoHabitacionRepository;
    }

    /**
     * {@code POST  /estado-habitacions} : Create a new estadoHabitacion.
     *
     * @param estadoHabitacion the estadoHabitacion to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new estadoHabitacion, or with status {@code 400 (Bad Request)} if the estadoHabitacion has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<EstadoHabitacion> createEstadoHabitacion(@Valid @RequestBody EstadoHabitacion estadoHabitacion)
        throws URISyntaxException {
        LOG.debug("REST request to save EstadoHabitacion : {}", estadoHabitacion);
        if (estadoHabitacion.getId() != null) {
            throw new BadRequestAlertException("A new estadoHabitacion cannot already have an ID", ENTITY_NAME, "idexists");
        }
        estadoHabitacion = estadoHabitacionRepository.save(estadoHabitacion);
        return ResponseEntity.created(new URI("/api/estado-habitacions/" + estadoHabitacion.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, estadoHabitacion.getId().toString()))
            .body(estadoHabitacion);
    }

    /**
     * {@code PUT  /estado-habitacions/:id} : Updates an existing estadoHabitacion.
     *
     * @param id the id of the estadoHabitacion to save.
     * @param estadoHabitacion the estadoHabitacion to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated estadoHabitacion,
     * or with status {@code 400 (Bad Request)} if the estadoHabitacion is not valid,
     * or with status {@code 500 (Internal Server Error)} if the estadoHabitacion couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<EstadoHabitacion> updateEstadoHabitacion(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody EstadoHabitacion estadoHabitacion
    ) throws URISyntaxException {
        LOG.debug("REST request to update EstadoHabitacion : {}, {}", id, estadoHabitacion);
        if (estadoHabitacion.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, estadoHabitacion.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!estadoHabitacionRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        estadoHabitacion = estadoHabitacionRepository.save(estadoHabitacion);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, estadoHabitacion.getId().toString()))
            .body(estadoHabitacion);
    }

    /**
     * {@code PATCH  /estado-habitacions/:id} : Partial updates given fields of an existing estadoHabitacion, field will ignore if it is null
     *
     * @param id the id of the estadoHabitacion to save.
     * @param estadoHabitacion the estadoHabitacion to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated estadoHabitacion,
     * or with status {@code 400 (Bad Request)} if the estadoHabitacion is not valid,
     * or with status {@code 404 (Not Found)} if the estadoHabitacion is not found,
     * or with status {@code 500 (Internal Server Error)} if the estadoHabitacion couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<EstadoHabitacion> partialUpdateEstadoHabitacion(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody EstadoHabitacion estadoHabitacion
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update EstadoHabitacion partially : {}, {}", id, estadoHabitacion);
        if (estadoHabitacion.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, estadoHabitacion.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!estadoHabitacionRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<EstadoHabitacion> result = estadoHabitacionRepository
            .findById(estadoHabitacion.getId())
            .map(existingEstadoHabitacion -> {
                if (estadoHabitacion.getNombre() != null) {
                    existingEstadoHabitacion.setNombre(estadoHabitacion.getNombre());
                }
                if (estadoHabitacion.getDescripcion() != null) {
                    existingEstadoHabitacion.setDescripcion(estadoHabitacion.getDescripcion());
                }

                return existingEstadoHabitacion;
            })
            .map(estadoHabitacionRepository::save);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, estadoHabitacion.getId().toString())
        );
    }

    /**
     * {@code GET  /estado-habitacions} : get all the estadoHabitacions.
     *
     * @param pageable the pagination information.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of estadoHabitacions in body.
     */
    @GetMapping("")
    public ResponseEntity<List<EstadoHabitacion>> getAllEstadoHabitacions(
        @org.springdoc.core.annotations.ParameterObject Pageable pageable
    ) {
        LOG.debug("REST request to get a page of EstadoHabitacions");
        Page<EstadoHabitacion> page = estadoHabitacionRepository.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /estado-habitacions/:id} : get the "id" estadoHabitacion.
     *
     * @param id the id of the estadoHabitacion to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the estadoHabitacion, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<EstadoHabitacion> getEstadoHabitacion(@PathVariable("id") Long id) {
        LOG.debug("REST request to get EstadoHabitacion : {}", id);
        Optional<EstadoHabitacion> estadoHabitacion = estadoHabitacionRepository.findById(id);
        return ResponseUtil.wrapOrNotFound(estadoHabitacion);
    }

    /**
     * {@code DELETE  /estado-habitacions/:id} : delete the "id" estadoHabitacion.
     *
     * @param id the id of the estadoHabitacion to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEstadoHabitacion(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete EstadoHabitacion : {}", id);
        estadoHabitacionRepository.deleteById(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
