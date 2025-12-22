package com.hotel.app.service.impl;

import com.hotel.app.config.ApplicationProperties;
import com.hotel.app.domain.SeccionContacto;
import com.hotel.app.repository.SeccionContactoRepository;
import com.hotel.app.service.SeccionContactoService;
import com.hotel.app.service.dto.SeccionContactoDTO;
import com.hotel.app.service.mapper.SeccionContactoMapper;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Base64;
import java.util.Optional;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing
 * {@link com.hotel.app.domain.SeccionContacto}.
 */
@Service
@Transactional
public class SeccionContactoServiceImpl implements SeccionContactoService {

    private static final Logger LOG = LoggerFactory.getLogger(SeccionContactoServiceImpl.class);
    private static final String CONTACT_FOLDER = "contactos";

    private final SeccionContactoRepository seccionContactoRepository;
    private final SeccionContactoMapper seccionContactoMapper;
    private final ApplicationProperties applicationProperties;

    public SeccionContactoServiceImpl(
            SeccionContactoRepository seccionContactoRepository,
            SeccionContactoMapper seccionContactoMapper,
            ApplicationProperties applicationProperties) {
        this.seccionContactoRepository = seccionContactoRepository;
        this.seccionContactoMapper = seccionContactoMapper;
        this.applicationProperties = applicationProperties;
    }

    @Override
    public SeccionContactoDTO save(SeccionContactoDTO seccionContactoDTO) {
        LOG.debug("Request to save SeccionContacto : {}", seccionContactoDTO);
        SeccionContacto seccionContacto = seccionContactoMapper.toEntity(seccionContactoDTO);

        // Handle image upload if base64 data is present
        if (seccionContactoDTO.getImagenFondoBase64() != null && !seccionContactoDTO.getImagenFondoBase64().isEmpty()) {
            String savedPath = saveImageToFile(seccionContactoDTO.getImagenFondoBase64(),
                    seccionContactoDTO.getImagenFondoContentType(), null);
            seccionContacto.setImagenFondoUrl(savedPath);
        }

        seccionContacto = seccionContactoRepository.save(seccionContacto);
        return seccionContactoMapper.toDto(seccionContacto);
    }

    @Override
    public SeccionContactoDTO update(SeccionContactoDTO seccionContactoDTO) {
        LOG.debug("Request to update SeccionContacto : {}", seccionContactoDTO);

        // Get existing entity to check for old image
        Optional<SeccionContacto> existingOpt = seccionContactoRepository.findById(seccionContactoDTO.getId());
        String oldImagePath = existingOpt.map(SeccionContacto::getImagenFondoUrl).orElse(null);

        SeccionContacto seccionContacto = seccionContactoMapper.toEntity(seccionContactoDTO);

        // Handle image upload if base64 data is present
        if (seccionContactoDTO.getImagenFondoBase64() != null && !seccionContactoDTO.getImagenFondoBase64().isEmpty()) {
            String savedPath = saveImageToFile(seccionContactoDTO.getImagenFondoBase64(),
                    seccionContactoDTO.getImagenFondoContentType(), oldImagePath);
            seccionContacto.setImagenFondoUrl(savedPath);
        }

        seccionContacto = seccionContactoRepository.save(seccionContacto);
        return seccionContactoMapper.toDto(seccionContacto);
    }

    private String saveImageToFile(String base64Data, String contentType, String oldImagePath) {
        try {
            // Delete old image if exists
            if (oldImagePath != null && !oldImagePath.isEmpty()) {
                deleteFileFromLocal(oldImagePath);
            }

            // Decode base64
            byte[] imageBytes = Base64.getDecoder().decode(base64Data);

            // Generate filename
            String extension = getExtensionFromContentType(contentType);
            String fileName = "fondo_" + UUID.randomUUID().toString() + extension;

            // Create directory if not exists
            Path rootPath = Paths.get(applicationProperties.getImagePath()).toAbsolutePath();
            Path contactosPath = rootPath.resolve(CONTACT_FOLDER);
            Files.createDirectories(contactosPath);

            // Write file
            Path targetPath = contactosPath.resolve(fileName);
            Files.write(targetPath, imageBytes);

            // Return relative path
            String relativePath = CONTACT_FOLDER + "/" + fileName;
            LOG.debug("Image saved successfully: {}", relativePath);
            return relativePath;
        } catch (IOException e) {
            LOG.error("Error saving contact background image", e);
            throw new RuntimeException("Could not save background image", e);
        }
    }

    private void deleteFileFromLocal(String relativePath) {
        if (relativePath == null || relativePath.isEmpty() || relativePath.toLowerCase().startsWith("http")) {
            return;
        }
        try {
            Path rootPath = Paths.get(applicationProperties.getImagePath()).toAbsolutePath();
            Path targetPath = rootPath.resolve(relativePath);
            if (Files.exists(targetPath)) {
                Files.delete(targetPath);
                LOG.debug("Deleted old background image: {}", targetPath);
            }
        } catch (Exception e) {
            LOG.warn("Could not delete file from local storage: {}", relativePath, e);
            // We do not throw exception here to avoid transaction rollback just because
            // file deletion failed
        }
    }

    private String getExtensionFromContentType(String contentType) {
        if (contentType == null)
            return ".jpg";
        if (contentType.contains("png"))
            return ".png";
        if (contentType.contains("gif"))
            return ".gif";
        if (contentType.contains("webp"))
            return ".webp";
        if (contentType.contains("jpeg") || contentType.contains("jpg"))
            return ".jpg";
        return ".jpg";
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
        // Delete associated image file before deleting entity
        seccionContactoRepository.findById(id).ifPresent(seccion -> {
            if (seccion.getImagenFondoUrl() != null) {
                deleteFileFromLocal(seccion.getImagenFondoUrl());
            }
        });
        seccionContactoRepository.deleteById(id);
    }
}
