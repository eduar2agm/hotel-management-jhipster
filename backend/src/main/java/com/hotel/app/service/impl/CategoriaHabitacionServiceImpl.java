package com.hotel.app.service.impl;

import com.hotel.app.domain.CategoriaHabitacion;
import com.hotel.app.repository.CategoriaHabitacionRepository;
import com.hotel.app.service.CategoriaHabitacionService;
import com.hotel.app.service.dto.CategoriaHabitacionDTO;
import com.hotel.app.service.mapper.CategoriaHabitacionMapper;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.hotel.app.domain.CategoriaHabitacion}.
 */
@Service
@Transactional
public class CategoriaHabitacionServiceImpl implements CategoriaHabitacionService {

    private static final Logger LOG = LoggerFactory.getLogger(CategoriaHabitacionServiceImpl.class);

    private final CategoriaHabitacionRepository categoriaHabitacionRepository;

    private final CategoriaHabitacionMapper categoriaHabitacionMapper;

    public CategoriaHabitacionServiceImpl(
        CategoriaHabitacionRepository categoriaHabitacionRepository,
        CategoriaHabitacionMapper categoriaHabitacionMapper
    ) {
        this.categoriaHabitacionRepository = categoriaHabitacionRepository;
        this.categoriaHabitacionMapper = categoriaHabitacionMapper;
    }

    @Override
    public CategoriaHabitacionDTO save(CategoriaHabitacionDTO categoriaHabitacionDTO) {
        LOG.debug("Request to save CategoriaHabitacion : {}", categoriaHabitacionDTO);
        CategoriaHabitacion categoriaHabitacion = categoriaHabitacionMapper.toEntity(categoriaHabitacionDTO);
        categoriaHabitacion = categoriaHabitacionRepository.save(categoriaHabitacion);
        return categoriaHabitacionMapper.toDto(categoriaHabitacion);
    }

    @Override
    public CategoriaHabitacionDTO update(CategoriaHabitacionDTO categoriaHabitacionDTO) {
        LOG.debug("Request to update CategoriaHabitacion : {}", categoriaHabitacionDTO);
        CategoriaHabitacion categoriaHabitacion = categoriaHabitacionMapper.toEntity(categoriaHabitacionDTO);
        categoriaHabitacion = categoriaHabitacionRepository.save(categoriaHabitacion);
        return categoriaHabitacionMapper.toDto(categoriaHabitacion);
    }

    @Override
    public Optional<CategoriaHabitacionDTO> partialUpdate(CategoriaHabitacionDTO categoriaHabitacionDTO) {
        LOG.debug("Request to partially update CategoriaHabitacion : {}", categoriaHabitacionDTO);

        return categoriaHabitacionRepository
            .findById(categoriaHabitacionDTO.getId())
            .map(existingCategoriaHabitacion -> {
                categoriaHabitacionMapper.partialUpdate(existingCategoriaHabitacion, categoriaHabitacionDTO);

                return existingCategoriaHabitacion;
            })
            .map(categoriaHabitacionRepository::save)
            .map(categoriaHabitacionMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CategoriaHabitacionDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all CategoriaHabitacions");
        return categoriaHabitacionRepository.findAll(pageable).map(categoriaHabitacionMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<CategoriaHabitacionDTO> findOne(Long id) {
        LOG.debug("Request to get CategoriaHabitacion : {}", id);
        return categoriaHabitacionRepository.findById(id).map(categoriaHabitacionMapper::toDto);
    }

    @Override
    public void delete(Long id) {
        LOG.debug("Request to delete CategoriaHabitacion : {}", id);
        categoriaHabitacionRepository.deleteById(id);
    }
}
