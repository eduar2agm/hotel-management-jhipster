package com.hotel.app.service.impl;

import com.hotel.app.domain.SeccionHero;
import com.hotel.app.repository.SeccionHeroRepository;
import com.hotel.app.service.SeccionHeroService;
import com.hotel.app.service.dto.SeccionHeroDTO;
import com.hotel.app.service.mapper.SeccionHeroMapper;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.hotel.app.domain.SeccionHero}.
 */
@Service
@Transactional
public class SeccionHeroServiceImpl implements SeccionHeroService {

    private static final Logger LOG = LoggerFactory.getLogger(SeccionHeroServiceImpl.class);

    private final SeccionHeroRepository seccionHeroRepository;

    private final SeccionHeroMapper seccionHeroMapper;

    public SeccionHeroServiceImpl(SeccionHeroRepository seccionHeroRepository, SeccionHeroMapper seccionHeroMapper) {
        this.seccionHeroRepository = seccionHeroRepository;
        this.seccionHeroMapper = seccionHeroMapper;
    }

    @Override
    public SeccionHeroDTO save(SeccionHeroDTO seccionHeroDTO) {
        LOG.debug("Request to save SeccionHero : {}", seccionHeroDTO);
        SeccionHero seccionHero = seccionHeroMapper.toEntity(seccionHeroDTO);
        seccionHero = seccionHeroRepository.save(seccionHero);
        return seccionHeroMapper.toDto(seccionHero);
    }

    @Override
    public SeccionHeroDTO update(SeccionHeroDTO seccionHeroDTO) {
        LOG.debug("Request to update SeccionHero : {}", seccionHeroDTO);
        SeccionHero seccionHero = seccionHeroMapper.toEntity(seccionHeroDTO);
        seccionHero = seccionHeroRepository.save(seccionHero);
        return seccionHeroMapper.toDto(seccionHero);
    }

    @Override
    public Optional<SeccionHeroDTO> partialUpdate(SeccionHeroDTO seccionHeroDTO) {
        LOG.debug("Request to partially update SeccionHero : {}", seccionHeroDTO);

        return seccionHeroRepository
            .findById(seccionHeroDTO.getId())
            .map(existingSeccionHero -> {
                seccionHeroMapper.partialUpdate(existingSeccionHero, seccionHeroDTO);

                return existingSeccionHero;
            })
            .map(seccionHeroRepository::save)
            .map(seccionHeroMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SeccionHeroDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all SeccionHeroes");
        return seccionHeroRepository.findAll(pageable).map(seccionHeroMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<SeccionHeroDTO> findOne(Long id) {
        LOG.debug("Request to get SeccionHero : {}", id);
        return seccionHeroRepository.findById(id).map(seccionHeroMapper::toDto);
    }

    @Override
    public void delete(Long id) {
        LOG.debug("Request to delete SeccionHero : {}", id);
        seccionHeroRepository.deleteById(id);
    }
}
