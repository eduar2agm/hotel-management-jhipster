package com.hotel.app.service.impl;

import com.hotel.app.domain.Cliente;
import com.hotel.app.repository.ClienteRepository;
import com.hotel.app.service.ClienteService;
import com.hotel.app.service.dto.ClienteDTO;
import com.hotel.app.service.mapper.ClienteMapper;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.hotel.app.domain.Cliente}.
 */
@Service
@Transactional
public class ClienteServiceImpl implements ClienteService {

    private static final Logger LOG = LoggerFactory.getLogger(ClienteServiceImpl.class);

    private final ClienteRepository clienteRepository;

    private final ClienteMapper clienteMapper;

    private final com.hotel.app.service.KeycloakService keycloakService;

    public ClienteServiceImpl(ClienteRepository clienteRepository, ClienteMapper clienteMapper,
            com.hotel.app.service.KeycloakService keycloakService) {
        this.clienteRepository = clienteRepository;
        this.clienteMapper = clienteMapper;
        this.keycloakService = keycloakService;
    }

    @Override
    public ClienteDTO save(ClienteDTO clienteDTO) {
        LOG.debug("Request to save Cliente : {}", clienteDTO);
        Cliente cliente = clienteMapper.toEntity(clienteDTO);
        cliente = clienteRepository.save(cliente);
        return clienteMapper.toDto(cliente);
    }

    @Override
    public ClienteDTO update(ClienteDTO clienteDTO) {
        LOG.debug("Request to update Cliente : {}", clienteDTO);
        Cliente cliente = clienteMapper.toEntity(clienteDTO);
        cliente = clienteRepository.save(cliente);
        syncWithKeycloak(cliente);
        return clienteMapper.toDto(cliente);
    }

    private void syncWithKeycloak(Cliente cliente) {
        if (cliente.getKeycloakId() != null) {
            try {
                keycloakService.updateUser(
                        cliente.getKeycloakId(),
                        cliente.getCorreo(),
                        cliente.getNombre(),
                        cliente.getApellido());
            } catch (Exception e) {
                LOG.error("Failed to sync client {} with Keycloak", cliente.getId(), e);
            }
        }
    }

    @Override
    public Optional<ClienteDTO> partialUpdate(ClienteDTO clienteDTO) {
        LOG.debug("Request to partially update Cliente : {}", clienteDTO);

        return clienteRepository
                .findById(clienteDTO.getId())
                .map(existingCliente -> {
                    clienteMapper.partialUpdate(existingCliente, clienteDTO);

                    return existingCliente;
                })
                .map(clienteRepository::save)
                .map(savedCliente -> {
                    syncWithKeycloak(savedCliente);
                    return savedCliente;
                })
                .map(clienteMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ClienteDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all Clientes");
        return clienteRepository.findAll(pageable).map(clienteMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<ClienteDTO> findOne(Long id) {
        LOG.debug("Request to get Cliente : {}", id);
        return clienteRepository.findById(id).map(clienteMapper::toDto);
    }

    @Override
    public void delete(Long id) {
        LOG.debug("Request to delete Cliente : {}", id);
        clienteRepository.deleteById(id);
    }

    @Override
    public void activate(Long id) {
        LOG.debug("Request to activate Cliente : {}", id);
        clienteRepository
                .findById(id)
                .ifPresent(cliente -> {
                    cliente.setActivo(true);
                    clienteRepository.save(cliente);
                    keycloakService.updateUserStatus(cliente.getKeycloakId(), true);
                });
    }

    @Override
    public void deactivate(Long id) {
        LOG.debug("Request to deactivate Cliente : {}", id);
        clienteRepository
                .findById(id)
                .ifPresent(cliente -> {
                    cliente.setActivo(false);
                    clienteRepository.save(cliente);
                    keycloakService.updateUserStatus(cliente.getKeycloakId(), false);
                });
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ClienteDTO> findByActivo(Boolean activo, Pageable pageable) {
        LOG.debug("Request to get Clientes by activo : {}", activo);
        return clienteRepository.findByActivo(activo, pageable).map(clienteMapper::toDto);
    }
}
