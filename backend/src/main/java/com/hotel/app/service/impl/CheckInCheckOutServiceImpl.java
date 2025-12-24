package com.hotel.app.service.impl;

import com.hotel.app.domain.CheckInCheckOut;
import com.hotel.app.domain.Reserva;
import com.hotel.app.domain.ReservaDetalle;
import com.hotel.app.domain.enumeration.EstadoReserva;
import com.hotel.app.repository.CheckInCheckOutRepository;
import com.hotel.app.repository.ReservaDetalleRepository;
import com.hotel.app.repository.ReservaRepository;
import com.hotel.app.domain.ServicioContratado;
import com.hotel.app.domain.enumeration.EstadoServicioContratado;
import com.hotel.app.repository.ServicioContratadoRepository;
import com.hotel.app.service.CheckInCheckOutService;
import com.hotel.app.service.MensajeSoporteService;
import com.hotel.app.service.ConfiguracionSistemaService;
import com.hotel.app.service.dto.CheckInCheckOutDTO;
import com.hotel.app.service.dto.MensajeSoporteDTO;
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

    private final ServicioContratadoRepository servicioContratadoRepository;

    private final MensajeSoporteService mensajeSoporteService;

    private final ConfiguracionSistemaService configuracionSistemaService;

    public CheckInCheckOutServiceImpl(
            CheckInCheckOutRepository checkInCheckOutRepository,
            CheckInCheckOutMapper checkInCheckOutMapper,
            ReservaRepository reservaRepository,
            ReservaDetalleRepository reservaDetalleRepository,
            ServicioContratadoRepository servicioContratadoRepository,
            MensajeSoporteService mensajeSoporteService,
            ConfiguracionSistemaService configuracionSistemaService) {
        this.checkInCheckOutRepository = checkInCheckOutRepository;
        this.checkInCheckOutMapper = checkInCheckOutMapper;
        this.reservaRepository = reservaRepository;
        this.reservaDetalleRepository = reservaDetalleRepository;
        this.servicioContratadoRepository = servicioContratadoRepository;
        this.mensajeSoporteService = mensajeSoporteService;
        this.configuracionSistemaService = configuracionSistemaService;
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

        // Send check-in notification if this is a check-in
        if (checkInCheckOut.getFechaHoraCheckIn() != null && checkInCheckOut.getFechaHoraCheckOut() == null) {
            enviarMensajeCheckIn(checkInCheckOut);
        }

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

                                // Actualizar servicios contratados y enviar mensajes
                                List<ServicioContratado> servicios = servicioContratadoRepository
                                        .findByReservaId(reserva.getId());
                                for (ServicioContratado s : servicios) {
                                    EstadoServicioContratado estadoAnterior = s.getEstado();

                                    if (s.getEstado() == EstadoServicioContratado.CONFIRMADO) {
                                        s.setEstado(EstadoServicioContratado.COMPLETADO);
                                        servicioContratadoRepository.save(s);
                                        enviarMensajeServicioCompletado(s, reserva);
                                    } else if (s.getEstado() == EstadoServicioContratado.PENDIENTE) {
                                        s.setEstado(EstadoServicioContratado.CANCELADO);
                                        servicioContratadoRepository.save(s);
                                        enviarMensajeServicioCancelado(s, reserva);
                                    }
                                }

                                // Send check-out message after finalizing reservation
                                enviarMensajeCheckOut(reserva);
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

    @Override
    @Transactional(readOnly = true)
    public Optional<CheckInCheckOutDTO> findOneByReservaDetalleId(Long reservaDetalleId) {
        LOG.debug("Request to get CheckInCheckOut by reservaDetalleId : {}", reservaDetalleId);
        return checkInCheckOutRepository.findByReservaDetalleId(reservaDetalleId).map(checkInCheckOutMapper::toDto);
    }

    /**
     * Envía un mensaje al cliente cuando un servicio se completa automáticamente
     */
    private void enviarMensajeServicioCompletado(ServicioContratado servicio, Reserva reserva) {
        if (reserva.getCliente() == null || reserva.getCliente().getKeycloakId() == null) {
            LOG.warn("No se puede enviar mensaje de servicio completado. Cliente no tiene keycloakId");
            return;
        }

        try {
            String servicioNombre = servicio.getServicio() != null ? servicio.getServicio().getNombre() : "Servicio";
            String msgText = "El servicio '" + servicioNombre + "' de su reserva #" + reserva.getId()
                    + " ha sido marcado como COMPLETADO tras realizar el check-out.";

            // Intentar obtener plantilla personalizada
            try {
                var configOpt = configuracionSistemaService.findByClave("MSG_SERVICIO_COMPLETADO");
                if (configOpt.isPresent() && configOpt.get().getValor() != null) {
                    msgText = configOpt.get().getValor()
                            .replace("{servicioNombre}", servicioNombre)
                            .replace("{reservaId}", reserva.getId().toString())
                            .replace("{clienteNombre}",
                                    reserva.getCliente().getNombre() != null ? reserva.getCliente().getNombre()
                                            : "Cliente");
                }
            } catch (Exception e) {
                LOG.debug("Usando mensaje por defecto para servicio completado");
            }

            MensajeSoporteDTO mensaje = new MensajeSoporteDTO();
            mensaje.setUserId(reserva.getCliente().getKeycloakId());
            mensaje.setUserName(
                    ((reserva.getCliente().getNombre() != null ? reserva.getCliente().getNombre() : "") + " " +
                            (reserva.getCliente().getApellido() != null ? reserva.getCliente().getApellido() : ""))
                            .trim());
            mensaje.setMensaje(msgText);
            mensaje.setRemitente("SISTEMA");
            mensaje.setLeido(false);
            mensaje.setActivo(true);
            mensaje.setFechaMensaje(java.time.Instant.now());

            mensajeSoporteService.save(mensaje);
            LOG.info("Mensaje de servicio completado enviado para servicio ID: {}", servicio.getId());
        } catch (Exception e) {
            LOG.error("Error enviando mensaje de servicio completado", e);
        }
    }

    /**
     * Envía un mensaje al cliente cuando un servicio se cancela automáticamente
     */
    private void enviarMensajeServicioCancelado(ServicioContratado servicio, Reserva reserva) {
        if (reserva.getCliente() == null || reserva.getCliente().getKeycloakId() == null) {
            LOG.warn("No se puede enviar mensaje de servicio cancelado. Cliente no tiene keycloakId");
            return;
        }

        try {
            String servicioNombre = servicio.getServicio() != null ? servicio.getServicio().getNombre() : "Servicio";
            String msgText = "El servicio '" + servicioNombre + "' de su reserva #" + reserva.getId()
                    + " ha sido CANCELADO porque estaba pendiente al momento del check-out. "
                    + "Si desea contratarlo nuevamente, contáctenos.";

            // Intentar obtener plantilla personalizada
            try {
                var configOpt = configuracionSistemaService.findByClave("MSG_SERVICIO_CANCELADO");
                if (configOpt.isPresent() && configOpt.get().getValor() != null) {
                    msgText = configOpt.get().getValor()
                            .replace("{servicioNombre}", servicioNombre)
                            .replace("{reservaId}", reserva.getId().toString())
                            .replace("{clienteNombre}",
                                    reserva.getCliente().getNombre() != null ? reserva.getCliente().getNombre()
                                            : "Cliente");
                }
            } catch (Exception e) {
                LOG.debug("Usando mensaje por defecto para servicio cancelado");
            }

            MensajeSoporteDTO mensaje = new MensajeSoporteDTO();
            mensaje.setUserId(reserva.getCliente().getKeycloakId());
            mensaje.setUserName(
                    ((reserva.getCliente().getNombre() != null ? reserva.getCliente().getNombre() : "") + " " +
                            (reserva.getCliente().getApellido() != null ? reserva.getCliente().getApellido() : ""))
                            .trim());
            mensaje.setMensaje(msgText);
            mensaje.setRemitente("SISTEMA");
            mensaje.setLeido(false);
            mensaje.setActivo(true);
            mensaje.setFechaMensaje(java.time.Instant.now());

            mensajeSoporteService.save(mensaje);
            LOG.info("Mensaje de servicio cancelado enviado para servicio ID: {}", servicio.getId());
        } catch (Exception e) {
            LOG.error("Error enviando mensaje de servicio cancelado", e);
        }
    }

    /**
     * Envía un mensaje al cliente cuando se realiza el check-in
     */
    private void enviarMensajeCheckIn(CheckInCheckOut checkInCheckOut) {
        if (checkInCheckOut.getReservaDetalle() == null) {
            return;
        }

        try {
            reservaDetalleRepository.findById(checkInCheckOut.getReservaDetalle().getId()).ifPresent(detalle -> {
                Reserva reserva = detalle.getReserva();
                if (reserva == null || reserva.getCliente() == null || reserva.getCliente().getKeycloakId() == null) {
                    return;
                }

                try {
                    String habitacionNumero = detalle.getHabitacion() != null ? detalle.getHabitacion().getNumero()
                            : "N/A";
                    String clienteNombre = reserva.getCliente().getNombre() != null ? reserva.getCliente().getNombre()
                            : "Cliente";

                    String msgText = "🏨 ¡Bienvenido " + clienteNombre
                            + "! Su check-in ha sido realizado exitosamente. Habitación: " + habitacionNumero
                            + ". Disfrute su estancia.";

                    try {
                        var configOpt = configuracionSistemaService.findByClave("MSG_CHECK_IN_REALIZADO");
                        if (configOpt.isPresent() && configOpt.get().getValor() != null) {
                            msgText = configOpt.get().getValor()
                                    .replace("{clienteNombre}", clienteNombre)
                                    .replace("{habitaciones}", habitacionNumero);
                        }
                    } catch (Exception e) {
                        LOG.debug("Usando mensaje por defecto para check-in");
                    }

                    MensajeSoporteDTO mensaje = new MensajeSoporteDTO();
                    mensaje.setUserId(reserva.getCliente().getKeycloakId());
                    mensaje.setUserName(((reserva.getCliente().getNombre() != null ? reserva.getCliente().getNombre()
                            : "") + " " +
                            (reserva.getCliente().getApellido() != null ? reserva.getCliente().getApellido() : ""))
                            .trim());
                    mensaje.setMensaje(msgText);
                    mensaje.setRemitente("SISTEMA");
                    mensaje.setLeido(false);
                    mensaje.setActivo(true);
                    mensaje.setFechaMensaje(java.time.Instant.now());

                    mensajeSoporteService.save(mensaje);
                    LOG.info("Mensaje de check-in enviado para reserva ID: {}", reserva.getId());
                } catch (Exception e) {
                    LOG.error("Error enviando mensaje de check-in", e);
                }
            });
        } catch (Exception e) {
            LOG.error("Error procesando check-in message", e);
        }
    }

    /**
     * Envía un mensaje al cliente cuando se realiza el check-out
     */
    private void enviarMensajeCheckOut(Reserva reserva) {
        if (reserva == null || reserva.getCliente() == null || reserva.getCliente().getKeycloakId() == null) {
            return;
        }

        try {
            String clienteNombre = reserva.getCliente().getNombre() != null ? reserva.getCliente().getNombre()
                    : "Cliente";
            String msgText = "👋 Check-out realizado. Gracias por hospedarse con nosotros, " + clienteNombre
                    + ". Esperamos verle pronto.";

            try {
                var configOpt = configuracionSistemaService.findByClave("MSG_CHECK_OUT_REALIZADO");
                if (configOpt.isPresent() && configOpt.get().getValor() != null) {
                    msgText = configOpt.get().getValor()
                            .replace("{clienteNombre}", clienteNombre);
                }
            } catch (Exception e) {
                LOG.debug("Usando mensaje por defecto para check-out");
            }

            MensajeSoporteDTO mensaje = new MensajeSoporteDTO();
            mensaje.setUserId(reserva.getCliente().getKeycloakId());
            mensaje.setUserName(
                    ((reserva.getCliente().getNombre() != null ? reserva.getCliente().getNombre() : "") + " " +
                            (reserva.getCliente().getApellido() != null ? reserva.getCliente().getApellido() : ""))
                            .trim());
            mensaje.setMensaje(msgText);
            mensaje.setRemitente("SISTEMA");
            mensaje.setLeido(false);
            mensaje.setActivo(true);
            mensaje.setFechaMensaje(java.time.Instant.now());

            mensajeSoporteService.save(mensaje);
            LOG.info("Mensaje de check-out enviado para reserva ID: {}", reserva.getId());
        } catch (Exception e) {
            LOG.error("Error enviando mensaje de check-out", e);
        }
    }
}
