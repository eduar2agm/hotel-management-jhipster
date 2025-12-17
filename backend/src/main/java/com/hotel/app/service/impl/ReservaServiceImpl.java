package com.hotel.app.service.impl;

import com.hotel.app.domain.Reserva;
import com.hotel.app.domain.ReservaDetalle;
import com.hotel.app.domain.enumeration.EstadoReserva;
import com.hotel.app.repository.ReservaDetalleRepository;
import com.hotel.app.repository.ReservaRepository;
import com.hotel.app.service.ReservaService;
import com.hotel.app.service.dto.ReservaDTO;
import com.hotel.app.service.mapper.ReservaMapper;
import com.hotel.app.web.rest.errors.BadRequestAlertException;
import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.hotel.app.domain.Reserva}.
 */
@Service
@Transactional
public class ReservaServiceImpl implements ReservaService {

    private static final Logger LOG = LoggerFactory.getLogger(ReservaServiceImpl.class);

    private final ReservaRepository reservaRepository;

    private final ReservaMapper reservaMapper;

    private final ReservaDetalleRepository reservaDetalleRepository;

    public ReservaServiceImpl(ReservaRepository reservaRepository, ReservaMapper reservaMapper,
            ReservaDetalleRepository reservaDetalleRepository) {
        this.reservaRepository = reservaRepository;
        this.reservaMapper = reservaMapper;
        this.reservaDetalleRepository = reservaDetalleRepository;
    }

    @Override
    public ReservaDTO save(ReservaDTO reservaDTO) {
        LOG.debug("Request to save Reserva : {}", reservaDTO);
        Reserva reserva = reservaMapper.toEntity(reservaDTO);
        reserva = reservaRepository.save(reserva);
        return reservaMapper.toDto(reserva);
    }

    @Override
    public ReservaDTO update(ReservaDTO reservaDTO) {
        LOG.debug("Request to update Reserva : {}", reservaDTO);
        Reserva reserva = reservaMapper.toEntity(reservaDTO);
        reserva = reservaRepository.save(reserva);
        return reservaMapper.toDto(reserva);
    }

    @Override
    public Optional<ReservaDTO> partialUpdate(ReservaDTO reservaDTO) {
        LOG.debug("Request to partially update Reserva : {}", reservaDTO);

        return reservaRepository
                .findById(reservaDTO.getId())
                .map(existingReserva -> {
                    reservaMapper.partialUpdate(existingReserva, reservaDTO);

                    return existingReserva;
                })
                .map(reservaRepository::save)
                .map(reservaMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReservaDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all Reservas");
        return reservaRepository.findAll(pageable).map(reservaMapper::toDto);
    }

    public Page<ReservaDTO> findAllWithEagerRelationships(Pageable pageable) {
        return reservaRepository.findAllWithEagerRelationships(pageable).map(reservaMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<ReservaDTO> findOne(Long id) {
        LOG.debug("Request to get Reserva : {}", id);
        return reservaRepository.findOneWithEagerRelationships(id).map(reservaMapper::toDto);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        LOG.debug("Request to delete Reserva with all associated details: {}", id);

        List<ReservaDetalle> detalles = reservaDetalleRepository.findAllByReservaId(id);
        if (!detalles.isEmpty()) {
            reservaDetalleRepository.deleteAll(detalles);
            LOG.info("Deleted {} details for Reserva ID: {}", detalles.size(), id);
        }

        reservaRepository.deleteById(id);
        LOG.info("Reserva ID: {} deleted successfully with cascade", id);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReservaDTO> findAllByClienteId(Long clienteId, Pageable pageable) {
        LOG.debug("Request to get Reservas by Client ID : {}", clienteId);
        return reservaRepository.findByClienteId(clienteId, pageable).map(reservaMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReservaDTO> findByActivo(Boolean activo, Pageable pageable) {
        LOG.debug("Request to get Reservas by activo : {}", activo);
        return reservaRepository.findByActivo(activo, pageable).map(reservaMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReservaDTO> findByActivoWithEagerRelationships(Boolean activo, Pageable pageable) {
        LOG.debug("Request to get Reservas by activo with eager relationships: {}", activo);
        return reservaRepository.findByActivoWithEagerRelationships(activo, pageable).map(reservaMapper::toDto);
    }

    @Override
    public void activate(Long id) {
        LOG.debug("Request to activate Reserva : {}", id);
        reservaRepository
                .findById(id)
                .ifPresent(reserva -> {
                    reserva.setActivo(true);
                    reservaRepository.save(reserva);

                    // Cascade to details
                    List<ReservaDetalle> details = reservaDetalleRepository.findAllByReservaId(id);
                    details.forEach(detail -> detail.setActivo(true));
                    reservaDetalleRepository.saveAll(details);
                });
    }

    @Override
    public void deactivate(Long id) {
        LOG.debug("Request to deactivate Reserva : {}", id);
        reservaRepository
                .findById(id)
                .ifPresent(reserva -> {
                    // Verificar que la reserva esté cancelada antes de desactivar
                    if (reserva.getEstado() != EstadoReserva.CANCELADA) {
                        throw new BadRequestAlertException(
                                "Solo se puede desactivar una reserva que esté cancelada",
                                "reserva",
                                "reservaNoCancelada");
                    }

                    reserva.setActivo(false);
                    reservaRepository.save(reserva);

                    // Cascade to details
                    List<ReservaDetalle> details = reservaDetalleRepository.findAllByReservaId(id);
                    details.forEach(detail -> detail.setActivo(false));
                    reservaDetalleRepository.saveAll(details);
                });
    }
}
