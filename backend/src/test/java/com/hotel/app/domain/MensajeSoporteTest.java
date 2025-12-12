package com.hotel.app.domain;

import static com.hotel.app.domain.MensajeSoporteTestSamples.*;
import static com.hotel.app.domain.ReservaTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.hotel.app.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class MensajeSoporteTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(MensajeSoporte.class);
        MensajeSoporte mensajeSoporte1 = getMensajeSoporteSample1();
        MensajeSoporte mensajeSoporte2 = new MensajeSoporte();
        assertThat(mensajeSoporte1).isNotEqualTo(mensajeSoporte2);

        mensajeSoporte2.setId(mensajeSoporte1.getId());
        assertThat(mensajeSoporte1).isEqualTo(mensajeSoporte2);

        mensajeSoporte2 = getMensajeSoporteSample2();
        assertThat(mensajeSoporte1).isNotEqualTo(mensajeSoporte2);
    }

    @Test
    void reservaTest() {
        MensajeSoporte mensajeSoporte = getMensajeSoporteRandomSampleGenerator();
        Reserva reservaBack = getReservaRandomSampleGenerator();

        mensajeSoporte.setReserva(reservaBack);
        assertThat(mensajeSoporte.getReserva()).isEqualTo(reservaBack);

        mensajeSoporte.reserva(null);
        assertThat(mensajeSoporte.getReserva()).isNull();
    }
}
