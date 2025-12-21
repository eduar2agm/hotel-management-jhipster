package com.hotel.app.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import com.hotel.app.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class CarouselItemDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(CarouselItemDTO.class);
        CarouselItemDTO carouselItemDTO1 = new CarouselItemDTO();
        carouselItemDTO1.setId(1L);
        CarouselItemDTO carouselItemDTO2 = new CarouselItemDTO();
        assertThat(carouselItemDTO1).isNotEqualTo(carouselItemDTO2);
        carouselItemDTO2.setId(carouselItemDTO1.getId());
        assertThat(carouselItemDTO1).isEqualTo(carouselItemDTO2);
        carouselItemDTO2.setId(2L);
        assertThat(carouselItemDTO1).isNotEqualTo(carouselItemDTO2);
        carouselItemDTO1.setId(null);
        assertThat(carouselItemDTO1).isNotEqualTo(carouselItemDTO2);
    }
}
