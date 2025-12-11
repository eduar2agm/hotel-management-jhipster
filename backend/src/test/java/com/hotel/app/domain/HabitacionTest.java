package com.hotel.app.domain;

import static com.hotel.app.domain.CategoriaHabitacionTestSamples.*;
import static com.hotel.app.domain.EstadoHabitacionTestSamples.*;
import static com.hotel.app.domain.HabitacionTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.hotel.app.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class HabitacionTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Habitacion.class);
        Habitacion habitacion1 = getHabitacionSample1();
        Habitacion habitacion2 = new Habitacion();
        assertThat(habitacion1).isNotEqualTo(habitacion2);

        habitacion2.setId(habitacion1.getId());
        assertThat(habitacion1).isEqualTo(habitacion2);

        habitacion2 = getHabitacionSample2();
        assertThat(habitacion1).isNotEqualTo(habitacion2);
    }

    @Test
    void categoriaHabitacionTest() {
        Habitacion habitacion = getHabitacionRandomSampleGenerator();
        CategoriaHabitacion categoriaHabitacionBack = getCategoriaHabitacionRandomSampleGenerator();

        habitacion.setCategoriaHabitacion(categoriaHabitacionBack);
        assertThat(habitacion.getCategoriaHabitacion()).isEqualTo(categoriaHabitacionBack);

        habitacion.categoriaHabitacion(null);
        assertThat(habitacion.getCategoriaHabitacion()).isNull();
    }

    @Test
    void estadoHabitacionTest() {
        Habitacion habitacion = getHabitacionRandomSampleGenerator();
        EstadoHabitacion estadoHabitacionBack = getEstadoHabitacionRandomSampleGenerator();

        habitacion.setEstadoHabitacion(estadoHabitacionBack);
        assertThat(habitacion.getEstadoHabitacion()).isEqualTo(estadoHabitacionBack);

        habitacion.estadoHabitacion(null);
        assertThat(habitacion.getEstadoHabitacion()).isNull();
    }
}
