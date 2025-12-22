package com.hotel.app.service.impl;

import com.hotel.app.domain.SeccionContacto;
import com.hotel.app.repository.SeccionContactoRepository;
import com.hotel.app.service.SeccionContactoService;
import com.hotel.app.service.dto.SeccionContactoDTO;
import com.hotel.app.service.mapper.SeccionContactoMapper;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.hotel.app.domain.SeccionContacto}.
 */
@Service
@Transactional
public class SeccionContactoServiceImpl implements SeccionContactoService {

    private static final Logger LOG = LoggerFactory.getLogger(SeccionContactoServiceImpl.class);

    private final SeccionContactoRepository seccionContactoRepository;

    private final SeccionContactoMapper seccionContactoMapper;

    public SeccionContactoServiceImpl(SeccionContactoRepository seccionContactoRepository, SeccionContactoMapper seccionContactoMapper) {
        this.seccionContactoRepository = seccionContactoRepository;
        this.seccionContactoMapper = seccionContactoMapper;
    }

    @Override
    public SeccionContactoDTO save(SeccionContactoDTO seccionContactoDTO) {
        LOG.debug("Request to save SeccionContacto : {}", seccionContactoDTO);
        SeccionContacto seccionContacto = seccionContactoMapper.toEntity(seccionContactoDTO);
        seccionContacto = seccionContactoRepository.save(seccionContacto);
        return seccionContactoMapper.toDto(seccionContacto);
    }

    @Override
    public SeccionContactoDTO update(SeccionContactoDTO seccionContactoDTO) {
        LOG.debug("Request to update SeccionContacto : {}", seccionContactoDTO);
        SeccionContacto seccionContacto = seccionContactoMapper.toEntity(seccionContactoDTO);
        seccionContacto = seccionContactoRepository.save(seccionContacto);
        return seccionContactoMapper.toDto(seccionContacto);
    }

    @Override
    public Optional<SeccionContactoDTO> partialUpdate(SeccionContactoDTO seccionContactoDTO) {
        LOG.debug("Request to partially update SeccionContacto : {}", seccionContactoDTO);

        return seccionContactoRepository
            .findById(seccionContactoDTO.getId())
            .map(existingSeccionContacto -> {
                seccionContactoMapper.partialUpdate(existingSeccionContacto, seccionContactoDTO);

                return existingSeccionContacto;
            })
            .map(seccionContactoRepository::save)
            .map(seccionContactoMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SeccionContactoDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all SeccionContactos");
        return seccionContactoRepository.findAll(pageable).map(seccionContactoMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<SeccionContactoDTO> findOne(Long id) {
        LOG.debug("Request to get SeccionContacto : {}", id);
        return seccionContactoRepository.findById(id).map(seccionContactoMapper::toDto);
    }

    @Override
    public void delete(Long id) {
        LOG.debug("Request to delete SeccionContacto : {}", id);
        seccionContactoRepository.deleteById(id);
    }
}
