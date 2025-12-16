package com.hotel.app.service.impl;

import com.hotel.app.domain.ReservaDetalle;
import com.hotel.app.repository.ReservaDetalleRepository;
import com.hotel.app.service.ReservaDetalleService;
import com.hotel.app.service.dto.ReservaDetalleDTO;
import com.hotel.app.service.mapper.ReservaDetalleMapper;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing
 * {@link com.hotel.app.domain.ReservaDetalle}.
 */
@Service
@Transactional
public class ReservaDetalleServiceImpl implements ReservaDetalleService {

    private static final Logger LOG = LoggerFactory.getLogger(ReservaDetalleServiceImpl.class);

    private final ReservaDetalleRepository reservaDetalleRepository;

    private final ReservaDetalleMapper reservaDetalleMapper;

    public ReservaDetalleServiceImpl(ReservaDetalleRepository reservaDetalleRepository,
            ReservaDetalleMapper reservaDetalleMapper) {
        this.reservaDetalleRepository = reservaDetalleRepository;
        this.reservaDetalleMapper = reservaDetalleMapper;
    }

    @Override
    public ReservaDetalleDTO save(ReservaDetalleDTO reservaDetalleDTO) {
        LOG.debug("Request to save ReservaDetalle : {}", reservaDetalleDTO);
        ReservaDetalle reservaDetalle = reservaDetalleMapper.toEntity(reservaDetalleDTO);
        reservaDetalle = reservaDetalleRepository.save(reservaDetalle);
        return reservaDetalleMapper.toDto(reservaDetalle);
    }

    @Override
    public ReservaDetalleDTO update(ReservaDetalleDTO reservaDetalleDTO) {
        LOG.debug("Request to update ReservaDetalle : {}", reservaDetalleDTO);
        ReservaDetalle reservaDetalle = reservaDetalleMapper.toEntity(reservaDetalleDTO);
        reservaDetalle = reservaDetalleRepository.save(reservaDetalle);
        return reservaDetalleMapper.toDto(reservaDetalle);
    }

    @Override
    public Optional<ReservaDetalleDTO> partialUpdate(ReservaDetalleDTO reservaDetalleDTO) {
        LOG.debug("Request to partially update ReservaDetalle : {}", reservaDetalleDTO);

        return reservaDetalleRepository
                .findById(reservaDetalleDTO.getId())
                .map(existingReservaDetalle -> {
                    reservaDetalleMapper.partialUpdate(existingReservaDetalle, reservaDetalleDTO);

                    return existingReservaDetalle;
                })
                .map(reservaDetalleRepository::save)
                .map(reservaDetalleMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReservaDetalleDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all ReservaDetalles");
        return reservaDetalleRepository.findAll(pageable).map(reservaDetalleMapper::toDto);
    }

    public Page<ReservaDetalleDTO> findAllWithEagerRelationships(Pageable pageable) {
        return reservaDetalleRepository.findAllWithEagerRelationships(pageable).map(reservaDetalleMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReservaDetalleDTO> findAllByReservaId(Long reservaId, Pageable pageable) {
        LOG.debug("Request to get all ReservaDetalles by reservaId : {}", reservaId);
        return reservaDetalleRepository.findAllByReservaId(reservaId, pageable).map(reservaDetalleMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<ReservaDetalleDTO> findOne(Long id) {
        LOG.debug("Request to get ReservaDetalle : {}", id);
        return reservaDetalleRepository.findOneWithEagerRelationships(id).map(reservaDetalleMapper::toDto);
    }

    @Override
    public void delete(Long id) {
        LOG.debug("Request to delete ReservaDetalle : {}", id);
        reservaDetalleRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReservaDetalleDTO> findByActivo(Boolean activo, Pageable pageable) {
        LOG.debug("Request to get ReservaDetalles by activo : {}", activo);
        return reservaDetalleRepository.findByActivo(activo, pageable).map(reservaDetalleMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReservaDetalleDTO> findByActivoWithEagerRelationships(Boolean activo, Pageable pageable) {
        LOG.debug("Request to get ReservaDetalles by activo with eager relationships: {}", activo);
        return reservaDetalleRepository.findByActivoWithEagerRelationships(activo, pageable)
                .map(reservaDetalleMapper::toDto);
    }
}
