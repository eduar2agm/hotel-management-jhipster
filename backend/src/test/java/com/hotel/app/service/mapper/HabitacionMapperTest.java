package com.hotel.app.service.mapper;

import static com.hotel.app.domain.HabitacionAsserts.*;
import static com.hotel.app.domain.HabitacionTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class HabitacionMapperTest {

    private HabitacionMapper habitacionMapper;

    @BeforeEach
    void setUp() {
        habitacionMapper = new HabitacionMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getHabitacionSample1();
        var actual = habitacionMapper.toEntity(habitacionMapper.toDto(expected));
        assertHabitacionAllPropertiesEquals(expected, actual);
    }
}
