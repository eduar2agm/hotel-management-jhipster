package com.hotel.app.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import com.hotel.app.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class ServicioContratadoDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(ServicioContratadoDTO.class);
        ServicioContratadoDTO servicioContratadoDTO1 = new ServicioContratadoDTO();
        servicioContratadoDTO1.setId(1L);
        ServicioContratadoDTO servicioContratadoDTO2 = new ServicioContratadoDTO();
        assertThat(servicioContratadoDTO1).isNotEqualTo(servicioContratadoDTO2);
        servicioContratadoDTO2.setId(servicioContratadoDTO1.getId());
        assertThat(servicioContratadoDTO1).isEqualTo(servicioContratadoDTO2);
        servicioContratadoDTO2.setId(2L);
        assertThat(servicioContratadoDTO1).isNotEqualTo(servicioContratadoDTO2);
        servicioContratadoDTO1.setId(null);
        assertThat(servicioContratadoDTO1).isNotEqualTo(servicioContratadoDTO2);
    }
}
