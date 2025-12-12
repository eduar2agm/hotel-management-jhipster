package com.hotel.app.service.mapper;

import static com.hotel.app.domain.ReservaDetalleAsserts.*;
import static com.hotel.app.domain.ReservaDetalleTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class ReservaDetalleMapperTest {

    private ReservaDetalleMapper reservaDetalleMapper;

    @BeforeEach
    void setUp() {
        reservaDetalleMapper = new ReservaDetalleMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getReservaDetalleSample1();
        var actual = reservaDetalleMapper.toEntity(reservaDetalleMapper.toDto(expected));
        assertReservaDetalleAllPropertiesEquals(expected, actual);
    }
}
