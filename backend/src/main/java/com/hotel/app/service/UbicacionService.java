package com.hotel.app.service;

import com.hotel.app.domain.Ubicacion;
import com.hotel.app.repository.UbicacionRepository;
import com.hotel.app.service.dto.UbicacionDTO;
import com.hotel.app.service.mapper.UbicacionMapper;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.hotel.app.domain.Ubicacion}.
 */
@Service
@Transactional
public class UbicacionService {

    private static final Logger LOG = LoggerFactory.getLogger(UbicacionService.class);

    private final UbicacionRepository ubicacionRepository;

    private final UbicacionMapper ubicacionMapper;

    public UbicacionService(UbicacionRepository ubicacionRepository, UbicacionMapper ubicacionMapper) {
        this.ubicacionRepository = ubicacionRepository;
        this.ubicacionMapper = ubicacionMapper;
    }

    /**
     * Save a ubicacion.
     *
     * @param ubicacionDTO the entity to save.
     * @return the persisted entity.
     */
    public UbicacionDTO save(UbicacionDTO ubicacionDTO) {
        LOG.debug("Request to save Ubicacion : {}", ubicacionDTO);
        Ubicacion ubicacion = ubicacionMapper.toEntity(ubicacionDTO);
        ubicacion = ubicacionRepository.save(ubicacion);
        return ubicacionMapper.toDto(ubicacion);
    }

    /**
     * Update a ubicacion.
     *
     * @param ubicacionDTO the entity to save.
     * @return the persisted entity.
     */
    public UbicacionDTO update(UbicacionDTO ubicacionDTO) {
        LOG.debug("Request to update Ubicacion : {}", ubicacionDTO);
        Ubicacion ubicacion = ubicacionMapper.toEntity(ubicacionDTO);
        ubicacion = ubicacionRepository.save(ubicacion);
        return ubicacionMapper.toDto(ubicacion);
    }

    /**
     * Partially update a ubicacion.
     *
     * @param ubicacionDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<UbicacionDTO> partialUpdate(UbicacionDTO ubicacionDTO) {
        LOG.debug("Request to partially update Ubicacion : {}", ubicacionDTO);

        return ubicacionRepository
            .findById(ubicacionDTO.getId())
            .map(existingUbicacion -> {
                ubicacionMapper.partialUpdate(existingUbicacion, ubicacionDTO);

                return existingUbicacion;
            })
            .map(ubicacionRepository::save)
            .map(ubicacionMapper::toDto);
    }

    /**
     * Get all the ubicacions.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Page<UbicacionDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all Ubicacions");
        return ubicacionRepository.findAll(pageable).map(ubicacionMapper::toDto);
    }

    /**
     * Get one ubicacion by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<UbicacionDTO> findOne(Long id) {
        LOG.debug("Request to get Ubicacion : {}", id);
        return ubicacionRepository.findById(id).map(ubicacionMapper::toDto);
    }

    /**
     * Delete the ubicacion by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete Ubicacion : {}", id);
        ubicacionRepository.deleteById(id);
    }
}
