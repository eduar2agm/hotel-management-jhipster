package com.hotel.app.service.mapper;

import static com.hotel.app.domain.RedSocialAsserts.*;
import static com.hotel.app.domain.RedSocialTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class RedSocialMapperTest {

    private RedSocialMapper redSocialMapper;

    @BeforeEach
    void setUp() {
        redSocialMapper = new RedSocialMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getRedSocialSample1();
        var actual = redSocialMapper.toEntity(redSocialMapper.toDto(expected));
        assertRedSocialAllPropertiesEquals(expected, actual);
    }
}
