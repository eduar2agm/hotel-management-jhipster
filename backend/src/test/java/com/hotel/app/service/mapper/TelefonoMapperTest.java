package com.hotel.app.service.mapper;

import static com.hotel.app.domain.TelefonoAsserts.*;
import static com.hotel.app.domain.TelefonoTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class TelefonoMapperTest {

    private TelefonoMapper telefonoMapper;

    @BeforeEach
    void setUp() {
        telefonoMapper = new TelefonoMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getTelefonoSample1();
        var actual = telefonoMapper.toEntity(telefonoMapper.toDto(expected));
        assertTelefonoAllPropertiesEquals(expected, actual);
    }
}
