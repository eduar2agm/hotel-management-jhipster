package com.hotel.app.web.rest;

import com.hotel.app.domain.Habitacion;
import com.hotel.app.repository.HabitacionRepository;
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
 * REST controller for managing {@link com.hotel.app.domain.Habitacion}.
 */
@RestController
@RequestMapping("/api/habitacions")
@Transactional
public class HabitacionResource {

    private static final Logger LOG = LoggerFactory.getLogger(HabitacionResource.class);

    private static final String ENTITY_NAME = "hotelAppHabitacion";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final HabitacionRepository habitacionRepository;

    public HabitacionResource(HabitacionRepository habitacionRepository) {
        this.habitacionRepository = habitacionRepository;
    }

    /**
     * {@code POST  /habitacions} : Create a new habitacion.
     *
     * @param habitacion the habitacion to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new habitacion, or with status {@code 400 (Bad Request)} if the habitacion has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<Habitacion> createHabitacion(@Valid @RequestBody Habitacion habitacion) throws URISyntaxException {
        LOG.debug("REST request to save Habitacion : {}", habitacion);
        if (habitacion.getId() != null) {
            throw new BadRequestAlertException("A new habitacion cannot already have an ID", ENTITY_NAME, "idexists");
        }
        habitacion = habitacionRepository.save(habitacion);
        return ResponseEntity.created(new URI("/api/habitacions/" + habitacion.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, habitacion.getId().toString()))
            .body(habitacion);
    }

    /**
     * {@code PUT  /habitacions/:id} : Updates an existing habitacion.
     *
     * @param id the id of the habitacion to save.
     * @param habitacion the habitacion to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated habitacion,
     * or with status {@code 400 (Bad Request)} if the habitacion is not valid,
     * or with status {@code 500 (Internal Server Error)} if the habitacion couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Habitacion> updateHabitacion(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody Habitacion habitacion
    ) throws URISyntaxException {
        LOG.debug("REST request to update Habitacion : {}, {}", id, habitacion);
        if (habitacion.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, habitacion.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!habitacionRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        habitacion = habitacionRepository.save(habitacion);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, habitacion.getId().toString()))
            .body(habitacion);
    }

    /**
     * {@code PATCH  /habitacions/:id} : Partial updates given fields of an existing habitacion, field will ignore if it is null
     *
     * @param id the id of the habitacion to save.
     * @param habitacion the habitacion to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated habitacion,
     * or with status {@code 400 (Bad Request)} if the habitacion is not valid,
     * or with status {@code 404 (Not Found)} if the habitacion is not found,
     * or with status {@code 500 (Internal Server Error)} if the habitacion couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<Habitacion> partialUpdateHabitacion(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody Habitacion habitacion
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update Habitacion partially : {}, {}", id, habitacion);
        if (habitacion.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, habitacion.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!habitacionRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<Habitacion> result = habitacionRepository
            .findById(habitacion.getId())
            .map(existingHabitacion -> {
                if (habitacion.getNumero() != null) {
                    existingHabitacion.setNumero(habitacion.getNumero());
                }
                if (habitacion.getCapacidad() != null) {
                    existingHabitacion.setCapacidad(habitacion.getCapacidad());
                }
                if (habitacion.getDescripcion() != null) {
                    existingHabitacion.setDescripcion(habitacion.getDescripcion());
                }
                if (habitacion.getImagen() != null) {
                    existingHabitacion.setImagen(habitacion.getImagen());
                }

                return existingHabitacion;
            })
            .map(habitacionRepository::save);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, habitacion.getId().toString())
        );
    }

    /**
     * {@code GET  /habitacions} : get all the habitacions.
     *
     * @param pageable the pagination information.
     * @param eagerload flag to eager load entities from relationships (This is applicable for many-to-many).
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of habitacions in body.
     */
    @GetMapping("")
    public ResponseEntity<List<Habitacion>> getAllHabitacions(
        @org.springdoc.core.annotations.ParameterObject Pageable pageable,
        @RequestParam(name = "eagerload", required = false, defaultValue = "true") boolean eagerload
    ) {
        LOG.debug("REST request to get a page of Habitacions");
        Page<Habitacion> page;
        if (eagerload) {
            page = habitacionRepository.findAllWithEagerRelationships(pageable);
        } else {
            page = habitacionRepository.findAll(pageable);
        }
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /habitacions/:id} : get the "id" habitacion.
     *
     * @param id the id of the habitacion to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the habitacion, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Habitacion> getHabitacion(@PathVariable("id") Long id) {
        LOG.debug("REST request to get Habitacion : {}", id);
        Optional<Habitacion> habitacion = habitacionRepository.findOneWithEagerRelationships(id);
        return ResponseUtil.wrapOrNotFound(habitacion);
    }

    /**
     * {@code DELETE  /habitacions/:id} : delete the "id" habitacion.
     *
     * @param id the id of the habitacion to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHabitacion(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete Habitacion : {}", id);
        habitacionRepository.deleteById(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
