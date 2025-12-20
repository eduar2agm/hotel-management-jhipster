package com.hotel.app.domain;

import static com.hotel.app.domain.ConfiguracionSistemaTestSamples.*;
import static com.hotel.app.domain.ImagenTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.hotel.app.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class ConfiguracionSistemaTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(ConfiguracionSistema.class);
        ConfiguracionSistema configuracionSistema1 = getConfiguracionSistemaSample1();
        ConfiguracionSistema configuracionSistema2 = new ConfiguracionSistema();
        assertThat(configuracionSistema1).isNotEqualTo(configuracionSistema2);

        configuracionSistema2.setId(configuracionSistema1.getId());
        assertThat(configuracionSistema1).isEqualTo(configuracionSistema2);

        configuracionSistema2 = getConfiguracionSistemaSample2();
        assertThat(configuracionSistema1).isNotEqualTo(configuracionSistema2);
    }

    @Test
    void imagenTest() {
        ConfiguracionSistema configuracionSistema = getConfiguracionSistemaRandomSampleGenerator();
        Imagen imagenBack = getImagenRandomSampleGenerator();

        configuracionSistema.setImagen(imagenBack);
        assertThat(configuracionSistema.getImagen()).isEqualTo(imagenBack);

        configuracionSistema.imagen(null);
        assertThat(configuracionSistema.getImagen()).isNull();
    }
}
