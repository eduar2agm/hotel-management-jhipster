package com.hotel.app.service.impl;

import com.hotel.app.domain.RedSocial;
import com.hotel.app.repository.RedSocialRepository;
import com.hotel.app.service.RedSocialService;
import com.hotel.app.service.dto.RedSocialDTO;
import com.hotel.app.service.mapper.RedSocialMapper;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.hotel.app.domain.RedSocial}.
 */
@Service
@Transactional
public class RedSocialServiceImpl implements RedSocialService {

    private static final Logger LOG = LoggerFactory.getLogger(RedSocialServiceImpl.class);

    private final RedSocialRepository redSocialRepository;

    private final RedSocialMapper redSocialMapper;

    public RedSocialServiceImpl(RedSocialRepository redSocialRepository, RedSocialMapper redSocialMapper) {
        this.redSocialRepository = redSocialRepository;
        this.redSocialMapper = redSocialMapper;
    }

    @Override
    public RedSocialDTO save(RedSocialDTO redSocialDTO) {
        LOG.debug("Request to save RedSocial : {}", redSocialDTO);
        RedSocial redSocial = redSocialMapper.toEntity(redSocialDTO);
        redSocial = redSocialRepository.save(redSocial);
        return redSocialMapper.toDto(redSocial);
    }

    @Override
    public RedSocialDTO update(RedSocialDTO redSocialDTO) {
        LOG.debug("Request to update RedSocial : {}", redSocialDTO);
        RedSocial redSocial = redSocialMapper.toEntity(redSocialDTO);
        redSocial = redSocialRepository.save(redSocial);
        return redSocialMapper.toDto(redSocial);
    }

    @Override
    public Optional<RedSocialDTO> partialUpdate(RedSocialDTO redSocialDTO) {
        LOG.debug("Request to partially update RedSocial : {}", redSocialDTO);

        return redSocialRepository
            .findById(redSocialDTO.getId())
            .map(existingRedSocial -> {
                redSocialMapper.partialUpdate(existingRedSocial, redSocialDTO);

                return existingRedSocial;
            })
            .map(redSocialRepository::save)
            .map(redSocialMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<RedSocialDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all RedSocials");
        return redSocialRepository.findAll(pageable).map(redSocialMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<RedSocialDTO> findOne(Long id) {
        LOG.debug("Request to get RedSocial : {}", id);
        return redSocialRepository.findById(id).map(redSocialMapper::toDto);
    }

    @Override
    public void delete(Long id) {
        LOG.debug("Request to delete RedSocial : {}", id);
        redSocialRepository.deleteById(id);
    }
}
