package com.hotel.app.service.impl;

import com.hotel.app.domain.ServicioContratado;
import com.hotel.app.repository.ServicioContratadoRepository;
import com.hotel.app.service.ServicioContratadoService;
import com.hotel.app.service.dto.ServicioContratadoDTO;
import com.hotel.app.service.mapper.ServicioContratadoMapper;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing
 * {@link com.hotel.app.domain.ServicioContratado}.
 */
@Service
@Transactional
public class ServicioContratadoServiceImpl implements ServicioContratadoService {

    private static final Logger LOG = LoggerFactory.getLogger(ServicioContratadoServiceImpl.class);

    private final ServicioContratadoRepository servicioContratadoRepository;

    private final ServicioContratadoMapper servicioContratadoMapper;

    public ServicioContratadoServiceImpl(
            ServicioContratadoRepository servicioContratadoRepository,
            ServicioContratadoMapper servicioContratadoMapper) {
        this.servicioContratadoRepository = servicioContratadoRepository;
        this.servicioContratadoMapper = servicioContratadoMapper;
    }

    @Override
    public ServicioContratadoDTO save(ServicioContratadoDTO servicioContratadoDTO) {
        LOG.debug("Request to save ServicioContratado : {}", servicioContratadoDTO);
        ServicioContratado servicioContratado = servicioContratadoMapper.toEntity(servicioContratadoDTO);
        servicioContratado = servicioContratadoRepository.save(servicioContratado);
        return servicioContratadoMapper.toDto(servicioContratado);
    }

    @Override
    public ServicioContratadoDTO update(ServicioContratadoDTO servicioContratadoDTO) {
        LOG.debug("Request to update ServicioContratado : {}", servicioContratadoDTO);
        ServicioContratado servicioContratado = servicioContratadoMapper.toEntity(servicioContratadoDTO);
        servicioContratado = servicioContratadoRepository.save(servicioContratado);
        return servicioContratadoMapper.toDto(servicioContratado);
    }

    @Override
    public Optional<ServicioContratadoDTO> partialUpdate(ServicioContratadoDTO servicioContratadoDTO) {
        LOG.debug("Request to partially update ServicioContratado : {}", servicioContratadoDTO);

        return servicioContratadoRepository
                .findById(servicioContratadoDTO.getId())
                .map(existingServicioContratado -> {
                    servicioContratadoMapper.partialUpdate(existingServicioContratado, servicioContratadoDTO);

                    return existingServicioContratado;
                })
                .map(servicioContratadoRepository::save)
                .map(servicioContratadoMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ServicioContratadoDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all ServicioContratados");
        return servicioContratadoRepository.findAll(pageable).map(servicioContratadoMapper::toDto);
    }

    public Page<ServicioContratadoDTO> findAllWithEagerRelationships(Pageable pageable) {
        return servicioContratadoRepository.findAllWithEagerRelationships(pageable)
                .map(servicioContratadoMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<ServicioContratadoDTO> findOne(Long id) {
        LOG.debug("Request to get ServicioContratado : {}", id);
        return servicioContratadoRepository.findOneWithEagerRelationships(id).map(servicioContratadoMapper::toDto);
    }

    @Override
    public void delete(Long id) {
        LOG.debug("Request to delete ServicioContratado : {}", id);
        servicioContratadoRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public java.util.List<ServicioContratadoDTO> findByReservaId(Long reservaId) {
        LOG.debug("Request to get ServicioContratados by Reserva : {}", reservaId);
        return servicioContratadoRepository.findByReservaId(reservaId).stream()
                .map(servicioContratadoMapper::toDto)
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public java.util.List<ServicioContratadoDTO> findByClienteId(Long clienteId) {
        LOG.debug("Request to get ServicioContratados by Cliente : {}", clienteId);
        return servicioContratadoRepository.findByClienteId(clienteId).stream()
                .map(servicioContratadoMapper::toDto)
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    public void confirmar(Long id) {
        LOG.debug("Request to confirm ServicioContratado : {}", id);
        servicioContratadoRepository.findById(id).ifPresent(servicioContratado -> {
            servicioContratado.setEstado(com.hotel.app.domain.enumeration.EstadoServicioContratado.CONFIRMADO);
            servicioContratadoRepository.save(servicioContratado);
        });
    }

    @Override
    public void completar(Long id) {
        LOG.debug("Request to complete ServicioContratado : {}", id);
        servicioContratadoRepository.findById(id).ifPresent(servicioContratado -> {
            servicioContratado.setEstado(com.hotel.app.domain.enumeration.EstadoServicioContratado.COMPLETADO);
            servicioContratadoRepository.save(servicioContratado);
        });
    }

    @Override
    public void cancelar(Long id) {
        LOG.debug("Request to cancel ServicioContratado : {}", id);
        servicioContratadoRepository.findById(id).ifPresent(servicioContratado -> {
            servicioContratado.setEstado(com.hotel.app.domain.enumeration.EstadoServicioContratado.CANCELADO);
            servicioContratadoRepository.save(servicioContratado);
        });
    }
}
