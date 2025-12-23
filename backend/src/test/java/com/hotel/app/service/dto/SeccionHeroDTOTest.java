package com.hotel.app.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import com.hotel.app.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class SeccionHeroDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(SeccionHeroDTO.class);
        SeccionHeroDTO seccionHeroDTO1 = new SeccionHeroDTO();
        seccionHeroDTO1.setId(1L);
        SeccionHeroDTO seccionHeroDTO2 = new SeccionHeroDTO();
        assertThat(seccionHeroDTO1).isNotEqualTo(seccionHeroDTO2);
        seccionHeroDTO2.setId(seccionHeroDTO1.getId());
        assertThat(seccionHeroDTO1).isEqualTo(seccionHeroDTO2);
        seccionHeroDTO2.setId(2L);
        assertThat(seccionHeroDTO1).isNotEqualTo(seccionHeroDTO2);
        seccionHeroDTO1.setId(null);
        assertThat(seccionHeroDTO1).isNotEqualTo(seccionHeroDTO2);
    }
}
