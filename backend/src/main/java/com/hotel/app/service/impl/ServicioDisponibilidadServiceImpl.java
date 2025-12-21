package com.hotel.app.service.impl;

import com.hotel.app.domain.ServicioDisponibilidad;
import com.hotel.app.repository.ServicioDisponibilidadRepository;
import com.hotel.app.service.ServicioDisponibilidadService;
import com.hotel.app.service.dto.ServicioDisponibilidadDTO;
import com.hotel.app.service.mapper.ServicioDisponibilidadMapper;
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
 * {@link com.hotel.app.domain.ServicioDisponibilidad}.
 */
@Service
@Transactional
public class ServicioDisponibilidadServiceImpl implements ServicioDisponibilidadService {

    private final Logger log = LoggerFactory.getLogger(ServicioDisponibilidadServiceImpl.class);

    private final ServicioDisponibilidadRepository servicioDisponibilidadRepository;

    private final ServicioDisponibilidadMapper servicioDisponibilidadMapper;

    public ServicioDisponibilidadServiceImpl(
            ServicioDisponibilidadRepository servicioDisponibilidadRepository,
            ServicioDisponibilidadMapper servicioDisponibilidadMapper) {
        this.servicioDisponibilidadRepository = servicioDisponibilidadRepository;
        this.servicioDisponibilidadMapper = servicioDisponibilidadMapper;
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
}
