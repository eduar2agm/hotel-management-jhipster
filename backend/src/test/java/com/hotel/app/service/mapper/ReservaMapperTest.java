package com.hotel.app.service.mapper;

import static com.hotel.app.domain.ReservaAsserts.*;
import static com.hotel.app.domain.ReservaTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class ReservaMapperTest {

    private ReservaMapper reservaMapper;

    @BeforeEach
    void setUp() {
        reservaMapper = new ReservaMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getReservaSample1();
        var actual = reservaMapper.toEntity(reservaMapper.toDto(expected));
        assertReservaAllPropertiesEquals(expected, actual);
    }
}
