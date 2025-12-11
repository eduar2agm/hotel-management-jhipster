package com.hotel.app.domain;

import static com.hotel.app.domain.EstadoHabitacionTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.hotel.app.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class EstadoHabitacionTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(EstadoHabitacion.class);
        EstadoHabitacion estadoHabitacion1 = getEstadoHabitacionSample1();
        EstadoHabitacion estadoHabitacion2 = new EstadoHabitacion();
        assertThat(estadoHabitacion1).isNotEqualTo(estadoHabitacion2);

        estadoHabitacion2.setId(estadoHabitacion1.getId());
        assertThat(estadoHabitacion1).isEqualTo(estadoHabitacion2);

        estadoHabitacion2 = getEstadoHabitacionSample2();
        assertThat(estadoHabitacion1).isNotEqualTo(estadoHabitacion2);
    }
}
