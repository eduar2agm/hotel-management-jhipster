package com.hotel.app.service.impl;

import com.hotel.app.domain.Servicio;
import com.hotel.app.repository.ServicioRepository;
import com.hotel.app.service.ServicioService;
import com.hotel.app.service.dto.ServicioDTO;
import com.hotel.app.service.mapper.ServicioMapper;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.hotel.app.domain.Servicio}.
 */
@Service
@Transactional
public class ServicioServiceImpl implements ServicioService {

    private static final Logger LOG = LoggerFactory.getLogger(ServicioServiceImpl.class);

    private final ServicioRepository servicioRepository;

    private final ServicioMapper servicioMapper;
    private final com.hotel.app.service.ImagenService imagenService;

    public ServicioServiceImpl(ServicioRepository servicioRepository, ServicioMapper servicioMapper,
            com.hotel.app.service.ImagenService imagenService) {
        this.servicioRepository = servicioRepository;
        this.servicioMapper = servicioMapper;
        this.imagenService = imagenService;
    }

    @Override
    public ServicioDTO save(ServicioDTO servicioDTO) {
        LOG.debug("Request to save Servicio : {}", servicioDTO);
        Servicio servicio = servicioMapper.toEntity(servicioDTO);
        servicio = servicioRepository.save(servicio);
        return servicioMapper.toDto(servicio);
    }

    @Override
    public ServicioDTO update(ServicioDTO servicioDTO) {
        LOG.debug("Request to update Servicio : {}", servicioDTO);
        Servicio servicio = servicioMapper.toEntity(servicioDTO);
        servicio = servicioRepository.save(servicio);
        return servicioMapper.toDto(servicio);
    }

    @Override
    public Optional<ServicioDTO> partialUpdate(ServicioDTO servicioDTO) {
        LOG.debug("Request to partially update Servicio : {}", servicioDTO);

        return servicioRepository
                .findById(servicioDTO.getId())
                .map(existingServicio -> {
                    servicioMapper.partialUpdate(existingServicio, servicioDTO);

                    return existingServicio;
                })
                .map(servicioRepository::save)
                .map(servicioMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ServicioDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all Servicios");
        return servicioRepository.findAll(pageable).map(servicioMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<ServicioDTO> findOne(Long id) {
        LOG.debug("Request to get Servicio : {}", id);
        return servicioRepository.findById(id).map(servicioMapper::toDto).map(dto -> {
            dto.setImagenes(imagenService.findByServicioId(id));
            return dto;
        });
    }

    @Override
    public void delete(Long id) {
        LOG.debug("Request to delete Servicio : {}", id);
        imagenService.deleteByServicioId(id);
        servicioRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ServicioDTO> findAllByDisponible(Pageable pageable) {
        LOG.debug("Request to get all available Servicios");
        return servicioRepository.findAllByDisponible(true, pageable).map(servicioMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ServicioDTO> findAllByTipoAndDisponible(com.hotel.app.domain.enumeration.TipoServicio tipo,
            Boolean disponible, Pageable pageable) {
        LOG.debug("Request to get Servicios by tipo: {} and disponible: {}", tipo, disponible);
        return servicioRepository.findAllByTipoAndDisponible(tipo, disponible, pageable).map(servicioMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ServicioDTO> findAllByTipo(com.hotel.app.domain.enumeration.TipoServicio tipo, Pageable pageable) {
        LOG.debug("Request to get Servicios by tipo: {}", tipo);
        return servicioRepository.findAllByTipo(tipo, pageable).map(servicioMapper::toDto);
    }
}
