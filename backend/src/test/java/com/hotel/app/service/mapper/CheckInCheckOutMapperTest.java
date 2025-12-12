package com.hotel.app.service.mapper;

import static com.hotel.app.domain.CheckInCheckOutAsserts.*;
import static com.hotel.app.domain.CheckInCheckOutTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class CheckInCheckOutMapperTest {

    private CheckInCheckOutMapper checkInCheckOutMapper;

    @BeforeEach
    void setUp() {
        checkInCheckOutMapper = new CheckInCheckOutMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getCheckInCheckOutSample1();
        var actual = checkInCheckOutMapper.toEntity(checkInCheckOutMapper.toDto(expected));
        assertCheckInCheckOutAllPropertiesEquals(expected, actual);
    }
}
