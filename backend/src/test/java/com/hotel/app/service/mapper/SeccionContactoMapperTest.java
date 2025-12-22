package com.hotel.app.service.mapper;

import static com.hotel.app.domain.SeccionContactoAsserts.*;
import static com.hotel.app.domain.SeccionContactoTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class SeccionContactoMapperTest {

    private SeccionContactoMapper seccionContactoMapper;

    @BeforeEach
    void setUp() {
        seccionContactoMapper = new SeccionContactoMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getSeccionContactoSample1();
        var actual = seccionContactoMapper.toEntity(seccionContactoMapper.toDto(expected));
        assertSeccionContactoAllPropertiesEquals(expected, actual);
    }
}
