package com.hotel.app.service.impl;

import com.hotel.app.domain.RedSociallanding;
import com.hotel.app.repository.RedSociallandingRepository;
import com.hotel.app.service.RedSociallandingService;
import com.hotel.app.service.dto.RedSociallandingDTO;
import com.hotel.app.service.mapper.RedSociallandingMapper;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.hotel.app.domain.RedSociallanding}.
 */
@Service
@Transactional
public class RedSociallandingServiceImpl implements RedSociallandingService {

    private static final Logger LOG = LoggerFactory.getLogger(RedSociallandingServiceImpl.class);

    private final RedSociallandingRepository redSociallandingRepository;

    private final RedSociallandingMapper redSociallandingMapper;

    public RedSociallandingServiceImpl(RedSociallandingRepository redSociallandingRepository, RedSociallandingMapper redSociallandingMapper) {
        this.redSociallandingRepository = redSociallandingRepository;
        this.redSociallandingMapper = redSociallandingMapper;
    }

    @Override
    public RedSociallandingDTO save(RedSociallandingDTO redSociallandingDTO) {
        LOG.debug("Request to save RedSociallanding : {}", redSociallandingDTO);
        RedSociallanding redSociallanding = redSociallandingMapper.toEntity(redSociallandingDTO);
        redSociallanding = redSociallandingRepository.save(redSociallanding);
        return redSociallandingMapper.toDto(redSociallanding);
    }

    @Override
    public RedSociallandingDTO update(RedSociallandingDTO redSociallandingDTO) {
        LOG.debug("Request to update RedSociallanding : {}", redSociallandingDTO);
        RedSociallanding redSociallanding = redSociallandingMapper.toEntity(redSociallandingDTO);
        redSociallanding = redSociallandingRepository.save(redSociallanding);
        return redSociallandingMapper.toDto(redSociallanding);
    }

    @Override
    public Optional<RedSociallandingDTO> partialUpdate(RedSociallandingDTO redSociallandingDTO) {
        LOG.debug("Request to partially update RedSociallanding : {}", redSociallandingDTO);

        return redSociallandingRepository
            .findById(redSociallandingDTO.getId())
            .map(existingRedSociallanding -> {
                redSociallandingMapper.partialUpdate(existingRedSociallanding, redSociallandingDTO);

                return existingRedSociallanding;
            })
            .map(redSociallandingRepository::save)
            .map(redSociallandingMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<RedSociallandingDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all RedSociallandings");
        return redSociallandingRepository.findAll(pageable).map(redSociallandingMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<RedSociallandingDTO> findOne(Long id) {
        LOG.debug("Request to get RedSociallanding : {}", id);
        return redSociallandingRepository.findById(id).map(redSociallandingMapper::toDto);
    }

    @Override
    public void delete(Long id) {
        LOG.debug("Request to delete RedSociallanding : {}", id);
        redSociallandingRepository.deleteById(id);
    }
}
