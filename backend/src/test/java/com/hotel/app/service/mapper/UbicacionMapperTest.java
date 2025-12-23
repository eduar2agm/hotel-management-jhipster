package com.hotel.app.service.mapper;

import static com.hotel.app.domain.UbicacionAsserts.*;
import static com.hotel.app.domain.UbicacionTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class UbicacionMapperTest {

    private UbicacionMapper ubicacionMapper;

    @BeforeEach
    void setUp() {
        ubicacionMapper = new UbicacionMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getUbicacionSample1();
        var actual = ubicacionMapper.toEntity(ubicacionMapper.toDto(expected));
        assertUbicacionAllPropertiesEquals(expected, actual);
    }
}
