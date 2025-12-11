package com.hotel.app.web.rest;

import com.hotel.app.domain.Cliente;
import com.hotel.app.repository.ClienteRepository;
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
 * REST controller for managing {@link com.hotel.app.domain.Cliente}.
 */
@RestController
@RequestMapping("/api/clientes")
@Transactional
public class ClienteResource {

    private static final Logger LOG = LoggerFactory.getLogger(ClienteResource.class);

    private static final String ENTITY_NAME = "hotelAppCliente";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final ClienteRepository clienteRepository;

    public ClienteResource(ClienteRepository clienteRepository) {
        this.clienteRepository = clienteRepository;
    }

    /**
     * {@code POST  /clientes} : Create a new cliente.
     *
     * @param cliente the cliente to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new cliente, or with status {@code 400 (Bad Request)} if the cliente has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<Cliente> createCliente(@Valid @RequestBody Cliente cliente) throws URISyntaxException {
        LOG.debug("REST request to save Cliente : {}", cliente);
        if (cliente.getId() != null) {
            throw new BadRequestAlertException("A new cliente cannot already have an ID", ENTITY_NAME, "idexists");
        }
        cliente = clienteRepository.save(cliente);
        return ResponseEntity.created(new URI("/api/clientes/" + cliente.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, cliente.getId().toString()))
            .body(cliente);
    }

    /**
     * {@code PUT  /clientes/:id} : Updates an existing cliente.
     *
     * @param id the id of the cliente to save.
     * @param cliente the cliente to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated cliente,
     * or with status {@code 400 (Bad Request)} if the cliente is not valid,
     * or with status {@code 500 (Internal Server Error)} if the cliente couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Cliente> updateCliente(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody Cliente cliente
    ) throws URISyntaxException {
        LOG.debug("REST request to update Cliente : {}, {}", id, cliente);
        if (cliente.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, cliente.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!clienteRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        cliente = clienteRepository.save(cliente);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, cliente.getId().toString()))
            .body(cliente);
    }

    /**
     * {@code PATCH  /clientes/:id} : Partial updates given fields of an existing cliente, field will ignore if it is null
     *
     * @param id the id of the cliente to save.
     * @param cliente the cliente to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated cliente,
     * or with status {@code 400 (Bad Request)} if the cliente is not valid,
     * or with status {@code 404 (Not Found)} if the cliente is not found,
     * or with status {@code 500 (Internal Server Error)} if the cliente couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<Cliente> partialUpdateCliente(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody Cliente cliente
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update Cliente partially : {}, {}", id, cliente);
        if (cliente.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, cliente.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!clienteRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<Cliente> result = clienteRepository
            .findById(cliente.getId())
            .map(existingCliente -> {
                if (cliente.getNombre() != null) {
                    existingCliente.setNombre(cliente.getNombre());
                }
                if (cliente.getApellido() != null) {
                    existingCliente.setApellido(cliente.getApellido());
                }
                if (cliente.getCorreo() != null) {
                    existingCliente.setCorreo(cliente.getCorreo());
                }
                if (cliente.getTelefono() != null) {
                    existingCliente.setTelefono(cliente.getTelefono());
                }
                if (cliente.getDireccion() != null) {
                    existingCliente.setDireccion(cliente.getDireccion());
                }
                if (cliente.getTipoIdentificacion() != null) {
                    existingCliente.setTipoIdentificacion(cliente.getTipoIdentificacion());
                }
                if (cliente.getNumeroIdentificacion() != null) {
                    existingCliente.setNumeroIdentificacion(cliente.getNumeroIdentificacion());
                }

                return existingCliente;
            })
            .map(clienteRepository::save);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, cliente.getId().toString())
        );
    }

    /**
     * {@code GET  /clientes} : get all the clientes.
     *
     * @param pageable the pagination information.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of clientes in body.
     */
    @GetMapping("")
    public ResponseEntity<List<Cliente>> getAllClientes(@org.springdoc.core.annotations.ParameterObject Pageable pageable) {
        LOG.debug("REST request to get a page of Clientes");
        Page<Cliente> page = clienteRepository.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /clientes/:id} : get the "id" cliente.
     *
     * @param id the id of the cliente to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the cliente, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Cliente> getCliente(@PathVariable("id") Long id) {
        LOG.debug("REST request to get Cliente : {}", id);
        Optional<Cliente> cliente = clienteRepository.findById(id);
        return ResponseUtil.wrapOrNotFound(cliente);
    }

    /**
     * {@code DELETE  /clientes/:id} : delete the "id" cliente.
     *
     * @param id the id of the cliente to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCliente(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete Cliente : {}", id);
        clienteRepository.deleteById(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
