package com.hotel.app.domain;

import static com.hotel.app.domain.ClienteTestSamples.*;
import static com.hotel.app.domain.PagoTestSamples.*;
import static com.hotel.app.domain.ReservaTestSamples.*;
import static com.hotel.app.domain.ServicioContratadoTestSamples.*;
import static com.hotel.app.domain.ServicioTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.hotel.app.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class ServicioContratadoTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(ServicioContratado.class);
        ServicioContratado servicioContratado1 = getServicioContratadoSample1();
        ServicioContratado servicioContratado2 = new ServicioContratado();
        assertThat(servicioContratado1).isNotEqualTo(servicioContratado2);

        servicioContratado2.setId(servicioContratado1.getId());
        assertThat(servicioContratado1).isEqualTo(servicioContratado2);

        servicioContratado2 = getServicioContratadoSample2();
        assertThat(servicioContratado1).isNotEqualTo(servicioContratado2);
    }

    @Test
    void servicioTest() {
        ServicioContratado servicioContratado = getServicioContratadoRandomSampleGenerator();
        Servicio servicioBack = getServicioRandomSampleGenerator();

        servicioContratado.setServicio(servicioBack);
        assertThat(servicioContratado.getServicio()).isEqualTo(servicioBack);

        servicioContratado.servicio(null);
        assertThat(servicioContratado.getServicio()).isNull();
    }

    @Test
    void reservaTest() {
        ServicioContratado servicioContratado = getServicioContratadoRandomSampleGenerator();
        Reserva reservaBack = getReservaRandomSampleGenerator();

        servicioContratado.setReserva(reservaBack);
        assertThat(servicioContratado.getReserva()).isEqualTo(reservaBack);

        servicioContratado.reserva(null);
        assertThat(servicioContratado.getReserva()).isNull();
    }

    @Test
    void clienteTest() {
        ServicioContratado servicioContratado = getServicioContratadoRandomSampleGenerator();
        Cliente clienteBack = getClienteRandomSampleGenerator();

        servicioContratado.setCliente(clienteBack);
        assertThat(servicioContratado.getCliente()).isEqualTo(clienteBack);

        servicioContratado.cliente(null);
        assertThat(servicioContratado.getCliente()).isNull();
    }

    @Test
    void pagoTest() {
        ServicioContratado servicioContratado = getServicioContratadoRandomSampleGenerator();
        Pago pagoBack = getPagoRandomSampleGenerator();

        servicioContratado.setPago(pagoBack);
        assertThat(servicioContratado.getPago()).isEqualTo(pagoBack);

        servicioContratado.pago(null);
        assertThat(servicioContratado.getPago()).isNull();
    }
}
