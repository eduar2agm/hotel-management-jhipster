package com.hotel.app.domain;

import static com.hotel.app.domain.RedSociallandingTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.hotel.app.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class RedSociallandingTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(RedSociallanding.class);
        RedSociallanding redSociallanding1 = getRedSociallandingSample1();
        RedSociallanding redSociallanding2 = new RedSociallanding();
        assertThat(redSociallanding1).isNotEqualTo(redSociallanding2);

        redSociallanding2.setId(redSociallanding1.getId());
        assertThat(redSociallanding1).isEqualTo(redSociallanding2);

        redSociallanding2 = getRedSociallandingSample2();
        assertThat(redSociallanding1).isNotEqualTo(redSociallanding2);
    }
}
