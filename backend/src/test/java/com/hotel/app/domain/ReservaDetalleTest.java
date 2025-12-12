package com.hotel.app.domain;

import static com.hotel.app.domain.HabitacionTestSamples.*;
import static com.hotel.app.domain.ReservaDetalleTestSamples.*;
import static com.hotel.app.domain.ReservaTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.hotel.app.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class ReservaDetalleTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(ReservaDetalle.class);
        ReservaDetalle reservaDetalle1 = getReservaDetalleSample1();
        ReservaDetalle reservaDetalle2 = new ReservaDetalle();
        assertThat(reservaDetalle1).isNotEqualTo(reservaDetalle2);

        reservaDetalle2.setId(reservaDetalle1.getId());
        assertThat(reservaDetalle1).isEqualTo(reservaDetalle2);

        reservaDetalle2 = getReservaDetalleSample2();
        assertThat(reservaDetalle1).isNotEqualTo(reservaDetalle2);
    }

    @Test
    void reservaTest() {
        ReservaDetalle reservaDetalle = getReservaDetalleRandomSampleGenerator();
        Reserva reservaBack = getReservaRandomSampleGenerator();

        reservaDetalle.setReserva(reservaBack);
        assertThat(reservaDetalle.getReserva()).isEqualTo(reservaBack);

        reservaDetalle.reserva(null);
        assertThat(reservaDetalle.getReserva()).isNull();
    }

    @Test
    void habitacionTest() {
        ReservaDetalle reservaDetalle = getReservaDetalleRandomSampleGenerator();
        Habitacion habitacionBack = getHabitacionRandomSampleGenerator();

        reservaDetalle.setHabitacion(habitacionBack);
        assertThat(reservaDetalle.getHabitacion()).isEqualTo(habitacionBack);

        reservaDetalle.habitacion(null);
        assertThat(reservaDetalle.getHabitacion()).isNull();
    }
}
