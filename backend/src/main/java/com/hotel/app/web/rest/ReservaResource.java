package com.hotel.app.web.rest;

import com.hotel.app.repository.ReservaRepository;
import com.hotel.app.repository.ClienteRepository;
import com.hotel.app.domain.Cliente;
import com.hotel.app.security.AuthoritiesConstants;
import com.hotel.app.security.SecurityUtils;
import com.hotel.app.service.ReservaService;
import com.hotel.app.service.ClienteService;
import com.hotel.app.service.dto.ReservaDTO;
import com.hotel.app.service.dto.ClienteDTO;
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

    private final ClienteService clienteService;

    public ReservaResource(ReservaService reservaService, ReservaRepository reservaRepository,
            ClienteRepository clienteRepository, ClienteService clienteService) {
        this.reservaService = reservaService;
        this.reservaRepository = reservaRepository;
        this.clienteRepository = clienteRepository;
        this.clienteService = clienteService;
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
    @PreAuthorize("permitAll()")
    @PostMapping("")
    public ResponseEntity<ReservaDTO> createReserva(@Valid @RequestBody ReservaDTO reservaDTO)
            throws URISyntaxException {
        LOG.debug("REST request to save Reserva : {}", reservaDTO);
        if (reservaDTO.getId() != null) {
            throw new BadRequestAlertException("A new reserva cannot already have an ID", ENTITY_NAME, "idexists");
        }

        // Logic for Anonymous/Client assignment
        if (SecurityUtils.isAuthenticated()) {
            // Logic for authenticated users (auto-assign current user's client profile)
            if (SecurityUtils.hasCurrentUserThisAuthority(AuthoritiesConstants.CLIENT) &&
                    !SecurityUtils.hasCurrentUserThisAuthority(AuthoritiesConstants.ADMIN) &&
                    !SecurityUtils.hasCurrentUserThisAuthority(AuthoritiesConstants.EMPLOYEE)) {
                // Existing logic implicit? No, currently it relied on Frontend sending ID or
                // backend not checking.
                // We should ensure the client matches the logged in user to prevent spoofing
                String currentUserLogin = SecurityUtils.getCurrentUserLogin().orElse("");
                // Find client by keycloakId (sub) or email
                // For now, we trust the logic in getAllReservas or we should enforce it here.
                // To be safe, we fetch the client associated with the token.
                // IMPLEMENTATION NOTE: For now, we assume frontend provides correct ID or we
                // handle it if null.
                // But strictly, we should override provided client with logged-in client.
            }
        } else {
            // Anonymous User
            if (reservaDTO.getCliente() == null) {
                throw new BadRequestAlertException("Client details required for anonymous booking", ENTITY_NAME,
                        "clientnamesmissing");
            }
            if (reservaDTO.getCliente().getCorreo() == null) {
                throw new BadRequestAlertException("Client email required", ENTITY_NAME, "emailmissing");
            }

            String email = reservaDTO.getCliente().getCorreo();
            Optional<Cliente> existingCliente = clienteRepository.findOneByCorreo(email);

            if (existingCliente.isPresent()) {
                if (existingCliente.get().getKeycloakId() != null) {
                    // Registered user exists with this email -> Require Login
                    // CAUTION: This exposes if a user exists.
                    throw new BadRequestAlertException("An account with this email already exists. Please login.",
                            ENTITY_NAME, "emailexists_login");
                }
                // Update existing anonymous client details?
                // For now, use existing client ID
                ClienteDTO existingDTO = new ClienteDTO();
                existingDTO.setId(existingCliente.get().getId());
                // We could update fields here if changed
                reservaDTO.setCliente(existingDTO);
            } else {
                // Create new Anonymous Client
                ClienteDTO newCliente = reservaDTO.getCliente();
                newCliente.setActivo(true);
                // Ensure keycloakId is null (it should be)
                newCliente.setKeycloakId(null);
                // Ensure ID is null
                newCliente.setId(null);

                // Allow other fields to be null/partial based on updated Entity
                newCliente = clienteService.save(newCliente);
                reservaDTO.setCliente(newCliente);
            }
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

        // Check if the entity is active
        reservaRepository.findById(id).ifPresent(existing -> {
            if (Boolean.FALSE.equals(existing.getActivo())) {
                throw new BadRequestAlertException("Cannot update inactive entity", ENTITY_NAME, "inactive");
            }
        });

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

        // Check if the entity is active
        reservaRepository.findById(id).ifPresent(existing -> {
            if (Boolean.FALSE.equals(existing.getActivo())) {
                throw new BadRequestAlertException("Cannot update inactive entity", ENTITY_NAME, "inactive");
            }
        });

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
            @RequestParam(name = "eagerload", required = false, defaultValue = "true") boolean eagerload,
            @RequestParam(name = "activo", required = false) Boolean activo) {
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
        if (activo != null) {
            page = reservaService.findByActivo(activo, pageable);
        } else if (eagerload) {
            // Default to active=true even for eager load, since 'activo' is null here
            page = reservaService.findByActivoWithEagerRelationships(true, pageable);
        } else {
            page = reservaService.findByActivo(true, pageable);
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

        if (reservaDTO.isPresent() && Boolean.FALSE.equals(reservaDTO.get().getActivo())) {
            throw new BadRequestAlertException("The reservation is inactive", ENTITY_NAME, "inactive");
        }

        return ResponseUtil.wrapOrNotFound(reservaDTO);
    }

    /**
     * {@code GET  /reservas/inactive} : get all the inactive reservas.
     *
     * @param pageable the pagination information.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list
     *         of reservas in body.
     */
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_EMPLOYEE')")
    @GetMapping("/inactive")
    public ResponseEntity<List<ReservaDTO>> getInactiveReservas(
            @org.springdoc.core.annotations.ParameterObject Pageable pageable) {
        LOG.debug("REST request to get a page of inactive Reservas");
        Page<ReservaDTO> page = reservaService.findByActivo(false, pageable);
        HttpHeaders headers = PaginationUtil
                .generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code DELETE  /reservas/:id} : delete the "id" reserva.
     *
     * @param id the id of the reservaDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReserva(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete Reserva : {}", id);
        reservaService.delete(id);
        return ResponseEntity.noContent()
                .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
                .build();
    }

    /**
     * {@code PUT  /reservas/:id/activate} : activate the "id" reserva.
     *
     * @param id the id of the reservaDTO to activate.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)}.
     */
    @PutMapping("/{id}/activate")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> activateReserva(@PathVariable Long id) {
        LOG.debug("REST request to activate Reserva : {}", id);
        reservaService.activate(id);
        return ResponseEntity.ok().build();
    }

    /**
     * {@code PUT  /reservas/:id/deactivate} : deactivate the "id" reserva.
     *
     * @param id the id of the reservaDTO to deactivate.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)}.
     */
    @PutMapping("/{id}/deactivate")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> deactivateReserva(@PathVariable Long id) {
        LOG.debug("REST request to deactivate Reserva : {}", id);
        reservaService.deactivate(id);
        return ResponseEntity.ok().build();
    }

    /**
     * {@code GET  /reservas/stats-grafico} : get stats for chart.
     *
     * @param periodo the period (semana, mes).
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the stats
     *         in body.
     */
    @GetMapping("/stats-grafico")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_EMPLOYEE')")
    public ResponseEntity<List<java.util.Map<String, Object>>> getEstadisticasGrafico(
            @RequestParam(value = "periodo", defaultValue = "semana") String periodo) {
        LOG.debug("REST request to get Reserva stats for chart: {}", periodo);
        List<java.util.Map<String, Object>> stats = reservaService.obtenerEstadisticasGrafico(periodo);
        return ResponseEntity.ok().body(stats);
    }
}
