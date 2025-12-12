package com.hotel.app.service.mapper;

import static com.hotel.app.domain.MensajeSoporteAsserts.*;
import static com.hotel.app.domain.MensajeSoporteTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class MensajeSoporteMapperTest {

    private MensajeSoporteMapper mensajeSoporteMapper;

    @BeforeEach
    void setUp() {
        mensajeSoporteMapper = new MensajeSoporteMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getMensajeSoporteSample1();
        var actual = mensajeSoporteMapper.toEntity(mensajeSoporteMapper.toDto(expected));
        assertMensajeSoporteAllPropertiesEquals(expected, actual);
    }
}
