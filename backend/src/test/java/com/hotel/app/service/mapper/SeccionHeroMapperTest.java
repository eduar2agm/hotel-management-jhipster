package com.hotel.app.service.mapper;

import static com.hotel.app.domain.SeccionHeroAsserts.*;
import static com.hotel.app.domain.SeccionHeroTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class SeccionHeroMapperTest {

    private SeccionHeroMapper seccionHeroMapper;

    @BeforeEach
    void setUp() {
        seccionHeroMapper = new SeccionHeroMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getSeccionHeroSample1();
        var actual = seccionHeroMapper.toEntity(seccionHeroMapper.toDto(expected));
        assertSeccionHeroAllPropertiesEquals(expected, actual);
    }
}
