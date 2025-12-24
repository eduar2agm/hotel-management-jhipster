package com.hotel.app.service.impl;

import com.hotel.app.domain.Reserva;
import com.hotel.app.domain.ReservaDetalle;
import com.hotel.app.domain.enumeration.EstadoReserva;
import com.hotel.app.repository.ReservaDetalleRepository;
import com.hotel.app.repository.ReservaRepository;
import com.hotel.app.service.ReservaService;
import com.hotel.app.service.dto.ReservaDTO;
import com.hotel.app.service.MensajeSoporteService;
import com.hotel.app.service.ConfiguracionSistemaService;
import com.hotel.app.service.ServicioContratadoService;
import com.hotel.app.service.dto.ServicioContratadoDTO;
import com.hotel.app.service.dto.MensajeSoporteDTO;
import java.time.Instant;
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
import com.hotel.app.security.AuthoritiesConstants;
import com.hotel.app.security.SecurityUtils;

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

    private final MensajeSoporteService mensajeSoporteService;

    private final ConfiguracionSistemaService configuracionSistemaService;

    private final ServicioContratadoService servicioContratadoService;

    public ReservaServiceImpl(ReservaRepository reservaRepository, ReservaMapper reservaMapper,
            ReservaDetalleRepository reservaDetalleRepository, MensajeSoporteService mensajeSoporteService,
            ConfiguracionSistemaService configuracionSistemaService,
            ServicioContratadoService servicioContratadoService) {
        this.reservaRepository = reservaRepository;
        this.reservaMapper = reservaMapper;
        this.reservaDetalleRepository = reservaDetalleRepository;
        this.mensajeSoporteService = mensajeSoporteService;
        this.configuracionSistemaService = configuracionSistemaService;
        this.servicioContratadoService = servicioContratadoService;
    }

    @Override
    public ReservaDTO save(ReservaDTO reservaDTO) {
        LOG.debug("Request to save Reserva : {}", reservaDTO);

        // If this is an update (ID exists), check status transition
        if (reservaDTO.getId() != null) {
            reservaRepository.findById(reservaDTO.getId()).ifPresent(existingReserva -> {
                // Check for Canceled - Cascade services
                if (existingReserva.getEstado() != EstadoReserva.CANCELADA
                        && reservaDTO.getEstado() == EstadoReserva.CANCELADA) {
                    cancelAssociatedServices(existingReserva);
                }
            });
        }

        Reserva reserva = reservaMapper.toEntity(reservaDTO);
        reserva = reservaRepository.save(reserva);
        return reservaMapper.toDto(reserva);
    }

    @Override
    public ReservaDTO update(ReservaDTO reservaDTO) {
        LOG.debug("Request to update Reserva : {}", reservaDTO);

        reservaRepository.findById(reservaDTO.getId()).ifPresent(existingReserva -> {
            // Check for Finalized
            if (existingReserva.getEstado() != EstadoReserva.FINALIZADA
                    && reservaDTO.getEstado() == EstadoReserva.FINALIZADA) {

                // Validate if allowed to finalize
                if (existingReserva.getEstado() != EstadoReserva.CHECK_IN) {
                    if (!SecurityUtils.hasCurrentUserThisAuthority(AuthoritiesConstants.ADMIN)) {
                        throw new BadRequestAlertException(
                                "Solo los administradores pueden finalizar una reserva que no ha hecho Check-In",
                                "reserva",
                                "finalizeRestricted");
                    }
                }

                sendFinalizadaMessage(existingReserva);
                completeAssociatedServices(existingReserva);
            }
            // Check for Canceled - Cascade services
            if (existingReserva.getEstado() != EstadoReserva.CANCELADA
                    && reservaDTO.getEstado() == EstadoReserva.CANCELADA) {
                cancelAssociatedServices(existingReserva);
            }
        });

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
                    if (existingReserva.getEstado() != EstadoReserva.FINALIZADA
                            && reservaDTO.getEstado() == EstadoReserva.FINALIZADA) {

                        String finishMsgKey = "MSG_ADMIN_FINALIZE";
                        // Validate if allowed to finalize
                        if (existingReserva.getEstado() != EstadoReserva.CHECK_IN) {
                            if (!SecurityUtils.hasCurrentUserThisAuthority(AuthoritiesConstants.ADMIN)) {
                                throw new BadRequestAlertException(
                                        "Solo los administradores pueden finalizar una reserva que no ha hecho Check-In",
                                        "reserva",
                                        "finalizeRestricted");
                            }
                            finishMsgKey = "MSG_ADMIN_FORCED_FINALIZE";
                        }

                        sendFinalizadaMessage(existingReserva, finishMsgKey);
                        completeAssociatedServices(existingReserva);
                    }
                    if (existingReserva.getEstado() != EstadoReserva.CANCELADA
                            && reservaDTO.getEstado() == EstadoReserva.CANCELADA) {
                        cancelAssociatedServices(existingReserva);
                    }
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

        // Verificar que la reserva no esté finalizada y que esté cancelada antes de
        // eliminar
        reservaRepository.findById(id).ifPresent(reserva -> {
            if (reserva.getEstado() == EstadoReserva.FINALIZADA) {
                throw new BadRequestAlertException(
                        "Una reserva finalizada no se puede eliminar físicamente",
                        "reserva",
                        "reservaFinalizadaEliminar");
            }
            if (reserva.getEstado() != EstadoReserva.CANCELADA) {
                throw new BadRequestAlertException(
                        "Solo se puede eliminar una reserva que esté cancelada",
                        "reserva",
                        "reservaNoCanceladaEliminar");
            }
        });

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
                    // Verificar bloqueo para reservas finalizadas o no canceladas
                    if (reserva.getEstado() == EstadoReserva.FINALIZADA) {
                        throw new BadRequestAlertException(
                                "Una reserva finalizada no se puede desactivar",
                                "reserva",
                                "reservaFinalizadaDeactivate");
                    }

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

    private void sendFinalizadaMessage(Reserva reserva) {
        sendFinalizadaMessage(reserva, "MSG_ADMIN_FINALIZE");
    }

    private void sendFinalizadaMessage(Reserva reserva, String key) {
        if (reserva.getCliente() != null) {
            String msgText = "Su reserva con ID " + reserva.getId() + " ha sido finalizada. Gracias por su estancia.";

            // Try to fetch custom message template
            try {
                var configOpt = configuracionSistemaService.findByClave(key);
                if (configOpt.isPresent() && configOpt.get().getValor() != null) {
                    String template = configOpt.get().getValor();
                    msgText = template
                            .replace("{clienteNombre}",
                                    reserva.getCliente().getNombre() != null ? reserva.getCliente().getNombre()
                                            : "Cliente")
                            .replace("{reservaId}", reserva.getId() != null ? reserva.getId().toString() : "")
                            .replace("{fechaInicio}",
                                    reserva.getFechaInicio() != null ? reserva.getFechaInicio().toString() : "")
                            .replace("{fechaFin}",
                                    reserva.getFechaFin() != null ? reserva.getFechaFin().toString() : "");
                }
            } catch (Exception e) {
                LOG.debug("Using default finalization message", e);
            }

            MensajeSoporteDTO mensaje = new MensajeSoporteDTO();
            mensaje.setMensaje(msgText);
            mensaje.setFechaMensaje(Instant.now());
            if (reserva.getCliente().getKeycloakId() != null) {
                mensaje.setUserId(reserva.getCliente().getKeycloakId());
            } else {
                mensaje.setUserId("unknown");
            }

            String nombre = Optional.ofNullable(reserva.getCliente().getNombre()).orElse("Cliente");
            String apellido = Optional.ofNullable(reserva.getCliente().getApellido()).orElse("");
            mensaje.setUserName((nombre + " " + apellido).trim());

            mensaje.setLeido(false);
            mensaje.setActivo(true);
            mensaje.setRemitente("SISTEMA");

            // Set the reservation in the message if needed.
            // Note: Use a new DTO or map existing one carefully to avoid issues
            ReservaDTO reservaDTO = reservaMapper.toDto(reserva);
            mensaje.setReserva(reservaDTO);

            mensajeSoporteService.save(mensaje);
        }
    }

    private void sendWelcomeMessage(Reserva reserva) {
        if (reserva.getCliente() != null) {
            String msgText = "👋 ¡Bienvenido a nuestro servicio de soporte!\n\nEstamos aquí para ayudarle con cualquier consulta o necesidad durante su estancia.\n\nNormalmente respondemos en pocos minutos.";

            // Try to fetch custom welcome message template
            try {
                var configOpt = configuracionSistemaService.findByClave("MSG_WELCOME_CHAT");
                if (configOpt.isPresent() && configOpt.get().getValor() != null) {
                    msgText = configOpt.get().getValor();
                }
            } catch (Exception e) {
                LOG.debug("Using default welcome message", e);
            }

            MensajeSoporteDTO mensaje = new MensajeSoporteDTO();
            mensaje.setMensaje(msgText);
            mensaje.setFechaMensaje(Instant.now());
            mensaje.setUserId(reserva.getCliente().getKeycloakId());
            mensaje.setUserName(reserva.getCliente().getNombre() + " " + reserva.getCliente().getApellido());
            mensaje.setLeido(false);
            mensaje.setActivo(true);
            mensaje.setRemitente("SISTEMA");

            ReservaDTO reservaDTO = reservaMapper.toDto(reserva);
            mensaje.setReserva(reservaDTO);

            mensajeSoporteService.save(mensaje);
        }
    }

    private void cancelAssociatedServices(Reserva reserva) {
        List<ServicioContratadoDTO> servicios = servicioContratadoService.findByReservaId(reserva.getId());
        for (ServicioContratadoDTO servicio : servicios) {
            if (servicio.getEstado() != com.hotel.app.domain.enumeration.EstadoServicioContratado.CANCELADO) {
                servicioContratadoService.cancelar(servicio.getId(), "MSG_SERVICE_AUTO_CANCEL_RESERVA");

                // Optional: Send notification for service cancellation (if not covered by other
                // flows)
                // The plan mentions MSG_SERVICE_AUTO_CANCEL_RESERVA, we could send it here or
                // let system handle
                // For now, assume simple cancellation is enough or basic message
            }
        }
    }

    private void completeAssociatedServices(Reserva reserva) {
        List<ServicioContratadoDTO> servicios = servicioContratadoService.findByReservaId(reserva.getId());
        for (ServicioContratadoDTO servicio : servicios) {
            if (servicio.getEstado() != com.hotel.app.domain.enumeration.EstadoServicioContratado.COMPLETADO
                    && servicio.getEstado() != com.hotel.app.domain.enumeration.EstadoServicioContratado.CANCELADO) {

                servicioContratadoService.completar(servicio.getId(), "MSG_SERVICE_AUTO_COMPLETED_CHECKOUT");
            }
        }
    }
}
