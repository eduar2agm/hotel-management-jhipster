package com.hotel.app.service.mapper;

import static com.hotel.app.domain.ServicioContratadoAsserts.*;
import static com.hotel.app.domain.ServicioContratadoTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class ServicioContratadoMapperTest {

    private ServicioContratadoMapper servicioContratadoMapper;

    @BeforeEach
    void setUp() {
        servicioContratadoMapper = new ServicioContratadoMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getServicioContratadoSample1();
        var actual = servicioContratadoMapper.toEntity(servicioContratadoMapper.toDto(expected));
        assertServicioContratadoAllPropertiesEquals(expected, actual);
    }
}
