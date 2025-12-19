package com.hotel.app.web.rest;

import com.hotel.app.domain.enumeration.TipoServicio;
import com.hotel.app.repository.ServicioRepository;
import com.hotel.app.service.ServicioService;
import com.hotel.app.service.dto.ServicioDTO;
import com.hotel.app.web.rest.errors.BadRequestAlertException;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
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
 * REST controller for managing {@link com.hotel.app.domain.Servicio}.
 */
@RestController
@RequestMapping("/api/servicios")
public class ServicioResource {

    private static final Logger LOG = LoggerFactory.getLogger(ServicioResource.class);

    private static final String ENTITY_NAME = "hotelAppServicio";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final ServicioService servicioService;

    private final ServicioRepository servicioRepository;

    public ServicioResource(ServicioService servicioService, ServicioRepository servicioRepository) {
        this.servicioService = servicioService;
        this.servicioRepository = servicioRepository;
    }

    /**
     * {@code POST  /servicios} : Create a new servicio.
     *
     * @param servicioDTO the servicioDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with
     *         body the new servicioDTO, or with status {@code 400 (Bad Request)} if
     *         the servicio has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN')")
    public ResponseEntity<ServicioDTO> createServicio(@Valid @RequestBody ServicioDTO servicioDTO)
            throws URISyntaxException {
        LOG.debug("REST request to save Servicio : {}", servicioDTO);
        if (servicioDTO.getId() != null) {
            throw new BadRequestAlertException("A new servicio cannot already have an ID", ENTITY_NAME, "idexists");
        }
        servicioDTO = servicioService.save(servicioDTO);
        return ResponseEntity.created(new URI("/api/servicios/" + servicioDTO.getId()))
                .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME,
                        servicioDTO.getId().toString()))
                .body(servicioDTO);
    }

    /**
     * {@code PUT  /servicios/:id} : Updates an existing servicio.
     *
     * @param id          the id of the servicioDTO to save.
     * @param servicioDTO the servicioDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body
     *         the updated servicioDTO,
     *         or with status {@code 400 (Bad Request)} if the servicioDTO is not
     *         valid,
     *         or with status {@code 500 (Internal Server Error)} if the servicioDTO
     *         couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN')")
    public ResponseEntity<ServicioDTO> updateServicio(
            @PathVariable(value = "id", required = false) final Long id,
            @Valid @RequestBody ServicioDTO servicioDTO) throws URISyntaxException {
        LOG.debug("REST request to update Servicio : {}, {}", id, servicioDTO);
        if (servicioDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, servicioDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!servicioRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        servicioDTO = servicioService.update(servicioDTO);
        return ResponseEntity.ok()
                .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME,
                        servicioDTO.getId().toString()))
                .body(servicioDTO);
    }

    /**
     * {@code PATCH  /servicios/:id} : Partial updates given fields of an existing
     * servicio, field will ignore if it is null
     *
     * @param id          the id of the servicioDTO to save.
     * @param servicioDTO the servicioDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body
     *         the updated servicioDTO,
     *         or with status {@code 400 (Bad Request)} if the servicioDTO is not
     *         valid,
     *         or with status {@code 404 (Not Found)} if the servicioDTO is not
     *         found,
     *         or with status {@code 500 (Internal Server Error)} if the servicioDTO
     *         couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN')")
    public ResponseEntity<ServicioDTO> partialUpdateServicio(
            @PathVariable(value = "id", required = false) final Long id,
            @NotNull @RequestBody ServicioDTO servicioDTO) throws URISyntaxException {
        LOG.debug("REST request to partial update Servicio partially : {}, {}", id, servicioDTO);
        if (servicioDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, servicioDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!servicioRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<ServicioDTO> result = servicioService.partialUpdate(servicioDTO);

        return ResponseUtil.wrapOrNotFound(
                result,
                HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME,
                        servicioDTO.getId().toString()));
    }

    /**
     * {@code GET  /servicios} : get all the servicios.
     *
     * @param pageable the pagination information.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list
     *         of servicios in body.
     */
    @GetMapping("")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_EMPLOYEE', 'ROLE_CLIENT')")
    public ResponseEntity<List<ServicioDTO>> getAllServicios(
            @org.springdoc.core.annotations.ParameterObject Pageable pageable) {
        LOG.debug("REST request to get a page of Servicios");
        Page<ServicioDTO> page = servicioService.findAll(pageable);
        HttpHeaders headers = PaginationUtil
                .generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /servicios/disponibles} : get all available servicios.
     *
     * @param pageable the pagination information.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list
     *         of servicios in body.
     */
    @GetMapping("/disponibles")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_EMPLOYEE', 'ROLE_CLIENT')")
    public ResponseEntity<List<ServicioDTO>> getServiciosDisponibles(
            @org.springdoc.core.annotations.ParameterObject Pageable pageable) {
        LOG.debug("REST request to get a page of Available Servicios");
        Page<ServicioDTO> page = servicioService.findAllByDisponible(pageable);
        HttpHeaders headers = PaginationUtil
                .generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /servicios/gratuitos} : get all free available servicios.
     *
     * @param pageable the pagination information.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list
     *         of servicios in body.
     */
    @GetMapping("/gratuitos")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_EMPLOYEE', 'ROLE_CLIENT')")
    public ResponseEntity<List<ServicioDTO>> getServiciosGratuitos(
            @org.springdoc.core.annotations.ParameterObject Pageable pageable) {
        LOG.debug("REST request to get a page of Free Servicios");
        Page<ServicioDTO> page = servicioService.findAllByTipoAndDisponible(TipoServicio.GRATUITO, true, pageable);
        HttpHeaders headers = PaginationUtil
                .generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /servicios/pago} : get all paid available servicios.
     *
     * @param pageable the pagination information.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list
     *         of servicios in body.
     */
    @GetMapping("/pago")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_EMPLOYEE', 'ROLE_CLIENT')")
    public ResponseEntity<List<ServicioDTO>> getServiciosPago(
            @org.springdoc.core.annotations.ParameterObject Pageable pageable) {
        LOG.debug("REST request to get a page of Paid Servicios");
        Page<ServicioDTO> page = servicioService.findAllByTipoAndDisponible(TipoServicio.PAGO, true, pageable);
        HttpHeaders headers = PaginationUtil
                .generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /servicios/:id} : get the "id" servicio.
     *
     * @param id the id of the servicioDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body
     *         the servicioDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_EMPLOYEE', 'ROLE_CLIENT')")
    public ResponseEntity<ServicioDTO> getServicio(@PathVariable("id") Long id) {
        LOG.debug("REST request to get Servicio : {}", id);
        Optional<ServicioDTO> servicioDTO = servicioService.findOne(id);
        return ResponseUtil.wrapOrNotFound(servicioDTO);
    }

    /**
     * {@code DELETE  /servicios/:id} : delete the "id" servicio.
     *
     * @param id the id of the servicioDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> deleteServicio(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete Servicio : {}", id);
        servicioService.delete(id);
        return ResponseEntity.noContent()
                .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
                .build();
    }
}
