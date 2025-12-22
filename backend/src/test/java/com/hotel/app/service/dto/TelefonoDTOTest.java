package com.hotel.app.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import com.hotel.app.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class TelefonoDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(TelefonoDTO.class);
        TelefonoDTO telefonoDTO1 = new TelefonoDTO();
        telefonoDTO1.setId(1L);
        TelefonoDTO telefonoDTO2 = new TelefonoDTO();
        assertThat(telefonoDTO1).isNotEqualTo(telefonoDTO2);
        telefonoDTO2.setId(telefonoDTO1.getId());
        assertThat(telefonoDTO1).isEqualTo(telefonoDTO2);
        telefonoDTO2.setId(2L);
        assertThat(telefonoDTO1).isNotEqualTo(telefonoDTO2);
        telefonoDTO1.setId(null);
        assertThat(telefonoDTO1).isNotEqualTo(telefonoDTO2);
    }
}
