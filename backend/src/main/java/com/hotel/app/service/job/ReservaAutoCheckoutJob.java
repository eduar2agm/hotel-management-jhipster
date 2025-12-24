package com.hotel.app.service.job;

import com.hotel.app.domain.Reserva;
import com.hotel.app.domain.ServicioContratado;
import com.hotel.app.domain.enumeration.EstadoReserva;
import com.hotel.app.domain.enumeration.EstadoServicioContratado;
import com.hotel.app.repository.ReservaRepository;
import com.hotel.app.repository.ServicioContratadoRepository;
import java.time.Instant;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReservaAutoCheckoutJob {

    private final Logger log = LoggerFactory.getLogger(ReservaAutoCheckoutJob.class);

    private final ReservaRepository reservaRepository;
    private final ServicioContratadoRepository servicioContratadoRepository;
    private final com.hotel.app.service.MensajeSoporteService mensajeSoporteService;
    private final com.hotel.app.service.ConfiguracionSistemaService configuracionSistemaService;
    private final com.hotel.app.service.mapper.ReservaMapper reservaMapper;

    public ReservaAutoCheckoutJob(
            ReservaRepository reservaRepository,
            ServicioContratadoRepository servicioContratadoRepository,
            com.hotel.app.service.MensajeSoporteService mensajeSoporteService,
            com.hotel.app.service.ConfiguracionSistemaService configuracionSistemaService,
            com.hotel.app.service.mapper.ReservaMapper reservaMapper) {
        this.reservaRepository = reservaRepository;
        this.servicioContratadoRepository = servicioContratadoRepository;
        this.mensajeSoporteService = mensajeSoporteService;
        this.configuracionSistemaService = configuracionSistemaService;
        this.reservaMapper = reservaMapper;
    }

    /**
     * Run every hour to check for reservations that need auto-checkout.
     * Cron: At second 0, minute 0 of every hour.
     */
    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void autoCheckoutReservas() {
        log.debug("Running autoCheckoutReservas job");
        Instant now = Instant.now();

        // Reservas que ya pasaron su fecha de fin y siguen en estado CONFIRMADA o
        // CHECK_IN
        List<EstadoReserva> estadosActivos = List.of(EstadoReserva.CONFIRMADA, EstadoReserva.CHECK_IN);
        List<Reserva> reservasExpiradas = reservaRepository.findByFechaFinBeforeAndEstadoIn(now, estadosActivos);

        for (Reserva reserva : reservasExpiradas) {
            log.info("Auto-checkout para Reserva ID: {}", reserva.getId());

            // 1. Finalizar Reserva
            reserva.setEstado(EstadoReserva.FINALIZADA);
            reservaRepository.save(reserva);

            // 2. Completar Servicios Asociados
            completarServiciosDeReserva(reserva);

            // 3. Enviar mensaje de notificación
            sendAutoCheckoutMessage(reserva);
        }
    }

    private void completarServiciosDeReserva(Reserva reserva) {
        List<ServicioContratado> servicios = servicioContratadoRepository.findByReservaId(reserva.getId());

        for (ServicioContratado servicio : servicios) {
            if (servicio.getEstado() == EstadoServicioContratado.CONFIRMADO) {
                log.debug("Auto-completando Servicio Contratado ID: {} de Reserva ID: {}", servicio.getId(),
                        reserva.getId());
                servicio.setEstado(EstadoServicioContratado.COMPLETADO);
                servicioContratadoRepository.save(servicio);
            } else if (servicio.getEstado() == EstadoServicioContratado.PENDIENTE) {
                log.debug("Cancelando Servicio Contratado PENDIENTE ID: {} de Reserva ID: {}", servicio.getId(),
                        reserva.getId());
                servicio.setEstado(EstadoServicioContratado.CANCELADO);
                servicioContratadoRepository.save(servicio);
            }
        }
    }

    private void sendAutoCheckoutMessage(Reserva reserva) {
        if (reserva.getCliente() != null) {
            String msgText = "Su reserva #" + reserva.getId()
                    + " ha finalizado automáticamente. Gracias por su estancia.";

            try {
                var configOpt = configuracionSistemaService.findByClave("MSG_RESERVA_AUTO_CHECKOUT");
                if (configOpt.isPresent() && configOpt.get().getValor() != null) {
                    msgText = configOpt.get().getValor()
                            .replace("{reservaId}", reserva.getId().toString())
                            .replace("{clienteNombre}",
                                    reserva.getCliente().getNombre() != null ? reserva.getCliente().getNombre()
                                            : "Cliente");
                }
            } catch (Exception e) {
                log.error("Error al obtener plantilla de mensaje auto-checkout", e);
            }

            com.hotel.app.service.dto.MensajeSoporteDTO mensaje = new com.hotel.app.service.dto.MensajeSoporteDTO();
            mensaje.setMensaje(msgText);
            mensaje.setFechaMensaje(Instant.now());

            if (reserva.getCliente().getKeycloakId() != null) {
                mensaje.setUserId(reserva.getCliente().getKeycloakId());
            } else {
                mensaje.setUserId("unknown");
            }

            String nombre = reserva.getCliente().getNombre() != null ? reserva.getCliente().getNombre() : "Cliente";
            String apellido = reserva.getCliente().getApellido() != null ? reserva.getCliente().getApellido() : "";
            mensaje.setUserName((nombre + " " + apellido).trim());

            mensaje.setLeido(false);
            mensaje.setActivo(true);
            mensaje.setRemitente("SISTEMA");

            try {
                mensaje.setReserva(reservaMapper.toDto(reserva));
            } catch (Exception e) {
                log.warn("Could not map reservation to DTO for message", e);
            }

            mensajeSoporteService.save(mensaje);
        }
    }
}
