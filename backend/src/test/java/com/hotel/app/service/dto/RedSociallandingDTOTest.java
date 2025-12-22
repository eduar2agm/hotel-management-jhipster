package com.hotel.app.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import com.hotel.app.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class RedSociallandingDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(RedSociallandingDTO.class);
        RedSociallandingDTO redSociallandingDTO1 = new RedSociallandingDTO();
        redSociallandingDTO1.setId(1L);
        RedSociallandingDTO redSociallandingDTO2 = new RedSociallandingDTO();
        assertThat(redSociallandingDTO1).isNotEqualTo(redSociallandingDTO2);
        redSociallandingDTO2.setId(redSociallandingDTO1.getId());
        assertThat(redSociallandingDTO1).isEqualTo(redSociallandingDTO2);
        redSociallandingDTO2.setId(2L);
        assertThat(redSociallandingDTO1).isNotEqualTo(redSociallandingDTO2);
        redSociallandingDTO1.setId(null);
        assertThat(redSociallandingDTO1).isNotEqualTo(redSociallandingDTO2);
    }
}
