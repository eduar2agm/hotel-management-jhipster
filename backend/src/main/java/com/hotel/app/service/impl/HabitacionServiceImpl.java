package com.hotel.app.service.impl;

import com.hotel.app.domain.Habitacion;
import com.hotel.app.repository.HabitacionRepository;
import com.hotel.app.service.HabitacionService;
import com.hotel.app.service.dto.HabitacionDTO;
import com.hotel.app.service.mapper.HabitacionMapper;
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

    public HabitacionServiceImpl(HabitacionRepository habitacionRepository, HabitacionMapper habitacionMapper) {
        this.habitacionRepository = habitacionRepository;
        this.habitacionMapper = habitacionMapper;
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

    public Page<HabitacionDTO> findAllWithEagerRelationships(Pageable pageable) {
        return habitacionRepository.findAllWithEagerRelationships(pageable).map(habitacionMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<HabitacionDTO> findOne(Long id) {
        LOG.debug("Request to get Habitacion : {}", id);
        return habitacionRepository.findOneWithEagerRelationships(id).map(habitacionMapper::toDto);
    }

    @Override
    public void delete(Long id) {
        LOG.debug("Request to delete Habitacion : {}", id);
        habitacionRepository.deleteById(id);
    }
}
