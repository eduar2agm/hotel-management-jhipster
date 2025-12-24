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

    public ReservaAutoCheckoutJob(
            ReservaRepository reservaRepository,
            ServicioContratadoRepository servicioContratadoRepository) {
        this.reservaRepository = reservaRepository;
        this.servicioContratadoRepository = servicioContratadoRepository;
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
        }
    }

    private void completarServiciosDeReserva(Reserva reserva) {
        List<ServicioContratado> servicios = servicioContratadoRepository.findByReservaId(reserva.getId());

        for (ServicioContratado servicio : servicios) {
            // Solo completar si no está cancelado ni ya completado
            if (servicio.getEstado() != EstadoServicioContratado.CANCELADO &&
                    servicio.getEstado() != EstadoServicioContratado.COMPLETADO) {

                log.debug("Auto-completando Servicio Contratado ID: {} de Reserva ID: {}", servicio.getId(),
                        reserva.getId());
                servicio.setEstado(EstadoServicioContratado.COMPLETADO);
                servicioContratadoRepository.save(servicio);
            }
        }
    }
}
