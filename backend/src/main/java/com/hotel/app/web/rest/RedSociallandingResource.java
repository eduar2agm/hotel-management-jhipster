package com.hotel.app.web.rest;

import com.hotel.app.repository.RedSociallandingRepository;
import com.hotel.app.service.RedSociallandingService;
import com.hotel.app.service.dto.RedSociallandingDTO;
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
 * REST controller for managing {@link com.hotel.app.domain.RedSociallanding}.
 */
@RestController
@RequestMapping("/api/red-socials")
public class RedSociallandingResource {

    private static final Logger LOG = LoggerFactory.getLogger(RedSociallandingResource.class);

    private static final String ENTITY_NAME = "hotelAppRedSociallanding";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final RedSociallandingService redSociallandingService;

    private final RedSociallandingRepository redSociallandingRepository;

    public RedSociallandingResource(RedSociallandingService redSociallandingService, RedSociallandingRepository redSociallandingRepository) {
        this.redSociallandingService = redSociallandingService;
        this.redSociallandingRepository = redSociallandingRepository;
    }

    /**
     * {@code POST  /red-socials} : Create a new redSociallanding.
     *
     * @param redSociallandingDTO the redSociallandingDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new redSociallandingDTO, or with status {@code 400 (Bad Request)} if the redSociallanding has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<RedSociallandingDTO> createRedSociallanding(@Valid @RequestBody RedSociallandingDTO redSociallandingDTO) throws URISyntaxException {
        LOG.debug("REST request to save RedSociallanding : {}", redSociallandingDTO);
        if (redSociallandingDTO.getId() != null) {
            throw new BadRequestAlertException("A new redSociallanding cannot already have an ID", ENTITY_NAME, "idexists");
        }
        redSociallandingDTO = redSociallandingService.save(redSociallandingDTO);
        return ResponseEntity.created(new URI("/api/red-socials/" + redSociallandingDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, redSociallandingDTO.getId().toString()))
            .body(redSociallandingDTO);
    }

    /**
     * {@code PUT  /red-socials/:id} : Updates an existing redSociallanding.
     *
     * @param id the id of the redSociallandingDTO to save.
     * @param redSociallandingDTO the redSociallandingDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated redSociallandingDTO,
     * or with status {@code 400 (Bad Request)} if the redSociallandingDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the redSociallandingDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<RedSociallandingDTO> updateRedSociallanding(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody RedSociallandingDTO redSociallandingDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update RedSociallanding : {}, {}", id, redSociallandingDTO);
        if (redSociallandingDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, redSociallandingDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!redSociallandingRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        redSociallandingDTO = redSociallandingService.update(redSociallandingDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, redSociallandingDTO.getId().toString()))
            .body(redSociallandingDTO);
    }

    /**
     * {@code PATCH  /red-socials/:id} : Partial updates given fields of an existing redSociallanding, field will ignore if it is null
     *
     * @param id the id of the redSociallandingDTO to save.
     * @param redSociallandingDTO the redSociallandingDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated redSociallandingDTO,
     * or with status {@code 400 (Bad Request)} if the redSociallandingDTO is not valid,
     * or with status {@code 404 (Not Found)} if the redSociallandingDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the redSociallandingDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<RedSociallandingDTO> partialUpdateRedSociallanding(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody RedSociallandingDTO redSociallandingDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update RedSociallanding partially : {}, {}", id, redSociallandingDTO);
        if (redSociallandingDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, redSociallandingDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!redSociallandingRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<RedSociallandingDTO> result = redSociallandingService.partialUpdate(redSociallandingDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, redSociallandingDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /red-socials} : get all the redSociallandings.
     *
     * @param pageable the pagination information.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of redSociallandings in body.
     */
    @GetMapping("")
    public ResponseEntity<List<RedSociallandingDTO>> getAllRedSociallandings(@org.springdoc.core.annotations.ParameterObject Pageable pageable) {
        LOG.debug("REST request to get a page of RedSociallandings");
        Page<RedSociallandingDTO> page = redSociallandingService.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /red-socials/:id} : get the "id" redSociallanding.
     *
     * @param id the id of the redSociallandingDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the redSociallandingDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<RedSociallandingDTO> getRedSociallanding(@PathVariable("id") Long id) {
        LOG.debug("REST request to get RedSociallanding : {}", id);
        Optional<RedSociallandingDTO> redSociallandingDTO = redSociallandingService.findOne(id);
        return ResponseUtil.wrapOrNotFound(redSociallandingDTO);
    }

    /**
     * {@code DELETE  /red-socials/:id} : delete the "id" redSociallanding.
     *
     * @param id the id of the redSociallandingDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRedSociallanding(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete RedSociallanding : {}", id);
        redSociallandingService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
