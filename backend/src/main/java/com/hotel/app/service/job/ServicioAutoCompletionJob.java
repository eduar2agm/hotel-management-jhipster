package com.hotel.app.service.job;

import com.hotel.app.domain.ServicioContratado;
import com.hotel.app.domain.enumeration.EstadoServicioContratado;
import com.hotel.app.repository.ServicioContratadoRepository;
import com.hotel.app.service.ConfiguracionSistemaService;
import com.hotel.app.service.MensajeSoporteService;
import com.hotel.app.service.dto.MensajeSoporteDTO;
import java.time.Instant;
import java.time.ZonedDateTime;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ServicioAutoCompletionJob {

    private final Logger log = LoggerFactory.getLogger(ServicioAutoCompletionJob.class);

    private final ServicioContratadoRepository servicioContratadoRepository;
    private final MensajeSoporteService mensajeSoporteService;
    private final ConfiguracionSistemaService configuracionSistemaService;

    public ServicioAutoCompletionJob(
            ServicioContratadoRepository servicioContratadoRepository,
            MensajeSoporteService mensajeSoporteService,
            ConfiguracionSistemaService configuracionSistemaService) {
        this.servicioContratadoRepository = servicioContratadoRepository;
        this.mensajeSoporteService = mensajeSoporteService;
        this.configuracionSistemaService = configuracionSistemaService;
    }

    /**
     * Run every hour to autocomplete past services.
     */
    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void autocompleteServices() {
        log.debug("Running autocompleteServices job");
        ZonedDateTime now = ZonedDateTime.now();
        List<ServicioContratado> expiredServices = servicioContratadoRepository.findByEstadoAndFechaServicioBefore(
                EstadoServicioContratado.CONFIRMADO,
                now);

        for (ServicioContratado servicio : expiredServices) {
            log.info("Completing expired service: {}", servicio.getId());
            servicio.setEstado(EstadoServicioContratado.COMPLETADO);
            servicioContratadoRepository.save(servicio);
            sendCompletionMessage(servicio);
        }
    }

    private void sendCompletionMessage(ServicioContratado servicio) {
        if (servicio.getCliente() != null) {
            String msgText = "✔️ El servicio \""
                    + (servicio.getServicio() != null ? servicio.getServicio().getNombre() : "Servicio")
                    + "\" ha sido marcado como completado.";

            try {
                var configOpt = configuracionSistemaService.findByClave("MSG_SERVICE_COMPLETADO");
                if (configOpt.isPresent() && configOpt.get().getValor() != null) {
                    msgText = configOpt.get().getValor()
                            .replace("{servicioNombre}",
                                    servicio.getServicio() != null ? servicio.getServicio().getNombre() : "")
                            .replace("{fechaServicio}",
                                    servicio.getFechaServicio() != null ? servicio.getFechaServicio().toString() : "");
                }
            } catch (Exception e) {
                log.error("Error fetching completion message template", e);
            }

            MensajeSoporteDTO mensaje = new MensajeSoporteDTO();
            mensaje.setMensaje(msgText);
            mensaje.setFechaMensaje(Instant.now());
            mensaje.setUserId(servicio.getCliente().getKeycloakId());
            mensaje.setUserName(servicio.getCliente().getNombre() + " " + servicio.getCliente().getApellido());
            mensaje.setLeido(false);
            mensaje.setActivo(true);
            mensaje.setRemitente("SISTEMA");

            // Note: Not setting ReservaDTO relation here to keep it simple or user can add
            // if needed
            // If needed, we map service.getReserva() to DTO.

            mensajeSoporteService.save(mensaje);
        }
    }
}
