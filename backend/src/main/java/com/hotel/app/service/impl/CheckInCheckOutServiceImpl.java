package com.hotel.app.service.impl;

import com.hotel.app.domain.CheckInCheckOut;
import com.hotel.app.domain.Reserva;
import com.hotel.app.domain.ReservaDetalle;
import com.hotel.app.domain.enumeration.EstadoReserva;
import com.hotel.app.repository.CheckInCheckOutRepository;
import com.hotel.app.repository.ReservaDetalleRepository;
import com.hotel.app.repository.ReservaRepository;
import com.hotel.app.service.CheckInCheckOutService;
import com.hotel.app.service.dto.CheckInCheckOutDTO;
import com.hotel.app.service.mapper.CheckInCheckOutMapper;
import com.hotel.app.web.rest.errors.BadRequestAlertException;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing
 * {@link com.hotel.app.domain.CheckInCheckOut}.
 */
@Service
@Transactional
public class CheckInCheckOutServiceImpl implements CheckInCheckOutService {

    private static final Logger LOG = LoggerFactory.getLogger(CheckInCheckOutServiceImpl.class);

    private final CheckInCheckOutRepository checkInCheckOutRepository;

    private final CheckInCheckOutMapper checkInCheckOutMapper;

    private final ReservaRepository reservaRepository;

    private final ReservaDetalleRepository reservaDetalleRepository;

    public CheckInCheckOutServiceImpl(
            CheckInCheckOutRepository checkInCheckOutRepository,
            CheckInCheckOutMapper checkInCheckOutMapper,
            ReservaRepository reservaRepository,
            ReservaDetalleRepository reservaDetalleRepository) {
        this.checkInCheckOutRepository = checkInCheckOutRepository;
        this.checkInCheckOutMapper = checkInCheckOutMapper;
        this.reservaRepository = reservaRepository;
        this.reservaDetalleRepository = reservaDetalleRepository;
    }

    @Override
    public CheckInCheckOutDTO save(CheckInCheckOutDTO checkInCheckOutDTO) {
        LOG.debug("Request to save CheckInCheckOut : {}", checkInCheckOutDTO);

        if (checkInCheckOutDTO.getReservaDetalle() != null && checkInCheckOutDTO.getReservaDetalle().getId() != null) {
            reservaDetalleRepository.findById(checkInCheckOutDTO.getReservaDetalle().getId()).ifPresent(detalle -> {
                Reserva reserva = detalle.getReserva();
                if (reserva != null && reserva.getFechaInicio() != null) {
                    LocalDate hoy = LocalDate.now();
                    LocalDate fechaInicio = LocalDate.ofInstant(reserva.getFechaInicio(), ZoneId.systemDefault());

                    if (!hoy.equals(fechaInicio)) {
                        throw new BadRequestAlertException(
                                "El check-in solo está permitido en la fecha de entrada",
                                "CheckInCheckOut",
                                "checkInDateInvalid");
                    }
                }
            });
        }

        CheckInCheckOut checkInCheckOut = checkInCheckOutMapper.toEntity(checkInCheckOutDTO);
        checkInCheckOut = checkInCheckOutRepository.save(checkInCheckOut);
        actualizarEstadoReservaSiEsCheckOut(checkInCheckOut);
        return checkInCheckOutMapper.toDto(checkInCheckOut);
    }

    @Override
    public CheckInCheckOutDTO update(CheckInCheckOutDTO checkInCheckOutDTO) {
        LOG.debug("Request to update CheckInCheckOut : {}", checkInCheckOutDTO);
        CheckInCheckOut checkInCheckOut = checkInCheckOutMapper.toEntity(checkInCheckOutDTO);
        checkInCheckOut = checkInCheckOutRepository.save(checkInCheckOut);
        actualizarEstadoReservaSiEsCheckOut(checkInCheckOut);
        return checkInCheckOutMapper.toDto(checkInCheckOut);
    }

    @Override
    public Optional<CheckInCheckOutDTO> partialUpdate(CheckInCheckOutDTO checkInCheckOutDTO) {
        LOG.debug("Request to partially update CheckInCheckOut : {}", checkInCheckOutDTO);

        return checkInCheckOutRepository
                .findById(checkInCheckOutDTO.getId())
                .map(existingCheckInCheckOut -> {
                    checkInCheckOutMapper.partialUpdate(existingCheckInCheckOut, checkInCheckOutDTO);

                    return existingCheckInCheckOut;
                })
                .map(checkInCheckOutRepository::save)
                .map(checkInCheckOut -> {
                    actualizarEstadoReservaSiEsCheckOut(checkInCheckOut);
                    return checkInCheckOut;
                })
                .map(checkInCheckOutMapper::toDto);
    }

    private void actualizarEstadoReservaSiEsCheckOut(CheckInCheckOut checkInCheckOut) {
        if (checkInCheckOut.getFechaHoraCheckOut() != null && checkInCheckOut.getReservaDetalle() != null) {
            // Recargar el detalle para estar seguro de tener la reserva (JPA Lazy loading)
            reservaDetalleRepository
                    .findById(checkInCheckOut.getReservaDetalle().getId())
                    .ifPresent(detalle -> {
                        Reserva reserva = detalle.getReserva();
                        if (reserva != null) {
                            List<ReservaDetalle> todosLosDetalles = reservaDetalleRepository
                                    .findAllByReservaId(reserva.getId());
                            boolean todosTienenCheckOut = true;

                            for (ReservaDetalle d : todosLosDetalles) {
                                Optional<CheckInCheckOut> cico = checkInCheckOutRepository
                                        .findByReservaDetalleId(d.getId());
                                if (cico.isEmpty() || cico.get().getFechaHoraCheckOut() == null) {
                                    todosTienenCheckOut = false;
                                    break;
                                }
                            }

                            if (todosTienenCheckOut) {
                                LOG.debug("Finalizando reserva ID: {} ya que todos los detalles tienen check-out",
                                        reserva.getId());
                                reserva.setEstado(EstadoReserva.FINALIZADA);
                                reservaRepository.save(reserva);
                            }
                        }
                    });
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CheckInCheckOutDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all CheckInCheckOuts");
        return checkInCheckOutRepository.findAll(pageable).map(checkInCheckOutMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<CheckInCheckOutDTO> findOne(Long id) {
        LOG.debug("Request to get CheckInCheckOut : {}", id);
        return checkInCheckOutRepository.findById(id).map(checkInCheckOutMapper::toDto);
    }

    @Override
    public void delete(Long id) {
        LOG.debug("Request to delete CheckInCheckOut : {}", id);
        checkInCheckOutRepository.deleteById(id);
    }
}
