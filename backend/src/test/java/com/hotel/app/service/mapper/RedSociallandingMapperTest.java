package com.hotel.app.service.mapper;

import static com.hotel.app.domain.RedSociallandingAsserts.*;
import static com.hotel.app.domain.RedSociallandingTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class RedSociallandingMapperTest {

    private RedSociallandingMapper redSociallandingMapper;

    @BeforeEach
    void setUp() {
        redSociallandingMapper = new RedSociallandingMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getRedSociallandingSample1();
        var actual = redSociallandingMapper.toEntity(redSociallandingMapper.toDto(expected));
        assertRedSociallandingAllPropertiesEquals(expected, actual);
    }
}
