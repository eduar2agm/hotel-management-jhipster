package com.hotel.app.service.mapper;

import static com.hotel.app.domain.CarouselItemAsserts.*;
import static com.hotel.app.domain.CarouselItemTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class CarouselItemMapperTest {

    private CarouselItemMapper carouselItemMapper;

    @BeforeEach
    void setUp() {
        carouselItemMapper = new CarouselItemMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getCarouselItemSample1();
        var actual = carouselItemMapper.toEntity(carouselItemMapper.toDto(expected));
        assertCarouselItemAllPropertiesEquals(expected, actual);
    }
}
