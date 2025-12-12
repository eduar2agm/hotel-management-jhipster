package com.hotel.app.service.impl;

import com.hotel.app.domain.CheckInCheckOut;
import com.hotel.app.repository.CheckInCheckOutRepository;
import com.hotel.app.service.CheckInCheckOutService;
import com.hotel.app.service.dto.CheckInCheckOutDTO;
import com.hotel.app.service.mapper.CheckInCheckOutMapper;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.hotel.app.domain.CheckInCheckOut}.
 */
@Service
@Transactional
public class CheckInCheckOutServiceImpl implements CheckInCheckOutService {

    private static final Logger LOG = LoggerFactory.getLogger(CheckInCheckOutServiceImpl.class);

    private final CheckInCheckOutRepository checkInCheckOutRepository;

    private final CheckInCheckOutMapper checkInCheckOutMapper;

    public CheckInCheckOutServiceImpl(CheckInCheckOutRepository checkInCheckOutRepository, CheckInCheckOutMapper checkInCheckOutMapper) {
        this.checkInCheckOutRepository = checkInCheckOutRepository;
        this.checkInCheckOutMapper = checkInCheckOutMapper;
    }

    @Override
    public CheckInCheckOutDTO save(CheckInCheckOutDTO checkInCheckOutDTO) {
        LOG.debug("Request to save CheckInCheckOut : {}", checkInCheckOutDTO);
        CheckInCheckOut checkInCheckOut = checkInCheckOutMapper.toEntity(checkInCheckOutDTO);
        checkInCheckOut = checkInCheckOutRepository.save(checkInCheckOut);
        return checkInCheckOutMapper.toDto(checkInCheckOut);
    }

    @Override
    public CheckInCheckOutDTO update(CheckInCheckOutDTO checkInCheckOutDTO) {
        LOG.debug("Request to update CheckInCheckOut : {}", checkInCheckOutDTO);
        CheckInCheckOut checkInCheckOut = checkInCheckOutMapper.toEntity(checkInCheckOutDTO);
        checkInCheckOut = checkInCheckOutRepository.save(checkInCheckOut);
        return checkInCheckOutMapper.toDto(checkInCheckOut);
    }

    @Override
    public Optional<CheckInCheckOutDTO> partialUpdate(CheckInCheckOutDTO checkInCheckOutDTO) {
        LOG.debug("Request to partially update CheckInCheckOut : {}", checkInCheckOutDTO);

        return checkInCheckOutRepository
            .findById(checkInCheckOutDTO.getId())
            .map(existingCheckInCheckOut -> {
                checkInCheckOutMapper.partialUpdate(existingCheckInCheckOut, checkInCheckOutDTO);

                return existingCheckInCheckOut;
            })
            .map(checkInCheckOutRepository::save)
            .map(checkInCheckOutMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CheckInCheckOutDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all CheckInCheckOuts");
        return checkInCheckOutRepository.findAll(pageable).map(checkInCheckOutMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<CheckInCheckOutDTO> findOne(Long id) {
        LOG.debug("Request to get CheckInCheckOut : {}", id);
        return checkInCheckOutRepository.findById(id).map(checkInCheckOutMapper::toDto);
    }

    @Override
    public void delete(Long id) {
        LOG.debug("Request to delete CheckInCheckOut : {}", id);
        checkInCheckOutRepository.deleteById(id);
    }
}
