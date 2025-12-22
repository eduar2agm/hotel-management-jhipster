package com.hotel.app.web.rest;

import com.hotel.app.repository.RedSocialRepository;
import com.hotel.app.service.RedSocialService;
import com.hotel.app.service.dto.RedSocialDTO;
import com.hotel.app.security.AuthoritiesConstants;
import com.hotel.app.web.rest.errors.BadRequestAlertException;
import org.springframework.security.access.prepost.PreAuthorize;
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
 * REST controller for managing {@link com.hotel.app.domain.RedSocial}.
 */
@RestController
@RequestMapping("/api/red-socials")
public class RedSocialResource {

    private static final Logger LOG = LoggerFactory.getLogger(RedSocialResource.class);

    private static final String ENTITY_NAME = "hotelAppRedSocial";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final RedSocialService redSocialService;

    private final RedSocialRepository redSocialRepository;

    public RedSocialResource(RedSocialService redSocialService, RedSocialRepository redSocialRepository) {
        this.redSocialService = redSocialService;
        this.redSocialRepository = redSocialRepository;
    }

    /**
     * {@code POST  /red-socials} : Create a new redSocial.
     *
     * @param redSocialDTO the redSocialDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with
     *         body the new redSocialDTO, or with status {@code 400 (Bad Request)}
     *         if the redSocial has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    @PreAuthorize("hasAuthority(\"" + AuthoritiesConstants.ADMIN + "\")")
    public ResponseEntity<RedSocialDTO> createRedSocial(@Valid @RequestBody RedSocialDTO redSocialDTO)
            throws URISyntaxException {
        LOG.debug("REST request to save RedSocial : {}", redSocialDTO);
        if (redSocialDTO.getId() != null) {
            throw new BadRequestAlertException("A new redSocial cannot already have an ID", ENTITY_NAME, "idexists");
        }
        redSocialDTO = redSocialService.save(redSocialDTO);
        return ResponseEntity.created(new URI("/api/red-socials/" + redSocialDTO.getId()))
                .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME,
                        redSocialDTO.getId().toString()))
                .body(redSocialDTO);
    }

    /**
     * {@code PUT  /red-socials/:id} : Updates an existing redSocial.
     *
     * @param id           the id of the redSocialDTO to save.
     * @param redSocialDTO the redSocialDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body
     *         the updated redSocialDTO,
     *         or with status {@code 400 (Bad Request)} if the redSocialDTO is not
     *         valid,
     *         or with status {@code 500 (Internal Server Error)} if the
     *         redSocialDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority(\"" + AuthoritiesConstants.ADMIN + "\")")
    public ResponseEntity<RedSocialDTO> updateRedSocial(
            @PathVariable(value = "id", required = false) final Long id,
            @Valid @RequestBody RedSocialDTO redSocialDTO) throws URISyntaxException {
        LOG.debug("REST request to update RedSocial : {}, {}", id, redSocialDTO);
        if (redSocialDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, redSocialDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!redSocialRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        redSocialDTO = redSocialService.update(redSocialDTO);
        return ResponseEntity.ok()
                .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME,
                        redSocialDTO.getId().toString()))
                .body(redSocialDTO);
    }

    /**
     * {@code PATCH  /red-socials/:id} : Partial updates given fields of an existing
     * redSocial, field will ignore if it is null
     *
     * @param id           the id of the redSocialDTO to save.
     * @param redSocialDTO the redSocialDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body
     *         the updated redSocialDTO,
     *         or with status {@code 400 (Bad Request)} if the redSocialDTO is not
     *         valid,
     *         or with status {@code 404 (Not Found)} if the redSocialDTO is not
     *         found,
     *         or with status {@code 500 (Internal Server Error)} if the
     *         redSocialDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    @PreAuthorize("hasAuthority(\"" + AuthoritiesConstants.ADMIN + "\")")
    public ResponseEntity<RedSocialDTO> partialUpdateRedSocial(
            @PathVariable(value = "id", required = false) final Long id,
            @NotNull @RequestBody RedSocialDTO redSocialDTO) throws URISyntaxException {
        LOG.debug("REST request to partial update RedSocial partially : {}, {}", id, redSocialDTO);
        if (redSocialDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, redSocialDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!redSocialRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<RedSocialDTO> result = redSocialService.partialUpdate(redSocialDTO);

        return ResponseUtil.wrapOrNotFound(
                result,
                HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME,
                        redSocialDTO.getId().toString()));
    }

    /**
     * {@code GET  /red-socials} : get all the redSocials.
     *
     * @param pageable the pagination information.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list
     *         of redSocials in body.
     */
    @GetMapping("")
    public ResponseEntity<List<RedSocialDTO>> getAllRedSocials(
            @org.springdoc.core.annotations.ParameterObject Pageable pageable) {
        LOG.debug("REST request to get a page of RedSocials");
        Page<RedSocialDTO> page = redSocialService.findAll(pageable);
        HttpHeaders headers = PaginationUtil
                .generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /red-socials/:id} : get the "id" redSocial.
     *
     * @param id the id of the redSocialDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body
     *         the redSocialDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<RedSocialDTO> getRedSocial(@PathVariable("id") Long id) {
        LOG.debug("REST request to get RedSocial : {}", id);
        Optional<RedSocialDTO> redSocialDTO = redSocialService.findOne(id);
        return ResponseUtil.wrapOrNotFound(redSocialDTO);
    }

    /**
     * {@code DELETE  /red-socials/:id} : delete the "id" redSocial.
     *
     * @param id the id of the redSocialDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority(\"" + AuthoritiesConstants.ADMIN + "\")")
    public ResponseEntity<Void> deleteRedSocial(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete RedSocial : {}", id);
        redSocialService.delete(id);
        return ResponseEntity.noContent()
                .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
                .build();
    }
}
