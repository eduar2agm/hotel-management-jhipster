package com.hotel.app.service.impl;

import com.hotel.app.config.ApplicationProperties;
import com.hotel.app.repository.HabitacionRepository;
import com.hotel.app.repository.ImagenRepository;
import com.hotel.app.repository.ServicioRepository;
import com.hotel.app.domain.Imagen;
import com.hotel.app.service.ImagenService;
import com.hotel.app.service.dto.ImagenDTO;
import com.hotel.app.service.mapper.ImagenMapper;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Optional;
import java.util.UUID;
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

    private final ApplicationProperties applicationProperties;

    private final HabitacionRepository habitacionRepository;

    private final ServicioRepository servicioRepository;

    public ImagenServiceImpl(
            ImagenRepository imagenRepository,
            ImagenMapper imagenMapper,
            ApplicationProperties applicationProperties,
            HabitacionRepository habitacionRepository,
            ServicioRepository servicioRepository) {
        this.imagenRepository = imagenRepository;
        this.imagenMapper = imagenMapper;
        this.applicationProperties = applicationProperties;
        this.habitacionRepository = habitacionRepository;
        this.servicioRepository = servicioRepository;
    }

    @Override
    public ImagenDTO save(ImagenDTO imagenDTO) {
        LOG.debug("Request to save Imagen : {}", imagenDTO);
        Imagen imagen = imagenMapper.toEntity(imagenDTO);
        if (imagen.getFichero() != null) {
            saveFileToLocal(imagenDTO, imagen);
        }
        imagen = imagenRepository.save(imagen);
        return imagenMapper.toDto(imagen);
    }

    @Override
    public ImagenDTO update(ImagenDTO imagenDTO) {
        LOG.debug("Request to update Imagen : {}", imagenDTO);
        Imagen imagen = imagenMapper.toEntity(imagenDTO);
        if (imagen.getFichero() != null) {
            saveFileToLocal(imagenDTO, imagen);
        }
        imagen = imagenRepository.save(imagen);
        return imagenMapper.toDto(imagen);
    }

    private void saveFileToLocal(ImagenDTO imagenDTO, Imagen imagen) {
        try {
            String subFolder = "carousel";

            // 1. Determine folder and Link existing parent to the Imagen entity
            if (imagen.getHabitacion() != null) {
                subFolder = "habitaciones";
                Long habId = imagen.getHabitacion().getId();
                if (habId != null) {
                    habitacionRepository.findById(habId).ifPresent(h -> {
                        // DELETE OLD FILE if it exists
                        if (h.getImagen() != null && !h.getImagen().isEmpty()) {
                            deleteFileFromLocal(h.getImagen());
                        }
                        imagen.setHabitacion(h); // LINK: Sets the foreign key for the Imagen table
                    });
                } else {
                    imagen.setHabitacion(null);
                }
            } else if (imagen.getServicio() != null) {
                subFolder = "servicios";
                Long servId = imagen.getServicio().getId();
                if (servId != null) {
                    servicioRepository.findById(servId).ifPresent(s -> {
                        // DELETE OLD FILE if it exists
                        if (s.getUrlImage() != null && !s.getUrlImage().isEmpty()) {
                            deleteFileFromLocal(s.getUrlImage());
                        }
                        imagen.setServicio(s); // LINK: Sets the foreign key for the Imagen table
                    });
                } else {
                    imagen.setServicio(null);
                }
            }

            // 2. Prepare filename
            String fileName = imagen.getNombreArchivo();
            if (fileName == null || fileName.isEmpty()) {
                fileName = UUID.randomUUID().toString() + "_" + imagen.getNombre();
            }
            fileName = fileName.replaceAll("[^a-zA-Z0-9._-]", "_");

            // 3. Write file
            Path rootPath = Paths.get(applicationProperties.getImagePath()).toAbsolutePath();
            Path targetPath = rootPath.resolve(subFolder).resolve(fileName);
            Files.createDirectories(targetPath.getParent());
            Files.write(targetPath, imagen.getFichero());

            // 4. Update the path string
            String relativePath = subFolder + "/" + fileName;
            imagen.setNombreArchivo(relativePath);

            // 5. Update the parent's path field if it exists
            if (imagen.getHabitacion() != null) {
                imagen.getHabitacion().setImagen(relativePath);
                habitacionRepository.save(imagen.getHabitacion());
            } else if (imagen.getServicio() != null) {
                imagen.getServicio().setUrlImage(relativePath);
                servicioRepository.save(imagen.getServicio());
            }

            LOG.debug("File saved and relationship established: {}", targetPath);
        } catch (IOException e) {
            LOG.error("Error saving file to local storage", e);
            throw new RuntimeException("Could not save file", e);
        }
    }

    private void deleteFileFromLocal(String relativePath) {
        if (relativePath == null || relativePath.isEmpty())
            return;
        try {
            Path rootPath = Paths.get(applicationProperties.getImagePath()).toAbsolutePath();
            Path targetPath = rootPath.resolve(relativePath);
            if (Files.exists(targetPath)) {
                Files.delete(targetPath);
                LOG.debug("Deleted file from local storage: {}", targetPath);
            }
        } catch (IOException e) {
            LOG.error("Error deleting file from local storage: {}", relativePath, e);
        }
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
        imagenRepository.findById(id).ifPresent(imagen -> {
            if (imagen.getNombreArchivo() != null) {
                deleteFileFromLocal(imagen.getNombreArchivo());
            }
            imagenRepository.delete(imagen);
        });
    }

    @Override
    public void deleteByHabitacionId(Long habitacionId) {
        imagenRepository.findByHabitacionId(habitacionId).forEach(imagen -> {
            delete(imagen.getId());
        });
    }

    @Override
    public void deleteByServicioId(Long servicioId) {
        imagenRepository.findByServicioId(servicioId).forEach(imagen -> {
            delete(imagen.getId());
        });
    }
}
