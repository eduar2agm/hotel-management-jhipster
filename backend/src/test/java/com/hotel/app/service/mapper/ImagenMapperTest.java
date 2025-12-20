package com.hotel.app.service.mapper;

import static com.hotel.app.domain.ImagenAsserts.*;
import static com.hotel.app.domain.ImagenTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class ImagenMapperTest {

    private ImagenMapper imagenMapper;

    @BeforeEach
    void setUp() {
        imagenMapper = new ImagenMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getImagenSample1();
        var actual = imagenMapper.toEntity(imagenMapper.toDto(expected));
        assertImagenAllPropertiesEquals(expected, actual);
    }
}
