package com.hotel.app.web.rest;

import com.hotel.app.repository.ImagenRepository;
import com.hotel.app.service.ImagenService;
import com.hotel.app.service.dto.ImagenDTO;
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
 * REST controller for managing {@link com.hotel.app.domain.Imagen}.
 */
@RestController
@RequestMapping("/api/imagens")
public class ImagenResource {

    private static final Logger LOG = LoggerFactory.getLogger(ImagenResource.class);

    private static final String ENTITY_NAME = "hotelAppImagen";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final ImagenService imagenService;

    private final ImagenRepository imagenRepository;

    public ImagenResource(ImagenService imagenService, ImagenRepository imagenRepository) {
        this.imagenService = imagenService;
        this.imagenRepository = imagenRepository;
    }

    /**
     * {@code POST  /imagens} : Create a new imagen.
     *
     * @param imagenDTO the imagenDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with
     *         body the new imagenDTO, or with status {@code 400 (Bad Request)} if
     *         the imagen has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<ImagenDTO> createImagen(@Valid @RequestBody ImagenDTO imagenDTO) throws URISyntaxException {
        LOG.debug("REST request to save Imagen : {}", imagenDTO);
        if (imagenDTO.getId() != null) {
            throw new BadRequestAlertException("A new imagen cannot already have an ID", ENTITY_NAME, "idexists");
        }
        imagenDTO = imagenService.save(imagenDTO);
        return ResponseEntity.created(new URI("/api/imagens/" + imagenDTO.getId()))
                .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME,
                        imagenDTO.getId().toString()))
                .body(imagenDTO);
    }

    /**
     * {@code PUT  /imagens/:id} : Updates an existing imagen.
     *
     * @param id        the id of the imagenDTO to save.
     * @param imagenDTO the imagenDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body
     *         the updated imagenDTO,
     *         or with status {@code 400 (Bad Request)} if the imagenDTO is not
     *         valid,
     *         or with status {@code 500 (Internal Server Error)} if the imagenDTO
     *         couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<ImagenDTO> updateImagen(
            @PathVariable(value = "id", required = false) final Long id,
            @Valid @RequestBody ImagenDTO imagenDTO) throws URISyntaxException {
        LOG.debug("REST request to update Imagen : {}, {}", id, imagenDTO);
        if (imagenDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, imagenDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!imagenRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        imagenDTO = imagenService.update(imagenDTO);
        return ResponseEntity.ok()
                .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME,
                        imagenDTO.getId().toString()))
                .body(imagenDTO);
    }

    /**
     * {@code PATCH  /imagens/:id} : Partial updates given fields of an existing
     * imagen, field will ignore if it is null
     *
     * @param id        the id of the imagenDTO to save.
     * @param imagenDTO the imagenDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body
     *         the updated imagenDTO,
     *         or with status {@code 400 (Bad Request)} if the imagenDTO is not
     *         valid,
     *         or with status {@code 404 (Not Found)} if the imagenDTO is not found,
     *         or with status {@code 500 (Internal Server Error)} if the imagenDTO
     *         couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<ImagenDTO> partialUpdateImagen(
            @PathVariable(value = "id", required = false) final Long id,
            @NotNull @RequestBody ImagenDTO imagenDTO) throws URISyntaxException {
        LOG.debug("REST request to partial update Imagen partially : {}, {}", id, imagenDTO);
        if (imagenDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, imagenDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!imagenRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<ImagenDTO> result = imagenService.partialUpdate(imagenDTO);

        return ResponseUtil.wrapOrNotFound(
                result,
                HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, imagenDTO.getId().toString()));
    }

    /**
     * {@code GET  /imagens} : get all the imagens.
     *
     * @param pageable  the pagination information.
     * @param eagerload flag to eager load entities from relationships (This is
     *                  applicable for many-to-many).
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list
     *         of imagens in body.
     */
    @GetMapping("")
    public ResponseEntity<List<ImagenDTO>> getAllImagens(
            @org.springdoc.core.annotations.ParameterObject Pageable pageable,
            @RequestParam(name = "eagerload", required = false, defaultValue = "true") boolean eagerload,
            @RequestParam(name = "habitacionId.equals", required = false) Long habitacionId,
            @RequestParam(name = "servicioId.equals", required = false) Long servicioId) {
        LOG.debug("REST request to get a page of Imagens");

        if (habitacionId != null) {
            return ResponseEntity.ok(imagenService.findByHabitacionId(habitacionId));
        }

        if (servicioId != null) {
            return ResponseEntity.ok(imagenService.findByServicioId(servicioId));
        }

        Page<ImagenDTO> page;
        if (eagerload) {
            page = imagenService.findAllWithEagerRelationships(pageable);
        } else {
            page = imagenService.findAll(pageable);
        }
        HttpHeaders headers = PaginationUtil
                .generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /imagens/:id} : get the "id" imagen.
     *
     * @param id the id of the imagenDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body
     *         the imagenDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ImagenDTO> getImagen(@PathVariable("id") Long id) {
        LOG.debug("REST request to get Imagen : {}", id);
        Optional<ImagenDTO> imagenDTO = imagenService.findOne(id);
        return ResponseUtil.wrapOrNotFound(imagenDTO);
    }

    /**
     * {@code DELETE  /imagens/:id} : delete the "id" imagen.
     *
     * @param id the id of the imagenDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteImagen(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete Imagen : {}", id);
        imagenService.delete(id);
        return ResponseEntity.noContent()
                .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
                .build();
    }
}
