package com.hotel.app.web.rest;

import com.hotel.app.repository.ConfiguracionSistemaRepository;
import com.hotel.app.service.ConfiguracionSistemaService;
import com.hotel.app.service.dto.ConfiguracionSistemaDTO;
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
 * {@link com.hotel.app.domain.ConfiguracionSistema}.
 */
@RestController
@RequestMapping("/api/configuracion-sistemas")
public class ConfiguracionSistemaResource {

    private static final Logger LOG = LoggerFactory.getLogger(ConfiguracionSistemaResource.class);

    private static final String ENTITY_NAME = "hotelAppConfiguracionSistema";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final ConfiguracionSistemaService configuracionSistemaService;

    private final ConfiguracionSistemaRepository configuracionSistemaRepository;

    public ConfiguracionSistemaResource(
            ConfiguracionSistemaService configuracionSistemaService,
            ConfiguracionSistemaRepository configuracionSistemaRepository) {
        this.configuracionSistemaService = configuracionSistemaService;
        this.configuracionSistemaRepository = configuracionSistemaRepository;
    }

    /**
     * {@code POST  /configuracion-sistemas} : Create a new configuracionSistema.
     *
     * @param configuracionSistemaDTO the configuracionSistemaDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with
     *         body the new configuracionSistemaDTO, or with status
     *         {@code 400 (Bad Request)} if the configuracionSistema has already an
     *         ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<ConfiguracionSistemaDTO> createConfiguracionSistema(
            @Valid @RequestBody ConfiguracionSistemaDTO configuracionSistemaDTO) throws URISyntaxException {
        LOG.debug("REST request to save ConfiguracionSistema : {}", configuracionSistemaDTO);
        if (configuracionSistemaDTO.getId() != null) {
            throw new BadRequestAlertException("A new configuracionSistema cannot already have an ID", ENTITY_NAME,
                    "idexists");
        }
        configuracionSistemaDTO = configuracionSistemaService.save(configuracionSistemaDTO);
        return ResponseEntity.created(new URI("/api/configuracion-sistemas/" + configuracionSistemaDTO.getId()))
                .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME,
                        configuracionSistemaDTO.getId().toString()))
                .body(configuracionSistemaDTO);
    }

    /**
     * {@code PUT  /configuracion-sistemas/:id} : Updates an existing
     * configuracionSistema.
     *
     * @param id                      the id of the configuracionSistemaDTO to save.
     * @param configuracionSistemaDTO the configuracionSistemaDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body
     *         the updated configuracionSistemaDTO,
     *         or with status {@code 400 (Bad Request)} if the
     *         configuracionSistemaDTO is not valid,
     *         or with status {@code 500 (Internal Server Error)} if the
     *         configuracionSistemaDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<ConfiguracionSistemaDTO> updateConfiguracionSistema(
            @PathVariable(value = "id", required = false) final Long id,
            @Valid @RequestBody ConfiguracionSistemaDTO configuracionSistemaDTO) throws URISyntaxException {
        LOG.debug("REST request to update ConfiguracionSistema : {}, {}", id, configuracionSistemaDTO);
        if (configuracionSistemaDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, configuracionSistemaDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!configuracionSistemaRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        configuracionSistemaDTO = configuracionSistemaService.update(configuracionSistemaDTO);
        return ResponseEntity.ok()
                .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME,
                        configuracionSistemaDTO.getId().toString()))
                .body(configuracionSistemaDTO);
    }

    /**
     * {@code PATCH  /configuracion-sistemas/:id} : Partial updates given fields of
     * an existing configuracionSistema, field will ignore if it is null
     *
     * @param id                      the id of the configuracionSistemaDTO to save.
     * @param configuracionSistemaDTO the configuracionSistemaDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body
     *         the updated configuracionSistemaDTO,
     *         or with status {@code 400 (Bad Request)} if the
     *         configuracionSistemaDTO is not valid,
     *         or with status {@code 404 (Not Found)} if the configuracionSistemaDTO
     *         is not found,
     *         or with status {@code 500 (Internal Server Error)} if the
     *         configuracionSistemaDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<ConfiguracionSistemaDTO> partialUpdateConfiguracionSistema(
            @PathVariable(value = "id", required = false) final Long id,
            @NotNull @RequestBody ConfiguracionSistemaDTO configuracionSistemaDTO) throws URISyntaxException {
        LOG.debug("REST request to partial update ConfiguracionSistema partially : {}, {}", id,
                configuracionSistemaDTO);
        if (configuracionSistemaDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, configuracionSistemaDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!configuracionSistemaRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<ConfiguracionSistemaDTO> result = configuracionSistemaService.partialUpdate(configuracionSistemaDTO);

        return ResponseUtil.wrapOrNotFound(
                result,
                HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME,
                        configuracionSistemaDTO.getId().toString()));
    }

    /**
     * {@code GET  /configuracion-sistemas} : get all the configuracionSistemas.
     *
     * @param pageable  the pagination information.
     * @param eagerload flag to eager load entities from relationships (This is
     *                  applicable for many-to-many).
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list
     *         of configuracionSistemas in body.
     */
    @GetMapping("")
    public ResponseEntity<List<ConfiguracionSistemaDTO>> getAllConfiguracionSistemas(
            @org.springdoc.core.annotations.ParameterObject Pageable pageable,
            @RequestParam(name = "eagerload", required = false, defaultValue = "true") boolean eagerload) {
        LOG.debug("REST request to get a page of ConfiguracionSistemas");
        Page<ConfiguracionSistemaDTO> page;
        if (eagerload) {
            page = configuracionSistemaService.findAllWithEagerRelationships(pageable);
        } else {
            page = configuracionSistemaService.findAll(pageable);
        }
        HttpHeaders headers = PaginationUtil
                .generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /configuracion-sistemas/:id} : get the "id" configuracionSistema.
     *
     * @param id the id of the configuracionSistemaDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body
     *         the configuracionSistemaDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ConfiguracionSistemaDTO> getConfiguracionSistema(@PathVariable("id") Long id) {
        LOG.debug("REST request to get ConfiguracionSistema : {}", id);
        Optional<ConfiguracionSistemaDTO> configuracionSistemaDTO = configuracionSistemaService.findOne(id);
        return ResponseUtil.wrapOrNotFound(configuracionSistemaDTO);
    }

    /**
     * {@code GET  /configuracion-sistemas/clave/:clave} : get the
     * configuracionSistema by "clave".
     *
     * @param clave the unique key of the configuracionSistemaDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body
     *         the configuracionSistemaDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/clave/{clave}")
    public ResponseEntity<ConfiguracionSistemaDTO> getConfiguracionSistemaByClave(@PathVariable("clave") String clave) {
        LOG.debug("REST request to get ConfiguracionSistema by clave : {}", clave);
        Optional<ConfiguracionSistemaDTO> configuracionSistemaDTO = configuracionSistemaService.findByClave(clave);
        return ResponseUtil.wrapOrNotFound(configuracionSistemaDTO);
    }

    /**
     * {@code DELETE  /configuracion-sistemas/:id} : delete the "id"
     * configuracionSistema.
     *
     * @param id the id of the configuracionSistemaDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteConfiguracionSistema(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete ConfiguracionSistema : {}", id);
        configuracionSistemaService.delete(id);
        return ResponseEntity.noContent()
                .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
                .build();
    }
}
