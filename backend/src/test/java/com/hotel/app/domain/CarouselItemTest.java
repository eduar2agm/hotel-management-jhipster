package com.hotel.app.domain;

import static com.hotel.app.domain.CarouselItemTestSamples.*;
import static com.hotel.app.domain.ConfiguracionSistemaTestSamples.*;
import static com.hotel.app.domain.ImagenTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.hotel.app.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class CarouselItemTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(CarouselItem.class);
        CarouselItem carouselItem1 = getCarouselItemSample1();
        CarouselItem carouselItem2 = new CarouselItem();
        assertThat(carouselItem1).isNotEqualTo(carouselItem2);

        carouselItem2.setId(carouselItem1.getId());
        assertThat(carouselItem1).isEqualTo(carouselItem2);

        carouselItem2 = getCarouselItemSample2();
        assertThat(carouselItem1).isNotEqualTo(carouselItem2);
    }

    @Test
    void imagenTest() {
        CarouselItem carouselItem = getCarouselItemRandomSampleGenerator();
        Imagen imagenBack = getImagenRandomSampleGenerator();

        carouselItem.setImagen(imagenBack);
        assertThat(carouselItem.getImagen()).isEqualTo(imagenBack);

        carouselItem.imagen(null);
        assertThat(carouselItem.getImagen()).isNull();
    }

    @Test
    void configuracionTest() {
        CarouselItem carouselItem = getCarouselItemRandomSampleGenerator();
        ConfiguracionSistema configuracionSistemaBack = getConfiguracionSistemaRandomSampleGenerator();

        carouselItem.setConfiguracion(configuracionSistemaBack);
        assertThat(carouselItem.getConfiguracion()).isEqualTo(configuracionSistemaBack);

        carouselItem.configuracion(null);
        assertThat(carouselItem.getConfiguracion()).isNull();
    }
}
