package com.hotel.app.service.impl;

import com.hotel.app.domain.ServicioContratado;
import com.hotel.app.domain.enumeration.DiaSemana;
import com.hotel.app.repository.ReservaRepository;
import com.hotel.app.repository.ServicioContratadoRepository;
import com.hotel.app.repository.ServicioDisponibilidadRepository;
import com.hotel.app.service.ConfiguracionSistemaService;
import com.hotel.app.service.MensajeSoporteService;
import com.hotel.app.service.ServicioContratadoService;
import com.hotel.app.service.dto.MensajeSoporteDTO;
import com.hotel.app.service.dto.ServicioContratadoDTO;
import java.time.Instant;
import com.hotel.app.service.mapper.ServicioContratadoMapper;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import com.hotel.app.web.rest.errors.BadRequestAlertException;
import java.time.ZonedDateTime;
import java.util.Optional;
import java.util.List;
import java.util.stream.Collectors;
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

    private final ReservaRepository reservaRepository;

    private final ServicioDisponibilidadRepository servicioDisponibilidadRepository;

    private final MensajeSoporteService mensajeSoporteService;

    private final ConfiguracionSistemaService configuracionSistemaService;

    public ServicioContratadoServiceImpl(
            ServicioContratadoRepository servicioContratadoRepository,
            ServicioContratadoMapper servicioContratadoMapper,
            ReservaRepository reservaRepository,
            ServicioDisponibilidadRepository servicioDisponibilidadRepository,
            MensajeSoporteService mensajeSoporteService,
            ConfiguracionSistemaService configuracionSistemaService) {
        this.servicioContratadoRepository = servicioContratadoRepository;
        this.servicioContratadoMapper = servicioContratadoMapper;
        this.reservaRepository = reservaRepository;
        this.servicioDisponibilidadRepository = servicioDisponibilidadRepository;
        this.mensajeSoporteService = mensajeSoporteService;
        this.configuracionSistemaService = configuracionSistemaService;
    }

    @Override
    public ServicioContratadoDTO save(ServicioContratadoDTO servicioContratadoDTO) {
        LOG.debug("Request to save ServicioContratado : {}", servicioContratadoDTO);

        // Validation Logic
        if (servicioContratadoDTO.getReserva() != null && servicioContratadoDTO.getFechaServicio() != null) {
            var reserva = reservaRepository.findById(servicioContratadoDTO.getReserva().getId())
                    .orElseThrow(() -> new BadRequestAlertException("Reserva not found", "reserva", "idnotfound"));

            // 1. Validate Date Range - Compare only dates, not times
            if (reserva.getEstado() != com.hotel.app.domain.enumeration.EstadoReserva.CONFIRMADA) {
                throw new BadRequestAlertException("Reservation is not confirmed", "servicioContratado",
                        "reservanotconfirmed");
            }

            // Convert to LocalDate using system timezone to compare only days
            // This ensures we compare in the same timezone as the user/system
            java.time.ZoneId systemZone = java.time.ZoneId.systemDefault();
            java.time.LocalDate fechaServicioDate = servicioContratadoDTO.getFechaServicio()
                    .withZoneSameInstant(systemZone).toLocalDate();
            java.time.LocalDate fechaInicioReserva = reserva.getFechaInicio()
                    .atZone(systemZone).toLocalDate();
            java.time.LocalDate fechaFinReserva = reserva.getFechaFin()
                    .atZone(systemZone).toLocalDate();

            if (fechaServicioDate.isBefore(fechaInicioReserva) || fechaServicioDate.isAfter(fechaFinReserva)) {
                throw new BadRequestAlertException("Service date must be within reservation dates",
                        "servicioContratado", "servicedateoutofrange");
            }

            // 2. Validate Service Availability - REQUIRED FOR ALL ROLES
            if (servicioContratadoDTO.getServicio() != null) {
                ZonedDateTime fechaServicio = servicioContratadoDTO.getFechaServicio();
                DiaSemana diaSemana = mapDayOfWeek(fechaServicio.getDayOfWeek());

                var disponibilidades = servicioDisponibilidadRepository
                        .findByServicioIdAndDiaSemanaAndActivoTrue(servicioContratadoDTO.getServicio().getId(),
                                diaSemana);

                if (disponibilidades.isEmpty()) {
                    throw new BadRequestAlertException("Service not available on this day", "servicioContratado",
                            "servicenotavailable");
                }

                // Check time and quota
                boolean timeValid = false;
                for (var disp : disponibilidades) {
                    boolean thisSlotTimeValid = false;

                    if (Boolean.TRUE.equals(disp.getHoraFija())) {
                        if (disp.getHoraInicio().getHour() == fechaServicio.getHour() &&
                                disp.getHoraInicio().getMinute() == fechaServicio.getMinute()) {
                            thisSlotTimeValid = true;
                        }
                    } else {
                        // Range
                        if (!fechaServicio.toLocalTime().isBefore(disp.getHoraInicio()) &&
                                (disp.getHoraFin() == null
                                        || !fechaServicio.toLocalTime().isAfter(disp.getHoraFin()))) {
                            thisSlotTimeValid = true;
                        }
                    }

                    if (thisSlotTimeValid) {
                        // Check Quota
                        Long currentTotalQuantity = servicioContratadoRepository
                                .sumCantidadByServicioIdAndFechaServicioAndEstadoIn(
                                        servicioContratadoDTO.getServicio().getId(),
                                        fechaServicio,
                                        List.of(
                                                com.hotel.app.domain.enumeration.EstadoServicioContratado.CONFIRMADO,
                                                com.hotel.app.domain.enumeration.EstadoServicioContratado.PENDIENTE,
                                                com.hotel.app.domain.enumeration.EstadoServicioContratado.COMPLETADO));

                        long requestedQuantity = servicioContratadoDTO.getCantidad() != null
                                ? servicioContratadoDTO.getCantidad()
                                : 0;

                        if ((currentTotalQuantity + requestedQuantity) <= disp.getCupoMaximo()) {
                            timeValid = true;
                            break;
                        }
                    }
                }

                if (!timeValid) {
                    throw new BadRequestAlertException(
                            "Service not available at this time (Invalid time or Quota full)", "servicioContratado",
                            "servicenotavailable");
                }
            }
        }

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
    public List<ServicioContratadoDTO> findByReservaId(Long reservaId) {
        LOG.debug("Request to get ServicioContratados by Reserva : {}", reservaId);
        return servicioContratadoRepository.findByReservaId(reservaId).stream()
                .map(servicioContratadoMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ServicioContratadoDTO> findByClienteId(Long clienteId) {
        LOG.debug("Request to get ServicioContratados by Cliente : {}", clienteId);
        return servicioContratadoRepository.findByClienteId(clienteId).stream()
                .map(servicioContratadoMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public void confirmar(Long id) {
        LOG.info("Request to confirm ServicioContratado : {}", id);
        servicioContratadoRepository.findById(id).ifPresent(servicioContratado -> {
            LOG.info("Found ServicioContratado, current state: {}", servicioContratado.getEstado());
            servicioContratado.setEstado(com.hotel.app.domain.enumeration.EstadoServicioContratado.CONFIRMADO);
            servicioContratadoRepository.save(servicioContratado);
            LOG.info("Updated ServicioContratado {} to CONFIRMADO state", id);
            sendMessage(servicioContratado, "MSG_SERVICE_CONFIRMADO");
            LOG.info("Sent confirmation message for ServicioContratado {}", id);
        });
        if (!servicioContratadoRepository.findById(id).isPresent()) {
            LOG.error("ServicioContratado with ID {} not found!", id);
        }
    }

    @Override
    public void completar(Long id) {
        LOG.debug("Request to complete ServicioContratado : {}", id);
        servicioContratadoRepository.findById(id).ifPresent(servicioContratado -> {
            servicioContratado.setEstado(com.hotel.app.domain.enumeration.EstadoServicioContratado.COMPLETADO);
            servicioContratadoRepository.save(servicioContratado);
            sendMessage(servicioContratado, "MSG_SERVICE_COMPLETADO");
        });
    }

    @Override
    public void cancelar(Long id) {
        LOG.debug("Request to cancel ServicioContratado : {}", id);
        servicioContratadoRepository.findById(id).ifPresent(servicioContratado -> {
            servicioContratado.setEstado(com.hotel.app.domain.enumeration.EstadoServicioContratado.CANCELADO);
            servicioContratadoRepository.save(servicioContratado);
            sendMessage(servicioContratado, "MSG_SERVICE_CANCELADO");
        });
    }

    private void sendMessage(ServicioContratado servicio, String key) {
        if (servicio.getCliente() != null) {
            String msgText = "Actualización de servicio: " + key;
            try {
                var configOpt = configuracionSistemaService.findByClave(key);
                if (configOpt.isPresent() && configOpt.get().getValor() != null) {
                    msgText = configOpt.get().getValor()
                            .replace("{servicioNombre}",
                                    servicio.getServicio() != null ? servicio.getServicio().getNombre() : "")
                            .replace("{fechaServicio}",
                                    servicio.getFechaServicio() != null ? servicio.getFechaServicio().toString() : "")
                            .replace("{total}",
                                    servicio.getPrecioUnitario() != null && servicio.getCantidad() != null
                                            ? String.valueOf(servicio.getPrecioUnitario()
                                                    .multiply(java.math.BigDecimal.valueOf(servicio.getCantidad())))
                                            : "");
                }
            } catch (Exception e) {
                LOG.error("Error fetching message template for key: {}", key, e);
            }

            MensajeSoporteDTO mensaje = new MensajeSoporteDTO();
            mensaje.setMensaje(msgText);
            mensaje.setFechaMensaje(Instant.now());
            mensaje.setUserId(servicio.getCliente().getKeycloakId());
            mensaje.setUserName(servicio.getCliente().getNombre() + " " + servicio.getCliente().getApellido());
            mensaje.setLeido(false);
            mensaje.setActivo(true);
            mensaje.setRemitente("SISTEMA");
            mensajeSoporteService.save(mensaje);
        }
    }

    private DiaSemana mapDayOfWeek(java.time.DayOfWeek dayOfWeek) {
        switch (dayOfWeek) {
            case MONDAY:
                return DiaSemana.LUNES;
            case TUESDAY:
                return DiaSemana.MARTES;
            case WEDNESDAY:
                return DiaSemana.MIERCOLES;
            case THURSDAY:
                return DiaSemana.JUEVES;
            case FRIDAY:
                return DiaSemana.VIERNES;
            case SATURDAY:
                return DiaSemana.SABADO;
            case SUNDAY:
                return DiaSemana.DOMINGO;
            default:
                throw new IllegalArgumentException("Invalid day");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<ServicioContratadoDTO> findByClienteAndServicioAndFechaRange(
            Long clienteId,
            Long servicioId,
            ZonedDateTime fechaInicio,
            ZonedDateTime fechaFin) {
        LOG.debug("Request to get ServicioContratados by Cliente, Servicio and Fecha Range");
        return servicioContratadoRepository
                .findByClienteAndServicioAndFechaRange(clienteId, servicioId, fechaInicio, fechaFin)
                .stream()
                .map(servicioContratadoMapper::toDto)
                .collect(Collectors.toList());
    }
}
