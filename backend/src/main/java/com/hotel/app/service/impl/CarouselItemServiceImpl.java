package com.hotel.app.service.impl;

import com.hotel.app.domain.CarouselItem;
import com.hotel.app.repository.CarouselItemRepository;
import com.hotel.app.service.CarouselItemService;
import com.hotel.app.service.dto.CarouselItemDTO;
import com.hotel.app.service.mapper.CarouselItemMapper;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.hotel.app.domain.CarouselItem}.
 */
@Service
@Transactional
public class CarouselItemServiceImpl implements CarouselItemService {

    private static final Logger LOG = LoggerFactory.getLogger(CarouselItemServiceImpl.class);

    private final CarouselItemRepository carouselItemRepository;

    private final CarouselItemMapper carouselItemMapper;

    public CarouselItemServiceImpl(CarouselItemRepository carouselItemRepository, CarouselItemMapper carouselItemMapper) {
        this.carouselItemRepository = carouselItemRepository;
        this.carouselItemMapper = carouselItemMapper;
    }

    @Override
    public CarouselItemDTO save(CarouselItemDTO carouselItemDTO) {
        LOG.debug("Request to save CarouselItem : {}", carouselItemDTO);
        CarouselItem carouselItem = carouselItemMapper.toEntity(carouselItemDTO);
        carouselItem = carouselItemRepository.save(carouselItem);
        return carouselItemMapper.toDto(carouselItem);
    }

    @Override
    public CarouselItemDTO update(CarouselItemDTO carouselItemDTO) {
        LOG.debug("Request to update CarouselItem : {}", carouselItemDTO);
        CarouselItem carouselItem = carouselItemMapper.toEntity(carouselItemDTO);
        carouselItem = carouselItemRepository.save(carouselItem);
        return carouselItemMapper.toDto(carouselItem);
    }

    @Override
    public Optional<CarouselItemDTO> partialUpdate(CarouselItemDTO carouselItemDTO) {
        LOG.debug("Request to partially update CarouselItem : {}", carouselItemDTO);

        return carouselItemRepository
            .findById(carouselItemDTO.getId())
            .map(existingCarouselItem -> {
                carouselItemMapper.partialUpdate(existingCarouselItem, carouselItemDTO);

                return existingCarouselItem;
            })
            .map(carouselItemRepository::save)
            .map(carouselItemMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CarouselItemDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all CarouselItems");
        return carouselItemRepository.findAll(pageable).map(carouselItemMapper::toDto);
    }

    public Page<CarouselItemDTO> findAllWithEagerRelationships(Pageable pageable) {
        return carouselItemRepository.findAllWithEagerRelationships(pageable).map(carouselItemMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<CarouselItemDTO> findOne(Long id) {
        LOG.debug("Request to get CarouselItem : {}", id);
        return carouselItemRepository.findOneWithEagerRelationships(id).map(carouselItemMapper::toDto);
    }

    @Override
    public void delete(Long id) {
        LOG.debug("Request to delete CarouselItem : {}", id);
        carouselItemRepository.deleteById(id);
    }
}
