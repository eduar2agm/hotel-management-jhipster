package com.hotel.app.service.impl;

import com.hotel.app.domain.EstadoHabitacion;
import com.hotel.app.repository.EstadoHabitacionRepository;
import com.hotel.app.service.EstadoHabitacionService;
import com.hotel.app.service.dto.EstadoHabitacionDTO;
import com.hotel.app.service.mapper.EstadoHabitacionMapper;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing
 * {@link com.hotel.app.domain.EstadoHabitacion}.
 */
@Service
@Transactional
public class EstadoHabitacionServiceImpl implements EstadoHabitacionService {

    private static final Logger LOG = LoggerFactory.getLogger(EstadoHabitacionServiceImpl.class);

    private final EstadoHabitacionRepository estadoHabitacionRepository;

    private final EstadoHabitacionMapper estadoHabitacionMapper;

    public EstadoHabitacionServiceImpl(
            EstadoHabitacionRepository estadoHabitacionRepository,
            EstadoHabitacionMapper estadoHabitacionMapper) {
        this.estadoHabitacionRepository = estadoHabitacionRepository;
        this.estadoHabitacionMapper = estadoHabitacionMapper;
    }

    @Override
    public EstadoHabitacionDTO save(EstadoHabitacionDTO estadoHabitacionDTO) {
        LOG.debug("Request to save EstadoHabitacion : {}", estadoHabitacionDTO);
        EstadoHabitacion estadoHabitacion = estadoHabitacionMapper.toEntity(estadoHabitacionDTO);
        estadoHabitacion = estadoHabitacionRepository.save(estadoHabitacion);
        return estadoHabitacionMapper.toDto(estadoHabitacion);
    }

    @Override
    public EstadoHabitacionDTO update(EstadoHabitacionDTO estadoHabitacionDTO) {
        LOG.debug("Request to update EstadoHabitacion : {}", estadoHabitacionDTO);
        EstadoHabitacion estadoHabitacion = estadoHabitacionMapper.toEntity(estadoHabitacionDTO);
        estadoHabitacion = estadoHabitacionRepository.save(estadoHabitacion);
        return estadoHabitacionMapper.toDto(estadoHabitacion);
    }

    @Override
    public Optional<EstadoHabitacionDTO> partialUpdate(EstadoHabitacionDTO estadoHabitacionDTO) {
        LOG.debug("Request to partially update EstadoHabitacion : {}", estadoHabitacionDTO);

        return estadoHabitacionRepository
                .findById(estadoHabitacionDTO.getId())
                .map(existingEstadoHabitacion -> {
                    estadoHabitacionMapper.partialUpdate(existingEstadoHabitacion, estadoHabitacionDTO);

                    return existingEstadoHabitacion;
                })
                .map(estadoHabitacionRepository::save)
                .map(estadoHabitacionMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<EstadoHabitacionDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all EstadoHabitacions");
        return estadoHabitacionRepository.findAll(pageable).map(estadoHabitacionMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<EstadoHabitacionDTO> findOne(Long id) {
        LOG.debug("Request to get EstadoHabitacion : {}", id);
        return estadoHabitacionRepository.findById(id).map(estadoHabitacionMapper::toDto);
    }

    @Override
    public void delete(Long id) {
        LOG.debug("Request to delete EstadoHabitacion : {}", id);
        estadoHabitacionRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<EstadoHabitacionDTO> findByActivo(Boolean activo, Pageable pageable) {
        LOG.debug("Request to get EstadoHabitacions by activo : {}", activo);
        return estadoHabitacionRepository.findByActivo(activo, pageable).map(estadoHabitacionMapper::toDto);
    }

}
