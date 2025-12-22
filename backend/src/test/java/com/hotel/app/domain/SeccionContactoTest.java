package com.hotel.app.domain;

import static com.hotel.app.domain.SeccionContactoTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.hotel.app.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class SeccionContactoTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(SeccionContacto.class);
        SeccionContacto seccionContacto1 = getSeccionContactoSample1();
        SeccionContacto seccionContacto2 = new SeccionContacto();
        assertThat(seccionContacto1).isNotEqualTo(seccionContacto2);

        seccionContacto2.setId(seccionContacto1.getId());
        assertThat(seccionContacto1).isEqualTo(seccionContacto2);

        seccionContacto2 = getSeccionContactoSample2();
        assertThat(seccionContacto1).isNotEqualTo(seccionContacto2);
    }
}
