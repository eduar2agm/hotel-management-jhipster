package com.hotel.app.domain;

import static com.hotel.app.domain.TelefonoTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.hotel.app.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class TelefonoTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Telefono.class);
        Telefono telefono1 = getTelefonoSample1();
        Telefono telefono2 = new Telefono();
        assertThat(telefono1).isNotEqualTo(telefono2);

        telefono2.setId(telefono1.getId());
        assertThat(telefono1).isEqualTo(telefono2);

        telefono2 = getTelefonoSample2();
        assertThat(telefono1).isNotEqualTo(telefono2);
    }
}
