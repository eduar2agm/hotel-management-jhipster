package com.hotel.app.service.mapper;

import static com.hotel.app.domain.CategoriaHabitacionAsserts.*;
import static com.hotel.app.domain.CategoriaHabitacionTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class CategoriaHabitacionMapperTest {

    private CategoriaHabitacionMapper categoriaHabitacionMapper;

    @BeforeEach
    void setUp() {
        categoriaHabitacionMapper = new CategoriaHabitacionMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getCategoriaHabitacionSample1();
        var actual = categoriaHabitacionMapper.toEntity(categoriaHabitacionMapper.toDto(expected));
        assertCategoriaHabitacionAllPropertiesEquals(expected, actual);
    }
}
