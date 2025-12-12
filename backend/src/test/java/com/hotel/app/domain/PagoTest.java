package com.hotel.app.domain;

import static com.hotel.app.domain.PagoTestSamples.*;
import static com.hotel.app.domain.ReservaTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.hotel.app.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class PagoTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Pago.class);
        Pago pago1 = getPagoSample1();
        Pago pago2 = new Pago();
        assertThat(pago1).isNotEqualTo(pago2);

        pago2.setId(pago1.getId());
        assertThat(pago1).isEqualTo(pago2);

        pago2 = getPagoSample2();
        assertThat(pago1).isNotEqualTo(pago2);
    }

    @Test
    void reservaTest() {
        Pago pago = getPagoRandomSampleGenerator();
        Reserva reservaBack = getReservaRandomSampleGenerator();

        pago.setReserva(reservaBack);
        assertThat(pago.getReserva()).isEqualTo(reservaBack);

        pago.reserva(null);
        assertThat(pago.getReserva()).isNull();
    }
}
