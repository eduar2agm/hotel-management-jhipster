package com.hotel.app.domain;

import static com.hotel.app.domain.RedSocialTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.hotel.app.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class RedSocialTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(RedSocial.class);
        RedSocial redSocial1 = getRedSocialSample1();
        RedSocial redSocial2 = new RedSocial();
        assertThat(redSocial1).isNotEqualTo(redSocial2);

        redSocial2.setId(redSocial1.getId());
        assertThat(redSocial1).isEqualTo(redSocial2);

        redSocial2 = getRedSocialSample2();
        assertThat(redSocial1).isNotEqualTo(redSocial2);
    }
}
