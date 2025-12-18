package com.hotel.app.service.impl;

import com.hotel.app.domain.Habitacion;
import com.hotel.app.repository.CheckInCheckOutRepository;
import com.hotel.app.repository.HabitacionRepository;
import com.hotel.app.repository.ReservaDetalleRepository;
import com.hotel.app.service.HabitacionService;
import com.hotel.app.service.dto.HabitacionDTO;
import com.hotel.app.service.mapper.HabitacionMapper;
import com.hotel.app.web.rest.errors.BadRequestAlertException;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.hotel.app.domain.Habitacion}.
 */
@Service
@Transactional
public class HabitacionServiceImpl implements HabitacionService {

    private static final Logger LOG = LoggerFactory.getLogger(HabitacionServiceImpl.class);

    private final HabitacionRepository habitacionRepository;

    private final HabitacionMapper habitacionMapper;

    private final CheckInCheckOutRepository checkInCheckOutRepository;

    private final ReservaDetalleRepository reservaDetalleRepository;

    public HabitacionServiceImpl(
            HabitacionRepository habitacionRepository,
            HabitacionMapper habitacionMapper,
            CheckInCheckOutRepository checkInCheckOutRepository,
            ReservaDetalleRepository reservaDetalleRepository) {
        this.habitacionRepository = habitacionRepository;
        this.habitacionMapper = habitacionMapper;
        this.checkInCheckOutRepository = checkInCheckOutRepository;
        this.reservaDetalleRepository = reservaDetalleRepository;
    }

    @Override
    public HabitacionDTO save(HabitacionDTO habitacionDTO) {
        LOG.debug("Request to save Habitacion : {}", habitacionDTO);
        Habitacion habitacion = habitacionMapper.toEntity(habitacionDTO);
        habitacion = habitacionRepository.save(habitacion);
        return habitacionMapper.toDto(habitacion);
    }

    @Override
    public HabitacionDTO update(HabitacionDTO habitacionDTO) {
        LOG.debug("Request to update Habitacion : {}", habitacionDTO);
        Habitacion habitacion = habitacionMapper.toEntity(habitacionDTO);
        habitacion = habitacionRepository.save(habitacion);
        return habitacionMapper.toDto(habitacion);
    }

    @Override
    public Optional<HabitacionDTO> partialUpdate(HabitacionDTO habitacionDTO) {
        LOG.debug("Request to partially update Habitacion : {}", habitacionDTO);

        return habitacionRepository
                .findById(habitacionDTO.getId())
                .map(existingHabitacion -> {
                    habitacionMapper.partialUpdate(existingHabitacion, habitacionDTO);

                    return existingHabitacion;
                })
                .map(habitacionRepository::save)
                .map(habitacionMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<HabitacionDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all Habitacions");
        return habitacionRepository.findAll(pageable).map(habitacionMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<HabitacionDTO> findOne(Long id) {
        LOG.debug("Request to get Habitacion : {}", id);
        return habitacionRepository.findById(id).map(habitacionMapper::toDto);
    }

    @Override
    public void delete(Long id) {
        LOG.debug("Request to delete Habitacion : {}", id);

        // Verificar si hay un cliente hospedado actualmente en esta habitación
        boolean estaOcupada = checkInCheckOutRepository
                .existsByReservaDetalle_Habitacion_IdAndFechaHoraCheckOutIsNullAndActivoTrue(id);

        if (estaOcupada) {
            throw new BadRequestAlertException(
                    "No se puede eliminar la habitación porque hay un cliente hospedado actualmente",
                    "habitacion",
                    "habitacionOcupadaEliminar");
        }

        // Verificar si hay reservas asociadas a esta habitación
        boolean tieneReservas = reservaDetalleRepository.existsByHabitacion_Id(id);

        if (tieneReservas) {
            throw new BadRequestAlertException(
                    "No se puede eliminar la habitación porque tiene reservas asociadas. Debe eliminar primero las reservas que incluyen esta habitación.",
                    "habitacion",
                    "habitacionConReservas");
        }

        habitacionRepository.deleteById(id);
    }

    @Override
    public void activate(Long id) {
        LOG.debug("Request to activate Habitacion : {}", id);
        habitacionRepository
                .findById(id)
                .ifPresent(habitacion -> {
                    habitacion.setActivo(true);
                    habitacionRepository.save(habitacion);
                });
    }

    @Override
    public void deactivate(Long id) {
        LOG.debug("Request to deactivate Habitacion : {}", id);

        // Verificar si hay un cliente hospedado actualmente en esta habitación
        boolean estaOcupada = checkInCheckOutRepository
                .existsByReservaDetalle_Habitacion_IdAndFechaHoraCheckOutIsNullAndActivoTrue(id);

        if (estaOcupada) {
            throw new BadRequestAlertException(
                    "No se puede desactivar la habitación porque hay un cliente hospedado actualmente",
                    "habitacion",
                    "habitacionOcupada");
        }

        habitacionRepository
                .findById(id)
                .ifPresent(habitacion -> {
                    habitacion.setActivo(false);
                    habitacionRepository.save(habitacion);
                });
    }

    @Override
    @Transactional(readOnly = true)
    public Page<HabitacionDTO> findByActivo(Boolean activo, Pageable pageable) {
        LOG.debug("Request to get Habitacions by activo : {}", activo);
        return habitacionRepository.findByActivo(activo, pageable).map(habitacionMapper::toDto);
    }
}
