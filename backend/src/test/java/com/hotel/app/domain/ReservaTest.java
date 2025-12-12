package com.hotel.app.domain;

import static com.hotel.app.domain.ClienteTestSamples.*;
import static com.hotel.app.domain.ReservaTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.hotel.app.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class ReservaTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Reserva.class);
        Reserva reserva1 = getReservaSample1();
        Reserva reserva2 = new Reserva();
        assertThat(reserva1).isNotEqualTo(reserva2);

        reserva2.setId(reserva1.getId());
        assertThat(reserva1).isEqualTo(reserva2);

        reserva2 = getReservaSample2();
        assertThat(reserva1).isNotEqualTo(reserva2);
    }

    @Test
    void clienteTest() {
        Reserva reserva = getReservaRandomSampleGenerator();
        Cliente clienteBack = getClienteRandomSampleGenerator();

        reserva.setCliente(clienteBack);
        assertThat(reserva.getCliente()).isEqualTo(clienteBack);

        reserva.cliente(null);
        assertThat(reserva.getCliente()).isNull();
    }
}
