package com.hotel.app.web.rest;

import com.hotel.app.repository.SeccionHeroRepository;
import com.hotel.app.service.SeccionHeroService;
import com.hotel.app.service.dto.SeccionHeroDTO;
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
 * REST controller for managing {@link com.hotel.app.domain.SeccionHero}.
 */
@RestController
@RequestMapping("/api/seccion-heroes")
public class SeccionHeroResource {

    private static final Logger LOG = LoggerFactory.getLogger(SeccionHeroResource.class);

    private static final String ENTITY_NAME = "hotelAppSeccionHero";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final SeccionHeroService seccionHeroService;

    private final SeccionHeroRepository seccionHeroRepository;

    private final com.hotel.app.config.ApplicationProperties applicationProperties;

    public SeccionHeroResource(SeccionHeroService seccionHeroService, SeccionHeroRepository seccionHeroRepository, com.hotel.app.config.ApplicationProperties applicationProperties) {
        this.seccionHeroService = seccionHeroService;
        this.seccionHeroRepository = seccionHeroRepository;
        this.applicationProperties = applicationProperties;
    }

    /**
     * {@code POST  /seccion-heroes/upload-image} : Uploads an image for the landing page.
     *
     * @param file the image file to upload.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the relative path of the image.
     */
    @PostMapping("/upload-image")
    public ResponseEntity<String> uploadImage(@RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        LOG.debug("REST request to upload image for SeccionHero");
        if (file.isEmpty()) {
            throw new BadRequestAlertException("File cannot be empty", ENTITY_NAME, "fileempty");
        }
        try {
            // Define path: images/landing/filename.ext
            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            java.nio.file.Path rootPath = java.nio.file.Paths.get(applicationProperties.getImagePath()).toAbsolutePath();
            java.nio.file.Path landingPath = rootPath.resolve("landing");
            if (!java.nio.file.Files.exists(landingPath)) {
                java.nio.file.Files.createDirectories(landingPath);
            }
            java.nio.file.Path targetPath = landingPath.resolve(fileName);
            java.nio.file.Files.copy(file.getInputStream(), targetPath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);

            String relativePath = "landing/" + fileName;
            return ResponseEntity.ok(relativePath);
        } catch (java.io.IOException e) {
            LOG.error("Failed to store file", e);
            throw new BadRequestAlertException("Failed to store file", ENTITY_NAME, "fileuploaderror");
        }
    }

    /**
     * {@code POST  /seccion-heroes} : Create a new seccionHero.
     *
     * @param seccionHeroDTO the seccionHeroDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new seccionHeroDTO, or with status {@code 400 (Bad Request)} if the seccionHero has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<SeccionHeroDTO> createSeccionHero(@Valid @RequestBody SeccionHeroDTO seccionHeroDTO) throws URISyntaxException {
        LOG.debug("REST request to save SeccionHero : {}", seccionHeroDTO);
        if (seccionHeroDTO.getId() != null) {
            throw new BadRequestAlertException("A new seccionHero cannot already have an ID", ENTITY_NAME, "idexists");
        }
        seccionHeroDTO = seccionHeroService.save(seccionHeroDTO);
        return ResponseEntity.created(new URI("/api/seccion-heroes/" + seccionHeroDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, seccionHeroDTO.getId().toString()))
            .body(seccionHeroDTO);
    }

    /**
     * {@code PUT  /seccion-heroes/:id} : Updates an existing seccionHero.
     *
     * @param id the id of the seccionHeroDTO to save.
     * @param seccionHeroDTO the seccionHeroDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated seccionHeroDTO,
     * or with status {@code 400 (Bad Request)} if the seccionHeroDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the seccionHeroDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<SeccionHeroDTO> updateSeccionHero(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody SeccionHeroDTO seccionHeroDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update SeccionHero : {}, {}", id, seccionHeroDTO);
        if (seccionHeroDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, seccionHeroDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!seccionHeroRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        seccionHeroDTO = seccionHeroService.update(seccionHeroDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, seccionHeroDTO.getId().toString()))
            .body(seccionHeroDTO);
    }

    /**
     * {@code PATCH  /seccion-heroes/:id} : Partial updates given fields of an existing seccionHero, field will ignore if it is null
     *
     * @param id the id of the seccionHeroDTO to save.
     * @param seccionHeroDTO the seccionHeroDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated seccionHeroDTO,
     * or with status {@code 400 (Bad Request)} if the seccionHeroDTO is not valid,
     * or with status {@code 404 (Not Found)} if the seccionHeroDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the seccionHeroDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<SeccionHeroDTO> partialUpdateSeccionHero(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody SeccionHeroDTO seccionHeroDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update SeccionHero partially : {}, {}", id, seccionHeroDTO);
        if (seccionHeroDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, seccionHeroDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!seccionHeroRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<SeccionHeroDTO> result = seccionHeroService.partialUpdate(seccionHeroDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, seccionHeroDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /seccion-heroes} : get all the seccionHeroes.
     *
     * @param pageable the pagination information.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of seccionHeroes in body.
     */
    @GetMapping("")
    public ResponseEntity<List<SeccionHeroDTO>> getAllSeccionHeroes(@org.springdoc.core.annotations.ParameterObject Pageable pageable) {
        LOG.debug("REST request to get a page of SeccionHeroes");
        Page<SeccionHeroDTO> page = seccionHeroService.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /seccion-heroes/:id} : get the "id" seccionHero.
     *
     * @param id the id of the seccionHeroDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the seccionHeroDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<SeccionHeroDTO> getSeccionHero(@PathVariable("id") Long id) {
        LOG.debug("REST request to get SeccionHero : {}", id);
        Optional<SeccionHeroDTO> seccionHeroDTO = seccionHeroService.findOne(id);
        return ResponseUtil.wrapOrNotFound(seccionHeroDTO);
    }

    /**
     * {@code DELETE  /seccion-heroes/:id} : delete the "id" seccionHero.
     *
     * @param id the id of the seccionHeroDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSeccionHero(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete SeccionHero : {}", id);
        seccionHeroService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
