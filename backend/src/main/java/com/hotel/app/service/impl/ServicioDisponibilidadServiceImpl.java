package com.hotel.app.service.impl;

import com.hotel.app.domain.ServicioDisponibilidad;
import com.hotel.app.domain.ServicioContratado;
import com.hotel.app.domain.enumeration.DiaSemana;
import com.hotel.app.domain.enumeration.EstadoServicioContratado;
import com.hotel.app.repository.ServicioDisponibilidadRepository;
import com.hotel.app.repository.ServicioContratadoRepository;
import com.hotel.app.service.ServicioDisponibilidadService;
import com.hotel.app.service.dto.ServicioDisponibilidadDTO;
import com.hotel.app.service.dto.ServicioDisponibilidadConCuposDTO;
import com.hotel.app.service.mapper.ServicioDisponibilidadMapper;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZonedDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing
 * {@link com.hotel.app.domain.ServicioDisponibilidad}.
 */
@Service
@Transactional
public class ServicioDisponibilidadServiceImpl implements ServicioDisponibilidadService {

    private final Logger log = LoggerFactory.getLogger(ServicioDisponibilidadServiceImpl.class);

    private final ServicioDisponibilidadRepository servicioDisponibilidadRepository;

    private final ServicioDisponibilidadMapper servicioDisponibilidadMapper;

    private final ServicioContratadoRepository servicioContratadoRepository;

    public ServicioDisponibilidadServiceImpl(
            ServicioDisponibilidadRepository servicioDisponibilidadRepository,
            ServicioDisponibilidadMapper servicioDisponibilidadMapper,
            ServicioContratadoRepository servicioContratadoRepository) {
        this.servicioDisponibilidadRepository = servicioDisponibilidadRepository;
        this.servicioDisponibilidadMapper = servicioDisponibilidadMapper;
        this.servicioContratadoRepository = servicioContratadoRepository;
    }

    @Override
    public ServicioDisponibilidadDTO save(ServicioDisponibilidadDTO servicioDisponibilidadDTO) {
        log.debug("Request to save ServicioDisponibilidad : {}", servicioDisponibilidadDTO);
        ServicioDisponibilidad servicioDisponibilidad = servicioDisponibilidadMapper
                .toEntity(servicioDisponibilidadDTO);
        servicioDisponibilidad = servicioDisponibilidadRepository.save(servicioDisponibilidad);
        return servicioDisponibilidadMapper.toDto(servicioDisponibilidad);
    }

    @Override
    public ServicioDisponibilidadDTO update(ServicioDisponibilidadDTO servicioDisponibilidadDTO) {
        log.debug("Request to update ServicioDisponibilidad : {}", servicioDisponibilidadDTO);
        ServicioDisponibilidad servicioDisponibilidad = servicioDisponibilidadMapper
                .toEntity(servicioDisponibilidadDTO);
        servicioDisponibilidad = servicioDisponibilidadRepository.save(servicioDisponibilidad);
        return servicioDisponibilidadMapper.toDto(servicioDisponibilidad);
    }

    @Override
    public Optional<ServicioDisponibilidadDTO> partialUpdate(ServicioDisponibilidadDTO servicioDisponibilidadDTO) {
        log.debug("Request to partially update ServicioDisponibilidad : {}", servicioDisponibilidadDTO);

        return servicioDisponibilidadRepository
                .findById(servicioDisponibilidadDTO.getId())
                .map(existingServicioDisponibilidad -> {
                    servicioDisponibilidadMapper.partialUpdate(existingServicioDisponibilidad,
                            servicioDisponibilidadDTO);

                    return existingServicioDisponibilidad;
                })
                .map(servicioDisponibilidadRepository::save)
                .map(servicioDisponibilidadMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ServicioDisponibilidadDTO> findAll(Pageable pageable) {
        log.debug("Request to get all ServicioDisponibilidads");
        return servicioDisponibilidadRepository.findAll(pageable).map(servicioDisponibilidadMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<ServicioDisponibilidadDTO> findOne(Long id) {
        log.debug("Request to get ServicioDisponibilidad : {}", id);
        return servicioDisponibilidadRepository.findById(id).map(servicioDisponibilidadMapper::toDto);
    }

    @Override
    public void delete(Long id) {
        log.debug("Request to delete ServicioDisponibilidad : {}", id);
        servicioDisponibilidadRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ServicioDisponibilidadDTO> findByServicioId(Long servicioId) {
        log.debug("Request to get ServicioDisponibilidad by servicioId : {}", servicioId);
        return servicioDisponibilidadRepository.findByServicioIdAndActivoTrue(servicioId)
                .stream()
                .map(servicioDisponibilidadMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ServicioDisponibilidadConCuposDTO> findDisponibilidadConCupos(
            Long servicioId,
            LocalDate fechaInicio,
            LocalDate fechaFin) {

        log.debug("Request to get disponibilidad con cupos for servicio {} from {} to {}",
                servicioId, fechaInicio, fechaFin);

        // Obtener todas las configuraciones de disponibilidad para este servicio
        List<ServicioDisponibilidad> disponibilidades = servicioDisponibilidadRepository
                .findByServicioIdAndActivoTrue(servicioId);

        if (disponibilidades.isEmpty()) {
            return new ArrayList<>();
        }

        // Obtener todos los servicios contratados en este rango (no cancelados)
        ZonedDateTime fechaInicioZ = fechaInicio.atStartOfDay(ZoneId.systemDefault());
        ZonedDateTime fechaFinZ = fechaFin.plusDays(1).atStartOfDay(ZoneId.systemDefault());

        List<EstadoServicioContratado> estadosActivos = Arrays.asList(
                EstadoServicioContratado.PENDIENTE,
                EstadoServicioContratado.CONFIRMADO);

        List<ServicioContratado> serviciosContratados = servicioContratadoRepository.findByServicioAndFechaRange(
                servicioId, fechaInicioZ, fechaFinZ, estadosActivos);

        // Generar lista de disponibilidades con cupos para cada día en el rango
        List<ServicioDisponibilidadConCuposDTO> resultado = new ArrayList<>();

        LocalDate currentDate = fechaInicio;
        while (!currentDate.isAfter(fechaFin)) {
            DayOfWeek dayOfWeek = currentDate.getDayOfWeek();
            DiaSemana diaSemana = convertDayOfWeekToDiaSemana(dayOfWeek);

            // Buscar disponibilidad configurada para este día de la semana
            for (ServicioDisponibilidad disp : disponibilidades) {
                if (disp.getDiaSemana().equals(diaSemana)) {
                    ServicioDisponibilidadDTO baseDTO = servicioDisponibilidadMapper.toDto(disp);
                    ServicioDisponibilidadConCuposDTO dtoConCupos = new ServicioDisponibilidadConCuposDTO(baseDTO);
                    dtoConCupos.setFecha(currentDate);

                    // Contar cupos ocupados para este día
                    final LocalDate fecha = currentDate;
                    long cuposOcupados = serviciosContratados.stream()
                            .filter(sc -> {
                                LocalDate fechaSc = sc.getFechaServicio().toLocalDate();
                                return fechaSc.equals(fecha);
                            })
                            .count();

                    dtoConCupos.setCuposOcupados((int) cuposOcupados);
                    resultado.add(dtoConCupos);
                }
            }

            currentDate = currentDate.plusDays(1);
        }

        return resultado;
    }

    /**
     * Convierte DayOfWeek a DiaSemana enum
     */
    private DiaSemana convertDayOfWeekToDiaSemana(DayOfWeek dayOfWeek) {
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
                throw new IllegalArgumentException("Invalid day of week: " + dayOfWeek);
        }
    }
}
