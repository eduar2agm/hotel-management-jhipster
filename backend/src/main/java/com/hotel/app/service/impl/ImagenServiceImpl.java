package com.hotel.app.service.impl;

import com.hotel.app.domain.Imagen;
import com.hotel.app.repository.ImagenRepository;
import com.hotel.app.service.ImagenService;
import com.hotel.app.service.dto.ImagenDTO;
import com.hotel.app.service.mapper.ImagenMapper;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.hotel.app.domain.Imagen}.
 */
@Service
@Transactional
public class ImagenServiceImpl implements ImagenService {

    private static final Logger LOG = LoggerFactory.getLogger(ImagenServiceImpl.class);

    private final ImagenRepository imagenRepository;

    private final ImagenMapper imagenMapper;

    public ImagenServiceImpl(ImagenRepository imagenRepository, ImagenMapper imagenMapper) {
        this.imagenRepository = imagenRepository;
        this.imagenMapper = imagenMapper;
    }

    @Override
    public ImagenDTO save(ImagenDTO imagenDTO) {
        LOG.debug("Request to save Imagen : {}", imagenDTO);
        Imagen imagen = imagenMapper.toEntity(imagenDTO);
        imagen = imagenRepository.save(imagen);
        return imagenMapper.toDto(imagen);
    }

    @Override
    public ImagenDTO update(ImagenDTO imagenDTO) {
        LOG.debug("Request to update Imagen : {}", imagenDTO);
        Imagen imagen = imagenMapper.toEntity(imagenDTO);
        imagen = imagenRepository.save(imagen);
        return imagenMapper.toDto(imagen);
    }

    @Override
    public Optional<ImagenDTO> partialUpdate(ImagenDTO imagenDTO) {
        LOG.debug("Request to partially update Imagen : {}", imagenDTO);

        return imagenRepository
            .findById(imagenDTO.getId())
            .map(existingImagen -> {
                imagenMapper.partialUpdate(existingImagen, imagenDTO);

                return existingImagen;
            })
            .map(imagenRepository::save)
            .map(imagenMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ImagenDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all Imagens");
        return imagenRepository.findAll(pageable).map(imagenMapper::toDto);
    }

    public Page<ImagenDTO> findAllWithEagerRelationships(Pageable pageable) {
        return imagenRepository.findAllWithEagerRelationships(pageable).map(imagenMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<ImagenDTO> findOne(Long id) {
        LOG.debug("Request to get Imagen : {}", id);
        return imagenRepository.findOneWithEagerRelationships(id).map(imagenMapper::toDto);
    }

    @Override
    public void delete(Long id) {
        LOG.debug("Request to delete Imagen : {}", id);
        imagenRepository.deleteById(id);
    }
}
