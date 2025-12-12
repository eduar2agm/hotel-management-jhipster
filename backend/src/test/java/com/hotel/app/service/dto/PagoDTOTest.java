package com.hotel.app.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import com.hotel.app.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class PagoDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(PagoDTO.class);
        PagoDTO pagoDTO1 = new PagoDTO();
        pagoDTO1.setId(1L);
        PagoDTO pagoDTO2 = new PagoDTO();
        assertThat(pagoDTO1).isNotEqualTo(pagoDTO2);
        pagoDTO2.setId(pagoDTO1.getId());
        assertThat(pagoDTO1).isEqualTo(pagoDTO2);
        pagoDTO2.setId(2L);
        assertThat(pagoDTO1).isNotEqualTo(pagoDTO2);
        pagoDTO1.setId(null);
        assertThat(pagoDTO1).isNotEqualTo(pagoDTO2);
    }
}
