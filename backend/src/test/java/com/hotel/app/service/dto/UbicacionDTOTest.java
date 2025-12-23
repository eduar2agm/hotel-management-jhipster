package com.hotel.app.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import com.hotel.app.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class UbicacionDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(UbicacionDTO.class);
        UbicacionDTO ubicacionDTO1 = new UbicacionDTO();
        ubicacionDTO1.setId(1L);
        UbicacionDTO ubicacionDTO2 = new UbicacionDTO();
        assertThat(ubicacionDTO1).isNotEqualTo(ubicacionDTO2);
        ubicacionDTO2.setId(ubicacionDTO1.getId());
        assertThat(ubicacionDTO1).isEqualTo(ubicacionDTO2);
        ubicacionDTO2.setId(2L);
        assertThat(ubicacionDTO1).isNotEqualTo(ubicacionDTO2);
        ubicacionDTO1.setId(null);
        assertThat(ubicacionDTO1).isNotEqualTo(ubicacionDTO2);
    }
}
