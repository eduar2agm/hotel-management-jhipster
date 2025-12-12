package com.hotel.app.service.mapper;

import static com.hotel.app.domain.EstadoHabitacionAsserts.*;
import static com.hotel.app.domain.EstadoHabitacionTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class EstadoHabitacionMapperTest {

    private EstadoHabitacionMapper estadoHabitacionMapper;

    @BeforeEach
    void setUp() {
        estadoHabitacionMapper = new EstadoHabitacionMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getEstadoHabitacionSample1();
        var actual = estadoHabitacionMapper.toEntity(estadoHabitacionMapper.toDto(expected));
        assertEstadoHabitacionAllPropertiesEquals(expected, actual);
    }
}
