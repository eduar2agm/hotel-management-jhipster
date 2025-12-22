package com.hotel.app.service.impl;

import com.hotel.app.domain.Telefono;
import com.hotel.app.repository.TelefonoRepository;
import com.hotel.app.service.TelefonoService;
import com.hotel.app.service.dto.TelefonoDTO;
import com.hotel.app.service.mapper.TelefonoMapper;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.hotel.app.domain.Telefono}.
 */
@Service
@Transactional
public class TelefonoServiceImpl implements TelefonoService {

    private static final Logger LOG = LoggerFactory.getLogger(TelefonoServiceImpl.class);

    private final TelefonoRepository telefonoRepository;

    private final TelefonoMapper telefonoMapper;

    public TelefonoServiceImpl(TelefonoRepository telefonoRepository, TelefonoMapper telefonoMapper) {
        this.telefonoRepository = telefonoRepository;
        this.telefonoMapper = telefonoMapper;
    }

    @Override
    public TelefonoDTO save(TelefonoDTO telefonoDTO) {
        LOG.debug("Request to save Telefono : {}", telefonoDTO);
        Telefono telefono = telefonoMapper.toEntity(telefonoDTO);
        telefono = telefonoRepository.save(telefono);
        return telefonoMapper.toDto(telefono);
    }

    @Override
    public TelefonoDTO update(TelefonoDTO telefonoDTO) {
        LOG.debug("Request to update Telefono : {}", telefonoDTO);
        Telefono telefono = telefonoMapper.toEntity(telefonoDTO);
        telefono = telefonoRepository.save(telefono);
        return telefonoMapper.toDto(telefono);
    }

    @Override
    public Optional<TelefonoDTO> partialUpdate(TelefonoDTO telefonoDTO) {
        LOG.debug("Request to partially update Telefono : {}", telefonoDTO);

        return telefonoRepository
            .findById(telefonoDTO.getId())
            .map(existingTelefono -> {
                telefonoMapper.partialUpdate(existingTelefono, telefonoDTO);

                return existingTelefono;
            })
            .map(telefonoRepository::save)
            .map(telefonoMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TelefonoDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all Telefonos");
        return telefonoRepository.findAll(pageable).map(telefonoMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<TelefonoDTO> findOne(Long id) {
        LOG.debug("Request to get Telefono : {}", id);
        return telefonoRepository.findById(id).map(telefonoMapper::toDto);
    }

    @Override
    public void delete(Long id) {
        LOG.debug("Request to delete Telefono : {}", id);
        telefonoRepository.deleteById(id);
    }
}
