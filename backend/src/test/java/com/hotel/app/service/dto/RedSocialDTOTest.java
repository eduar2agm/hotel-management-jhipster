package com.hotel.app.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import com.hotel.app.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class RedSocialDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(RedSocialDTO.class);
        RedSocialDTO redSocialDTO1 = new RedSocialDTO();
        redSocialDTO1.setId(1L);
        RedSocialDTO redSocialDTO2 = new RedSocialDTO();
        assertThat(redSocialDTO1).isNotEqualTo(redSocialDTO2);
        redSocialDTO2.setId(redSocialDTO1.getId());
        assertThat(redSocialDTO1).isEqualTo(redSocialDTO2);
        redSocialDTO2.setId(2L);
        assertThat(redSocialDTO1).isNotEqualTo(redSocialDTO2);
        redSocialDTO1.setId(null);
        assertThat(redSocialDTO1).isNotEqualTo(redSocialDTO2);
    }
}
