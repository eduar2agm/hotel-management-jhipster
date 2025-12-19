package com.hotel.app.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import com.hotel.app.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class ConfiguracionSistemaDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(ConfiguracionSistemaDTO.class);
        ConfiguracionSistemaDTO configuracionSistemaDTO1 = new ConfiguracionSistemaDTO();
        configuracionSistemaDTO1.setId(1L);
        ConfiguracionSistemaDTO configuracionSistemaDTO2 = new ConfiguracionSistemaDTO();
        assertThat(configuracionSistemaDTO1).isNotEqualTo(configuracionSistemaDTO2);
        configuracionSistemaDTO2.setId(configuracionSistemaDTO1.getId());
        assertThat(configuracionSistemaDTO1).isEqualTo(configuracionSistemaDTO2);
        configuracionSistemaDTO2.setId(2L);
        assertThat(configuracionSistemaDTO1).isNotEqualTo(configuracionSistemaDTO2);
        configuracionSistemaDTO1.setId(null);
        assertThat(configuracionSistemaDTO1).isNotEqualTo(configuracionSistemaDTO2);
    }
}
