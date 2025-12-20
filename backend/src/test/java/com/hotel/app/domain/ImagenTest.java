package com.hotel.app.domain;

import static com.hotel.app.domain.HabitacionTestSamples.*;
import static com.hotel.app.domain.ImagenTestSamples.*;
import static com.hotel.app.domain.ServicioTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.hotel.app.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class ImagenTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Imagen.class);
        Imagen imagen1 = getImagenSample1();
        Imagen imagen2 = new Imagen();
        assertThat(imagen1).isNotEqualTo(imagen2);

        imagen2.setId(imagen1.getId());
        assertThat(imagen1).isEqualTo(imagen2);

        imagen2 = getImagenSample2();
        assertThat(imagen1).isNotEqualTo(imagen2);
    }

    @Test
    void habitacionTest() {
        Imagen imagen = getImagenRandomSampleGenerator();
        Habitacion habitacionBack = getHabitacionRandomSampleGenerator();

        imagen.setHabitacion(habitacionBack);
        assertThat(imagen.getHabitacion()).isEqualTo(habitacionBack);

        imagen.habitacion(null);
        assertThat(imagen.getHabitacion()).isNull();
    }

    @Test
    void servicioTest() {
        Imagen imagen = getImagenRandomSampleGenerator();
        Servicio servicioBack = getServicioRandomSampleGenerator();

        imagen.setServicio(servicioBack);
        assertThat(imagen.getServicio()).isEqualTo(servicioBack);

        imagen.servicio(null);
        assertThat(imagen.getServicio()).isNull();
    }
}
