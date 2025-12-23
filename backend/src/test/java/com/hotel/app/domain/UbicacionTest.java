package com.hotel.app.domain;

import static com.hotel.app.domain.UbicacionTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.hotel.app.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class UbicacionTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Ubicacion.class);
        Ubicacion ubicacion1 = getUbicacionSample1();
        Ubicacion ubicacion2 = new Ubicacion();
        assertThat(ubicacion1).isNotEqualTo(ubicacion2);

        ubicacion2.setId(ubicacion1.getId());
        assertThat(ubicacion1).isEqualTo(ubicacion2);

        ubicacion2 = getUbicacionSample2();
        assertThat(ubicacion1).isNotEqualTo(ubicacion2);
    }
}
