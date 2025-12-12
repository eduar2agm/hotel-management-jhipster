package com.hotel.app.service.impl;

import com.hotel.app.domain.MensajeSoporte;
import com.hotel.app.repository.MensajeSoporteRepository;
import com.hotel.app.service.MensajeSoporteService;
import com.hotel.app.service.dto.MensajeSoporteDTO;
import com.hotel.app.service.mapper.MensajeSoporteMapper;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.hotel.app.domain.MensajeSoporte}.
 */
@Service
@Transactional
public class MensajeSoporteServiceImpl implements MensajeSoporteService {

    private static final Logger LOG = LoggerFactory.getLogger(MensajeSoporteServiceImpl.class);

    private final MensajeSoporteRepository mensajeSoporteRepository;

    private final MensajeSoporteMapper mensajeSoporteMapper;

    public MensajeSoporteServiceImpl(MensajeSoporteRepository mensajeSoporteRepository, MensajeSoporteMapper mensajeSoporteMapper) {
        this.mensajeSoporteRepository = mensajeSoporteRepository;
        this.mensajeSoporteMapper = mensajeSoporteMapper;
    }

    @Override
    public MensajeSoporteDTO save(MensajeSoporteDTO mensajeSoporteDTO) {
        LOG.debug("Request to save MensajeSoporte : {}", mensajeSoporteDTO);
        MensajeSoporte mensajeSoporte = mensajeSoporteMapper.toEntity(mensajeSoporteDTO);
        mensajeSoporte = mensajeSoporteRepository.save(mensajeSoporte);
        return mensajeSoporteMapper.toDto(mensajeSoporte);
    }

    @Override
    public MensajeSoporteDTO update(MensajeSoporteDTO mensajeSoporteDTO) {
        LOG.debug("Request to update MensajeSoporte : {}", mensajeSoporteDTO);
        MensajeSoporte mensajeSoporte = mensajeSoporteMapper.toEntity(mensajeSoporteDTO);
        mensajeSoporte = mensajeSoporteRepository.save(mensajeSoporte);
        return mensajeSoporteMapper.toDto(mensajeSoporte);
    }

    @Override
    public Optional<MensajeSoporteDTO> partialUpdate(MensajeSoporteDTO mensajeSoporteDTO) {
        LOG.debug("Request to partially update MensajeSoporte : {}", mensajeSoporteDTO);

        return mensajeSoporteRepository
            .findById(mensajeSoporteDTO.getId())
            .map(existingMensajeSoporte -> {
                mensajeSoporteMapper.partialUpdate(existingMensajeSoporte, mensajeSoporteDTO);

                return existingMensajeSoporte;
            })
            .map(mensajeSoporteRepository::save)
            .map(mensajeSoporteMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MensajeSoporteDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all MensajeSoportes");
        return mensajeSoporteRepository.findAll(pageable).map(mensajeSoporteMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<MensajeSoporteDTO> findOne(Long id) {
        LOG.debug("Request to get MensajeSoporte : {}", id);
        return mensajeSoporteRepository.findById(id).map(mensajeSoporteMapper::toDto);
    }

    @Override
    public void delete(Long id) {
        LOG.debug("Request to delete MensajeSoporte : {}", id);
        mensajeSoporteRepository.deleteById(id);
    }
}
