package com.hotel.app.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import com.hotel.app.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class MensajeSoporteDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(MensajeSoporteDTO.class);
        MensajeSoporteDTO mensajeSoporteDTO1 = new MensajeSoporteDTO();
        mensajeSoporteDTO1.setId(1L);
        MensajeSoporteDTO mensajeSoporteDTO2 = new MensajeSoporteDTO();
        assertThat(mensajeSoporteDTO1).isNotEqualTo(mensajeSoporteDTO2);
        mensajeSoporteDTO2.setId(mensajeSoporteDTO1.getId());
        assertThat(mensajeSoporteDTO1).isEqualTo(mensajeSoporteDTO2);
        mensajeSoporteDTO2.setId(2L);
        assertThat(mensajeSoporteDTO1).isNotEqualTo(mensajeSoporteDTO2);
        mensajeSoporteDTO1.setId(null);
        assertThat(mensajeSoporteDTO1).isNotEqualTo(mensajeSoporteDTO2);
    }
}
