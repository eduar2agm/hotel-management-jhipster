package com.hotel.app.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import com.hotel.app.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class SeccionContactoDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(SeccionContactoDTO.class);
        SeccionContactoDTO seccionContactoDTO1 = new SeccionContactoDTO();
        seccionContactoDTO1.setId(1L);
        SeccionContactoDTO seccionContactoDTO2 = new SeccionContactoDTO();
        assertThat(seccionContactoDTO1).isNotEqualTo(seccionContactoDTO2);
        seccionContactoDTO2.setId(seccionContactoDTO1.getId());
        assertThat(seccionContactoDTO1).isEqualTo(seccionContactoDTO2);
        seccionContactoDTO2.setId(2L);
        assertThat(seccionContactoDTO1).isNotEqualTo(seccionContactoDTO2);
        seccionContactoDTO1.setId(null);
        assertThat(seccionContactoDTO1).isNotEqualTo(seccionContactoDTO2);
    }
}
