package com.hotel.app.service.impl;

import com.hotel.app.config.ApplicationProperties;
import com.hotel.app.domain.RedSocial;
import com.hotel.app.repository.RedSocialRepository;
import com.hotel.app.service.RedSocialService;
import com.hotel.app.service.dto.RedSocialDTO;
import com.hotel.app.service.mapper.RedSocialMapper;
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
 * Service Implementation for managing {@link com.hotel.app.domain.RedSocial}.
 */
@Service
@Transactional
public class RedSocialServiceImpl implements RedSocialService {

    private static final Logger LOG = LoggerFactory.getLogger(RedSocialServiceImpl.class);
    private static final String REDES_FOLDER = "redes";

    private final RedSocialRepository redSocialRepository;
    private final RedSocialMapper redSocialMapper;
    private final ApplicationProperties applicationProperties;

    public RedSocialServiceImpl(
            RedSocialRepository redSocialRepository,
            RedSocialMapper redSocialMapper,
            ApplicationProperties applicationProperties) {
        this.redSocialRepository = redSocialRepository;
        this.redSocialMapper = redSocialMapper;
        this.applicationProperties = applicationProperties;
    }

    @Override
    public RedSocialDTO save(RedSocialDTO redSocialDTO) {
        LOG.debug("Request to save RedSocial : {}", redSocialDTO);

        // Handle file upload
        if (redSocialDTO.getIconoMediaBase64() != null) {
            try {
                String imagePath = saveImageToFile(
                        redSocialDTO.getIconoMediaBase64(),
                        redSocialDTO.getIconoMediaContentType(),
                        null // No old image for create
                );
                redSocialDTO.setIconoUrl(imagePath);
            } catch (IOException e) {
                LOG.error("Failed to save red social icon", e);
                throw new RuntimeException("Failed to save image", e);
            }
        }

        RedSocial redSocial = redSocialMapper.toEntity(redSocialDTO);
        redSocial = redSocialRepository.save(redSocial);
        return redSocialMapper.toDto(redSocial);
    }

    @Override
    public RedSocialDTO update(RedSocialDTO redSocialDTO) {
        LOG.debug("Request to update RedSocial : {}", redSocialDTO);

        // Handle file upload
        if (redSocialDTO.getIconoMediaBase64() != null) {
            try {
                // Get old image path to delete it
                String oldImagePath = null;
                Optional<RedSocial> oldEntity = redSocialRepository.findById(redSocialDTO.getId());
                if (oldEntity.isPresent()) {
                    oldImagePath = oldEntity.get().getIconoUrl();
                }

                String imagePath = saveImageToFile(
                        redSocialDTO.getIconoMediaBase64(),
                        redSocialDTO.getIconoMediaContentType(),
                        oldImagePath);
                redSocialDTO.setIconoUrl(imagePath);
            } catch (IOException e) {
                LOG.error("Failed to save red social icon", e);
                throw new RuntimeException("Failed to save image", e);
            }
        }

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
                    // Logic for partial update with image is complex, usually full update is used
                    // via UI.
                    // If needed, implement similar logic here, but for now we rely on full update
                    // for images.
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

        // Delete image file if exists
        redSocialRepository.findById(id).ifPresent(redSocial -> {
            if (redSocial.getIconoUrl() != null) {
                deleteFileFromLocal(redSocial.getIconoUrl());
            }
        });

        redSocialRepository.deleteById(id);
    }

    private String saveImageToFile(String base64Data, String contentType, String oldImagePath) throws IOException {
        // Delete old image if exists
        if (oldImagePath != null && !oldImagePath.isEmpty()) {
            deleteFileFromLocal(oldImagePath);
        }

        // Decode base64
        byte[] imageBytes = Base64.getDecoder().decode(base64Data);

        // Generate filename
        String extension = getExtensionFromContentType(contentType);
        String fileName = "icon_" + UUID.randomUUID().toString() + extension;

        // Create directory if not exists
        Path rootPath = Paths.get(applicationProperties.getImagePath()).toAbsolutePath();
        Path targetFolder = rootPath.resolve(REDES_FOLDER);
        Files.createDirectories(targetFolder);

        // Write file
        Path targetPath = targetFolder.resolve(fileName);
        Files.write(targetPath, imageBytes);

        // Return relative path
        String relativePath = REDES_FOLDER + "/" + fileName;
        LOG.debug("Image saved successfully: {}", relativePath);
        return relativePath;
    }

    private void deleteFileFromLocal(String relativePath) {
        if (relativePath == null || relativePath.isEmpty() || relativePath.toLowerCase().startsWith("http")) {
            return;
        }
        // Don't delete if it looks like a lucide icon key (no slash, no dot)
        if (!relativePath.contains("/") && !relativePath.contains(".")) {
            return;
        }

        try {
            Path rootPath = Paths.get(applicationProperties.getImagePath()).toAbsolutePath();
            Path targetPath = rootPath.resolve(relativePath);
            if (Files.exists(targetPath)) {
                Files.delete(targetPath);
                LOG.debug("Deleted old icon: {}", targetPath);
            }
        } catch (Exception e) {
            LOG.warn("Could not delete file from local storage: {}", relativePath, e);
        }
    }

    private String getExtensionFromContentType(String contentType) {
        if (contentType == null)
            return ".png"; // Default
        switch (contentType.toLowerCase()) {
            case "image/jpeg":
                return ".jpg";
            case "image/png":
                return ".png";
            case "image/gif":
                return ".gif";
            case "image/webp":
                return ".webp";
            case "image/svg+xml":
                return ".svg";
            default:
                return ".png";
        }
    }
}
