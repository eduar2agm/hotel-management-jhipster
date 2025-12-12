package com.hotel.app.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import com.hotel.app.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class ReservaDetalleDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(ReservaDetalleDTO.class);
        ReservaDetalleDTO reservaDetalleDTO1 = new ReservaDetalleDTO();
        reservaDetalleDTO1.setId(1L);
        ReservaDetalleDTO reservaDetalleDTO2 = new ReservaDetalleDTO();
        assertThat(reservaDetalleDTO1).isNotEqualTo(reservaDetalleDTO2);
        reservaDetalleDTO2.setId(reservaDetalleDTO1.getId());
        assertThat(reservaDetalleDTO1).isEqualTo(reservaDetalleDTO2);
        reservaDetalleDTO2.setId(2L);
        assertThat(reservaDetalleDTO1).isNotEqualTo(reservaDetalleDTO2);
        reservaDetalleDTO1.setId(null);
        assertThat(reservaDetalleDTO1).isNotEqualTo(reservaDetalleDTO2);
    }
}
