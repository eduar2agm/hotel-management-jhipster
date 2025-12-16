package com.hotel.app.web.rest;

import com.hotel.app.repository.ReservaRepository;
import com.hotel.app.repository.ClienteRepository;
import com.hotel.app.domain.Cliente;
import com.hotel.app.security.AuthoritiesConstants;
import com.hotel.app.security.SecurityUtils;
import com.hotel.app.service.ReservaService;
import com.hotel.app.service.dto.ReservaDTO;
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
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link com.hotel.app.domain.Reserva}.
 */
@RestController
@RequestMapping("/api/reservas")
public class ReservaResource {

    private static final Logger LOG = LoggerFactory.getLogger(ReservaResource.class);

    private static final String ENTITY_NAME = "hotelAppReserva";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final ReservaService reservaService;

    private final ReservaRepository reservaRepository;

    private final ClienteRepository clienteRepository;

    public ReservaResource(ReservaService reservaService, ReservaRepository reservaRepository,
            ClienteRepository clienteRepository) {
        this.reservaService = reservaService;
        this.reservaRepository = reservaRepository;
        this.clienteRepository = clienteRepository;
    }

    /**
     * {@code POST  /reservas} : Create a new reserva.
     *
     * @param reservaDTO the reservaDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with
     *         body the new reservaDTO, or with status {@code 400 (Bad Request)} if
     *         the reserva has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_EMPLOYEE', 'ROLE_CLIENT')")
    @PostMapping("")
    public ResponseEntity<ReservaDTO> createReserva(@Valid @RequestBody ReservaDTO reservaDTO)
            throws URISyntaxException {
        LOG.debug("REST request to save Reserva : {}", reservaDTO);
        if (reservaDTO.getId() != null) {
            throw new BadRequestAlertException("A new reserva cannot already have an ID", ENTITY_NAME, "idexists");
        }
        reservaDTO = reservaService.save(reservaDTO);
        return ResponseEntity.created(new URI("/api/reservas/" + reservaDTO.getId()))
                .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME,
                        reservaDTO.getId().toString()))
                .body(reservaDTO);
    }

    /**
     * {@code PUT  /reservas/:id} : Updates an existing reserva.
     *
     * @param id         the id of the reservaDTO to save.
     * @param reservaDTO the reservaDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body
     *         the updated reservaDTO,
     *         or with status {@code 400 (Bad Request)} if the reservaDTO is not
     *         valid,
     *         or with status {@code 500 (Internal Server Error)} if the reservaDTO
     *         couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_EMPLOYEE')")
    @PutMapping("/{id}")
    public ResponseEntity<ReservaDTO> updateReserva(
            @PathVariable(value = "id", required = false) final Long id,
            @Valid @RequestBody ReservaDTO reservaDTO) throws URISyntaxException {
        LOG.debug("REST request to update Reserva : {}, {}", id, reservaDTO);
        if (reservaDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, reservaDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!reservaRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        reservaDTO = reservaService.update(reservaDTO);
        return ResponseEntity.ok()
                .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME,
                        reservaDTO.getId().toString()))
                .body(reservaDTO);
    }

    /**
     * {@code PATCH  /reservas/:id} : Partial updates given fields of an existing
     * reserva, field will ignore if it is null
     *
     * @param id         the id of the reservaDTO to save.
     * @param reservaDTO the reservaDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body
     *         the updated reservaDTO,
     *         or with status {@code 400 (Bad Request)} if the reservaDTO is not
     *         valid,
     *         or with status {@code 404 (Not Found)} if the reservaDTO is not
     *         found,
     *         or with status {@code 500 (Internal Server Error)} if the reservaDTO
     *         couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_EMPLOYEE', 'ROLE_CLIENT')")
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<ReservaDTO> partialUpdateReserva(
            @PathVariable(value = "id", required = false) final Long id,
            @NotNull @RequestBody ReservaDTO reservaDTO) throws URISyntaxException {
        LOG.debug("REST request to partial update Reserva partially : {}, {}", id, reservaDTO);
        if (reservaDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, reservaDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!reservaRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<ReservaDTO> result = reservaService.partialUpdate(reservaDTO);

        return ResponseUtil.wrapOrNotFound(
                result,
                HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, reservaDTO.getId().toString()));
    }

    /**
     * {@code GET  /reservas} : get all the reservas.
     *
     * @param pageable  the pagination information.
     * @param eagerload flag to eager load entities from relationships (This is
     *                  applicable for many-to-many).
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list
     *         of reservas in body.
     */
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_EMPLOYEE', 'ROLE_CLIENT')")
    @GetMapping("")
    public ResponseEntity<List<ReservaDTO>> getAllReservas(
            @org.springdoc.core.annotations.ParameterObject Pageable pageable,
            @RequestParam(name = "eagerload", required = false, defaultValue = "true") boolean eagerload) {
        LOG.debug("REST request to get a page of Reservas");

        // Auto-filter for Clients
        if (SecurityUtils.hasCurrentUserThisAuthority(AuthoritiesConstants.CLIENT) &&
                !SecurityUtils.hasCurrentUserThisAuthority(AuthoritiesConstants.ADMIN) &&
                !SecurityUtils.hasCurrentUserThisAuthority(AuthoritiesConstants.EMPLOYEE)) {

            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            Optional<Cliente> cliente = Optional.empty();

            if (authentication.getPrincipal() instanceof org.springframework.security.oauth2.jwt.Jwt) {
                org.springframework.security.oauth2.jwt.Jwt jwt = (org.springframework.security.oauth2.jwt.Jwt) authentication
                        .getPrincipal();
                String sub = jwt.getSubject();
                cliente = clienteRepository.findOneByKeycloakId(sub);
            }

            if (!cliente.isPresent()) {
                String login = SecurityUtils.getCurrentUserLogin().orElse("");
                cliente = clienteRepository.findOneByCorreo(login);
                if (!cliente.isPresent()) {
                    cliente = clienteRepository.findOneByKeycloakId(login);
                }
            }

            if (cliente.isPresent()) {
                Page<ReservaDTO> page = reservaService.findAllByClienteId(cliente.get().getId(), pageable);
                HttpHeaders headers = PaginationUtil
                        .generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
                return ResponseEntity.ok().headers(headers).body(page.getContent());
            } else {
                // return empty page if client profile not found
                return ResponseEntity.ok().headers(new HttpHeaders()).body(List.of());
            }
        }

        Page<ReservaDTO> page;
        if (eagerload) {
            page = reservaService.findAllWithEagerRelationships(pageable);
        } else {
            page = reservaService.findAll(pageable);
        }
        HttpHeaders headers = PaginationUtil
                .generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /reservas/:id} : get the "id" reserva.
     *
     * @param id the id of the reservaDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body
     *         the reservaDTO, or with status {@code 404 (Not Found)}.
     */
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_EMPLOYEE', 'ROLE_CLIENT')")
    @GetMapping("/{id}")
    public ResponseEntity<ReservaDTO> getReserva(@PathVariable("id") Long id) {
        LOG.debug("REST request to get Reserva : {}", id);
        Optional<ReservaDTO> reservaDTO = reservaService.findOne(id);
        return ResponseUtil.wrapOrNotFound(reservaDTO);
    }

    /**
     * {@code DELETE  /reservas/:id} : delete the "id" reserva.
     *
     * @param id the id of the reservaDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReserva(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete Reserva : {}", id);
        reservaService.delete(id);
        return ResponseEntity.noContent()
                .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
                .build();
    }
}
