package com.hotel.app.domain;

import static com.hotel.app.domain.CheckInCheckOutTestSamples.*;
import static com.hotel.app.domain.ReservaDetalleTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.hotel.app.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class CheckInCheckOutTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(CheckInCheckOut.class);
        CheckInCheckOut checkInCheckOut1 = getCheckInCheckOutSample1();
        CheckInCheckOut checkInCheckOut2 = new CheckInCheckOut();
        assertThat(checkInCheckOut1).isNotEqualTo(checkInCheckOut2);

        checkInCheckOut2.setId(checkInCheckOut1.getId());
        assertThat(checkInCheckOut1).isEqualTo(checkInCheckOut2);

        checkInCheckOut2 = getCheckInCheckOutSample2();
        assertThat(checkInCheckOut1).isNotEqualTo(checkInCheckOut2);
    }

    @Test
    void reservaDetalleTest() {
        CheckInCheckOut checkInCheckOut = getCheckInCheckOutRandomSampleGenerator();
        ReservaDetalle reservaDetalleBack = getReservaDetalleRandomSampleGenerator();

        checkInCheckOut.setReservaDetalle(reservaDetalleBack);
        assertThat(checkInCheckOut.getReservaDetalle()).isEqualTo(reservaDetalleBack);

        checkInCheckOut.reservaDetalle(null);
        assertThat(checkInCheckOut.getReservaDetalle()).isNull();
    }
}
