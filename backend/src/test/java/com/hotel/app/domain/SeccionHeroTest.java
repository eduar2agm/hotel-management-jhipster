package com.hotel.app.domain;

import static com.hotel.app.domain.SeccionHeroTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.hotel.app.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class SeccionHeroTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(SeccionHero.class);
        SeccionHero seccionHero1 = getSeccionHeroSample1();
        SeccionHero seccionHero2 = new SeccionHero();
        assertThat(seccionHero1).isNotEqualTo(seccionHero2);

        seccionHero2.setId(seccionHero1.getId());
        assertThat(seccionHero1).isEqualTo(seccionHero2);

        seccionHero2 = getSeccionHeroSample2();
        assertThat(seccionHero1).isNotEqualTo(seccionHero2);
    }
}
