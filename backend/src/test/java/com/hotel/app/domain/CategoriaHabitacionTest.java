package com.hotel.app.domain;

import static com.hotel.app.domain.CategoriaHabitacionTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.hotel.app.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class CategoriaHabitacionTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(CategoriaHabitacion.class);
        CategoriaHabitacion categoriaHabitacion1 = getCategoriaHabitacionSample1();
        CategoriaHabitacion categoriaHabitacion2 = new CategoriaHabitacion();
        assertThat(categoriaHabitacion1).isNotEqualTo(categoriaHabitacion2);

        categoriaHabitacion2.setId(categoriaHabitacion1.getId());
        assertThat(categoriaHabitacion1).isEqualTo(categoriaHabitacion2);

        categoriaHabitacion2 = getCategoriaHabitacionSample2();
        assertThat(categoriaHabitacion1).isNotEqualTo(categoriaHabitacion2);
    }
}
